#include <eosiolib/eosio.hpp>

class volean : public eosio::contract {
public:
  volean(account_name self) : contract(self) {}

  /**
   * @brief Basic profile information
   * @abi table basic i64
   */
  struct profile {
    account_name account;
    std::string first_name;
    std::string last_name;
    time date_of_birth;
    auto primary_key() const { return account; }
    EOSLIB_SERIALIZE(profile, (account)(first_name)(last_name)(date_of_birth))
  };

  /**
   * @brief The table definition for the profiles.
   */
  typedef eosio::multi_index<N(profiles), profile> profiles;

  /// @abi action
  /// Create a new profile
  void create(const account_name& account);
};
