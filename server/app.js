const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const communication = require("./communication.js");
const init = require("./init.js");

init();

app.use(function(req, res, next) {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
  next();
});

app.use("", express.static(__dirname + "/public"));

io.on("connection", function(socket) {
  let tables_hash;
  setInterval(function() {
    communication.getTables(tables => {
      const tables_hash_new = JSON.stringify(tables);
      if (tables_hash != tables_hash_new) {
        tables_hash = tables_hash_new;
        socket.emit("update", tables);
      }
    });
  }, 1000);

  function errorHandler(error) {
    socket.emit("err", error);
  }

  socket.on("action", function(data) {
    communication.execute(
      data.contract,
      data.action,
      errorHandler,
      data.auth,
      ...data.args
    );
  });
});

http.listen(3000, function() {
  console.log("listening on *:3000");
});
