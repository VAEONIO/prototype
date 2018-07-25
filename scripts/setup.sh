#!/bin/bash

# device to pipe output to
keosd_output_device=/dev/ttys016
nodeos_output_device=/dev/ttys018

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

source $DIR/vars.sh

runtime_dir=$DIR/../runtime

rm -rf $runtime_dir
mkdir -p $runtime_dir/wallets

$DIR/create_config.sh $runtime_dir/config.ini $runtime_dir/wallets

config_dir="--config-dir $runtime_dir"

# start keosd
pkill keosd
$keosd --http-server-address=$keosd_server_address $config_dir > $keosd_output_device 2>&1 &

# start nodeos
pkill nodeos
$nodeos -e -p eosio --plugin eosio::chain_api_plugin --plugin eosio::history_api_plugin $config_dir --delete-all-blocks > $nodeos_output_device 2>&1 &

# wait for nodeos to start
sleep 1

accounts=(flo andi vol.token vol.profile)
wallet_passwords=()

for account in "${accounts[@]}" 
do
  password=$($cleos wallet create -n $account | tail -1)
  password=${password#\"}
  password=${password%\"}
  wallet_passwords+=$password
  echo "wallet created - " $account " - " $password

  $cleos wallet open -n $account > /dev/null
  $cleos wallet unlock -n $account --password $password > /dev/null

  keys=$($cleos create key)
  private_key=$(echo $keys | cut -d " " -f 3)
  public_key=$(echo $keys | cut -d " " -f 6)
  echo "key created - " $private_key " - " $public_key
  $cleos wallet import -n $account --private-key $private_key > /dev/null

  #import eosio private key
  $cleos wallet import -n $account --private-key 5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3 > /dev/null

  $cleos create account eosio $account $public_key $public_key > /dev/null
done

#token contract
$cleos set contract vol.token $DIR/../../eos/build/contracts/eosio.token
$cleos push action vol.token create '[ "vol.token", "10000.0000 VOL"]' -p vol.token

#profile contract
mkdir -p $DIR/../build/profile

# hack because of buggy eosiocpp
cp -Rf $DIR/../volean $DIR/../../eos/contracts
cd $DIR/../../eos
$eosiocpp -g $DIR/../build/profile/profile.abi contracts/volean/profile.hpp

#/usr/local/eosio/bin/eosiocpp -g $DIR/../build/profile/profile.abi $DIR/../volean/profile.hpp
$eosiocpp -o $DIR/../build/profile/profile.wast $DIR/../volean/profile.cpp

$cleos set contract vol.profile $DIR/../build/profile
