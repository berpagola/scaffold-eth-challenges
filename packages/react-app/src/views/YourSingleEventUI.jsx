import React, { useState, useEffect } from "react";
import { Alert, Button, Card, Col, Input, List, Menu, Row, Divider } from "antd";
import { Account, Address, AddressInput, Faucet, GasGauge, Header, Ramp, ThemeSwitch } from "../components";
import { ethers } from "ethers";
import { Contract } from "@ethersproject/contracts";
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

import EventABI from "../abi/Event.abi.json";

const { BufferList } = require("bl");
const ipfsAPI = require("ipfs-http-client");
const ipfs = ipfsAPI({ host: "ipfs.infura.io", port: "5001", protocol: "https" });

const BOOSTPERCENT = 0


const OPENSEA_LINK = "https://testnets.opensea.io/assets/"



const YourSingleEventUI = ({ loadWeb3Modal, address, tx, readContracts, writeContracts, mainnetProvider, blockExplorer,
    userSigner, eventAdd, tokenId }) => {

    var eventContract = null;

    const [eventname, setName] = useState("");
    const [eventUri, setUri] = useState("");
    const [eventMetadata, setMetadata] = useState("");
    const [eventLimit, setLimit] = useState("");
    const [eventTicketsSold, setSold] = useState("");
    const [eventTicketPrice, setPrice] = useState("");
    const [ticketsPerWallet, setWalletLimit] = useState("");
    const [contractBalance, setBalanceETH] = useState("");



    // keep track of a variable from the contract in the local React state:
    const balance = useContractReader(eventContract, "balanceOf", [address]);



    const getEventBalance = async () => {
        const balanceETH = await eventContract.getBalance();
        //console.log("balanceETH", balanceETH)
        setBalanceETH(ethers.utils.formatUnits(balanceETH, 18));
    };

    const getEventName = async () => {
        const name = await eventContract.getEventName();
        //console.log("eventUri", eventUri)
        setName(name);
    };

    const getEventUri = async () => {
        const uri = await readContracts.EventFactory.tokenURI(tokenId);
        console.log("eventUri", uri)
        setUri(uri);
        try {
            const metadata = await axios.get(uri);
            console.log("metadata single event", metadata);
            if (metadata) {
                setMetadata(metadata.data);
            }
        } catch (e) { console.log(e) }
    };

    const getEventLimit = async () => {
        const limit = await eventContract.getTicketLimit();
        //console.log("limit", limit)
        setLimit(ethers.utils.formatUnits(limit, 0));
    };

    const getTicketsSold = async () => {
        const sold = await eventContract.getTicketsSold();
        //console.log("sold", sold)
        setSold(ethers.utils.formatUnits(sold, 0));
    };

    const getTicketsPerWalletLimit = async () => {
        const walletLimit = await eventContract.getTicketsPerWalletLimit();
        //console.log("walletLimit", walletLimit)
        setWalletLimit(ethers.utils.formatUnits(walletLimit, 0));
    };

    const getTicketPrice = async () => {
        const price = await eventContract.getTicketPrice();
        //console.log("price", price)
        setPrice(ethers.utils.formatUnits(price, 18));
    };

    const setContract = async () => {
        if (eventContract == null)
            eventContract = await new Contract(eventAdd, EventABI, userSigner);
        await getEventName();
        await getEventLimit();
        await getTicketsSold();
        await getTicketPrice();
        await getTicketsPerWalletLimit();
        await getEventBalance();
        await getEventUri();
    };

    const withdrawFunds = async () => {

        await setContract();
        tx(eventContract.withdraw(),
            update => {
                console.log("📡 Transaction Update:", update);
                if (update && (update.status === "confirmed" || update.status === 1)) {
                    console.log(" 🍾 Transaction " + update.hash + " finished!");
                    loadCollection();
                }
            },
        );

    };

    const loadCollection = async () => {
        await setContract();

    };
    useEffect(() => {
        if (readContracts.EventFactory) loadCollection();
    }, [address, readContracts, writeContracts]);

    //console.log("collection.items", collection.items)
    //console.log("collection.items", collection.items.lenght)

    return (
        <div style={{ maxWidth: 768, margin: "20px auto", paddingBottom: 25 }}>
            {address ? (
                <>
                    <div>
                        <img src={eventMetadata.image} style={{ maxWidth: 150 }} />
                    </div>
                    <div style={{ width: 640, margin: "auto", marginTop: 2, paddingBottom: 32 }}>
                        <div style={{ padding: 32, width: 400, margin: "auto" }}>
                            <div>Event name: {eventname}</div>
                            <div>Event limit: {eventLimit}</div>
                            <div>Tickets sold: {eventTicketsSold}</div>
                            <div>Tickets price: {eventTicketPrice}</div>
                            <div>Tickets per wallet: {ticketsPerWallet}</div>
                        </div>
                        <div style={{ padding: 32, width: 400, margin: "auto" }}>
                            <div>Event balance: {contractBalance}</div>
                        </div>
                    </div>
                    <Button
                        style={{ marginTop: 15 }}
                        type="primary"
                        onClick={() => {
                            withdrawFunds();
                        }}
                    >
                        WITHDRAW FUNDS
                    </Button>

                    <Divider />
                </>
            ) : (
                <Button key="loginbutton" type="primary" onClick={loadWeb3Modal}>
                    Connect Ethereum Wallet To Mint
                </Button>
            )}
        </div>

    );
};

export default YourSingleEventUI;
