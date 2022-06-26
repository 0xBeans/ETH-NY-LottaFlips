//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {console} from "forge-std/console.sol";
import {TestVm} from "../test/TestVm.sol";

import {LottaFlips} from "../src/LottaFlipsFactory.sol";
import {LottaFlipsFactory} from "../src/LottaFlipsFactory.sol";

contract Deploy is TestVm {
    function run() external {
        address apetimism = 0x51E5426eDE4e2d4c2586371372313B5782387222;
        address optipunk = 0xB8Df6Cc3050cC02F967Db1eE48330bA23276A492;
        address signer = 0x88a0371fc2BefDfC6F675F9293DE32ef79D6f6c7;

        vm.startBroadcast();

        LottaFlips lottaFlips = new LottaFlips();
        LottaFlipsFactory lottaFlipsFactory = new LottaFlipsFactory();

        address collection1 = lottaFlipsFactory.deployCollection(
            address(lottaFlips),
            apetimism,
            signer
        );
        address collection2 = lottaFlipsFactory.deployCollection(
            address(lottaFlips),
            optipunk,
            signer
        );

        console.log("lottaFlips", address(lottaFlips));
        console.log("lottaFlipsFactory", address(lottaFlipsFactory));
        console.log("collection1", collection1);
        console.log("collection2", collection2);
    }
}

//   ADDRESSES:
//   lottaFlips, 0xd6c25cee1830a4d736376b453aedcb48159098c7
//   lottaFlipsFactory, 0x8812599320335b8fdbc95b97c8b56a3b610d91af
//   collection1, 0xda4624a7e4b131663383cade2c9496e3d018112f
//   collection2, 0x361ea6a9e0d9cda53e0d5835adefd0dd4dcffab9
