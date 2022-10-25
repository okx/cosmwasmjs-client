import { SigningCosmWasmClient, Secp256k1HdWallet, coin, parseCoins } from "cosmwasm";
import { stringToPath } from "@cosmjs/crypto";
import { HdPath, Slip10RawIndex } from "@cosmjs/crypto";

// This is your rpc endpoint
const rpcEndpoint = "localhost:26657";

// Using a random generated mnemonic
const mnemonic = "palace cube bitter light woman side pave cereal donor bronze twice work";

async function main() {
  // Create a wallet
  //const path = stringToPath("m/44'/996'/0'/0/0");
  //const path = stringToPath("m/44'/118'/0'/0/0")
  // const path = [
  //   Slip10RawIndex.hardened(44),
  //   Slip10RawIndex.hardened(60),
  //   Slip10RawIndex.hardened(0),
  //   Slip10RawIndex.normal(0),
  //   Slip10RawIndex.normal(0),
  // ];
  const path = stringToPath("m/44'/118'/0'/0/0");
  const wallet = await Secp256k1HdWallet.fromMnemonic(mnemonic, {hdPaths:[path], "prefix":"ex"});
  console.log(wallet.mnemonic);
  const accs = await wallet.getAccounts();
  console.log(accs);

  // Using
  const client = await SigningCosmWasmClient.connectWithSigner(
    rpcEndpoint,
    wallet,
  );
  console.log(client);
  const codes = await client.getCodes();
  console.log(codes);
  const contract = await client.getContract("ex14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s6fqu27");
  console.log(contract);
  const res = await client.queryContractSmart("ex14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s6fqu27", {"balance":{"address":"ex1eutyuqqase3eyvwe92caw8dcx5ly8s544q3hmq"}})
  console.log(res);
  const res2 = await client.queryContractSmart("ex14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s6fqu27", {"balance":{"address":"ex1h0j8x0v9hs4eq6ppgamemfyu4vuvp2sl0q9p3v"}})
  console.log(res2);
  const res3 = await client.execute("ex1eutyuqqase3eyvwe92caw8dcx5ly8s544q3hmq", "ex14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s6fqu27", {"transfer":{"amount":"10","recipient":"ex1h0j8x0v9hs4eq6ppgamemfyu4vuvp2sl0q9p3v"}}, {"amount":parseCoins("1okt"),"gas":"200000"}, "", null);
  console.log(res3);
  const res4 = await client.queryContractSmart("ex14hj2tavq8fpesdwxxcu44rty3hh90vhujrvcmstl4zr3txmfvw9s6fqu27", {"balance":{"address":"ex1eutyuqqase3eyvwe92caw8dcx5ly8s544q3hmq"}})
  console.log(res4);
}

main();
