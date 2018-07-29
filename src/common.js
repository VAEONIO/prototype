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

function getTable(constract, table) {
  const promises = [];
  for (let i = 0; i < accounts.length; i++) {
    promises.push(getTableRowsInternal(constract, accounts[i], table));
  }
  return Promise.all(promises);
}

function getTables(callback) {
  const profile_promise = getTable("vol.profile", "profiles");
  const profile_field_promise = getTable("vol.profile", "fields");
  const token_promise = getTable("vol.token", "accounts");
  const request_promise = getTable("vol.request", "request");

  Promise.all([
    profile_promise,
    profile_field_promise,
    token_promise,
    request_promise
  ])
    .then(values => {
      const profiles = values[0];
      const profile_fields = values[1];
      const tokens = values[2];
      const requests = values[3];

      const result = {
        profiles: [],
        profile_fields: [],
        requests: [],
        tokens: []
      };

      for (let i = 0; i < accounts.length; i++) {
        const account = accounts[i];
        const profile = profiles[i];
        const profile_field = profile_fields[i];
        const token = tokens[i];
        const request = requests[i];
        if (profile.rows.length > 0) {
          if (token.rows.length > 0) {
            profile.rows[0].balance = token.rows[0].balance;
          }
          result.profiles.push(profile.rows[0]);
        }
        if (token.rows.length > 0 && profile.rows.length == 0) {
          const row = token.rows[0];
          row.account = account;
          result.tokens.push(row);
        }
        for (let j = 0; j < profile_field.rows.length; j++) {
          const row = profile_field.rows[j];
          row.account = account;
          result.profile_fields.push(row);
        }
        for (let j = 0; j < request.rows.length; j++) {
          result.requests.push(request.rows[j]);
        }
      }
      callback(result);
    })
    .catch(handleError);
}

module.exports = {
  eos,
  execute,
  getAuthorization,
  handleError,
  getTables
};
