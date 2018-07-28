#include "request.hpp"

#include "common.hpp"

void has_enough_assets(const account_name& requester, const eosio::asset& payment) {
  eosio::token t(N(vol.token));
  eosio::asset asset = t.get_balance(requester, volean::get_symbol());
  std::string error_message = "not enough tokens (" + std::to_string(payment.amount) +
                              " requested, " + std::to_string(asset.amount) + " available)";
  eosio_assert(payment.symbol == asset.symbol, "wrong token");
  eosio_assert(payment.amount <= asset.amount, error_message.c_str());
}

void calculate_payment(const eosio::asset& total_payment, eosio::asset& payment,
                       eosio::asset& fee) {
  payment = total_payment;
  fee = total_payment;
  payment.amount *= 1 - volean::fee;
  fee.amount *= volean::fee;
}

void request::create(const account_name& requester, const account_name& requestee,
                     const eosio::asset& total_payment, const std::string& memo) {
  eosio_assert(requester != requestee, "cannot request from yourself");
  require_auth(requester);
  eosio_assert(is_account(requestee), "requestee account does not exist");

  request_idx requests(_self, requester);
  auto r = requests.find(requestee);
  eosio_assert(r == requests.end(), "there is already a request in place");

  has_enough_assets(requester, total_payment);

  eosio::asset payment;
  eosio::asset fee;
  calculate_payment(total_payment, payment, fee);
  SEND_INLINE_ACTION(eosio::token(N(vol.token)), transfer, {requester, N(active)},
                     {requester, N(vol.request), payment, memo});
  SEND_INLINE_ACTION(eosio::token(N(vol.token)), transfer, {requester, N(active)},
                     {requester, N(vol.cash), fee, memo});

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

  SEND_INLINE_ACTION(eosio::token(N(vol.token)), transfer, {N(vol.request), N(active)},
                     {N(vol.token), requestee, r->payment, memo});
  requests.erase(r);
}

void request::reject(const account_name& requester, const account_name& requestee,
                     const std::string& memo) {
  require_auth(requestee);
  request_idx requests(_self, requester);
  auto r = requests.find(requestee);
  eosio_assert(r != requests.end(), "request does not exist");

  SEND_INLINE_ACTION(eosio::token(N(vol.token)), transfer, {N(vol.request), N(active)},
                     {N(vol.token), requester, r->payment, memo});
  requests.erase(r);
}

EOSIO_ABI(request, (create)(accept)(reject))
