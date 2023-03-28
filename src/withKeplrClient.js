import {parseCoins, setupWebKeplr} from "cosmwasm";

// 三种网络类型：main, test, local
const netType = "local";


const netInfoByNetType = {
  chainId: (netType === "main") ? "exchain-66": (netType === "test") ? "exchain-65" : "exchain-65",
  chainName: (netType === "main") ? "OKC Mainnet": (netType === "test") ? "OKC Testnet" : "OKC Localhost",
  rpc: (netType === "main") ? "https://exchaintmrpc.okex.org": (netType === "test") ? "https://exchaintesttmrpc.okex.org" : "http://localhost:8092",
  rest:  (netType === "main") ? "https://exchainrpc.okex.org" : (netType === "test") ? "https://exchaintestrpc.okex.org" : "http://localhost:8092",
  rpcEndpoint: (netType === "main") ? "https://exchaintmrpc.okex.org": (netType === "test") ? "https://exchaintesttmrpc.okex.org" : "http://localhost:8092",
}

const config = {
  chainId: netInfoByNetType.chainId,
  rpcEndpoint: netInfoByNetType.rpcEndpoint,
  prefix: "ex",
};


async function main() {
  let captain = "ex1h0j8x0v9hs4eq6ppgamemfyu4vuvp2sl0q9p3v";
  let keplrAddr = "ex1eutyuqqase3eyvwe92caw8dcx5ly8s544q3hmq";

  const client = await setupWebKeplr(config);
  console.log(client);
  const chainID = await client.getChainId();
  console.log(chainID);

  const res = await client.sendTokens(keplrAddr, captain, parseCoins("1000000000000000000wei"), {"amount":parseCoins("20000000000000wei"),"gas":"200000"});
  console.log(res);

  // TODO
  // upload wasm code

  const codes = await client.getCodes();
  console.log(codes);
  const info = await client.instantiate(keplrAddr, 1, {"decimals":10,"initial_balances":[{"address":keplrAddr,"amount":"100000000"}],"name":"my test token", "symbol":"MTT"}, "hello world", {"amount":parseCoins("20000000000000wei"),"gas":"200000"}, {"funds":parseCoins("1okt")});
  console.log(info);
  const contract = await client.getContract(info.contractAddress);
  console.log(contract);
  const res3 = await client.execute(keplrAddr, info.contractAddress, {"transfer":{"amount":"10","recipient":captain}}, {"amount":parseCoins("20000000000000wei"),"gas":"200000"}, "", null);
  console.log(res3);
  const res4 = await client.queryContractSmart(info.contractAddress, {"balance":{"address":keplrAddr}})
  console.log(res4);
  const res2 = await client.queryContractSmart(info.contractAddress, {"balance":{"address":captain}})
  console.log(res2);
}



