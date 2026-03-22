// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {Vault} from "../src/Vault.sol";

contract DeployVault is Script {
    Vault public vault;

    function setUp() public {}

    function run() public {
        address depositToken = vm.envAddress("DEPOSIT_TOKEN");
        address oracle = vm.envAddress("ORACLE");
        address owner = vm.envAddress("OWNER");
        string memory name = vm.envString("NAME");
        string memory symbol = vm.envString("SYMBOL");

        vm.startBroadcast();

        // Deploy at predictable address
        vault = new Vault{salt: bytes32(0)}(depositToken, oracle, owner, name, symbol);

        console.log("Vault deployed at", address(vault));

        vm.stopBroadcast();
    }
}
