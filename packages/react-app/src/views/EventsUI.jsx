import React, { useState, useEffect } from "react";
import { Alert, Button, Card, Col, Input, List, Menu, Row } from "antd";
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



const EventsUI = ({ loadWeb3Modal, address, tx, readContracts, writeContracts, mainnetProvider, blockExplorer,
    localProvider, userSigner, eventAdd }) => {
    const [collection, setCollection] = useState({
        loading: true,
        items: [],
    });

    const [minting, setMinting] = useState(false);

    var eventContract = null;

    const [count, setCount] = useState(1);
    const [eventname, setName] = useState("");


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

    const getEventName = async () => {
        const name = await eventContract.getEventName();
        console.log("name", name)
        setName(name);
    };

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

    const getTokenURI = async (ownerAddress, index) => {
        const id = await eventContract.tokenOfOwnerByIndex(ownerAddress, index);
        const tokenURI = await eventContract.tokenURI(id);
        //console.log("tokenURI", tokenURI)
        try {
            const metadata = await axios.get(tokenURI);
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

    const setContract = async () => {
        if (eventContract == null)
            eventContract = await new Contract(eventAdd, EventABI, userSigner);
            await getEventName();
    };

    const mintItem = async () => {
        // upload to ipfs
        const uploaded = await ipfs.add(JSON.stringify(json[count]));
        setCount(count + 1);
        console.log("Uploaded Hash: ", uploaded);
        console.log("eventContract: ", eventContract);
        await setContract();
        await eventContract.mintItem(address, uploaded.path)
        loadCollection();
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
        for (let tokenIndex = 0; tokenIndex < balance; tokenIndex++) {
            try {
                // console.log("GEtting token index", tokenIndex);
                const tokenId = await eventContract.tokenOfOwnerByIndex(address, tokenIndex);
                // console.log("tokenId", tokenId);
                const tokenURI = await eventContract.tokenURI(tokenId);
                //  console.log("tokenURI", tokenURI);

                const ipfsHash = tokenURI.replace("https://ipfs.io/ipfs/", "");
                console.log("ipfsHash", ipfsHash);

                const jsonManifestBuffer = await getFromIPFS(ipfsHash);

                try {
                    const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
                    console.log("jsonManifest", jsonManifest);
                    collectibleUpdate.push({ id: tokenId, uri: tokenURI, owner: address, ...jsonManifest });
                } catch (e) {
                    console.log(e);
                }
            } catch (e) {
                console.log(e);
            }
        }
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
        if (eventContract == null) loadCollection();
    }, [address, readContracts, writeContracts]);

    console.log("collection.items", collection.items)


    return (
        <div style={{ maxWidth: 768, margin: "20px auto", paddingBottom: 25 }}>
            {address ? (
                <>
                    <div style={{ width: 640, margin: "auto", marginTop: 2, paddingBottom: 32 }}>
                        <div style={{ padding: 32, width: 400, margin: "auto" }}>
                            <div>Event name:</div>
                            {eventname}
                        </div>
                        <List
                            bordered
                            dataSource={collection.items}
                            renderItem={item => {
                                const id = item.uri.id.toNumber();;
                                return (
                                    <List.Item key={id + "_" + item.uri + "_" + item.uri.owner}>
                                        <Card
                                            title={
                                                <div>
                                                    <span style={{ fontSize: 16, marginRight: 8 }}>#{id}</span> {item.uri.name}
                                                </div>
                                            }
                                        >
                                            <div>
                                                <img src={item.uri.image} style={{ maxWidth: 150 }} />
                                            </div>
                                            <div>{item.uri.description}</div>
                                        </Card>

                                        <div>
                                            owner:{" "}
                                            <Address
                                                address={item.owner}
                                                ensProvider={mainnetProvider}
                                                blockExplorer={blockExplorer}
                                                fontSize={16}
                                            />
                                            <AddressInput
                                                ensProvider={mainnetProvider}
                                                placeholder="transfer to address"
                                                value={transferToAddresses[id]}
                                                onChange={newValue => {
                                                    const update = {};
                                                    update[id] = newValue;
                                                    setTransferToAddresses({ ...transferToAddresses, ...update });
                                                }}
                                            />
                                            <Button
                                                onClick={() => {
                                                    console.log("writeContracts", writeContracts);
                                                    tx(writeContracts.YourCollectible.transferFrom(address, transferToAddresses[id], id));
                                                }}
                                            >
                                                Transfer
                                            </Button>
                                        </div>
                                    </List.Item>
                                );
                            }}
                        />
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
                </>
            ) : (
                <Button key="loginbutton" type="primary" onClick={loadWeb3Modal}>
                    Connect Ethereum Wallet To Mint
                </Button>
            )}
        </div>

    );
};

export default EventsUI;
