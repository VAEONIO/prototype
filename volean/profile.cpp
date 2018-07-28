#include "profile.hpp"

void volean::create(const account_name& account, const std::string& first_name,
                    const std::string& last_name) {
  require_auth(account);
  profiles_idx profiles(_self, _self);
  eosio_assert(profiles.find(account) == profiles.end(), "profile already exists");

  profiles.emplace(_self, [&](auto& p) {
    p.account = account;
    p.first_name = first_name;
    p.last_name = last_name;
  });
}

void volean::remove(const account_name& account) {
  require_auth(account);
  profiles_idx profiles(_self, _self);
  auto profile = profiles.find(account);
  eosio_assert(profile != profiles.end(), "profile does not exist");
  profiles.erase(profile);
}

void volean::update(const account_name& account, const std::string& first_name,
                    const std::string& last_name) {
  require_auth(account);
  profiles_idx profiles(_self, _self);
  auto profile = profiles.find(account);
  eosio_assert(profile != profiles.end(), "profile does not exist");

  profiles.modify(profile, _self, [&](auto& p) {
    p.first_name = first_name;
    p.last_name = last_name;
  });
}

EOSIO_ABI(volean, (create)(remove)(update))
