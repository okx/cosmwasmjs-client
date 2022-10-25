import { CosmWasmClient } from "cosmwasm";

// console.log(CosmWasmClient);

// This is your rpc endpoint
//const rpcEndpoint = "https://rpc.cliffnet.cosmwasm.com:443/";
const rpcEndpoint = "localhost:26657"

async function main() {
    const client = await CosmWasmClient.connect(rpcEndpoint);
    console.log(client);
    const chainID = await client.getChainId();
    console.log(chainID);
    const height = await client.getHeight();
    console.log(height);
    const codes = await client.getCodes();
    console.log(codes);
}

main();
