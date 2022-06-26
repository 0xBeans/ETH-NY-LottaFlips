// SPDX-License-Identifier: MIT
//
// Pain... so much pain... Didnt have time to optimize gas too much or clean up... please have mercy
// Commit-reveal works like this:
// 1. We hash publically known and verifiable values (this is the 'commit')
// hash = keccak256(
//     abi.encode(
//         listing.lister,
//         listing.bidder,
//         tokenId,
//         listing.listPrice,
//         listing.bidPrice
//     )
// );
//
// 2. When the lottery is ready to be settle, we sign the hash with our private key off-chain.
// This signature is used as the random num essentially. Anyone can verifiy there was no tampering
// with the random number by using the public key (signer) to decrypto the signature to see if the
// hash was the correct hash used. Front-running is not possible after a few blocks as NFTs/ETH can
// ONLY be sent out of the contract by settling (can be called by anyone). The random number relies on the
// hash that already is 'committed' and the signing via private key gives us enough security.
// I think this works... we crammed a lot in the past 10 hours so... yeah... pretty sure this works..
pragma solidity ^0.8.13;

import "openzeppelin-contracts/access/Ownable.sol";
import "openzeppelin-contracts/security/ReentrancyGuard.sol";
import "openzeppelin-contracts/proxy/utils/Initializable.sol";
import "openzeppelin-contracts/token/ERC721/IERC721Receiver.sol";
import "openzeppelin-contracts/utils/cryptography/ECDSA.sol";
import "prb-math/PRBMathUD60x18.sol";
import "./ICollection.sol";
import {console} from "forge-std/console.sol";

