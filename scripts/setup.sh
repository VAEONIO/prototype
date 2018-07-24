#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null && pwd )"

runtime_dir=$DIR/../runtime

rm -rf $runtime_dir
mkdir -p $runtime_dir/wallets

$DIR/create_config.sh $runtime_dir/config.ini $runtime_dir/wallets

keosd_server_address="localhost:8899"
config_dir="--config-dir $runtime_dir"
cleos="/usr/local/eosio/bin/cleos --wallet-url=http://$keosd_server_address"
keosd="/usr/local/eosio/bin/keosd"
nodeos="/usr/local/eosio/bin/nodeos"

# pipe output to different device
keosd_output_device=/dev/ttys016 
nodeos_output_device=/dev/ttys012 

# start keosd
pkill keosd
$keosd --http-server-address=$keosd_server_address $config_dir > $keosd_output_device 2>&1 &

# start nodeos
pkill nodeos
$nodeos -e -p eosio --plugin eosio::chain_api_plugin --plugin eosio::history_api_plugin $config_dir --delete-all-blocks > $nodeos_output_device 2>&1 &

# wait for nodeos to start
sleep 1

accounts=(flo andi volean)
#accounts=(flo)
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
