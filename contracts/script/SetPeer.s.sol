// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {OApp} from "@layerzerolabs/oapp-evm/contracts/oapp/OApp.sol";

contract SetPeer is Script {
    function setUp() public {}

    function run() public {
        address oappAddress = vm.envAddress("OAPP_ADDRESS");
        address peerAddress = vm.envAddress("PEER_ADDRESS");
        uint32 eid = uint32(vm.envUint("EID"));

        console.log("Setting peer for EID", eid, "to", peerAddress);
        console.log("OApp address", oappAddress);

        vm.startBroadcast();

        OApp(oappAddress).setPeer(eid, bytes32(uint256(uint160(peerAddress))));

        vm.stopBroadcast();
    }
}
