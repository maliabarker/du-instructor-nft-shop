// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract DUInstructors {
    address[16] public owners;

    // Owning instructor NFT
    function mint(uint instructorId) public returns (uint) {
        require(instructorId >= 0 && instructorId <= 15);

        owners[instructorId] = msg.sender;

        return instructorId;
    }

    // Retrieving the adopters
    function getOwners() public view returns (address[16] memory) {
        return owners;
    }

}