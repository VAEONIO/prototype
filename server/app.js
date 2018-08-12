const eos_frontend = require("eos-frontend");
const init = require("./init.js");
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

const tables = [
  new eos_frontend.Table("vaeon", "profiles", process),
  new eos_frontend.Table("vaeon", "fields", processAddAccount),
  new eos_frontend.Table("vae.token", "accounts", processAddAccount),
  new eos_frontend.Table("vaeon", "requests", process),
  new eos_frontend.Table("vaeon", "reqin", processAddAccount),
  new eos_frontend.Table("vaeon", "reqdone", processAddAccount)
];

const actions = [
  new eos_frontend.Action(
    "vaeon",
    "createprof",
    [
      new eos_frontend.Argument("account", "flo"),
      new eos_frontend.Argument("first_name", { value: "Flo", price: 0 }),
      new eos_frontend.Argument("last_name", { value: "GG", price: 0 }),
      new eos_frontend.Argument("string_fields", [
        { name: "Age", value: "HASH", price: 10 }
      ])
    ],
    "flo@active",
    "create profile"
  ),
  new eos_frontend.Action(
    "vaeon",
    "updateprof",
    [
      new eos_frontend.Argument("account", "flo"),
      new eos_frontend.Argument("first_name", { value: "Florian", price: 0 }),
      new eos_frontend.Argument("last_name", { value: "HASH2", price: 5 }),
      new eos_frontend.Argument("string_fields", [
        { name: "University", value: "HASH", price: 20 }
      ])
    ],
    "flo@active",
    "update profile"
  ),
  new eos_frontend.Action(
    "vaeon",
    "removeprof",
    [new eos_frontend.Argument("account_name", "flo")],
    "flo@active",
    "remove profile"
  ),
  new eos_frontend.Action(
    "vae.token",
    "create",
    [
      new eos_frontend.Argument("issuer", "vae.token"),
      new eos_frontend.Argument("maximum_supply", "100000 VAE")
    ],
    "vae.token@active",
    "create token"
  ),
  new eos_frontend.Action(
    "vae.token",
    "issue",
    [
      new eos_frontend.Argument("to", "flo"),
      new eos_frontend.Argument("quantity", "100 VAE"),
      new eos_frontend.Argument("memo", "Here ya go bro :-*")
    ],
    "vae.token@active",
    "issue token"
  ),
  new eos_frontend.Action(
    "vae.token",
    "transfer",
    [
      new eos_frontend.Argument("from", "flo"),
      new eos_frontend.Argument("to", "andi"),
      new eos_frontend.Argument("quantity", "75 VAE"),
      new eos_frontend.Argument("memo", "with love")
    ],
    "flo@active",
    "transfer token"
  ),
  new eos_frontend.Action(
    "vaeon",
    "createreq",
    [
      new eos_frontend.Argument("requester", "flo"),
      new eos_frontend.Argument("requestee", "andi"),
      new eos_frontend.Argument("payment", "100 VAE"),
      new eos_frontend.Argument("public_key", "KEY_SKDFASDJLAS"),
      new eos_frontend.Argument("field_names", ["Last_Name", "age"]),
      new eos_frontend.Argument("memo", "gimme dat data")
    ],
    "flo@active",
    "create request"
  ),
  new eos_frontend.Action(
    "vaeon",
    "acceptreq",
    [
      new eos_frontend.Argument("requester", "flo"),
      new eos_frontend.Argument("requestee", "andi"),
      new eos_frontend.Argument("field_keys", [
        "KEY_IUBMAHGTZQ",
        "KEY_ALJSLKLJAJ"
      ]),
      new eos_frontend.Argument("memo", "cool!")
    ],
    "andi@active",
    "accept request"
  ),
  new eos_frontend.Action(
    "vaeon",
    "rejectreq",
    [
      new eos_frontend.Argument("requester", "flo"),
      new eos_frontend.Argument("requestee", "andi"),
      new eos_frontend.Argument("memo", "not cool!")
    ],
    "andi@active",
    "reject request"
  ),
  new eos_frontend.Action(
    "vaeon",
    "cancelreq",
    [
      new eos_frontend.Argument("requester", "flo"),
      new eos_frontend.Argument("requestee", "andi")
    ],
    "flo@active",
    "cancel request"
  ),
  new eos_frontend.Action(
    "vaeon",
    "releasereq",
    [
      new eos_frontend.Argument("requester", "flo"),
      new eos_frontend.Argument("key", 0)
    ],
    "andi@active",
    "release request"
  ),
  new eos_frontend.Action(
    "vaeon",
    "burnreq",
    [
      new eos_frontend.Argument("requester", "flo"),
      new eos_frontend.Argument("key", 0),
      new eos_frontend.Argument("memo", "fake data!")
    ],
    "flo@active",
    "burn request"
  )
];

eos_frontend.start(keyProvider, accounts, tables, actions);
init();
