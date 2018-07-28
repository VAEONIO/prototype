const execute = require("./common.js").execute;
const getAuthorization = require("./common.js").getAuthorization;
const getTableRowsInternal = require("./common.js").getTableRowsInternal;
const handleError = require("./common.js").handleError;

function create() {
  execute("vol.token", token => {
    token
      .create("vol.profile", "10000000 VOL", getAuthorization("vol.token"))
      .catch(handleError);
  });
}

function issue() {
  execute("vol.token", token => {
    token
      .issue("flo", "1000 VOL", "k&n", getAuthorization("vol.profile"))
      .catch(handleError);
  });
}

function transfer() {
  execute("vol.token", token => {
    token
      .transfer("flo", "andi", "100 VOL", "k&n", getAuthorization("flo"))
      .catch(handleError);
  });
}

function getTableRows(callback) {
  getTableRowsInternal(callback, "vol.token", "flo", "accounts");
  getTableRowsInternal(callback, "vol.token", "andi", "accounts");
  getTableRowsInternal(callback, "vol.token", "vol.token", "stat");
}

module.exports = { create, issue, transfer, getTableRows };
