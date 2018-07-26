#!/bin/bash

# device to pipe output to
keosd_output_device=/dev/ttys016
nodeos_output_device=/dev/ttys018

dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

source $dir/vars.sh

runtime_dir=$dir/../runtime
build_dir=$dir/../build

rm -rf $runtime_dir
rm -rf $build_dir
mkdir -p $runtime_dir/wallets
mkdir -p $build_dir

$dir/create_config.sh $runtime_dir/config.ini $runtime_dir/wallets

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

  echo $private_key >> $build_dir/private_keys.txt

  $cleos wallet import -n $account --private-key $private_key > /dev/null

  #import eosio private key
  $cleos wallet import -n $account --private-key 5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3 > /dev/null

  $cleos create account eosio $account $public_key $public_key > /dev/null
done

#token contract
$cleos set contract vol.token $dir/../../eos/build/contracts/eosio.token

#profile contract
mkdir -p $build_dir/profile

# hack because of buggy eosiocpp
cp -Rf $dir/../volean $dir/../../eos/contracts
cd $dir/../../eos
$eosiocpp -g $build_dir/profile/profile.abi contracts/volean/profile.hpp

#/usr/local/eosio/bin/eosiocpp -g $dir/../build/profile/profile.abi $dir/../volean/profile.hpp
$eosiocpp -o $build_dir/profile/profile.wast $dir/../volean/profile.cpp

$cleos set contract vol.profile $build_dir/profile
