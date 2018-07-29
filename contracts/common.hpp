#pragma once
#include <eosiolib/eosio.hpp>

#include "../eosio.token/eosio.token.hpp"

namespace vaeon {

constexpr double fee = 0.1;

eosio::symbol_name get_symbol() {
  constexpr eosio::symbol_name symbol(S(4, VAEON));
  return eosio::symbol_type(symbol).name();
}
} // namespace vaeon
