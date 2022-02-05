// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2; 
import "./Event.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol"; 
import "@openzeppelin/contracts/utils/Strings.sol";

contract EventFactory is ERC721, ERC721Enumerable, ERC721URIStorage, Ownable {

    using SafeMath for uint256;
    Event[] public es;
    using Counters for Counters.Counter;
    Counters.Counter private _idCounter;
    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("Events Factory", "CIV") payable {

    }

    function create(address _owner, string memory _model) public {
        _idCounter.increment();
        Event e = new Event(_owner, _model);
        es.push(e);
        mintItem(_owner);
    }
 
    function createAndSendEther(address _owner, string memory _model) public payable {
        _idCounter.increment();
        Event e = (new Event){value: msg.value}(_owner, _model);
        es.push(e);
    }

    function create2(
        address _owner,
        string memory _model,
        bytes32 _salt
    ) public {
        _idCounter.increment();
        Event e = (new Event){salt: _salt}(_owner, _model);
        es.push(e);
    }

    function create2AndSendEther(
        address _owner,
        string memory _model,
        bytes32 _salt
    ) public payable {
        _idCounter.increment();
        Event e = (new Event){value: msg.value, salt: _salt}(_owner, _model);
        es.push(e);
    }

    function getEvent(uint _index)
        public
        view
        returns (
            address owner,
            string memory model,
            address eAddr,
            uint balance
        )
    {
        Event e = es[_index];

        return (e.owner(), e.eventName(), e.eventAddr(), address(e).balance);
    }

    function mintItem(address to) private returns (uint256) {
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, Strings.toString(tokenId));
        return tokenId;
    }

    function  getTotalEvents() 
        public view
        returns (uint256)
    {
        return (_idCounter.current());
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

