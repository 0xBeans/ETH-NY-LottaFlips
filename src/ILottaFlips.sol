// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {LottaFlips} from "./LottaFlips.sol";

interface ILottaFlips {
    function initialize(address _collection, address _signer) external;

    function createLottery(
        uint256 tokenId,
        uint64 price,
        uint64 expirationTimestamp
    ) external;

    function enterLottery(uint256 tokenId) external payable;

    function settleLottery(uint256 tokenId, bytes calldata randomnessSignature)
        external;

    function deleteListing(uint256 tokenId) external;

    function randomnessHash(uint256 tokenId) external view returns (bytes32);

    function allActiveListings()
        external
        view
        returns (LottaFlips.Listing[] memory);
}
