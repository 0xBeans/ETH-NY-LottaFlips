// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "openzeppelin-contracts/token/ERC721/extensions/ERC721Enumerable.sol";

contract MockERC721 is ERC721Enumerable {
    constructor() ERC721("Mock_ERC721", "Mock_ERC721") {}

    function mint(uint256 quantity) external {
        for (uint256 i = 0; i < quantity; i++) {
            _mint(msg.sender, i);
        }
    }
}
