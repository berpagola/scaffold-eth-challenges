import React, { useState, useEffect } from "react";
import { Alert, Button, Card, Col, Input, List, Menu, Row } from "antd";
import { Account, Address, AddressInput, Contract, Faucet, GasGauge, Header, Ramp, ThemeSwitch } from "../components";
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



const YourEvents = ({ loadWeb3Modal, address, tx, readContracts, writeContracts, mainnetProvider, blockExplorer }) => {
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

    const mintItem = async () => {
        const result = tx(
            writeContracts &&
            writeContracts.EventFactory &&
            writeContracts.EventFactory.create(address, "event of " + address),
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
        console.log("YOUR BALANCE:", address)
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
                    <Button
                        style={{ marginTop: 15 }}
                        type="primary"
                        onClick={() => {
                            mintItem();
                        }}
                    >
                        CREATE EVENT
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

export default YourEvents;
