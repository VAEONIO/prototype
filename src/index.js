const token = require("./token.js");
const profile = require("./profile.js");
const request = require("./request.js");
const fs = require("fs");

if (fs.existsSync(__dirname + "/../build/NEW")) {
  fs.unlinkSync(__dirname + "/../build/NEW");
  profile.create();
  token.create();
  token.issue();
} else {
  profile.update();
  token.issue();
  token.transfer();
  request.create();
}

profile.getTableRows(res => console.log(res));
token.getTableRows(res => console.log(res));
