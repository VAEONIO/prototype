const fs = require("fs");

const communication = require("./communication.js");

module.exports = () => {
  if (fs.existsSync(__dirname + "/../build/NEW")) {
    fs.unlinkSync(__dirname + "/../build/NEW");
    communication.execute(
      "vae.token",
      "create",
      undefined,
      "vae.token@active",
      "vae.token",
      "100000 VAE"
    );
    communication.execute(
      "vae.token",
      "issue",
      undefined,
      "vae.token@active",
      "flo",
      "500 VAE",
      "memo"
    );
    communication.execute(
      "vae.token",
      "issue",
      undefined,
      "vae.token@active",
      "andi",
      "500 VAE",
      "memo"
    );
    communication.execute(
      "vaeon",
      "createprof",
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
        },
        {
          name: "Picture",
          value:
            "https://ipfs.io/ipfs/QmW2WQi7j6c7UgJTarActp7tDNikE4B2qXtFCfLPdsgaTQ/cat.jpg",
          price: 0
        }
      ]
    );
    communication.execute(
      "vaeon",
      "createprof",
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
