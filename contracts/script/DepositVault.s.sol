// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {CrosschainVault} from "../src/CrosschainVault.sol";
import {Token} from "../src/Token.sol";

contract DepositVault is Script {
    CrosschainVault public vault;

    function setUp() public {}

    function run() public {
        address depositToken = vm.envAddress("DEPOSIT_TOKEN");
        address vaultAddress = vm.envAddress("VAULT");
        uint256 amount = vm.envUint("AMOUNT");

        vm.startBroadcast();

        vault = CrosschainVault(payable(vaultAddress));
        Token token = Token(depositToken);

        token.approve(address(vault), amount);
        vault.deposit(amount, msg.sender);

        vm.stopBroadcast();
    }
}
