// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract RWA is ERC20, Ownable {
    uint256 public immutable price;
    IERC20 public immutable currencyToken;

    event Buy(address indexed user, uint256 amount, uint256 shares);

    constructor(string memory _name, string memory _symbol, address _currencyToken, uint256 _price, address _owner)
        ERC20(_name, _symbol)
        Ownable(_owner)
    {
        // Price is in 6 decimals, 1 = 10^6 = 100%
        currencyToken = IERC20(_currencyToken);
        price = _price;
    }

    function buy(uint256 amount) public {
        // amount = 1; price per share = 1100000; shares = 1/1.1 = 0.90909090909
        uint256 shares = Math.mulDiv(amount, 1_000_000, price);

        _mint(msg.sender, shares);

        currencyToken.transferFrom(msg.sender, address(this), amount);
        emit Buy(msg.sender, amount, shares);
    }
}
