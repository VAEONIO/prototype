const execute = require("./common.js").execute;
const getAuthorization = require("./common.js").getAuthorization;
const getTableRowsInternal = require("./common.js").getTableRowsInternal;
const handleError = require("./common.js").handleError;

function create() {
  execute("vol.token", token => {
    token
      .create("vol.profile", "10000000.0000 VOL", getAuthorization("vol.token"))
      .catch(handleError);
  });
}

function issue() {
  execute("vol.token", token => {
    token
      .issue("flo", "1337.0000 VOL", "k&n", getAuthorization("vol.profile"))
      .catch(handleError);
  });
}

function getTableRows(callback) {
  getTableRowsInternal(callback, "vol.token", "flo", "accounts");
  getTableRowsInternal(callback, "vol.token", "vol.token", "stat");
}

module.exports = { create, issue, getTableRows };
