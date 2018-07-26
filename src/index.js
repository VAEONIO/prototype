const token = require("./token.js");
const profile = require("./profile.js");

init = true;
init = false;

if (init) {
  profile.create();
  token.create();
} else {
  profile.update();
  token.issue();
}

profile.getTableRows(res => console.log(res));
token.getTableRows(res => console.log(res));
