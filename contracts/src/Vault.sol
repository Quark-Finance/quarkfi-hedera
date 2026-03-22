// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {Math} from "@openzeppelin/contracts/utils/math/Math.sol";

contract Vault is Ownable, ERC20 {
    IERC20 public immutable depositToken;
    address public immutable oracle;

    uint256 public constant FEE_ON_DEPOSIT = 1000; // 0.1%
    uint256 public constant FEE_ON_WITHDRAW = 5000; // 0.5%

    uint256 public pricePerShare = 1_000_000; // 6 decimals, 1 = 10^6 = 100%

    // Errors
    error OnlyOracle();
    error InvalidUpdateRate();
    error ExecutionFailed();

    // Events
    event Deposit(address indexed user, uint256 amount, uint256 shares);
    event Withdraw(address indexed user, uint256 shares, uint256 amount);
    event OwnerWithdraw(address indexed user, uint256 amount);
    event Execute(address indexed to, uint256 value, bytes data);

    modifier onlyOracle() {
        if (msg.sender != oracle) {
            revert OnlyOracle();
        }
        _;
    }

    constructor(address _depositToken, address _oracle, address _owner, string memory _name, string memory _symbol)
        Ownable(_owner)
        ERC20(_name, _symbol)
    {
        depositToken = IERC20(_depositToken);
        oracle = _oracle;
    }

    function updatePricePerShare(int64 _updateRate) public onlyOracle {
        // The update rate cannot be greater than 5% at a time, to prevent abuse
        if (_updateRate > 50000 || _updateRate < -50000) {
            revert InvalidUpdateRate();
        }

        pricePerShare = Math.mulDiv(pricePerShare, uint256(uint64(1_000_000 + _updateRate)), uint256(1_000_000));
    }

    function deposit(uint256 amount, address to) public {
        // amount = 1; price per share = 1100000; shares = 1/1.1 = 0.90909090909
        uint256 shares = Math.mulDiv(amount, 1_000_000, pricePerShare);
        uint256 fee = Math.mulDiv(shares, FEE_ON_DEPOSIT, 1_000_000);

        uint256 sharesAfterFee = shares - fee;
        _mint(to, sharesAfterFee);

        depositToken.transferFrom(msg.sender, address(this), amount);
        emit Deposit(msg.sender, amount, sharesAfterFee);
    }

    function withdraw(uint256 shares) public {
        _burn(msg.sender, shares);

        // shares = 1; price per share = 1100000; amount = 1 * 1.1 = 1.1
        uint256 amount = Math.mulDiv(shares, pricePerShare, 1_000_000);
        uint256 fee = Math.mulDiv(amount, FEE_ON_WITHDRAW, 1_000_000);

        uint256 amountAfterFee = amount - fee;

        depositToken.transfer(msg.sender, amountAfterFee);

        emit Withdraw(msg.sender, shares, amountAfterFee);
    }

    function ownerWithdraw(uint256 amount) public onlyOwner {
        depositToken.transfer(msg.sender, amount);

        emit OwnerWithdraw(msg.sender, amount);
    }

    function execute(address to, uint256 value, bytes memory data) public onlyOwner {
        (bool success,) = to.call{value: value}(data);
        if (!success) {
            revert ExecutionFailed();
        }

        emit Execute(to, value, data);
    }

    // Allow the contract to receive native tokens
    receive() external payable {}
}
