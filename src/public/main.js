var socket = io();

class Argument {
  constructor(name, value, isString = false) {
    this.name = name;
    this.value = value;
    this.isString = isString;
  }
}

class Action {
  constructor(contract, contractAccount, name, args, auth) {
    this.contract = contract;
    this.contractAccount = contractAccount;
    this.name = name;
    this.args = args;
    this.auth = auth;
  }
}

var actions = [
  new Action(
    "profile",
    "vae.profile",
    "create",
    [
      new Argument("account", "flo"),
      new Argument("first_name", { value: "Flo", price: 0 }),
      new Argument("last_name", { value: "GG", price: 0 }),
      new Argument("string_fields", [{ name: "Age", value: "HASH", price: 10 }])
    ],
    "flo@active"
  ),
  new Action(
    "profile",
    "vae.profile",
    "update",
    [
      new Argument("account", "flo"),
      new Argument("first_name", { value: "Florian", price: 0 }),
      new Argument("last_name", { value: "HASH2", price: 5 }),
      new Argument("string_fields", [
        { name: "University", value: "HASH", price: 20 }
      ])
    ],
    "flo@active"
  ),
  new Action(
    "profile",
    "vae.profile",
    "remove",
    [new Argument("account_name", "flo")],
    "flo@active"
  ),
  new Action(
    "token",
    "vae.token",
    "create",
    [
      new Argument("issuer", "vae.token"),
      new Argument("maximum supply", "100000 VAE", true)
    ],
    "vae.token@active"
  ),
  new Action(
    "token",
    "vae.token",
    "issue",
    [
      new Argument("to", "flo"),
      new Argument("quantity", "100 VAE", true),
      new Argument("memo", "Here ya go bro :-*", true)
    ],
    "vae.token@active"
  ),
  new Action(
    "token",
    "vae.token",
    "transfer",
    [
      new Argument("from", "flo"),
      new Argument("to", "andi"),
      new Argument("quantity", "75 VAE", true),
      new Argument("memo", "with love", true)
    ],
    "flo@active"
  ),
  new Action(
    "request",
    "vae.request",
    "create",
    [
      new Argument("requester", "flo"),
      new Argument("requestee", "andi"),
      new Argument("payment", "100 VAE", true),
      new Argument("memo", "gimme dat data", true)
    ],
    "flo@active"
  ),
  new Action(
    "request",
    "vae.request",
    "accept",
    [
      new Argument("requester", "flo"),
      new Argument("requestee", "andi"),
      new Argument("memo", "cool!", true)
    ],
    "andi@active"
  ),
  new Action(
    "request",
    "vae.request",
    "reject",
    [
      new Argument("requester", "flo"),
      new Argument("requestee", "andi"),
      new Argument("memo", "not cool!", true)
    ],
    "andi@active"
  )
];

$(document).ready(function() {
  for (let i = 0; i < actions.length; i++) {
    let action = actions[i];
    $option = $("<option></option>")
      .text(action.contract + " " + action.name)
      .data("action", action);
    $("#actions").append($option);
  }

  function setCmd() {
    const action = $("#actions")
      .find(":selected")
      .data("action");

    let cmd = action.contractAccount + " " + action.name;
    $("#actionInputContainer > input").each(function() {
      if ($(this).data("arg").isString) {
        cmd += ' "' + $(this).val() + '"';
      } else {
        cmd += " " + $(this).val();
      }
    });
    $("#cmd").text(cmd);
  }

  function createActionFieldInput(arg) {
    const id = "actionInput_" + arg.name;
    const $label = $("<label></label>")
      .text(arg.name)
      .attr("for", id);
    const $input = $("<input  class='u-full-width' type='text'></input>")
      .val(JSON.stringify(arg.value, null, 1))
      .attr("id", id)
      .data("arg", arg);
    $input.on("input", setCmd);
    $("#actionInputContainer").append($label);
    $("#actionInputContainer").append($input);
    setCmd();
  }

  function updateAction() {
    $("#actionInputContainer").empty();
    const action = $("#actions")
      .find(":selected")
      .data("action");
    for (let i = 0; i < action.args.length; i++) {
      createActionFieldInput(action.args[i]);
    }
    createActionFieldInput(new Argument("authentification", action.auth));
  }

  $("#actions").change(updateAction);
  updateAction();

  $("#action").submit(function() {
    $("#error").text("");

    const action = $("#actions")
      .find(":selected")
      .data("action");

    var args = [];
    $("#actionInputContainer > input").each(function() {
      args.push(JSON.parse($(this).val()));
    });
    var data = {
      contract: action.contractAccount,
      action: action.name,
      args: args.slice(0, -1),
      auth: args[args.length - 1]
    };
    socket.emit("action", data);
    return false;
  });

  function createTable(name, data) {
    var $table = $("<table></table>").attr({ id: name });
    var $caption = $("<caption></caption>").text(name);
    var $head = $("<thead></thead>");
    var $body = $("<tbody></tbody>");
    $table.append($caption);
    $table.append($head);
    $table.append($body);

    for (var i = 0; i < data.length; i++) {
      if (i === 0) {
        var $row = $("<tr></tr>").appendTo($head);
        for (var key in data[i]) {
          $("<td></td>")
            .text(key)
            .appendTo($row);
        }
      }
      var $row = $("<tr></tr>").appendTo($body);
      for (var key in data[i]) {
        $("<td></td>")
          .text(JSON.stringify(data[i][key], null, 1).replace(/"/g, ""))
          .appendTo($row);
      }
    }

    $("#tableContainer").append($table);
  }

  let tables_hash;

  socket.on("update", function(tables) {
    const tables_hash_new = JSON.stringify(tables);
    if (tables_hash != tables_hash_new) {
      console.log(tables);
      tables_hash = tables_hash_new;
      $("#tableContainer").empty();
      for (let name in tables) {
        createTable(name, tables[name]);
      }
    }
  });

  socket.on("err", function(error) {
    $("#error").text(error);
  });
});
