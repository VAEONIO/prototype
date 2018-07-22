#!/bin/sh

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

mkdir $DIR/../build
/usr/local/eosio/bin/eosiocpp -o $DIR/../build/profile.wast $DIR/../volean/profile.hpp $DIR/../volean/profile.cpp
