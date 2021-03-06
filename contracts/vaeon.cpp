#include "vaeon.hpp"

#include <algorithm>
#include <functional>

#include "common.hpp"

namespace vaeon {

using namespace std::placeholders;

void update_field(field& old_field, const named_string_field& new_field) {
  old_field.set(new_field.name, new_field.value, new_field.price);
}

void create_update_or_delete(const account_name& payer, field_idx& fields,
                             const std::vector<named_string_field>& string_fields) {
  for (const auto& string_field : string_fields) {
    uint64_t key = field::get_key(string_field.name);
    auto field_to_update = fields.find(key);
    if (field_to_update == fields.end()) {
      fields.emplace(payer, std::bind(update_field, _1, string_field));
    } else if (string_field.value != "") {
      fields.modify(field_to_update, payer, std::bind(update_field, _1, string_field));
    } else {
      fields.erase(field_to_update);
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

  create_update_or_delete(_self, fields, string_fields);
}

void vaeon::removeprof(const account_name& account) {
  require_auth(account);
  profile_idx profiles(_self, account);
  auto profile = profiles.find(account);
  eosio_assert(profile != profiles.end(), "profile does not exist");

  field_idx fields(_self, account);
  profiles.erase(profile);

  auto field_itr = fields.begin();
  while (field_itr != fields.end()) {
    field_itr = fields.erase(field_itr);
  }

  // remove outgoing requests
  request_idx requests(_self, account);
  auto request_itr = requests.begin();
  while (request_itr != requests.end()) {
    account_name requestee = request_itr->requestee;
    request_itr++;
    cancelreq(account, requestee);
  }

  // remove incoming requests
  request_in_idx requests_in(_self, account);
  auto request_in_itr = requests_in.begin();
  while (request_in_itr != requests_in.end()) {
    account_name requester = request_in_itr->requester;
    request_in_itr++;
    rejectreq(requester, account, "profile removed");
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
  create_update_or_delete(_self, fields, string_fields);
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
                      const eosio::asset& payment, const std::string& public_key,
                      const std::vector<std::string>& field_names, const std::string& memo) {
  eosio_assert(requester != requestee, "cannot request from yourself");
  require_auth(requester);
  eosio_assert(is_account(requestee), "requestee account does not exist");
  require_recipient(requestee);
  profile_idx profiles(_self, requestee);
  eosio_assert(profiles.begin() != profiles.end(), "requestee profile does not exist");

  // TODO: Change to unordered_set once supported.
  std::set<std::string> preset_fields = {"first_name", "last_name"};
  field_idx fields(_self, requestee);
  for (const auto& field_name : field_names) {
    eosio_assert(preset_fields.find(field::normalize_name(field_name)) != preset_fields.end() ||
                     fields.find(field::get_key(field_name)) != fields.end(),
                 "field does not exist");
  }

  request_idx requests(_self, requester);
  auto r = requests.find(requestee);
  eosio_assert(r == requests.end(), "there is already a request in place");

  SEND_INLINE_ACTION(eosio::token(N(vae.token)), transfer, {requester, N(active)},
                     {requester, N(vae.cash), payment, memo});

  requests.emplace(
      _self, [&](auto& r) { r.set(requester, requestee, payment, public_key, field_names, memo); });
  request_in_idx(_self, requestee).emplace(_self, [&](auto& r_in) { r_in.set(requester); });
}

void vaeon::remove_request_in(const account_name& requester, const account_name& requestee) {
  request_in_idx requests_in(_self, requestee);
  auto r_in = requests_in.find(requester);
  requests_in.erase(r_in);
}

void release_funds(const account_name& beneficiary, const eosio::asset& quantity, double fee_ratio,
                   const std::string& memo) {
  eosio::asset refund;
  eosio::asset fee;
  calculate_fee(quantity, refund, fee, fee_ratio);

  if (refund.amount > 0) {
    SEND_INLINE_ACTION(eosio::token(N(vae.token)), transfer, {N(vae.cash), N(active)},
                       {N(vae.cash), beneficiary, refund, memo});
  }
  if (fee.amount > 0) {
    SEND_INLINE_ACTION(eosio::token(N(vae.token)), transfer, {N(vae.cash), N(active)},
                       {N(vae.cash), N(vae.fee), fee, memo});
  }
}

void vaeon::acceptreq(const account_name& requester, const account_name& requestee,
                      const std::vector<std::string>& field_keys, const std::string& memo) {
  require_auth(requestee);
  require_recipient(requester);
  request_idx requests(_self, requester);
  auto r = requests.find(requestee);
  eosio_assert(r != requests.end(), "request does not exist");
  eosio_assert(field_keys.size() == r->field_names.size(), "wrong number of keys provided");

  // release_funds(requestee, r->payment, 0, memo);
  requests.erase(r);
  remove_request_in(requester, requestee);

  request_done_idx requests_done(_self, requester);
  requests_done.emplace(_self, [&](auto& rd) {
    rd.key = requests_done.available_primary_key();
    rd.requestee = requestee;
    rd.payment = r->payment;
    rd.release_time = now() + request_release_time;
  });
}

void vaeon::rejectreq(const account_name& requester, const account_name& requestee,
                      const std::string& memo) {
  require_auth(requestee);
  require_recipient(requester);
  request_idx requests(_self, requester);
  auto r = requests.find(requestee);
  eosio_assert(r != requests.end(), "request does not exist");

  release_funds(requester, r->payment, request_reject_fee, memo);
  requests.erase(r);
  remove_request_in(requester, requestee);
}

void vaeon::cancelreq(const account_name& requester, const account_name& requestee) {
  require_auth(requester);
  require_recipient(requestee);
  request_idx requests(_self, requester);
  auto r = requests.find(requestee);
  eosio_assert(r != requests.end(), "request does not exist");

  release_funds(requester, r->payment, request_cancel_fee, "request canceled");
  requests.erase(r);
  remove_request_in(requester, requestee);
}

void vaeon::releasereq(const account_name& requester, uint64_t key) {
  request_done_idx requests_done(_self, requester);
  auto r = requests_done.find(key);
  eosio_assert(r != requests_done.end(), "request does not exist");
  eosio_assert(r->release_time <= now(), "release time has not been reached");
  release_funds(r->requestee, r->payment, 0.0, "funds released");
  requests_done.erase(r);
}

void vaeon::burnreq(const account_name& requester, uint64_t key, const std::string& memo) {
  require_auth(requester);
  request_done_idx requests_done(_self, requester);
  auto r = requests_done.find(key);
  eosio_assert(r != requests_done.end(), "request does not exist");
  eosio_assert(r->release_time > now(), "release time has been reached");
  release_funds(requester, r->payment, 1.0, memo);
  requests_done.erase(r);
}

EOSIO_ABI(vaeon, (createprof)(removeprof)(updateprof)(createreq)(acceptreq)(rejectreq)(cancelreq)(
                     releasereq)(burnreq))
} // namespace vaeon
