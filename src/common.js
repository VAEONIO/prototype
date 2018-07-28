const Eos = require("eosjs");
const fs = require("fs");

const keyProvider = fs
  .readFileSync(__dirname + "/../build/private_keys.txt")
  .toString()
  .split("\n");
keyProvider.pop();

eos = Eos({
  keyProvider: keyProvider
});

function handleError(error) {
  console.log(error);
}

function execute(contractName, callback, errorHandler) {
  eos
    .contract(contractName)
    .then(callback)
    .catch(errorHandler !== undefined ? errorHandler : handleError);
}

function getAuthorization(account) {
  return {
    authorization: account + "@active"
  };
}

function getTableRowsInternal(code, scope, table, callback) {
  const promise = eos.getTableRows({
    code: code,
    scope: scope,
    table: table,
    json: true
  });
  if (callback === undefined) {
    return promise;
  } else {
    promise.then(callback).catch(handleError);
  }
}

function getTables(callback) {
  getTableRowsInternal("vol.profile", "vol.profile", "profile", profiles => {
    if (profiles.rows.length > 0) {
      const promises = [];
      for (var i = 0; i < profiles.rows.length; i++) {
        promises.push(
          getTableRowsInternal(
            "vol.token",
            profiles.rows[i].account,
            "accounts"
          )
        );
        promises.push(
          getTableRowsInternal(
            "vol.request",
            profiles.rows[i].account,
            "request"
          )
        );
      }
      Promise.all(promises)
        .then(function(values) {
          const requests = {
            rows: []
          };

          for (var i = 0; i < values.length; i++) {
            const rows = values[i].rows;
            if (i % 2 === 0) {
              profiles.rows[i / 2].balance = rows[0].balance;
            } else {
              for (var j = 0; j < rows.length; j++) {
                requests.rows.push(rows[j]);
              }
            }
          }
          callback(profiles, requests);
        })
        .catch(handleError);
    }
  });
}

module.exports = {
  eos,
  execute,
  getAuthorization,
  handleError,
  getTables
};
