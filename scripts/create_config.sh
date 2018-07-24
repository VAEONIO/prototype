#!/bin/bash

outfile=$1
wallet_dir=$2

cat > $outfile << EOL
unlock-timeout = 31557600
contracts-console = true
wallet-dir = "$wallet_dir"
http-alias=localhost:8888
EOL
