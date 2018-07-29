#include "vaeon.hpp"

#include <functional>

#include "common.hpp"

namespace vaeon {

using namespace std::placeholders;

void update_field(field& old_field, const named_string_field& new_field) {
  old_field.idx = std::hash<std::string>{}(new_field.name);
  old_field.name = new_field.name;
  old_field.value = new_field.value;
  old_field.price = new_field.price;
}

void create_or_update(const account_name& payer, field_idx& fields,
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

void vaeon::createprof(const account_name& account, const string_field& first_name,
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

void vaeon::removeprof(const account_name& account) {
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

void vaeon::updateprof(const account_name& account, const string_field& first_name,
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

void has_enough_assets(const account_name& requester, const eosio::asset& payment) {
  eosio::token t(N(vae.token));
  eosio::asset asset = t.get_balance(requester, get_symbol());
  std::string error_message = "not enough tokens (" + std::to_string(payment.amount) +
                              " requested, " + std::to_string(asset.amount) + " available)";
  eosio_assert(payment.symbol == asset.symbol, "wrong token");
  eosio_assert(payment.amount <= asset.amount, error_message.c_str());
}

void vaeon::createreq(const account_name& requester, const account_name& requestee,
                      const eosio::asset& payment, const std::string& memo) {
  eosio_assert(requester != requestee, "cannot request from yourself");
  require_auth(requester);
  eosio_assert(is_account(requestee), "requestee account does not exist");

  request_idx requests(_self, requester);
  auto r = requests.find(requestee);
  eosio_assert(r == requests.end(), "there is already a request in place");

  // todo require_recipient

  SEND_INLINE_ACTION(eosio::token(N(vae.token)), transfer, {requester, N(active)},
                     {requester, N(vae.cash), payment, memo});

  requests.emplace(_self, [&](auto& r) {
    r.requester = requester;
    r.requestee = requestee;
    r.payment = payment;
    r.memo = memo;
  });
}

void vaeon::acceptreq(const account_name& requester, const account_name& requestee,
                      const std::string& memo) {
  require_auth(requestee);
  request_idx requests(_self, requester);
  auto r = requests.find(requestee);
  eosio_assert(r != requests.end(), "request does not exist");

  SEND_INLINE_ACTION(eosio::token(N(vae.token)), transfer, {N(vae.cash), N(active)},
                     {N(vae.cash), requestee, r->payment, memo});
  requests.erase(r);
}

void vaeon::rejectreq(const account_name& requester, const account_name& requestee,
                      const std::string& memo) {
  require_auth(requestee);
  request_idx requests(_self, requester);
  auto r = requests.find(requestee);
  eosio_assert(r != requests.end(), "request does not exist");

  SEND_INLINE_ACTION(eosio::token(N(vae.token)), transfer, {N(vae.cash), N(active)},
                     {N(vae.cash), requester, r->payment, memo});
  requests.erase(r);
}

EOSIO_ABI(vaeon, (createprof)(removeprof)(updateprof)(createreq)(acceptreq)(rejectreq))
} // namespace vaeon
