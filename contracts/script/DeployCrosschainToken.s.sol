// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {CrosschainToken} from "../src/CrosschainToken.sol";

contract DeployCrosschainToken is Script {
    CrosschainToken public token;

    function setUp() public {}

    function run() public {
        address lzEndpoint = vm.envAddress("LZ_ENDPOINT");
        address owner = vm.envAddress("OWNER");

        vm.startBroadcast();

        string memory name = "USD Coin Test";
        string memory symbol = "USDC";

        // Deploy at predictable address
        token = new CrosschainToken(name, symbol, lzEndpoint, owner);

        console.log("CrosschainToken deployed at", address(token));

        vm.stopBroadcast();
    }
}
