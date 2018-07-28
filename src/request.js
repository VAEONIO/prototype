const execute = require("./common.js").execute;
const getAuthorization = require("./common.js").getAuthorization;
const getTableRowsInternal = require("./common.js").getTableRowsInternal;
const handleError = require("./common.js").handleError;

function create() {
  execute("vol.request", request => {
    request
      .create(
        "flo",
        "andi",
        "3000 VOL",
        "please share your data",
        getAuthorization("flo")
      )
      .catch(handleError);
  });
}

function accept() {
  execute("vol.request", request => {
    request.accept("flo", "andi", getAuthorization("andi")).catch(handleError);
  });
}

function reject() {
  execute("vol.request", request => {
    request.reject("flo", "andi", getAuthorization("andi")).catch(handleError);
  });
}

function getTableRows(callback) {
  getTableRowsInternal(callback, "vol.request", "flo", "accounts");
  getTableRowsInternal(callback, "vol.request", "andi", "accounts");
  getTableRowsInternal(callback, "vol.request", "vol.request", "stat");
}

module.exports = { create, accept, reject, getTableRows };
