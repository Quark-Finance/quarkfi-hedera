// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {OFT} from "@layerzerolabs/oft-evm/contracts/OFT.sol";
import {
    IOFT,
    SendParam,
    MessagingFee,
    MessagingReceipt,
    OFTReceipt
} from "@layerzerolabs/oft-evm/contracts/interfaces/IOFT.sol";
import {Vault} from "./Vault.sol";

contract CrosschainVault is Vault {
    event TokenSentCrosschain(uint32 indexed dstEid, address indexed to, uint256 amount, uint256 nativeFeeAmount);

    constructor(address _depositToken, address _oracle, address _owner, string memory _name, string memory _symbol)
        Vault(_depositToken, _oracle, _owner, _name, _symbol)
    {}

    function sendTokenCrosschain(uint32 _dstEid, address _to, uint256 _amount, uint256 nativeFeeAmount)
        public
        payable
        onlyOwner
    {
        SendParam memory sendParam = SendParam({
            dstEid: _dstEid,
            to: bytes32(uint256(uint160(_to))),
            amountLD: _amount,
            minAmountLD: 0,
            extraOptions: "",
            composeMsg: "",
            oftCmd: ""
        });

        MessagingFee memory fee = MessagingFee({nativeFee: nativeFeeAmount, lzTokenFee: 0});

        (MessagingReceipt memory msgReceipt, OFTReceipt memory oftReceipt) =
            IOFT(address(depositToken)).send{value: nativeFeeAmount}(sendParam, fee, address(this));

        emit TokenSentCrosschain(_dstEid, _to, _amount, nativeFeeAmount);
    }
}
