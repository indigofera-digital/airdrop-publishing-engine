// SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

contract {{ name }} {

    string public message;

    constructor() {
        message = "Hello World";
    }

    function update(string memory newMessage) public {
        message = newMessage;
    }
}