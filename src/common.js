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

function getTableRowsInternal(callback, code, scope, table) {
  eos
    .getTableRows({
      code: code,
      scope: scope,
      table: table,
      json: true
    })
    .then(callback)
    .catch(handleError);
}

module.exports = {
  eos,
  execute,
  getAuthorization,
  handleError,
  getTableRowsInternal
};
