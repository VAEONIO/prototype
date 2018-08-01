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
typedef eosio::multi_index<N(profiles), profile> profile_idx;

/**
 * @abi table fields i64
 */
struct field {
  uint64_t key;
  std::string name;
  std::string value;
  int64_t price;
  auto primary_key() const { return key; }

  static uint64_t get_key(const std::string& field_name) {
    return std::hash<std::string>{}(normalize_name(field_name));
  }

  static std::string normalize_name(const std::string& name) {
    std::string normalized_name = name;
    std::transform(normalized_name.begin(), normalized_name.end(), normalized_name.begin(),
                   ::tolower);
    return normalized_name;
  }

  void set(const std::string& name, const std::string& value, int64_t price) {
    this->key = get_key(name);
    this->name = normalize_name(name);
    this->value = value;
    this->price = price;
  }

  EOSLIB_SERIALIZE(field, (key)(name)(value)(price))
};
typedef eosio::multi_index<N(fields), field> field_idx;

struct request_in {
  account_name requester;
  auto primary_key() const { return requester; }

  void set(const account_name& requester) { this->requester = requester; }
  EOSLIB_SERIALIZE(request_in, (requester))
};
typedef eosio::multi_index<N(requests_in), request_in> request_in_idx;

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

  void set(const account_name& requester, const account_name& requestee,
           const eosio::asset& payment, const std::string& public_key,
           const std::vector<std::string>& field_names, const std::string& memo) {
    this->requester = requester;
    this->requestee = requestee;
    this->payment = payment;
    this->public_key = public_key;
    std::vector<std::string> normalized_field_names;
    std::transform(field_names.begin(), field_names.end(),
                   std::back_inserter(normalized_field_names), field::normalize_name);
    this->field_names = normalized_field_names;
    this->memo = memo;
  }
  EOSLIB_SERIALIZE(request, (requester)(requestee)(payment)(public_key)(field_names)(memo))
};
typedef eosio::multi_index<N(requests), request> request_idx;

} // namespace vaeon
