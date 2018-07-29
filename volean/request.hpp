#include <eosiolib/eosio.hpp>

#include "../eosio.token/eosio.token.hpp"

class request : public eosio::contract {
public:
  request(account_name self) : contract(self) {}

  /**
   * @abi table request i64
   */
  struct request_tbl {
    account_name requester;
    account_name requestee;
    eosio::asset payment;
    std::string memo;
    auto primary_key() const { return requestee; }
    EOSLIB_SERIALIZE(request_tbl, (requester)(requestee)(payment)(memo))
  };

  typedef eosio::multi_index<N(request), request_tbl> request_idx;

  // todo make sure that profile exists!

  /// @abi action
  void create(const account_name& requester, const account_name& requestee,
              const eosio::asset& payment, const std::string& memo);

  /// @abi action
  void accept(const account_name& requester, const account_name& requestee,
              const std::string& memo);

  /// @abi action
  void reject(const account_name& requester, const account_name& requestee,
              const std::string& memo);
};
