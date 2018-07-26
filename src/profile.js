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
  getTableRowsInternal(callback, "vol.profile", "vol.profile", "profile");
}

module.exports = { create, update, remove, print, getTableRows };
