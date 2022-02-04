// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2; 
import "./Event.sol";
/*
contract Event {
    address public owner;
    string public model;
    address public eAddr;

    constructor(address _owner, string memory _model) payable {
        owner = _owner;
        model = _model;
        eAddr = address(this);
    }
}
*/
contract EventFactory {
    Event[] public es;

    function create(address _owner, string memory _model) public {
        Event e = new Event(_owner, _model);
        es.push(e);
    }
 
    function createAndSendEther(address _owner, string memory _model) public payable {
        Event e = (new Event){value: msg.value}(_owner, _model);
        es.push(e);
    }

    function create2(
        address _owner,
        string memory _model,
        bytes32 _salt
    ) public {
        Event e = (new Event){salt: _salt}(_owner, _model);
        es.push(e);
    }

    function create2AndSendEther(
        address _owner,
        string memory _model,
        bytes32 _salt
    ) public payable {
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

        return (e.owner(), e.eventName(), e.eventOwner(), address(e).balance);
    }
}

