const Eos = require("eosjs");
const fs = require("fs");

function loadFile(path) {
  const array = fs
    .readFileSync(__dirname + path)
    .toString()
    .split("\n");
  array.pop();
  return array;
}

const keyProvider = loadFile("/../build/private_keys.txt");
const accounts = loadFile("/../build/accounts.txt");

eos = Eos({
  keyProvider: keyProvider
});

function handleError(error) {
  console.log(error);
}

function execute(contractName, action, errorHandler, auth, ...args) {
  const handler = errorHandler !== undefined ? errorHandler : handleError;
  args.push({ authorization: auth });
  eos
    .contract(contractName)
    .then(c => {
      c[action].apply(c[action], args).catch(handler);
    })
    .catch(handler);
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

class Table {
  constructor(contract, name, processor) {
    this.contract = contract;
    this.name = name;
    this.processor = processor;
  }
}

function queryTable(table) {
  const promises = [];
  for (let i = 0; i < accounts.length; i++) {
    promises.push(
      getTableRowsInternal(table.contract, accounts[i], table.name)
    );
  }
  return Promise.all(promises);
}

function process(data, output) {
  for (let i = 0; i < data.rows.length; i++) {
    output.push(data.rows[i]);
  }
}

function processAddAccount(data, output, account) {
  for (let i = 0; i < data.rows.length; i++) {
    const row = data.rows[i];
    row.account = account;
    output.push(row);
  }
}

function getTables(callback) {
  const tables = [
    new Table("vaeon", "profiles", process),
    new Table("vaeon", "fields", processAddAccount),
    new Table("vae.token", "accounts", processAddAccount),
    new Table("vaeon", "requests", process),
    new Table("vaeon", "reqin", processAddAccount),
    new Table("vaeon", "reqdone", processAddAccount)
  ];

  Promise.all(tables.map(t => queryTable(t)))
    .then(values => {
      const result = {};
      for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        const outputTableName = tables[i].contract + "/" + tables[i].name;
        result[outputTableName] = [];
        for (let j = 0; j < accounts.length; j++) {
          const data = values[i][j];
          table.processor(data, result[outputTableName], accounts[j]);
        }
      }
      callback(result);
    })
    .catch(handleError);
}

module.exports = {
  execute,
  getTables
};
