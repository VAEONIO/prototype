#include "profile.hpp"

#include <functional>

using namespace std::placeholders;

void update_field(volean::field& old_field, const named_string_field& new_field) {
  old_field.idx = std::hash<std::string>{}(new_field.name);
  old_field.name = new_field.name;
  old_field.value = new_field.value;
  old_field.price = new_field.price;
}

void create_or_update(const account_name& payer, volean::field_idx& fields,
                      const std::vector<named_string_field>& string_fields) {
  std::hash<std::string> hash_fn;
  for (const auto& string_field : string_fields) {
    uint64_t idx = hash_fn(string_field.name);
    auto field_to_update = fields.find(idx);
    if (field_to_update == fields.end()) {
      fields.emplace(payer, std::bind(update_field, _1, string_field));
    } else {
      fields.modify(field_to_update, payer, std::bind(update_field, _1, string_field));
    }
  }
}

void volean::create(const account_name& account, const string_field& first_name,
                    const string_field& last_name,
                    const std::vector<named_string_field>& string_fields) {
  require_auth(account);
  profile_idx profiles(_self, account);
  eosio_assert(profiles.find(account) == profiles.end(), "profile already exists");

  profiles.emplace(_self, [&](auto& p) {
    p.account = account;
    p.first_name = first_name;
    p.last_name = last_name;
  });

  field_idx fields(_self, account);
  eosio_assert(fields.begin() == fields.end(),
               "fields exist also profile does not - this should never happen");

  create_or_update(_self, fields, string_fields);
}

void volean::remove(const account_name& account) {
  require_auth(account);
  profile_idx profiles(_self, account);
  auto profile = profiles.find(account);
  eosio_assert(profile != profiles.end(), "profile does not exist");

  field_idx fields(_self, account);
  profiles.erase(profile);

  auto fields_itr = fields.begin();
  while (fields_itr != fields.end()) {
    fields_itr = fields.erase(fields_itr);
  }
}

void volean::update(const account_name& account, const string_field& first_name,
                    const string_field& last_name,
                    const std::vector<named_string_field>& string_fields) {
  require_auth(account);
  profile_idx profiles(_self, account);
  auto profile = profiles.find(account);
  eosio_assert(profile != profiles.end(), "profile does not exist");

  profiles.modify(profile, _self, [&](auto& p) {
    p.account = account;
    p.first_name = first_name;
    p.last_name = last_name;
  });

  field_idx fields(_self, account);
  create_or_update(_self, fields, string_fields);
}

EOSIO_ABI(volean, (create)(remove)(update))
