// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract DynamicContract {
    address public owner;
    string public contractDetails;

    constructor(string memory details) {
        owner = msg.sender;
        contractDetails = details;
    }

    function updateDetails(string memory newDetails) public {
        require(msg.sender == owner, "Only the owner can update details.");
        contractDetails = newDetails;
    }
}