contract LottaFlips is Ownable, Initializable, ReentrancyGuard {
    using ECDSA for bytes32;
    using PRBMathUD60x18 for uint256;

    /*==============================================================
    ==                        CUSTOM ERRORS                       ==
    ==============================================================*/

    error LotteryAlreadyCreated();
    error LotteryNotActive();
    error LotteryPastDeadline();
    error EntryCantExceed50Percent();
    error EntryMinumumMustbe10Percect();
    error LotteryNotLocked();
    error InvalidSignature();
    error PriceTooLow();

    /*==============================================================
    ==                           EVENTS                           ==
    ==============================================================*/

    event LotteryStart(address indexed lister, uint256 indexed tokenId);
    event LotteryEnd(
        address indexed lister,
        address indexed bidder,
        uint256 indexed tokenId,
        uint64 listPrice,
        uint64 bidPrice,
        bytes randomnessSignature
    );

    /*==============================================================
    ==                         DATA TYPES                         ==
    ==============================================================*/

    struct Listing {
        address lister;
        address bidder;
        uint64 listPrice;
        uint64 bidPrice;
        uint64 expirationTimestamp;
        LotteryStatus status;
    }

    enum LotteryStatus {
        NOTACTIVE,
        PENDING,
        LOCKED
    }

    address public collection;
    address public signer;

    uint256 public totalListings;

    mapping(uint256 => Listing) public listings;

    // Initialize the proxies with the proper collections they represent
    function initialize(address _collection, address _signer)
        external
        initializer
    {
        collection = _collection;
        signer = _signer;
    }

    /*==============================================================
    ==                       LOTTERY LOGIC                        ==
    ==============================================================*/

    // NFT holders create the lottery and set the price.
    // If holders set the price too high, no one will partake in the lottery
    // so its safe to give them this option.
    // NFTs are locked until the lottery is settled to prevent front-running.
    function createLottery(
        uint256 tokenId,
        uint64 price,
        uint64 expirationTimestamp
    ) external {
        Listing storage listing = listings[tokenId];

        if (listing.status != LotteryStatus.NOTACTIVE)
            revert LotteryAlreadyCreated();
        if (!(price > 0)) revert PriceTooLow();

        listing.lister = msg.sender;
        listing.listPrice = price;
        listing.expirationTimestamp = expirationTimestamp;
        listing.status = LotteryStatus.PENDING;

        ICollection(collection).safeTransferFrom(
            msg.sender,
            address(this),
            tokenId
        );

        unchecked {
            ++totalListings;
        }

        emit LotteryStart(msg.sender, tokenId);
    }

    // Bidders can send up to 50% of value in ETH but minimum 10%. ETH is locked
    // until lottery is settled.
    function enterLottery(uint256 tokenId) external payable {
        Listing storage listing = listings[tokenId];

        if (listing.status != LotteryStatus.PENDING) revert LotteryNotActive();
        if (block.timestamp > listing.expirationTimestamp)
            revert LotteryPastDeadline();

        // max 50%
        if ((msg.value).div(uint256(listing.listPrice)) > 5e17)
            revert EntryCantExceed50Percent();

        // min 50%
        if ((msg.value).div(uint256(listing.listPrice)) < 1e17)
            revert EntryMinumumMustbe10Percect();

        listing.bidder = msg.sender;
        listing.bidPrice = uint64(msg.value);
        listing.status = LotteryStatus.LOCKED;
    }

    // Anyone can settle the lottery. A lottery is automatically deleted after
    // it is settled and all assets are sent to correct parties.
    function settleLottery(uint256 tokenId, bytes calldata randomnessSignature)
        external
        nonReentrant
    {
        Listing storage listing = listings[tokenId];

        if (listing.status != LotteryStatus.LOCKED) revert LotteryNotLocked();
        if (!_isValidSignature(tokenId, randomnessSignature))
            revert InvalidSignature();

        // rudimentary RNG ('dice roll) logic. Should not be exploitable
        // but would make it more precise if we had more time
        uint256 odds = uint256((listing.bidPrice)).div(
            uint256(listing.listPrice)
        );

        // use the verified signature as rng
        uint256 randomness = uint256(keccak256(randomnessSignature)) % 1e18;
        if (randomness <= odds) {
            // send NFT to bidder if RNG is good
            ICollection(collection).safeTransferFrom(
                address(this),
                listing.bidder,
                tokenId
            );
        } else {
            // send NFT back to lister
            ICollection(collection).safeTransferFrom(
                address(this),
                listing.lister,
                tokenId
            );
        }

        (bool sent, ) = (listing.lister).call{value: listing.bidPrice}("");
        require(sent, "can't send ether");

        emit LotteryEnd(
            listing.lister,
            listing.bidder,
            tokenId,
            listing.listPrice,
            listing.bidPrice,
            randomnessSignature
        );

        unchecked {
            --totalListings;
        }

        delete listings[tokenId];
    }

    // can only delete listing after expiration. Called by anyone.
    function deleteListing(uint256 tokenId) external {
        Listing memory listing = listings[tokenId];

        ICollection(collection).safeTransferFrom(
            address(this),
            listing.lister,
            tokenId
        );

        if (listing.expirationTimestamp < block.timestamp) {
            delete listings[tokenId];
        }
    }

    /*==============================================================
    ==                         RNG LOGIC                          ==
    ==============================================================*/

    // called by off-chain server and signed via private key
    function randomnessHash(uint256 tokenId) public view returns (bytes32) {
        Listing memory listing = listings[tokenId];
        return
            keccak256(
                abi.encode(
                    listing.lister,
                    listing.bidder,
                    tokenId,
                    listing.listPrice,
                    listing.bidPrice
                )
            );
    }

    // check signature was signed by PK. Other can use this func to ensure
    // rand num was not tampered with.
    function _isValidSignature(
        uint256 tokenId,
        bytes calldata randomnessSignature
    ) internal view returns (bool) {
        bytes32 hash = randomnessHash(tokenId);
        return
            hash.toEthSignedMessageHash().recover(randomnessSignature) ==
            signer;
    }

    /*==============================================================
    ==                          READ ONLY                         ==
    ==============================================================*/

    // should NOT be called on chain. ONLY used when we fuck up event tracking.
    function allActiveListings() external view returns (Listing[] memory) {
        uint256 count;
        uint256 totalCollectionSupply = ICollection(collection).totalSupply();
        Listing[] memory activeListings = new Listing[](totalListings);
        Listing memory listing;

        uint256 i;
        for (; i < totalCollectionSupply; ) {
            // early break if all listings found
            if (count == totalListings) {
                return activeListings;
            }
            listing = listings[i];
            if (listings[i].status != LotteryStatus.NOTACTIVE) {
                activeListings[count] = listing;
                count++;
            }
            unchecked {
                ++i;
            }
        }
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
