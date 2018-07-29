const express = require("express");
const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);

const profile = require("./profile.js");
const common = require("./common.js");
const init = require("./init.js");

init();

app.get("/", function(req, res) {
  res.sendFile(__dirname + "/public/index.html");
});

app.use(function(req, res, next) {
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");
  next();
});

app.use("", express.static(__dirname + "/public"));

io.on("connection", function(socket) {
  setInterval(function() {
    common.getTables(tables => socket.emit("update", tables));
  }, 1000);

  function errorHandler(error) {
    socket.emit("err", error);
  }

  socket.on("action", function(data) {
    common.execute(
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
