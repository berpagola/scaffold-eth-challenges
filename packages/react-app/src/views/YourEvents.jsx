import React, { useState, useEffect } from "react";
import { Alert, Button, Card, Col, Input, List, Menu, Row } from "antd";
import { Account, Address, AddressInput, Contract, Faucet, GasGauge, Header, Ramp, ThemeSwitch } from "../components";
import EventABI from "../abi/Event.abi.json";
import YourSingleEventUI from "./YourSingleEventUI";
const fs = require('fs')
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
    const [image, setImageFile] = useState();


    // keep track of a variable from the contract in the local React state:
    const balance = useContractReader(readContracts, "EventFactory", "balanceOf", [address]);
    //console.log("🤗 balanceeee:", balance);

    // keep track of a variable from the contract in the local React state:
    const name = useContractReader(readContracts, "EventFactory", "name");
    //console.log("🤗 event name:", name);

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
        /*
        console.log("GEtting token index", index);
        const tokenId = await readContracts.EventFactory.tokenOfOwnerByIndex(ownerAddress, index);
        console.log("tokenId", tokenId);
        const tokenURI = await readContracts.EventFactory.tokenURI(tokenId);
        console.log("tokenURI", tokenURI);
        return tokenURI;
*/
        const id = await readContracts.EventFactory.tokenOfOwnerByIndex(ownerAddress, index);
        console.log("id", id)
        const tokenURI = await readContracts.EventFactory.tokenURI(id);
        console.log("tokenURI", tokenURI)
        try {
            console.log("tokenURI", tokenURI)
            const metadata = await axios.get(tokenURI);
            console.log("metadata", metadata)
            if (metadata) {
                return { ...metadata.data, id, tokenURI };
            }
        } catch (e) { console.log(e) }
        //console.log("metadata",metadata.data)
        //const approved = await readContracts.GigaNFT.getApproved(id);

    };
    const getEventData = async (eventAddress) => {

        let eventContract = await new Contract(eventAddress, EventABI, userSigner);
        let eventName = eventContract.getEventName();
        let ticketLimit = eventContract.getTicketLimit();
        //await getEventName();
        return { eventName: eventName, ticketLimit: ticketLimit };

    };

    const uploadFileIPFS = async (file) => {
        setImageFile(file);
        console.log("image", image);
    }



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

    const mintItem = async () => {
        console.log("quantity", q);
        let js = json[count];
        console.log("jason", js);
        const uploadedImage = await ipfs.add(image)
        console.log(uploadedImage);
        let v1CID = uploadedImage.cid.toV1()
        console.log("https://"+v1CID+".ipfs.dweb.link");
        js.image = "https://"+v1CID+".ipfs.dweb.link";
        console.log("jason", js);
        const uploaded = await ipfs.add(JSON.stringify(js));
        console.log("uploaded", uploaded);
        let cant = 2;
        const result = tx(
            writeContracts &&
            writeContracts.EventFactory &&
            writeContracts.EventFactory.create(address, neweventname, q, newTicketsPerWallet, utils.parseEther(newPrice), uploaded.path),
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

    const getImgPath = async (event) => {
        console.log("event", event.target.files[0]);
        uploadFileIPFS(event.target.files[0]);
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
            //const tokenURI = await readContracts.EventFactory.tokenURI(tokenId);
            console.log("tokenURI", tokenId)
            const event = await readContracts.EventFactory.getEvent(tokenId);
            console.log("event address", event.eAddr)
            tokensPromises.push({ tokenId: tokenId, eventAddress: event.eAddr });//, event: await getEventData(event.eAddr) });//eventName: eventName, ticketLimit: ticketLimit });
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

    const [q, setQ] = useState("");
    const [neweventname, setNewName] = useState("");
    const [newTicketsPerWallet, setnewTicketsPerWallet] = useState("");
    const [newPrice, setnewPrice] = useState("");

    return (
        <div style={{ maxWidth: 768, margin: "20px auto", paddingBottom: 25 }}>
            {address ? (
                <>
                    {
                        <List
                            bordered
                            dataSource={collection.items}
                            renderItem={item => {
                                return (
                                    <YourSingleEventUI
                                        loadWeb3Modal={loadWeb3Modal}
                                        address={address}
                                        tx={tx}
                                        writeContracts={writeContracts}
                                        readContracts={readContracts}
                                        mainnetProvider={mainnetProvider}
                                        blockExplorer={blockExplorer}
                                        userSigner={userSigner}
                                        eventAdd={item.eventAddress}
                                        tokenId={item.tokenId}
                                    />
                                );
                            }}
                        />

                    }
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
