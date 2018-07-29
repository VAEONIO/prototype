const fs = require("fs");

const common = require("./common.js");

module.exports = () => {
  if (fs.existsSync(__dirname + "/../build/NEW")) {
    //fs.unlinkSync(__dirname + "/../build/NEW");
    common.execute(
      "vol.token",
      "create",
      undefined,
      "vol.token@active",
      "vol.token",
      "100000 VOL"
    );
    common.execute(
      "vol.token",
      "issue",
      undefined,
      "vol.token@active",
      "flo",
      "500 VOL",
      "memo"
    );
    common.execute(
      "vol.token",
      "issue",
      undefined,
      "vol.token@active",
      "andi",
      "500 VOL",
      "memo"
    );
    common.execute(
      "vol.profile",
      "create",
      undefined,
      "flo@active",
      "flo",
      {
        value: "Flo",
        price: 0
      },
      {
        value: "GG",
        price: 0
      },
      [
        {
          name: "Age",
          value: "29",
          price: 0
        }
      ]
    );
    common.execute(
      "vol.profile",
      "create",
      undefined,
      "andi@active",
      "andi",
      {
        value: "Andi",
        price: 0
      },
      {
        value: "Miko",
        price: 0
      },
      [
        {
          name: "Age",
          value: "HASH_LJLDS",
          price: 10
        },
        {
          name: "University",
          value: "HASH_LOHLL",
          price: 30
        }
      ]
    );
  }
};
