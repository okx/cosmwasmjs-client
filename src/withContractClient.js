import { CosmWasmClient } from "cosmwasm";

// This is your rpc endpoint
const rpcEndpoint = "https://rpc.cliffnet.cosmwasm.com:443/";

// This is your contract address
const contractAddr = "wasm19qws2lfd8pskyn0cfgpl5yjjyq3msy5402qr8nkzff9kdnkaepyqycedfh";

async function main() {
  const client = await CosmWasmClient.connect(rpcEndpoint);
  console.log(client);
  const config = await client.queryContractSmart(contractAddr, { config: {} });

  console.log(config);
}

main();
