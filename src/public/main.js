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
    "vol.profile",
    "create",
    [
      new Argument("account_name", "flo"),
      new Argument("first_name", "Flo"),
      new Argument("last_name", "GG")
    ],
    "flo@active"
  ),
  new Action(
    "profile",
    "vol.profile",
    "update",
    [
      new Argument("account_name", "flo"),
      new Argument("first_name", "Florian"),
      new Argument("last_name", "G")
    ],
    "flo@active"
  ),
  new Action(
    "profile",
    "vol.profile",
    "remove",
    [new Argument("account_name", "flo")],
    "flo@active"
  ),
  new Action(
    "token",
    "vol.token",
    "create",
    [
      new Argument("issuer", "vol.token"),
      new Argument("maximum supply", "100000 VOL", true)
    ],
    "vol.token@active"
  ),
  new Action(
    "token",
    "vol.token",
    "issue",
    [
      new Argument("to", "flo"),
      new Argument("quantity", "100 VOL", true),
      new Argument("memo", "Here ya go bro :-*", true)
    ],
    "vol.token@active"
  ),
  new Action(
    "token",
    "vol.token",
    "transfer",
    [
      new Argument("from", "flo"),
      new Argument("to", "andi"),
      new Argument("quantity", "10 VOL", true),
      new Argument("memo", "with love", true)
    ],
    "flo@active"
  ),
  new Action(
    "request",
    "vol.request",
    "create",
    [
      new Argument("requester", "flo"),
      new Argument("requestee", "andi"),
      new Argument("payment", "100 VOL", true),
      new Argument("memo", "gimme dat data", true)
    ],
    "flo@active"
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
      .val(arg.value)
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
      args.push($(this).val());
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
    var $head = $("<thead></thead>");
    var $body = $("<tbody></tbody>");
    $table.append($head);
    $table.append($body);

    for (var i = 0; i < data.rows.length; i++) {
      if (i === 0) {
        var $row = $("<tr></tr>").appendTo($head);
        for (var key in data.rows[i]) {
          $("<td></td>")
            .text(key)
            .appendTo($row);
        }
      }
      var $row = $("<tr></tr>").appendTo($body);
      for (var key in data.rows[i]) {
        $("<td></td>")
          .text(data.rows[i][key])
          .appendTo($row);
      }
    }
    $("#" + name).replaceWith($table);
  }

  socket.on("update", function(profiles, requests) {
    createTable("profiles", profiles);
    createTable("requests", requests);
  });

  socket.on("err", function(error) {
    $("#error").text(error);
  });
});
