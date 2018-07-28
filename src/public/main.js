var socket = io();

var contracts = {
  profile: {
    name: "profile",
    account: "vol.profile",
    actions: {
      create: {
        command: "flo Flo GG flo@active"
      },
      update: {
        command: "flo Florian G flo@active"
      },
      remove: {
        command: "flo flo@active"
      }
    }
  }
};

$(document).ready(function() {
  for (var c_key in contracts) {
    var c = contracts[c_key];
    for (var a_key in c.actions) {
      var a = c.actions[a_key];
      $option = $("<option></option>")
        .val(c.account + " " + a_key + " " + a.command)
        .text(c.name + " " + a_key);
      $("#actions").append($option);
    }
  }

  function updateAction() {
    $("#actionInput").val(
      $("#actions")
        .find(":selected")
        .val()
    );
  }

  $("#actions").change(updateAction);
  updateAction();

  $("#action").submit(function() {
    $("#error").text("");
    var input = $("#actionInput")
      .val()
      .split(" ");
    var data = {
      contract: input[0],
      action: input[1],
      args: input.slice(2, -1),
      auth: input[input.length - 1]
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
