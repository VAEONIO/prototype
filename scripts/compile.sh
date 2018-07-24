#!/bin/bash

cleos="/usr/local/eosio/bin/cleos --wallet-url=http://localhost:8899"
eosiocpp=/usr/local/eosio/bin/eosiocpp

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

mkdir -p $DIR/../build/profile

# hack because of buggy eosiocpp
cp -Rf $DIR/../volean $DIR/../../eos/contracts
cd $DIR/../../eos
$eosiocpp -g $DIR/../build/profile/profile.abi contracts/volean/profile.hpp

#/usr/local/eosio/bin/eosiocpp -g $DIR/../build/profile/profile.abi $DIR/../volean/profile.hpp
$eosiocpp -o $DIR/../build/profile/profile.wast $DIR/../volean/profile.cpp

$cleos set contract volean $DIR/../build/profile
$cleos push action volean create '{"account":"flo", "first_name":"Flo", "last_name":"GG"}' --permission flo@active
$cleos push action volean create '{"account":"andi", "first_name":"A1m", "last_name":"Miko"}' --permission andi@active
$cleos push action volean print '' --permission flo@active
