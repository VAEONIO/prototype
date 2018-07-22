#include "profile.hpp"

// using namespace eosio;

void volean::create(const account_name& account) {
  require_auth(account);
  profiles existing_profile(_self, account);
  eosio_assert(existing_profile.begin() == existing_profile.end(), "profile already exists");

  existing_profile.emplace(account, [&account](auto& p) { p.account = account; });
}
