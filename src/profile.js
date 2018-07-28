const execute = require("./common.js").execute;
const getAuthorization = require("./common.js").getAuthorization;
const handleError = require("./common.js").handleError;
const getTableRowsInternal = require("./common.js").getTableRowsInternal;

class profile {
  constructor(account, firstName, lastName) {
    this.account = account;
    this.firstName = firstName;
    this.lastName = lastName;
  }
}

flo = new profile("flo", "Flo", "GG");
andi = new profile("andi", "Andi", "Miko");

function createOrUpdateProfile(func, profile) {
  func(
    profile.account,
    profile.firstName,
    profile.lastName,
    getAuthorization(profile.account)
  ).catch(handleError);
}

function createProfile(contract, profile) {
  createOrUpdateProfile(contract.create, profile);
}

function updateProfile(contract, profile) {
  createOrUpdateProfile(contract.update, profile);
}

function removeProfile(contract, profile) {
  contract.remove(profile.account, getAuthorization(profile.account));
}

function executeAll(callback, profiles) {
  execute("vol.profile", profile => {
    for (let p of profiles) {
      callback(profile, p);
    }
  });
}

function create() {
  executeAll(createProfile, [flo, andi]);
}

function update() {
  executeAll(updateProfile, [
    new profile("flo", "Florian", "GG"),
    new profile("andi", "Andreas", "Miko")
  ]);
}

function remove() {
  executeAll(removeProfile, [flo, andi]);
}

function print() {
  execute(profile =>
    profile.print(getAuthorization(flo.account)).catch(handleError)
  );
}

function getTableRows(callback) {
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
      }
      Promise.all(promises)
        .then(function(values) {
          for (var i = 0; i < profiles.rows.length; i++) {
            profiles.rows[i].balance = values[i].rows[0].balance;
          }
          callback(profiles);
        })
        .catch(handleError);
    }
  });
}

module.exports = { create, update, remove, print, getTableRows };
