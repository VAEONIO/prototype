# Vaeon

## Installation

#### Install eos
- Clone the eos repository by running `git clone git@github.com:EOSIO/eos.git --recursive`
- Build eos with the [autobuild script](https://developers.eos.io/eosio-nodeos/docs/autobuild-script) 
- Verify the build by running the command provided in the output of the previous command
- Install the binaries by running `sudo make install` inside the eos build directory

#### Setup vaeon
- `git clone git@github.com:devgg/vaeon.git`
- `cd server && npm install`
- `cd ..`
- `cp scripts/config_template.sh scripts/config.sh`
- Fill in the values in `scripts/config.sh`

#### Start vaeon development environment
- `./scripts/setup.sh`
- `node server/app.js`
- Go to http://localhost:3000/ in your browser
