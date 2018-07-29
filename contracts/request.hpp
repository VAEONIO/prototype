#include <eosiolib/eosio.hpp>


namespace vaeon {

class request : public eosio::contract {
public:
  request(account_name self) : contract(self) {}



};

} // namespace vaeon
