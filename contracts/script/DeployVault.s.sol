// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {Vault} from "../src/Vault.sol";

contract DeployVault is Script {
    Vault public vault;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        address depositToken = address(0);
        address oracle = address(0);
        address owner = address(0);
        string memory name = "Vault";
        string memory symbol = "VAULT";

        // Deploy at predictable address
        vault = new Vault{salt: bytes32(0)}(depositToken, oracle, owner, name, symbol);

        console.log("Vault deployed at", address(vault));

        vm.stopBroadcast();
    }
}
