// SPDX-License-Identifier: MIT
// OpenZeppelin Contracts (last updated v4.6.0) (token/ERC721/IERC721.sol)

pragma solidity ^0.8.0;

import "openzeppelin-contracts/token/ERC721/IERC721.sol";

interface ICollection is IERC721 {
    function totalSupply() external view returns (uint256);
}
