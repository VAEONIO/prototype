#!/usr/local/bin/bash

# device to pipe output to
keosd_output_device=/dev/ttys016
nodeos_output_device=/dev/ttys018

dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null && pwd)"

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
$keosd --http-server-address=$keosd_server_address $config_dir >$keosd_output_device 2>&1 &

# start nodeos
pkill nodeos
$nodeos -e -p eosio --plugin eosio::chain_api_plugin --plugin eosio::history_api_plugin $config_dir --delete-all-blocks >$nodeos_output_device 2>&1 &

# wait for nodeos to start
sleep 1

accounts=(flo andi vol.token vol.profile vol.request vol.cash)
declare -A passwords
declare -A private_keys
declare -A public_keys

for account in "${accounts[@]}"; do
	password=$($cleos wallet create -n $account | tail -1)
	password=${password#\"}
	password=${password%\"}
	passwords[$account]+=$password
	echo "wallet created - " $account " - " $password

	$cleos wallet open -n $account >/dev/null
	$cleos wallet unlock -n $account --password $password >/dev/null

	keys=$($cleos create key)
	private_key=$(echo $keys | cut -d " " -f 3)
	private_keys[$account]+=$private_key
	public_key=$(echo $keys | cut -d " " -f 6)
	public_keys[$account]+=$public_key
	echo "key created - " $private_key " - " $public_key

	echo $private_key >>$build_dir/private_keys.txt

	$cleos wallet import -n $account --private-key $private_key >/dev/null

	#import eosio private key
	$cleos wallet import -n $account --private-key 5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3 >/dev/null

	$cleos create account eosio $account $public_key $public_key >/dev/null
done

$cleos wallet import -n vol.request --private-key ${private_keys[flo]} >/dev/null

$cleos set account permission flo active '{"threshold": 1,"keys": [{"key": "'${public_keys[vol.request]}'","weight": 1}],"accounts": [{"permission":{"actor":"vol.request","permission":"eosio.code"},"weight":1}]}' owner -p flo@active

$cleos set account permission vol.request active '{"threshold": 1,"keys": [{"key": "'${public_keys[vol.request]}'","weight": 1}],"accounts": [{"permission":{"actor":"vol.request","permission":"eosio.code"},"weight":1}]}' owner -p vol.request@active

#token contract
$cleos set contract vol.token $dir/../../eos/build/contracts/eosio.token

#profile contract
mkdir -p $build_dir/profile

# hack because of buggy eosiocpp
cp -Rf $dir/../volean $dir/../../eos/contracts
cd $dir/../../eos
$eosiocpp -g $build_dir/profile/profile.abi contracts/volean/profile.hpp

#/usr/local/eosio/bin/eosiocpp -g $dir/../build/profile/profile.abi $dir/../volean/profile.hpp
$eosiocpp -o $build_dir/profile/profile.wast contracts/volean/profile.cpp

$cleos set contract vol.profile $build_dir/profile

#request contract
mkdir -p $build_dir/request

# hack because of buggy eosiocpp
$eosiocpp -g $build_dir/request/request.abi contracts/volean/request.hpp

#/usr/local/eosio/bin/eosiocpp -g $dir/../build/profile/profile.abi $dir/../volean/profile.hpp
$eosiocpp -o $build_dir/request/request.wast contracts/volean/request.cpp

$cleos set contract vol.request $build_dir/request

touch $build_dir/NEW