window.onload = async () => {
  // Keplr extension injects the offline signer that is compatible with cosmJS.
  // You can get this offline signer from `window.getOfflineSigner(chainId:string)` after load event.
  // And it also injects the helper function to `window.keplr`.
  // If `window.getOfflineSigner` or `window.keplr` is null, Keplr extension may be not installed on browser.
  if (!window.getOfflineSigner || !window.keplr) {
    alert("Please install keplr extension");
  } else {
    if (window.keplr.experimentalSuggestChain) {
      try {
        // Keplr v0.6.4 introduces an experimental feature that supports the feature to suggests the chain from a webpage.
        // cosmoshub-3 is integrated to Keplr so the code should return without errors.
        // The code below is not needed for cosmoshub-3, but may be helpful if you’re adding a custom chain.
        // If the user approves, the chain will be added to the user's Keplr extension.
        // If the user rejects it or the suggested chain information doesn't include the required fields, it will throw an error.
        // If the same chain id is already registered, it will resolve and not require the user interactions.
        await window.keplr.experimentalSuggestChain({
          // Chain-id of the Osmosis chain.
          chainId: netInfoByNetType.chainId,
          // The name of the chain to be displayed to the user.
          chainName: netInfoByNetType.chainName,
          // RPC endpoint of the chain. In this case we are using blockapsis, as it's accepts connections from any host currently. No Cors limitations.
          rpc: netInfoByNetType.rpc,
          // REST endpoint of the chain.
          rest: netInfoByNetType.rest,
          // Staking coin information
          stakeCurrency: {
            // Coin denomination to be displayed to the user.
            coinDenom: "OKT",
            // Actual denom (i.e. uatom, uscrt) used by the blockchain.
            coinMinimalDenom: "wei",
            // # of decimal points to convert minimal denomination to user-facing denomination.
            coinDecimals: 18,
            // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
            // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
            coinGeckoId: "oec-token"
          },
          // (Optional) If you have a wallet webpage used to stake the coin then provide the url to the website in `walletUrlForStaking`.
          // The 'stake' button in Keplr extension will link to the webpage.
          // walletUrlForStaking: "",
          // The BIP44 path.
          bip44: {
            // You can only set the coin type of BIP44.
            // 'Purpose' is fixed to 44.
            coinType: 60,
          },
          // Bech32 configuration to show the address to user.
          // This field is the interface of
          // {
          //   bech32PrefixAccAddr: string;
          //   bech32PrefixAccPub: string;
          //   bech32PrefixValAddr: string;
          //   bech32PrefixValPub: string;
          //   bech32PrefixConsAddr: string;
          //   bech32PrefixConsPub: string;
          // }
          bech32Config: {
            bech32PrefixAccAddr: "ex",
            bech32PrefixAccPub: "expub",
            bech32PrefixValAddr: "exvaloper",
            bech32PrefixValPub: "exvaloperpub",
            bech32PrefixConsAddr: "exvalcons",
            bech32PrefixConsPub: "exvalconspub"
          },
          // List of all coin/tokens used in this chain.
          currencies: [{
            // Coin denomination to be displayed to the user.
            coinDenom: "OKT",
            // Actual denom (i.e. uatom, uscrt) used by the blockchain.
            coinMinimalDenom: "wei",
            // # of decimal points to convert minimal denomination to user-facing denomination.
            coinDecimals: 18,
            // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
            // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
            coinGeckoId: "oec-token"
          }],
          // List of coin/tokens used as a fee token in this chain.
          feeCurrencies: [{
            // Coin denomination to be displayed to the user.
            coinDenom: "OKT",
            // Actual denom (i.e. uosmo, uscrt) used by the blockchain.
            coinMinimalDenom: "wei",
            // # of decimal points to convert minimal denomination to user-facing denomination.
            coinDecimals: 18,
            // (Optional) Keplr can show the fiat value of the coin if a coingecko id is provided.
            // You can get id from https://api.coingecko.com/api/v3/coins/list if it is listed.
            coinGeckoId: "oec-token"
          }],
          // (Optional) The number of the coin type.
          // This field is only used to fetch the address from ENS.
          // Ideally, it is recommended to be the same with BIP44 path's coin type.
          // However, some early chains may choose to use the Cosmos Hub BIP44 path of '118'.
          // So, this is separated to support such chains.
          coinType: 60,
          // (Optional) This is used to set the fee of the transaction.
          // If this field is not provided, Keplr extension will set the default gas price as (low: 0.01, average: 0.025, high: 0.04).
          // Currently, Keplr doesn't support dynamic calculation of the gas prices based on on-chain data.
          // Make sure that the gas prices are higher than the minimum gas prices accepted by chain validators and RPC/REST endpoint.
          gasPriceStep: {
            low: 200000000,
            average: 250000000,
            high: 400000000
          },
          features: ["stargate", "ibc-transfer", "no-legacy-stdTx", "ibc-go"],
        });
      } catch {
        alert("Failed to suggest the chain");
      }
    } else {
      alert("Please use the recent version of keplr extension");
    }
  }

  main();

  //   const chainId = "osmosis-1";

  // You should request Keplr to enable the wallet.
  // This method will ask the user whether or not to allow access if they haven't visited this website.
  // Also, it will request user to unlock the wallet if the wallet is locked.
  // If you don't request enabling before usage, there is no guarantee that other methods will work.
  //   await window.keplr.enable(chainId);

  // const offlineSigner = window.getOfflineSigner(chainId);

  // You can get the address/public keys by `getAccounts` method.
  // It can return the array of address/public key.
  // But, currently, Keplr extension manages only one address/public key pair.
  // XXX: This line is needed to set the sender address for SigningCosmosClient.
  //const accounts = await offlineSigner.getAccounts();

  // Initialize the gaia api with the offline signer that is injected by Keplr extension.
  //const cosmJS = new SigningCosmosClient(
  //    "https://rpc-osmosis.blockapsis.com",
  //    accounts[0].address,
  //    offlineSigner,
  //);

  //document.getElementById("address").append(accounts[0].address);
};


