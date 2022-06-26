// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import {MockERC721} from "./mocks/MockERC721.sol";
import {LottaFlips} from "../src/LottaFlips.sol";
import {LottaFlipsFactory} from "../src/LottaFlipsFactory.sol";
import {TestVm} from "./TestVM.sol";
import {console} from "forge-std/console.sol";
import "../src/ILottaFlips.sol";

contract LottaFlipsFactoryTest is Test {
    event LotteryStart(address indexed lister, uint256 indexed tokenId);
    event LotteryEnd(
        address indexed lister,
        address indexed bidder,
        uint256 indexed tokenId,
        uint64 listPrice,
        uint64 bidPrice,
        bytes randomnessSignature
    );

    MockERC721 private mockERC721;
    MockERC721 private mockERC7212;
    LottaFlips private lottaFlips;
    LottaFlipsFactory private lottaFlipsFactory;
    address collection1;
    address collection2;

    // public/private key for signatures
    address signer = 0x4A455783fC9022800FC6C03A73399d5bEB4065e8;
    uint256 signerPk =
        0x3532c806834d0a952c89f8954e2f3c417e3d6a5ad0d985c4a87a545da0ca722a;

    address user1 = 0x2Af416FDA8d86fAabDe21758aEea6c1BA5Da1f38;
    address user2 = 0x4b3d0D71A31F1f5e28B79bc0222bFEef4449B479;

    function setUp() public {
        mockERC721 = new MockERC721();
        mockERC7212 = new MockERC721();
        lottaFlips = new LottaFlips();
        lottaFlipsFactory = new LottaFlipsFactory();

        console.log("HEELP");
        collection1 = lottaFlipsFactory.deployCollection(
            address(lottaFlips),
            address(mockERC721),
            signer
        );

        collection2 = lottaFlipsFactory.deployCollection(
            address(lottaFlips),
            address(mockERC7212),
            signer
        );
    }

    function testCreateProxy() public {
        vm.startPrank(address(0x2Af416FDA8d86fAabDe21758aEea6c1BA5Da1f38));
        mockERC721.mint(10);
        assertEq(mockERC721.balanceOf(user1), 10);
        LottaFlips l = LottaFlips(collection1);

        mockERC721.setApprovalForAll(address(l), true);

        l.createLottery(0, 1 ether, uint64(block.timestamp * 2));

        assertEq(mockERC721.balanceOf(user1), 9);
        assertEq(mockERC721.balanceOf(address(l)), 1);
    }
}
