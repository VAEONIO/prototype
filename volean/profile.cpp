#include "profile.hpp"

// using namespace eosio;

void volean::create(const account_name& account) {
  require_auth(account);
  profiles existing_profiles(_self, _self);
  eosio_assert(existing_profiles.find(account) == existing_profiles.end(),
               "profile already exists");

  existing_profiles.emplace(_self, [&account](auto& p) {
    p.account = account;
    p.first_name = "flo";
    p.last_name = "gg";
  });
}

void volean::remove(const account_name& account) {
  require_auth(account);
  profiles existing_profiles(_self, _self);
  auto p = existing_profiles.find(account);
  eosio_assert(p != existing_profiles.end(), "profile does not exist");
  existing_profiles.erase(p);
}

EOSIO_ABI(volean, (create)(remove))
