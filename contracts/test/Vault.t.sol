// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {Vault} from "../src/Vault.sol";

contract VaultTest is Test {
    Vault public vault;

    address public depositToken = address(0);
    address public oracle = makeAddr("oracle");
    address public owner = makeAddr("owner");
    string public name = "Vault";
    string public symbol = "VAULT";

    function setUp() public {
        vault = new Vault(depositToken, oracle, owner, name, symbol);
    }
}
