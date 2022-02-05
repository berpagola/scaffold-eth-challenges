import React, { useState, useEffect } from "react";
import { Alert, Button, Card, Col, Input, List, Menu, Row } from "antd";
import { Account, Address, AddressInput, Contract, Faucet, GasGauge, Header, Ramp, ThemeSwitch } from "../components";
import EventABI from "../abi/Event.abi.json";

const { utils, BigNumber } = require("ethers");
import { ethers } from "ethers";
import axios from "axios";
import {
    useBalance,
    useContractLoader,
    useContractReader,
    useGasPrice,
    useOnBlock,
    useUserProviderAndSigner,
} from "eth-hooks";

import { formatEther } from "@ethersproject/units";
import { usePoller } from "eth-hooks";

const { BufferList } = require("bl");
const ipfsAPI = require("ipfs-http-client");
const ipfs = ipfsAPI({ host: "ipfs.infura.io", port: "5001", protocol: "https" });

const BOOSTPERCENT = 0


const OPENSEA_LINK = "https://testnets.opensea.io/assets/"



const YourEvents = ({ loadWeb3Modal, address, tx, readContracts, writeContracts, mainnetProvider, blockExplorer, userSigner }) => {
    const [collection, setCollection] = useState({
        loading: true,
        items: [],
    });

    const [minting, setMinting] = useState(false);

    const [count, setCount] = useState(1);
    const [eventname, setName] = useState("");


    // keep track of a variable from the contract in the local React state:
    const balance = useContractReader(readContracts, "EventFactory", "balanceOf", [address]);
    console.log("🤗 balanceeee:", balance);

    // keep track of a variable from the contract in the local React state:
    const name = useContractReader(readContracts, "EventFactory", "name");
    console.log("🤗 event name:", name);

    // 📟 Listen for broadcast events
    //const transferEvents = useEventListener(readContracts, "YourCollectible", "Transfer", localProvider, 1);
    //console.log("📟 Transfer events:", transferEvents);

    //
    // 🧠 This effect will update yourCollectibles by polling when your balance changes
    //
    const yourBalance = balance && balance.toNumber && balance.toNumber();
    const [yourCollectibles, setYourCollectibles] = useState();

    const [transferToAddresses, setTransferToAddresses] = useState({});
    /*
        const getEventName = async () => {
            const name = await readContracts.EventFactory.getEventName();
            console.log("name", name)
            setName(name);
        };
    */
    const getTokenURI = async (ownerAddress, index) => {
        //await getEventName();
        console.log("GEtting token index", index);
        const tokenId = await readContracts.EventFactory.tokenOfOwnerByIndex(ownerAddress, index);
        console.log("tokenId", tokenId);
        const tokenURI = await readContracts.EventFactory.tokenURI(tokenId);
        console.log("tokenURI", tokenURI);
        return tokenURI;

        //console.log("metadata",metadata.data)
        //const approved = await readContracts.GigaNFT.getApproved(id);

    };
    const getEventData = async (eventAddress) => {

        let eventContract = await new Contract(eventAddress, EventABI, userSigner);
        let eventName = eventContract.getEventName();
        let ticketLimit = eventContract.getTicketLimit();
        //await getEventName();
        return { eventName: eventName, ticketLimit:ticketLimit };

    };



    const mintItem = async () => {
        console.log("quantity", q);
        let cant = 2;
        const result = tx(
            writeContracts &&
            writeContracts.EventFactory &&
            writeContracts.EventFactory.create(address, neweventname, q, newTicketsPerWallet, utils.parseEther(newPrice)),
            update => {
                console.log("📡 Transaction Update:", update);
                if (update && (update.status === "confirmed" || update.status === 1)) {
                    console.log(" 🍾 Transaction " + update.hash + " finished!");
                    console.log(
                        " ⛽️ " +
                        update.gasUsed +
                        "/" +
                        (update.gasLimit || update.gas) +
                        " @ " +
                        parseFloat(update.gasPrice) / 1000000000 +
                        " gwei",
                    );
                    loadCollection();
                }
            },
        );
    };

    const loadCollection = async () => {
        if (!address || !readContracts || !writeContracts) return;
        setCollection({
            loading: true,
            items: [],
        });
        const balance = (await readContracts.EventFactory.balanceOf(address)).toNumber();
        console.log("YOUR BALANCE:", balance)
        const tokensPromises = [];
        for (let i = 0; i < balance; i += 1) {
            const tokenId = await readContracts.EventFactory.tokenOfOwnerByIndex(address, i);
            const tokenURI = await readContracts.EventFactory.tokenURI(tokenId);
            console.log("tokenURI", tokenURI)
            const event = await readContracts.EventFactory.getEvent(tokenURI - 1);
            console.log("event address", event.eAddr)
            tokensPromises.push({ id: i, uri: await getTokenURI(address, i), owner: address});//, event: await getEventData(event.eAddr) });//eventName: eventName, ticketLimit: ticketLimit });
        }
        const tokens = await Promise.all(tokensPromises);
        setCollection({
            loading: false,
            items: tokens,
        });
    };

    useEffect(() => {
        if (readContracts.EventFactory) loadCollection();
    }, [address, readContracts, writeContracts]);

    console.log("collection.items", collection.items)

    const [q, setQ] = useState("");
    const [neweventname, setNewName] = useState("");
    const [newTicketsPerWallet, setnewTicketsPerWallet] = useState("");
    const [newPrice, setnewPrice] = useState("");

    return (
        <div style={{ maxWidth: 768, margin: "20px auto", paddingBottom: 25 }}>
            {address ? (
                <>
                    <div style={{ width: 640, margin: "auto", marginTop: 2, paddingBottom: 32 }}>
                        <div style={{ padding: 32, width: 400, margin: "auto" }}>
                            <div>Event name: {eventname}</div>
                            
                        </div>
                        <List
                            bordered
                            dataSource={collection.items}
                            renderItem={item => {
                                const id = item.id;
                                return (
                                    <List.Item key={id + "_" + item.owner}>
                                        <Card
                                            title={
                                                <div>
                                                    <span style={{ fontSize: 16, marginRight: 8 }}>#{id}</span> {item.owner}
                                                </div>
                                            }
                                        >
                                            <div>
                                                EVENT ID: {item.uri}
                                            </div>
                                        </Card>
                                    </List.Item>
                                );
                            }}
                        />
                    </div>
                    <div style={{ maxWidth: 350, margin: "20px auto" }}>
                        <h2 style={{ marginBottom: "20px" }}>New Event</h2>
                        <div style={{ display: "flex", alignItems: "center", maxWidth: 350, margin: "0 auto", marginBottom: "10px" }}>
                            <label htmlFor="name" style={{ marginRight: 10, flexGrow: 1, flex: 1, textAlign: "left" }}>
                                Event name:
                            </label>
                            <Input
                                placeholder="Event name"
                                id="name"
                                style={{ flex: 2 }}
                                value={neweventname}
                                onChange={e => setNewName(e.target.value)}
                            />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", maxWidth: 350, margin: "0 auto", marginBottom: "10px" }}>
                            <label htmlFor="quantity" style={{ marginRight: 20, flexGrow: 1, flex: 1, textAlign: "left" }}>
                                Ticket quantity:
                            </label>
                            <Input
                                type="number"
                                placeholder="Total amount of tickets"
                                id="quantity"
                                style={{ flex: 2 }}
                                value={q}
                                onChange={e => setQ(e.target.value)}
                            />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", maxWidth: 350, margin: "0 auto", marginBottom: "10px" }}>
                            <label htmlFor="quantityPerWallet" style={{ marginRight: 20, flexGrow: 1, flex: 1, textAlign: "left" }}>
                                Ticket per wallet:
                            </label>
                            <Input
                                type="number"
                                placeholder="Total of tickets per wallet"
                                id="quantityPerWallet"
                                style={{ flex: 2 }}
                                value={newTicketsPerWallet}
                                onChange={e => setnewTicketsPerWallet(e.target.value)}
                            />
                        </div>
                        <div style={{ display: "flex", alignItems: "center", maxWidth: 350, margin: "0 auto", marginBottom: "10px" }}>
                            <label htmlFor="price" style={{ marginRight: 20, flexGrow: 1, flex: 1, textAlign: "left" }}>
                                Ticket price (ETH):
                            </label>
                            <Input
                                type="number"
                                placeholder="Total amount of tickets"
                                id="price"
                                style={{ flex: 2 }}
                                value={newPrice}
                                onChange={e => setnewPrice(e.target.value)}
                            />
                        </div>

                        <Button
                            style={{ marginTop: 15 }}
                            type="primary"
                            onClick={() => {
                                mintItem();
                            }}
                        >
                            CREATE EVENT
                        </Button>
                    </div>
                </>
            ) : (
                <Button key="loginbutton" type="primary" onClick={loadWeb3Modal}>
                    Connect Ethereum Wallet To Mint
                </Button>
            )}
        </div>

    );
};

export default YourEvents;
