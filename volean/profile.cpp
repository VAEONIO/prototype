#include "profile.hpp"

// using namespace eosio;

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
  auto p = profiles.find(account);
  eosio_assert(p != profiles.end(), "profile does not exist");
  profiles.erase(p);
}

void volean::print() {
  profiles_idx profiles(_self, _self);
  for (auto it = profiles.begin(); it != profiles.end(); ++it) {
    eosio::print(it->first_name, " ", it->last_name, "\n");
  }
}

EOSIO_ABI(volean, (create)(remove)(print))
