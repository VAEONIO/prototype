#include <eosiolib/eosio.hpp>

// Templating is not supported by the .abi generator currently.

struct string_field {
  std::string value;
  int64_t price;
};

struct named_string_field {
  std::string name;
  std::string value;
  int64_t price;
};

class volean : public eosio::contract {
public:
  volean(account_name self) : contract(self) {}

  /**
   * @abi table fields i64
   */
  struct field {
    uint64_t idx;
    std::string name;
    std::string value;
    int64_t price;
    auto primary_key() const { return idx; }
    EOSLIB_SERIALIZE(field, (idx)(name)(value)(price))
  };

  typedef eosio::multi_index<N(fields), field> field_idx;

  /**
   * @abi table profiles i64
   */
  struct profile {
    account_name account;
    string_field first_name;
    string_field last_name;
    auto primary_key() const { return account; }
    EOSLIB_SERIALIZE(profile, (account)(first_name)(last_name))
  };

  /**
   * @brief The table definition for the profiles.
   */
  typedef eosio::multi_index<N(profiles), profile> profile_idx;

  /// @abi action
  /// Create a new profile
  void create(const account_name& account, const string_field& first_name,
              const string_field& last_name, const std::vector<named_string_field>& string_fields);
  // const string_field& last_name);

  /// @abi action
  /// Remove a profile
  void remove(const account_name& account);

  /// @abi action
  /// Update a profile
  void update(const account_name& account, const string_field& first_name,
              const string_field& last_name, const std::vector<named_string_field>& string_fields);
};
