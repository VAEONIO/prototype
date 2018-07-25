#!/bin/bash

eos_bin_dir=/usr/local/eosio/bin
keosd_server_address="localhost:8899"
cleos="$eos_bin_dir/cleos --wallet-url=http://$keosd_server_address"
keosd=$eos_bin_dir/keosd
nodeos=$eos_bin_dir/nodeos
eosiocpp=$eos_bin_dir/eosiocpp
