// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";

contract Event is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    Counters.Counter private _tokenIdCounter;
    string public eventName;
    address public eventOwner;
    address public eventAddr;
    uint256 private ticketLimit;
    uint256 private ticketsPerWalletLimit;
    uint256 private ticketPrice;

    constructor(
        address _eventOwner,
        string memory _eventName,
        uint256 _ticketLimit,
        uint256 _ticketsPerWalletLimit,
        uint256 _ticketPrice
    ) payable ERC721(_eventName, "CIV") {
        eventName = _eventName;
        eventOwner = _eventOwner;
        ticketLimit = _ticketLimit;
        ticketPrice = _ticketPrice;
        ticketsPerWalletLimit = _ticketsPerWalletLimit;
        eventAddr = address(this);
    }

    function setEventName(string memory _eventName) public {
        require(msg.sender == eventOwner, "NOT EVENT OWNER!!");
        eventName = _eventName;
    }

    function getEventName() public view returns (string memory) {
        return (eventName);
    }

    function getBalance() public view returns (uint256) {
        return (address(this).balance);
    }

    function getTicketLimit() public view returns (uint256) {
        return (ticketLimit);
    }

    function getTicketPrice() public view returns (uint256) {
        return (ticketPrice);
    }

    function getTicketsSold() public view returns (uint256) {
        return (_tokenIdCounter.current());
    }

    function getTicketsPerWalletLimit() public view returns (uint256) {
        return (ticketsPerWalletLimit);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://ipfs.io/ipfs/";
    }

    function withdraw() public {
        require(msg.sender == eventOwner, "NOT EVENT OWNER");
        address payable payable_addr = payable(msg.sender);
        payable_addr.transfer(address(this).balance);
    }

    function mintItem(address to, string memory uri)
        public
        payable
        returns (uint256)
    {
        _tokenIdCounter.increment();
        console.log("current", _tokenIdCounter.current());
        console.log("ticketLimit", ticketLimit);
        uint256 currentPrice = ticketPrice;
        console.log("currentPrice", currentPrice);
        console.log("msg.value", msg.value);
        require(msg.value >= currentPrice, "sorry, price has increased");
        uint256 tokenId = _tokenIdCounter.current();
        require(tokenId <= ticketLimit, "NO MORE TICKETS FOR THIS EVENT");
        uint256 currentTicketsPerWalletLimit = ticketsPerWalletLimit;
        console.log(
            "currentTicketsPerWalletLimit",
            currentTicketsPerWalletLimit
        );
        uint256 ticketsOfUser = balanceOf(to);
        console.log("ticketsOfUser", ticketsOfUser);
        require(
            ticketsOfUser < currentTicketsPerWalletLimit,
            "CAN'T BUY MORE TICKETS WITH THIS WALLET"
        );
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        return tokenId;
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        override(ERC721, ERC721URIStorage)
    {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
