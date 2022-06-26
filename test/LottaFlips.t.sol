// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import {MockERC721} from "./mocks/MockERC721.sol";
import {LottaFlips} from "../src/LottaFlips.sol";
import {TestVm} from "./TestVM.sol";
import {console} from "forge-std/console.sol";

contract LottaFlipsTest is Test {
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
    LottaFlips private lottaFlips;

    // public/private key for signatures
    address signer = 0x4A455783fC9022800FC6C03A73399d5bEB4065e8;
    uint256 signerPk =
        0x3532c806834d0a952c89f8954e2f3c417e3d6a5ad0d985c4a87a545da0ca722a;

    address user1 = 0x2Af416FDA8d86fAabDe21758aEea6c1BA5Da1f38;
    address user2 = 0x4b3d0D71A31F1f5e28B79bc0222bFEef4449B479;

    function setUp() public {
        mockERC721 = new MockERC721();
        lottaFlips = new LottaFlips();

        lottaFlips.initialize(address(mockERC721), signer);
    }

    function testCreateLottery() public {
        vm.startPrank(user1);
        mockERC721.mint(10);
        assertEq(mockERC721.balanceOf(user1), 10);

        mockERC721.setApprovalForAll(address(lottaFlips), true);

        vm.expectEmit(true, true, true, true);
        emit LotteryStart(user1, 0);
        lottaFlips.createLottery(0, 1 ether, uint64(block.timestamp * 2));

        assertEq(mockERC721.balanceOf(user1), 9);
        assertEq(mockERC721.balanceOf(address(lottaFlips)), 1);
    }

    function testCreateLotteryRevert() public {
        vm.startPrank(user1);
        mockERC721.mint(10);
        mockERC721.setApprovalForAll(address(lottaFlips), true);
        lottaFlips.createLottery(0, 1 ether, uint64(block.timestamp * 2));

        vm.expectRevert(LottaFlips.LotteryAlreadyCreated.selector);
        lottaFlips.createLottery(0, 1 ether, uint64(block.timestamp * 2));
    }

    function testEnterLottery() public {
        vm.startPrank(user1);
        mockERC721.mint(10);
        mockERC721.setApprovalForAll(address(lottaFlips), true);
        lottaFlips.createLottery(0, 1 ether, uint64(block.timestamp * 2));
        vm.stopPrank();

        vm.deal(user2, 10 ether);
        vm.startPrank(user2);
        lottaFlips.enterLottery{value: 0.4 ether}(0);
    }

    function testEnterLotteryRevert() public {
        vm.startPrank(user1);
        mockERC721.mint(10);
        mockERC721.setApprovalForAll(address(lottaFlips), true);
        lottaFlips.createLottery(0, 1 ether, uint64(block.timestamp * 2));
        vm.stopPrank();

        vm.deal(user2, 10 ether);
        vm.startPrank(user2);

        vm.expectRevert(LottaFlips.EntryCantExceed50Percent.selector);
        lottaFlips.enterLottery{value: 0.6 ether}(0);

        vm.expectRevert(LottaFlips.EntryMinumumMustbe10Percect.selector);
        lottaFlips.enterLottery{value: 0.001 ether}(0);

        lottaFlips.enterLottery{value: 0.4 ether}(0);

        vm.expectRevert(LottaFlips.LotteryNotActive.selector);
        lottaFlips.enterLottery{value: 0.4 ether}(0);
    }

    function testWinLottery() public {
        vm.startPrank(user1);
        mockERC721.mint(10);
        mockERC721.setApprovalForAll(address(lottaFlips), true);
        lottaFlips.createLottery(0, 1 ether, uint64(block.timestamp * 2));
        vm.stopPrank();

        vm.deal(user2, 10 ether);
        vm.startPrank(user2);
        lottaFlips.enterLottery{value: 0.5 ether}(0);

        vm.expectEmit(true, true, true, true);
        emit LotteryEnd(
            user1,
            user2,
            0,
            1 ether,
            0.5 ether,
            signMessage(lottaFlips.randomnessHash(0))
        );
        lottaFlips.settleLottery(0, signMessage(lottaFlips.randomnessHash(0)));

        assertEq(address(user1).balance, 0.5 ether);

        assertEq(mockERC721.balanceOf(user1), 9);
        assertEq(mockERC721.balanceOf(user2), 1);
    }

    function testGetActiveListings() public {
        vm.startPrank(user1);
        mockERC721.mint(10);
        mockERC721.setApprovalForAll(address(lottaFlips), true);
        lottaFlips.createLottery(0, 1 ether, uint64(block.timestamp * 2));
        lottaFlips.createLottery(1, 1 ether, uint64(block.timestamp * 2));
        lottaFlips.createLottery(2, 1 ether, uint64(block.timestamp * 2));
        lottaFlips.createLottery(3, 1 ether, uint64(block.timestamp * 2));

        LottaFlips.Listing[] memory activeListings = lottaFlips
            .allActiveListings();

        assertEq(activeListings.length, 4);
    }

    // --- utils ---
    function signMessage(bytes32 randomnessHash)
        internal
        returns (bytes memory)
    {
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", randomnessHash)
        );

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(
            signerPk,
            ethSignedMessageHash
        );
        return abi.encodePacked(r, s, v);
    }
}
