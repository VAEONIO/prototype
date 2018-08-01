#pragma once
#include <eosiolib/eosio.hpp>

#include "../eosio.token/eosio.token.hpp"

namespace vaeon {

constexpr double fee_ratio = 0.1;

void calculate_fee(const eosio::asset& total, eosio::asset& result, eosio::asset& fee) {
  result = total;
  fee = total;
  result.amount *= 1 - fee_ratio;
  fee.amount *= fee_ratio;
}

eosio::symbol_name get_symbol() {
  constexpr eosio::symbol_name symbol(S(4, VAEON));
  return eosio::symbol_type(symbol).name();
}
} // namespace vaeon
