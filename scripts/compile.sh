#!/bin/sh

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

mkdir -p $DIR/../build
/usr/local/eosio/bin/eosiocpp -g $DIR/../build/profile.abi $DIR/../volean/profile.hpp
/usr/local/eosio/bin/eosiocpp -o $DIR/../build/profile.wast $DIR/../volean/profile.cpp
