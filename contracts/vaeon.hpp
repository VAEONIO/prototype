#pragma once

#include <eosiolib/eosio.hpp>

// TODO: Change this once compilation hack is no longer required.
//#include <eosio.token.hpp>
#include "../eosio.token/eosio.token.hpp"
#include "struct.hpp"

namespace vaeon {

class vaeon : public eosio::contract {
public:
  vaeon(account_name self) : contract(self) {}

  // Creates a new profile.
  // @abi action
  void createprof(const account_name& account, const string_field& first_name,
                  const string_field& last_name,
                  const std::vector<named_string_field>& string_fields);

  // Removes a profile, cancels outgoing requests and rejects incoming requests.
  // @abi action
  void removeprof(const account_name& account);

  // Updates a profile by changing the specified fields. Fields with empty values are removed.
  // @abi action
  void updateprof(const account_name& account, const string_field& first_name,
                  const string_field& last_name,
                  const std::vector<named_string_field>& string_fields);

  // Creates a new request. Can only be done if the requestee has a profile and there is no existing
  // request with the same requestee.
  // @abi action
  void createreq(const account_name& requester, const account_name& requestee,
                 const eosio::asset& payment, const std::string& public_key,
                 const std::vector<std::string>& fields, const std::string& memo);

  // Accepts the request which transfers the tokens to the requestee. The requestee must include the
  // private keys of the requested fields encrypted with the requesters public key.
  // @abi action
  void acceptreq(const account_name& requester, const account_name& requestee,
                 const std::vector<std::string>& field_keys, const std::string& memo);

  // Rejects the request and transfers the tokens back to the requester. Takes a fee to
  // disincentivize spamming.
  // @abi action
  void rejectreq(const account_name& requester, const account_name& requestee,
                 const std::string& memo);

  // Cancels the request and transfers the tokens back to the requester. Takes a fee to
  // disincentivize spamming.
  // @abi action
  void cancelreq(const account_name& requester, const account_name& requestee);

  // Burns the tokens of an accepted request. Disincentivize fake profiles.
  // @abi action
  void burnreq(const account_name& requester, uint64_t key, const std::string& memo);

private:
  void remove_request_in(const account_name& requester, const account_name& requestee);
};

} // namespace vaeon
