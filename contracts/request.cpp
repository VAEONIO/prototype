#include "request.hpp"

#include "common.hpp"

namespace vaeon {

void has_enough_assets(const account_name& requester, const eosio::asset& payment) {
  eosio::token t(N(vae.token));
  eosio::asset asset = t.get_balance(requester, get_symbol());
  std::string error_message = "not enough tokens (" + std::to_string(payment.amount) +
                              " requested, " + std::to_string(asset.amount) + " available)";
  eosio_assert(payment.symbol == asset.symbol, "wrong token");
  eosio_assert(payment.amount <= asset.amount, error_message.c_str());
}

void request::create(const account_name& requester, const account_name& requestee,
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

void request::accept(const account_name& requester, const account_name& requestee,
                     const std::string& memo) {
  require_auth(requestee);
  request_idx requests(_self, requester);
  auto r = requests.find(requestee);
  eosio_assert(r != requests.end(), "request does not exist");

  SEND_INLINE_ACTION(eosio::token(N(vae.token)), transfer, {N(vae.cash), N(active)},
                     {N(vae.cash), requestee, r->payment, memo});
  requests.erase(r);
}

void request::reject(const account_name& requester, const account_name& requestee,
                     const std::string& memo) {
  require_auth(requestee);
  request_idx requests(_self, requester);
  auto r = requests.find(requestee);
  eosio_assert(r != requests.end(), "request does not exist");

  SEND_INLINE_ACTION(eosio::token(N(vae.token)), transfer, {N(vae.cash), N(active)},
                     {N(vae.cash), requester, r->payment, memo});
  requests.erase(r);
}

EOSIO_ABI(request, (create)(accept)(reject))
} // namespace vaeon
