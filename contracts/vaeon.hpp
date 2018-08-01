#pragma once

#include <eosiolib/eosio.hpp>
//#include <eosio.token.hpp>

#include "../eosio.token/eosio.token.hpp"
#include "struct.hpp"

// Templating is not supported by the .abi generator currently.

namespace vaeon {

class vaeon : public eosio::contract {
public:
  vaeon(account_name self) : contract(self) {}

  /// @abi action
  /// Create a new profile
  void createprof(const account_name& account, const string_field& first_name,
                  const string_field& last_name,
                  const std::vector<named_string_field>& string_fields);

  // todo remove requests
  /// @abi action
  /// Remove a profile
  void removeprof(const account_name& account);

  /// @abi action
  /// Update a profile
  void updateprof(const account_name& account, const string_field& first_name,
                  const string_field& last_name,
                  const std::vector<named_string_field>& string_fields);

  // todo make sure that profile exists!
  /// @abi action
  void createreq(const account_name& requester, const account_name& requestee,
                 const eosio::asset& payment, const std::string& public_key,
                 const std::vector<std::string>& fields, const std::string& memo);

  /// @abi action
  void acceptreq(const account_name& requester, const account_name& requestee,
                 const std::vector<std::string>& field_keys, const std::string& memo);

  /// @abi action
  void rejectreq(const account_name& requester, const account_name& requestee,
                 const std::string& memo);

  /// @abi action
  void cancelreq(const account_name& requester, const account_name& requestee);
};

} // namespace vaeon
