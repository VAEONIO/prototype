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
 * @abi table fields i64
 */
struct field {
  uint64_t idx;
  std::string name;
  std::string value;
  int64_t price;
  auto primary_key() const { return idx; }

  static uint64_t get_idx(const std::string& field_name) {
    return std::hash<std::string>{}(normalize_name(field_name));
  }

  static std::string normalize_name(const std::string& name) {
    std::string normalized_name = name;
    std::transform(normalized_name.begin(), normalized_name.end(), normalized_name.begin(),
                   ::tolower);
    return normalized_name;
  }

  void set(const std::string& name_new, const std::string& value_new, int64_t price_new) {
    idx = get_idx(name_new);
    name = normalize_name(name_new);
    value = value_new;
    price = price_new;
  }

  EOSLIB_SERIALIZE(field, (idx)(name)(value)(price))
}; // namespace vaeon

typedef eosio::multi_index<N(fields), field> field_idx;

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
  std::string public_key;
  std::vector<std::string> field_names;
  std::string memo;
  auto primary_key() const { return requestee; }

  void set(const account_name& requester_new, const account_name& requestee_new,
           const eosio::asset& payment_new, const std::string& public_key_new,
           const std::vector<std::string>& field_names_new, const std::string& memo_new) {
    requester = requester_new;
    requestee = requestee_new;
    payment = payment_new;
    public_key = public_key_new;
    std::vector<std::string> normalized_field_names;
    std::transform(field_names_new.begin(), field_names_new.end(),
                   std::back_inserter(normalized_field_names), field::normalize_name);
    field_names = normalized_field_names;
    memo = memo_new;
  }
  EOSLIB_SERIALIZE(request, (requester)(requestee)(payment)(public_key)(field_names)(memo))
};

typedef eosio::multi_index<N(requests), request> request_idx;
} // namespace vaeon
