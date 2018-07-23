#!/bin/sh

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

mkdir -p $DIR/../build/profile

# hack because of buggy eosiocpp
cp -Rf $DIR/../volean $DIR/../../eos/contracts
cd $DIR/../../eos
/usr/local/eosio/bin/eosiocpp -g $DIR/../build/profile/profile.abi contracts/volean/profile.hpp

#/usr/local/eosio/bin/eosiocpp -g $DIR/../build/profile/profile.abi $DIR/../volean/profile.hpp
/usr/local/eosio/bin/eosiocpp -o $DIR/../build/profile/profile.wast $DIR/../volean/profile.cpp

/usr/local/eosio/bin/cleos set contract flo $DIR/../build/profile
