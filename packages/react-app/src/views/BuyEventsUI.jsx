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



const BuyEventsUI = ({ loadWeb3Modal, address, tx, readContracts, writeContracts, mainnetProvider, blockExplorer,
    localProvider, userSigner, eventAdd }) => {
    const [collection, setCollection] = useState({
        loading: true,
        items: [],
    });

    const [minting, setMinting] = useState(false);

    var eventContract = null;

    const [count, setCount] = useState(1);
    const [eventname, setName] = useState("");
    const [eventLimit, setLimit] = useState("");
    const [eventTicketsSold, setSold] = useState("");
    const [eventTicketPrice, setPrice] = useState("");
    const [ticketsPerWallet, setWalletLimit] = useState("");
    const [contractBalance, setBalanceETH] = useState("");



    // keep track of a variable from the contract in the local React state:
    const balance = useContractReader(eventContract, "balanceOf", [address]);
    //console.log("🤗 balance of event:", balance);
    //console.log("🤗 balance of event contract:", eventContract);

    // keep track of a variable from the contract in the local React state:
    //const balance = useContractReader(readContracts, "Event", "balanceOf", [address]);
    //console.log("🤗 balanceeee:", balance);

    // keep track of a variable from the contract in the local React state:
    //const name = useContractReader(eventContract, "Event", "name");
    //console.log("🤗 event name:", name);

    // 📟 Listen for broadcast events
    //const transferEvents = useEventListener(readContracts, "YourCollectible", "Transfer", localProvider, 1);
    //console.log("📟 Transfer events:", transferEvents);

    //
    // 🧠 This effect will update yourCollectibles by polling when your balance changes
    //
    //const yourBalance = balance && balance.toNumber && balance.toNumber();
    const [yourCollectibles, setYourCollectibles] = useState();

    const [transferToAddresses, setTransferToAddresses] = useState({});




    const getEventBalance = async () => {
        const balanceETH = await eventContract.getBalance();
        //console.log("balanceETH", balanceETH)
        setBalanceETH(ethers.utils.formatUnits(balanceETH, 18));
    };

    const getEventName = async () => {
        const name = await eventContract.getEventName();
        //console.log("name", name)
        setName(name);
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
/*
    const getFromIPFS = async hashToGet => {
        for await (const file of ipfs.get(hashToGet)) {
            console.log(file.path);
            if (!file.content) continue;
            const content = new BufferList();
            for await (const chunk of file.content) {
                content.append(chunk);
            }
            console.log(content);
            return content;
        }
    };
*/
    const getTokenURI = async (ownerAddress, index) => {
        const id = await eventContract.tokenOfOwnerByIndex(ownerAddress, index);
        const tokenURI = await eventContract.tokenURI(id);
        //console.log("tokenURI", tokenURI)
        try {
            const metadata = await axios.get(tokenURI);
            console.log("metadata", metadata)
            if (metadata) {
                return { ...metadata.data, id, tokenURI /*, approved: approved === writeContracts.GigaNFT.address */ };
            }
        } catch (e) { console.log(e) }

        //console.log("metadata",metadata.data)
        //const approved = await readContracts.GigaNFT.getApproved(id);

    };
    // the json for the nfts
    const json = {
        1: {
            description: "It's actually a bison?",
            external_url: "https://austingriffith.com/portfolio/paintings/", // <-- this can link to a page for the specific file too
            image: "https://austingriffith.com/images/paintings/buffalo.jpg",
            name: "Buffalo",
            attributes: [
                {
                    trait_type: "BackgroundColor",
                    value: "green",
                },
                {
                    trait_type: "Eyes",
                    value: "googly",
                },
                {
                    trait_type: "Stamina",
                    value: 42,
                },
            ],
        },
        2: {
            description: "What is it so worried about?",
            external_url: "https://austingriffith.com/portfolio/paintings/", // <-- this can link to a page for the specific file too
            image: "https://austingriffith.com/images/paintings/zebra.jpg",
            name: "Zebra",
            attributes: [
                {
                    trait_type: "BackgroundColor",
                    value: "blue",
                },
                {
                    trait_type: "Eyes",
                    value: "googly",
                },
                {
                    trait_type: "Stamina",
                    value: 38,
                },
            ],
        },
        3: {
            description: "What a horn!",
            external_url: "https://austingriffith.com/portfolio/paintings/", // <-- this can link to a page for the specific file too
            image: "https://austingriffith.com/images/paintings/rhino.jpg",
            name: "Rhino",
            attributes: [
                {
                    trait_type: "BackgroundColor",
                    value: "pink",
                },
                {
                    trait_type: "Eyes",
                    value: "googly",
                },
                {
                    trait_type: "Stamina",
                    value: 22,
                },
            ],
        },
        4: {
            description: "Is that an underbyte?",
            external_url: "https://austingriffith.com/portfolio/paintings/", // <-- this can link to a page for the specific file too
            image: "https://austingriffith.com/images/paintings/fish.jpg",
            name: "Fish",
            attributes: [
                {
                    trait_type: "BackgroundColor",
                    value: "blue",
                },
                {
                    trait_type: "Eyes",
                    value: "googly",
                },
                {
                    trait_type: "Stamina",
                    value: 15,
                },
            ],
        },
        5: {
            description: "So delicate.",
            external_url: "https://austingriffith.com/portfolio/paintings/", // <-- this can link to a page for the specific file too
            image: "https://austingriffith.com/images/paintings/flamingo.jpg",
            name: "Flamingo",
            attributes: [
                {
                    trait_type: "BackgroundColor",
                    value: "black",
                },
                {
                    trait_type: "Eyes",
                    value: "googly",
                },
                {
                    trait_type: "Stamina",
                    value: 6,
                },
            ],
        },
        6: {
            description: "Raaaar!",
            external_url: "https://austingriffith.com/portfolio/paintings/", // <-- this can link to a page for the specific file too
            image: "https://austingriffith.com/images/paintings/godzilla.jpg",
            name: "Godzilla",
            attributes: [
                {
                    trait_type: "BackgroundColor",
                    value: "orange",
                },
                {
                    trait_type: "Eyes",
                    value: "googly",
                },
                {
                    trait_type: "Stamina",
                    value: 99,
                },
            ],
        },
    };
    const getContract = async () => {
        if (eventContract == null)
            eventContract = await new Contract(eventAdd, EventABI, userSigner);
        return eventContract;
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
    };

    const mintItem = async () => {
        // upload to ipfs
        
        const uploaded = await ipfs.add(JSON.stringify(json[count]));
        setCount(count + 1);
        console.log("Uploaded Hash: ", uploaded);
        console.log("eventContract: ", eventContract);
        await setContract();
        let price = eventContract.getTicketPrice();
        //await eventContract.mintItem(address, uploaded.path)
        tx(eventContract.mintItem(address, uploaded.path, { value: price }),
            update => {
                console.log("📡 Transaction Update:", update);
                if (update && (update.status === "confirmed" || update.status === 1)) {
                    console.log(" 🍾 Transaction " + update.hash + " finished!");
                    loadCollection();
                }
            },
        );
        /*
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
        */
    };

    const loadCollection = async () => {
        await setContract();
        console.log("eventContract:", eventContract)
        if (!address || !readContracts || !writeContracts) return;
        setCollection({
            loading: true,
            items: [],
        });
        const balance = (await eventContract.balanceOf(address)).toNumber();
        //console.log("YOUR BALANCE:", balance)
        const collectibleUpdate = [];
        setYourCollectibles(collectibleUpdate);
        const tokensPromises = [];
        for (let i = 0; i < balance; i += 1) {
            tokensPromises.push({ id: i, uri: await getTokenURI(address, i), owner: address });
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

    //console.log("collection.items", collection.items)
    //console.log("collection.items", collection.items.lenght)


    return (
        <div style={{ maxWidth: 768, margin: "20px auto", paddingBottom: 25 }}>
            {address ? (
                <>
                    <div style={{ width: 640, margin: "auto", marginTop: 2, paddingBottom: 32 }}>
                        <div style={{ padding: 32, width: 400, margin: "auto" }}>
                            <div>Event name: {eventname}</div>
                            <div>Event limit: {eventLimit}</div>
                            <div>Tickets sold: {eventTicketsSold}</div>
                            <div>Tickets price: {eventTicketPrice}</div>
                            <div>Tickets per wallet: {ticketsPerWallet}</div>
                        </div>
                        <div style={{ padding: 32, width: 400, margin: "auto" }}>
                            <div>Your tickets: {collection.items.length}</div>
                            <div>Contract balance: {contractBalance}</div>
                        </div>
                    </div>
                    <Button
                        style={{ marginTop: 15 }}
                        type="primary"
                        onClick={() => {
                            mintItem();
                        }}
                    >
                        BUY TICKET
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

export default BuyEventsUI;
