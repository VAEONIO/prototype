class profile {
  constructor(account, firstName, lastName) {
    this.account = account;
    this.firstName = firstName;
    this.lastName = lastName;
  }
}

flo = new profile("flo", "Flo", "GG");
andi = new profile("andi", "Andi", "Miko");

function getAuthorization(profile) {
  return {
    authorization: profile.account + "@active"
  };
}

function createOrUpdateProfile(func, profile) {
  func(
    profile.account,
    profile.firstName,
    profile.lastName,
    getAuthorization(profile)
  );
}

function createProfile(contract, profile) {
  createOrUpdateProfile(contract.create, profile);
}

function updateProfile(contract, profile) {
  createOrUpdateProfile(contract.update, profile);
}

function removeProfile(contract, profile) {
  contract.remove(profile.account, getAuthorization(profile));
}

function handleError(error) {
  console.log(error);
}

function execute(eos, callback) {
  eos
    .contract("vol.profile")
    .then(callback)
    .catch(handleError);
}

function executeAll(eos, callback, profiles) {
  execute(eos, profile => {
    for (let p of profiles) {
      callback(profile, p);
    }
  });
}

function create(eos) {
  executeAll(eos, createProfile, [flo, andi]);
}

function update(eos) {
  executeAll(eos, updateProfile, [
    new profile("flo", "Florian", "GG"),
    new profile("andi", "Andreas", "Miko")
  ]);
}

function remove(eos) {
  executeAll(eos, removeProfile, [flo, andi]);
}

function print(eos) {
  execute(eos, profile => profile.print(getAuthorization(flo)));
}

module.exports = { create, update, remove, print };
