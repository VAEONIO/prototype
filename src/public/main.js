var socket = io();

class Argument {
  constructor(name, value) {
    this.name = name;
    this.value = value;
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
  )
];
//profile: {
//  name: "token",
//  account: "vol.token",
//  actions: {
//    create: {
//      command: "vol.token 100000 VOL vol.token@active"
//    },
//    issue: {
//      command: "flo 1000 VOL flo@active"
//    },
//    remove: {
//      command: "flo flo@active"
//    }
//  }
//}

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
      cmd += " " + $(this).val();
    });
    $("#cmd").text(cmd);
  }

  function createActionFieldInput(name, value) {
    const id = "actionInput_" + name;
    const $label = $("<label></label>")
      .text(name)
      .attr("for", id);
    const $input = $("<input  class='u-full-width' type='text'></input>")
      .val(value)
      .attr("id", id);
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
      createActionFieldInput(action.args[i].name, action.args[i].value);
    }
    createActionFieldInput("authentification", action.auth);
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
    console.log(data);
    socket.emit("action", data);
    return false;
  });

  socket.on("update", function(profiles) {
    var $table = $("<table></table>").attr({ id: "profiles" });
    var $head = $("<thead></thead>");
    var $body = $("<tbody></tbody>");
    $table.append($head);
    $table.append($body);

    for (var i = 0; i < profiles.rows.length; i++) {
      if (i === 0) {
        var $row = $("<tr></tr>").appendTo($head);
        for (var key in profiles.rows[i]) {
          $("<td></td>")
            .text(key)
            .appendTo($row);
        }
      }
      var $row = $("<tr></tr>").appendTo($body);
      for (var key in profiles.rows[i]) {
        $("<td></td>")
          .text(profiles.rows[i][key])
          .appendTo($row);
      }
    }
    $("#profiles").replaceWith($table);
  });

  socket.on("err", function(error) {
    $("#error").text(error);
  });
});
