Eos = require("eosjs");
const profile = require("./profile.js");

const keyProvider = [
  "5KCHcvhrS669GjuJnPor2uDs5otxU4Ha1ygaoK6g5fYTWK4dx6B",
  "5K32iS8oLn8ghGsXGsGDfPF9PJVNNxSyiZQNx1KMaPNHdRW4voF",
  "5JjcfXLAvm6JEfk8q5kwYdCfc962Pb9p17QyLXQXGddJ5R85r3W"
];

eos = Eos({ keyProvider });

profile.create(eos);
profile.print(eos);
profile.update(eos);
profile.print(eos);
profile.remove(eos);
profile.print(eos);

eos
  .getTableRows({
    code: "vol.profile",
    scope: "vol.profile",
    table: "profile",
    json: true
  })
  .then(function(res) {
    console.log(res);
  });
