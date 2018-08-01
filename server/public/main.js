var socket = io();

class Argument {
  constructor(name, value) {
    this.name = name;
    this.value = value;
  }
}

class Action {
  constructor(contract, name, args, auth, description) {
    this.contract = contract;
    this.name = name;
    this.args = args;
    this.auth = auth;
    this.description = description;
  }
}

var actions = [
  new Action(
    "vaeon",
    "createprof",
    [
      new Argument("account", "flo"),
      new Argument("first_name", { value: "Flo", price: 0 }),
      new Argument("last_name", { value: "GG", price: 0 }),
      new Argument("string_fields", [{ name: "Age", value: "HASH", price: 10 }])
    ],
    "flo@active",
    "create profile"
  ),
  new Action(
    "vaeon",
    "updateprof",
    [
      new Argument("account", "flo"),
      new Argument("first_name", { value: "Florian", price: 0 }),
      new Argument("last_name", { value: "HASH2", price: 5 }),
      new Argument("string_fields", [
        { name: "University", value: "HASH", price: 20 }
      ])
    ],
    "flo@active",
    "update profile"
  ),
  new Action(
    "vaeon",
    "removeprof",
    [new Argument("account_name", "flo")],
    "flo@active",
    "remove profile"
  ),
  new Action(
    "vae.token",
    "create",
    [
      new Argument("issuer", "vae.token"),
      new Argument("maximum supply", "100000 VAE")
    ],
    "vae.token@active",
    "create token"
  ),
  new Action(
    "vae.token",
    "issue",
    [
      new Argument("to", "flo"),
      new Argument("quantity", "100 VAE"),
      new Argument("memo", "Here ya go bro :-*")
    ],
    "vae.token@active",
    "issue token"
  ),
  new Action(
    "vae.token",
    "transfer",
    [
      new Argument("from", "flo"),
      new Argument("to", "andi"),
      new Argument("quantity", "75 VAE"),
      new Argument("memo", "with love")
    ],
    "flo@active",
    "transfer token"
  ),
  new Action(
    "vaeon",
    "createreq",
    [
      new Argument("requester", "flo"),
      new Argument("requestee", "andi"),
      new Argument("payment", "100 VAE"),
      new Argument("public_key", "KEY_SKDFASDJLAS"),
      new Argument("field_names", ["Last_Name", "age"]),
      new Argument("memo", "gimme dat data")
    ],
    "flo@active",
    "create request"
  ),
  new Action(
    "vaeon",
    "acceptreq",
    [
      new Argument("requester", "flo"),
      new Argument("requestee", "andi"),
      new Argument("field_keys", ["KEY_IUBMAHGTZQ", "KEY_ALJSLKLJAJ"]),
      new Argument("memo", "cool!")
    ],
    "andi@active",
    "accept request"
  ),
  new Action(
    "vaeon",
    "rejectreq",
    [
      new Argument("requester", "flo"),
      new Argument("requestee", "andi"),
      new Argument("memo", "not cool!")
    ],
    "andi@active",
    "reject request"
  ),
  new Action(
    "vaeon",
    "cancelreq",
    [new Argument("requester", "flo"), new Argument("requestee", "andi")],
    "flo@active",
    "cancel request"
  )
];

$(document).ready(function() {
  for (let i = 0; i < actions.length; i++) {
    let action = actions[i];
    $option = $("<option></option>")
      .text(action.description)
      .data("action", action);
    $("#actions").append($option);
  }

  function setCmd() {
    const action = $("#actions")
      .find(":selected")
      .data("action");

    let cmd = action.contract + " " + action.name + " '{";
    for (let i = 0; i < action.args.length; i++) {
      let arg = action.args[i];
      if (i > 0) {
        cmd += ", ";
      }
      cmd += '"' + arg.name + '": ' + $("#actionInput_" + arg.name).val();
    }
    cmd += "}' -p " + $("#actionInput_authentification").val();
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
      contract: action.contract,
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

  socket.on("update", function(tables) {
    $("#tableContainer").empty();
    for (let name in tables) {
      createTable(name, tables[name]);
    }
  });

  socket.on("err", function(error) {
    $("#error").text(error);
  });
});
