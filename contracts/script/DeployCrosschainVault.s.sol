// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {CrosschainVault} from "../src/CrosschainVault.sol";

contract DeployCrosschainVault is Script {
    CrosschainVault public vault;

    function setUp() public {}

    function run() public {
        address depositToken = vm.envAddress("DEPOSIT_TOKEN");
        address oracle = vm.envAddress("ORACLE");
        address owner = vm.envAddress("OWNER");
        string memory name = vm.envString("NAME");
        string memory symbol = vm.envString("SYMBOL");

        vm.startBroadcast();

        // Deploy at predictable address
        vault = new CrosschainVault{salt: bytes32(0)}(depositToken, oracle, owner, name, symbol);

        console.log("CrosschainVault deployed at", address(vault));

        vm.stopBroadcast();
    }
}
