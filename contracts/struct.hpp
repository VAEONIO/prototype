#pragma once

#include <eosiolib/eosio.hpp>

namespace vaeon {

struct string_field {
  std::string value;
  int64_t price;
};

struct named_string_field {
  std::string name;
  std::string value;
  int64_t price;
};

/**
 * @abi table fields i64
 */
struct field {
  uint64_t idx;
  std::string name;
  std::string value;
  int64_t price;
  auto primary_key() const { return idx; }
  EOSLIB_SERIALIZE(field, (idx)(name)(value)(price))
};

typedef eosio::multi_index<N(fields), field> field_idx;

/**
 * @abi table profiles i64
 */
struct profile {
  account_name account;
  string_field first_name;
  string_field last_name;
  auto primary_key() const { return account; }
  EOSLIB_SERIALIZE(profile, (account)(first_name)(last_name))
};

/**
 * @brief The table definition for the profiles.
 */
typedef eosio::multi_index<N(profiles), profile> profile_idx;

/**
 * @abi table requests i64
 */
struct request {
  account_name requester;
  account_name requestee;
  eosio::asset payment;
  std::string memo;
  auto primary_key() const { return requestee; }
  EOSLIB_SERIALIZE(request, (requester)(requestee)(payment)(memo))
};

typedef eosio::multi_index<N(requests), request> request_idx;
} // namespace vaeon
