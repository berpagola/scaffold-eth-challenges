// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2; 
import "./Event.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol"; 
import "@openzeppelin/contracts/utils/Strings.sol";

contract EventFactory is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {

    using SafeMath for uint256;
    Event[] private es;
    using Counters for Counters.Counter;
    Counters.Counter private _idCounter;
    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("Events Factory", "CIV") payable {

    }
    
    function create(address _owner, string memory _eventName, uint256 _ticketLimit, uint256 _ticketsPerWalletLimit, uint256 _ticketPrice, string memory uri) public {
        _idCounter.increment();
        Event e = new Event(_owner, _eventName, _ticketLimit, _ticketsPerWalletLimit, _ticketPrice);
        es.push(e);
        mintItem(_owner, uri);
    }
 
    function getEvent(uint _tokenId)
        public
        view
        returns (
            address owner,
            string memory model,
            address eAddr,
            uint balance, 
            uint256 _ticketLimit
        )
    {
        Event e = es[_tokenId-1];

        return (e.owner(), e.eventName(), e.eventAddr(), address(e).balance, e.getTicketLimit());
    }

    function mintItem(address to, string memory uri) private returns (uint256) {
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        console.log("tokenId", tokenId); 
        _safeMint(to, tokenId); 
        _setTokenURI(tokenId, uri);
        return tokenId;
    }

    function  getTotalEvents() 
        public view
        returns (uint256)
    {
        return (_idCounter.current());
    }

    function _baseURI() internal pure override returns (string memory) {
        return "https://ipfs.io/ipfs/";
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

