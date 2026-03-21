// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import {Vault} from "../src/Vault.sol";
import {Token} from "../src/Token.sol";
import {RWA} from "../src/RWA.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

contract VaultTest is Test {
    Vault public vault;

    Token public depositToken;
    address public oracle = makeAddr("oracle");
    address public owner = makeAddr("owner");
    address public user = makeAddr("user");
    string public name = "Vault";
    string public symbol = "VAULT";

    function setUp() public {
        depositToken = new Token("USDC", "USDC");

        vault = new Vault(address(depositToken), oracle, owner, name, symbol);
    }

    function test_deposit() public {
        depositToken.mint(user, 1 ether);

        vm.startPrank(user);
        depositToken.approve(address(vault), 1 ether);
        vault.deposit(1 ether, user);
        assertEq(vault.balanceOf(user), 0.999 ether); // 0.1% fee
        assertEq(depositToken.balanceOf(address(vault)), 1 ether); // 0.1% fee
        vm.stopPrank();

        vm.startPrank(oracle);
        vault.updatePricePerShare(10000); // 1% increase
        vm.stopPrank();

        depositToken.mint(address(vault), 1 ether);

        uint256 userVaultBalance = vault.balanceOf(user);
        uint256 expectedAmount = Math.mulDiv(
            Math.mulDiv(userVaultBalance, vault.pricePerShare(), 1_000_000),
            1_000_000 - vault.FEE_ON_WITHDRAW(),
            1_000_000
        );

        vm.startPrank(user);
        vault.withdraw(userVaultBalance);
        assertEq(vault.balanceOf(user), 0 ether);
        assertEq(depositToken.balanceOf(user), expectedAmount);
        vm.stopPrank();
    }

    function test_ownerWithdraw() public {
        depositToken.mint(address(vault), 1 ether);

        vm.startPrank(owner);
        vault.ownerWithdraw(1 ether);
        assertEq(depositToken.balanceOf(owner), 1 ether);
        vm.stopPrank();
    }

    function test_execute() public {
        Token mockToken = new Token("MockToken", "MOCK");
        bytes memory data = abi.encodeWithSelector(mockToken.mint.selector, address(vault), 1 ether);

        vm.startPrank(owner);
        vault.execute(address(mockToken), 0, data);
        vm.stopPrank();

        assertEq(mockToken.balanceOf(address(vault)), 1 ether);
    }

    function test_executeBuyRWA() public {
        RWA rwa = new RWA("RWA", "RWA", address(depositToken), 1100000, owner);

        bytes memory approveData = abi.encodeWithSelector(depositToken.approve.selector, address(rwa), 1 ether);

        bytes memory buyData = abi.encodeWithSelector(rwa.buy.selector, 1 ether);

        depositToken.mint(user, 2 ether);
        vm.startPrank(user);
        depositToken.approve(address(vault), 2 ether);
        vault.deposit(2 ether, user);
        vm.stopPrank();

        vm.startPrank(owner);
        vault.execute(address(depositToken), 0, approveData);

        assertEq(depositToken.allowance(address(vault), address(rwa)), 1 ether);

        vault.execute(address(rwa), 0, buyData);
        vm.stopPrank();

        assertEq(rwa.balanceOf(address(vault)), Math.mulDiv(1 ether, 1_000_000, 1100000));
    }
}
