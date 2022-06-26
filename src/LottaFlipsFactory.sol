// SPDX-License-Identifier: MIT
//
// We want to only allow lotteries for verified collections so
// random users can create lotteries for scam projects. It also
// just gives us more control which is desireable for something like
// this.
// Minimal proxy for cheap/quick deployments and immutable code (immutability)
// is desireable for things that require RNG since users can trust the logic
// will not change all of a sudden.
pragma solidity ^0.8.13;

import "openzeppelin-contracts/proxy/Clones.sol";
import "openzeppelin-contracts/access/Ownable.sol";
import "./LottaFlips.sol";

contract LottaFlipsFactory is Ownable {
    using Clones for address;
    address[] public proxyContracts;

    function deployCollection(
        address implementation,
        address collection,
        address signer
    ) public onlyOwner returns (address) {
        address proxyContract = implementation.clone();
        // shouldve used the interface but I wanna go to bed T_T
        LottaFlips lotta = LottaFlips(proxyContract);
        lotta.initialize(collection, signer);
        proxyContracts.push(proxyContract);

        return proxyContract;
    }
}
