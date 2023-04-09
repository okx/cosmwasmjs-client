import {parseCoins, setupWebKeplr} from "cosmwasm";

// 三种网络类型：main, test, local
const netType = "test";


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


let contractaddress = "";

// 动态获取一次Keplr最新钱包状态
async function getLatestKeplrAccount() {
  const chainId = "exchain-65";

  // Enabling before using the Keplr is recommended.
  // This method will ask the user whether to allow access if they haven't visited this website.
  // Also, it will request that the user unlock the wallet if the wallet is locked.
  await window.keplr.enable(chainId);

  const offlineSigner = window.keplr.getOfflineSigner(chainId);

  // You can get the address/public keys by `getAccounts` method.
  // It can return the array of address/public key.
  // But, currently, Keplr extension manages only one address/public key pair.
  // XXX: This line is needed to set the sender address for SigningCosmosClient.
  const accounts = await offlineSigner.getAccounts();

  // Initialize the gaia api with the offline signer that is injected by Keplr extension.
  // const cosmJS = new SigningCosmosClient(
  //     "https://lcd-cosmoshub.keplr.app",
  //     accounts[0].address,
  //     offlineSigner,
  // );

  console.log('getLatestKeplrAcc method inner: ', accounts[0].address);
  return accounts[0].address;
}


async function main() {
  if (!window.keplr) {
    alert("Please install keplr extension");
    return false;
  }

  const client = await setupWebKeplr(config);
  console.log(client);

  // 查询id
  document.getElementById("qChainId").addEventListener('click', async function () {
    const chainID = await client.getChainId();
    console.log(chainID);
    document.getElementById("rChainId").innerHTML = chainID
  });

  // 查询高度
  document.getElementById("qHeight").addEventListener('click', async function () {
    const height = await client.getHeight();
    console.log(height);
    document.getElementById("rHeight").innerHTML = height
  });

  // 查询区块
  document.getElementById("qBlock").addEventListener('click', async function () {
    const block = await client.getBlock();
    console.log(block);
    document.getElementById("rBlock").innerHTML = JSON.stringify(block.header) + ', id: '+ block.id + ', txs个数：' + block.txs.length;
  });




  // 第一次获取
  let keplrCurrentAddr = await getLatestKeplrAccount();
  let keplrAddr2 = "";

  // 查询个人账户信息
  document.getElementById("qAccount").addEventListener('click', async function () {
    keplrCurrentAddr = await getLatestKeplrAccount();
    // 读取Keplr中的地址
    let account = await client.getAccount(keplrCurrentAddr)
    console.log(account);
    document.getElementById("rAccount").innerHTML = JSON.stringify(account)
  });

  // 查询我的余额
  document.getElementById("qBalance").addEventListener('click', async function () {
    keplrCurrentAddr = await getLatestKeplrAccount();
    const balance = await client.getBalance(keplrCurrentAddr, 'okt');
    console.log(balance);
    document.getElementById("rBalance").innerHTML = JSON.stringify(balance)
  });

  // 查询Sequence
  document.getElementById("qSequence").addEventListener('click', async function () {
    keplrCurrentAddr = await getLatestKeplrAccount();
    const sequence = await client.getSequence(keplrCurrentAddr);
    console.log(sequence);
    document.getElementById("rSequence").innerHTML = JSON.stringify(sequence)
  });

  // 转账
  document.getElementById("send").addEventListener('click', async function () {
    keplrCurrentAddr = await getLatestKeplrAccount();
    const to = document.getElementById("to").value.trim();
    if (!to) {
      alert("接收地址不能为空");
      return false;
    } else if (to.substr(0, 2) !== 'ex') {
      alert("请输入ex前缀地址");
      return false;
    } else if (to.length !== 41) {
      alert("您输入ex前缀地址长度不正确");
      return false;
    }
    document.getElementById("sendLoading").style.display = 'block';
    const res = await client.sendTokens(keplrCurrentAddr, to, parseCoins("1000000000000000000wei"), {"amount":parseCoins("20000000000000wei"),"gas":"200000"});
    console.log(res);
    document.getElementById("rto").innerHTML = JSON.stringify(res)
    document.getElementById("sendLoading").style.display = 'none';
  });



  // 加减法合约 demo
  let demoInfo = null;
  let demoAddr = keplrCurrentAddr; // 用户部署合约后切换钱包，是自己的问题。
  document.getElementById("demoDeploy").addEventListener('click', async function () {
    document.getElementById("demoDeployLoading").style.display = 'block';
    demoAddr = await getLatestKeplrAccount();
    demoInfo = await client.instantiate(demoAddr, 224, {"verifier":demoAddr, "beneficiary":demoAddr}, "hello world", {"amount":parseCoins("200000000000000000wei"),"gas":"20000000"},{"funds":[{"denom":"okt","amount":"1000000000000000000"}],"admin":demoAddr});
    console.log(demoInfo);
    document.getElementById("rDemoDeploy").innerHTML = "加减法合约实例化完成" + JSON.stringify(demoInfo);
    document.getElementById("demoResult").innerHTML = 0;
    document.getElementById("demoDeployLoading").style.display = 'none';
  });
  document.getElementById("demoAdd").addEventListener('click', async function () {
    if (!demoInfo) {
      alert("加减法合约，请先部署再执行Add和Subtract");
      return false;
    }
    const num = document.getElementById("demoAddInput").value.trim();
    if (!num) {
      alert("请输入正整数，且不能为空");
      return false;
    }
    var addMsg = {"add":{"delta": num}};
    var res1 = await client.execute(demoAddr, demoInfo.contractAddress, addMsg,  {"amount": parseCoins("200000000000000000wei"),"gas":"20000000"},'')
    console.log(res1)
    const rest2 = await client.queryContractSmart(demoInfo.contractAddress, {"get_counter": {}});
    document.getElementById("demoResult").innerHTML = rest2;
  });
  document.getElementById("demoSubtract").addEventListener('click', async function () {
    var subtractMsg = {"subtract":{}};
    var res1 = await client.execute(demoAddr, demoInfo.contractAddress, subtractMsg,  {"amount": parseCoins("200000000000000000wei"),"gas":"20000000"},'')
    console.log(res1)
    const rest2 = await client.queryContractSmart(demoInfo.contractAddress, {"get_counter": {}});
    document.getElementById("demoResult").innerHTML = rest2;
  });





  // 合约测试
  let filedata = null;
  document.getElementById("oInput").addEventListener('change', function selectedFilechanged( ) {
    console.log(this.files);
    let reader = new FileReader();
    reader.readAsArrayBuffer(this.files[0]);//读取文件的内容
    reader.onload = function () {
      filedata = this.result
    }
  });

  // 测试合约代码button
  document.getElementById("upload").addEventListener('click', async function selectedFilechanged( ) {
    keplrCurrentAddr = await getLatestKeplrAccount();
    let address = keplrCurrentAddr;
    console.log("wasm updalod addr", address)
    document.getElementById("loading").style.display = 'block';

    const newAdmin = document.getElementById("keplrAddr2").value.trim();
    if (!newAdmin) {
      alert("新admin地址不能为空");
      document.getElementById("loading").style.display = 'none';
      return false;
    } else if (newAdmin.substr(0, 2) !== 'ex') {
      alert("请输入ex前缀地址");
      document.getElementById("loading").style.display = 'none';
      return false;
    } else if (newAdmin.length !== 41) {
      alert("您输入ex前缀地址长度不正确");
      document.getElementById("loading").style.display = 'none';
      return false;
    }
    keplrAddr2 = newAdmin;

    // 1. 上传
    let result = null;
    try {
      result = await client.upload(address,filedata,{"amount":parseCoins("100000000000000000wei"),"gas":"20000000"})
    } catch (e) {
      alert("异常：请检查是否已上传合约文件，" + JSON.stringify(e));
      document.getElementById("loading").style.display = 'none';
      throw new Error('异常退出');
      return false;
    }
    if (!result) {
      return false;
    }

    document.getElementById("loading").style.display = 'block';
    console.log("upload",address)
    // HTML展示
    let dom = document.createElement("div"); dom.innerHTML = "uploading, my address：" + address;
    document.getElementById("deployContract").appendChild(dom);


    console.log("1. wasm 上传完成", result)
    // HTML展示
    dom = document.createElement("div"); dom.innerHTML = "1. wasm 上传完成" + JSON.stringify(result);
    document.getElementById("deployContract").appendChild(dom);


    let codes = await client.getCodes()
    console.log("get codes",codes)
    // HTML展示
    dom = document.createElement("div"); dom.innerHTML = "getCodes：" + JSON.stringify(codes).substr(0, 100) + "......内容较长，请移动光标到文本是否查看完整内容";
    dom.setAttribute("title", JSON.stringify(result))
    document.getElementById("deployContract").appendChild(dom);

    let codeId = result.codeId
    let code = await client.getCodeDetails(codeId)
    console.log("get code",code)
    // HTML展示
    dom = document.createElement("div"); dom.innerHTML = "getCodeDetails：(codeId=" + codeId + ")" + JSON.stringify(code);
    document.getElementById("deployContract").appendChild(dom);

    let tx = await client.getTx(result.transactionHash)
    console.log("get tx",tx)
    // HTML展示
    dom = document.createElement("div"); dom.innerHTML = "getTx(hash=" + result.transactionHash + ")：" + JSON.stringify(tx);
    document.getElementById("deployContract").appendChild(dom);


    tx = await client.searchTx({ height: result.height })
    console.log("search tx",tx)
    // HTML展示
    dom = document.createElement("div"); dom.innerHTML = "searchTx：（height="+ result.height +"）" + JSON.stringify(tx).substr(0, 100) + "......内容较长，请移动光标到文本是否查看完整内容";
    dom.setAttribute("title", JSON.stringify(tx))
    document.getElementById("deployContract").appendChild(dom);


    // 2. 实例化
    let initMsg = {"verifier":address, "beneficiary":address}
    const info = await client.instantiate(address, codeId, initMsg, "hello world", {"amount":parseCoins("200000000000000000wei"),"gas":"20000000"},{"funds":[{"denom":"okt","amount":"1000000000000000000"}],"admin":address});
    console.log("2. wasm 实例化完成",info);
    // HTML展示
    dom = document.createElement("div"); dom.innerHTML = "2. wasm 实例化instantiate完成：" + JSON.stringify(info);
    document.getElementById("deployContract").appendChild(dom);


    let contract = await client.getContract(info.contractAddress);
    console.log("get contract",contract);
    // HTML展示
    dom = document.createElement("div"); dom.innerHTML = "getContract(contractAddress=" + info.contractAddress +  ")：" + JSON.stringify(contract);
    document.getElementById("deployContract").appendChild(dom);

    contractaddress = info.contractAddress
    let contracts = await client.getContracts(codeId)
    console.log("get contracts",contracts)
    // HTML展示
    dom = document.createElement("div"); dom.innerHTML = "getContracts：" + JSON.stringify(contracts);
    document.getElementById("deployContract").appendChild(dom);

    let status = await client.queryContractSmart(contractaddress,{"verifier":{}})
    console.log("queryContractSmart",status)
    // HTML展示
    dom = document.createElement("div"); dom.innerHTML = "queryContractSmart：" + JSON.stringify(status);
    document.getElementById("deployContract").appendChild(dom);

    // 3. 执行
    result = await client.execute(address,contractaddress,{"release":{}},{"amount":parseCoins("200000000000000000wei"),"gas":"20000000"})
    console.log("3. wasm 执行完成",result)
    // HTML展示
    dom = document.createElement("div"); dom.innerHTML = "3. wasm execute完成：" + JSON.stringify(result);
    document.getElementById("deployContract").appendChild(dom);


    // 4. 更新管理员
    contract = await client.getContract(info.contractAddress);
    console.log("get contract admin",contract.admin)
    // HTML展示
    dom = document.createElement("div"); dom.innerHTML = "4. 当前admin是：" + contract.admin;
    document.getElementById("deployContract").appendChild(dom);


    result = await client.updateAdmin(address,contractaddress,keplrAddr2,{"amount":parseCoins("200000000000000000wei"),"gas":"20000000"})
    console.log("update admin完成",result)
    // HTML展示
    dom = document.createElement("div"); dom.innerHTML = "update admin完成：" + JSON.stringify(result);
    document.getElementById("deployContract").appendChild(dom);


    contract = await client.getContract(info.contractAddress);
    console.log("get contract admin",contract.admin)
    // HTML展示
    dom = document.createElement("div"); dom.innerHTML = "新admin：" + contract.admin;
    document.getElementById("deployContract").appendChild(dom);

    client.disconnect()
    // HTML展示
    dom = document.createElement("div"); dom.innerHTML = "disconnect";
    document.getElementById("deployContract").appendChild(dom);

    contract = await client.getContract(info.contractAddress);
    console.log("get contract admin",contract.admin)
    // HTML展示
    dom = document.createElement("div"); dom.innerHTML = "通过(contractAddress=" + info.contractAddress +  ")获取admin地址：" + contract.admin;
    document.getElementById("deployContract").appendChild(dom);

    document.getElementById("loading").style.display = 'none';

  });

  // 升级合约
  let filedata2 = null;
  document.getElementById("upgradeInput").addEventListener('change', function selectedFilechanged( ) {
    console.log(this.files);
    let reader = new FileReader();
    reader.readAsArrayBuffer(this.files[0]);//读取文件的内容
    reader.onload = function () {
      filedata2 = this.result
    }
  });

  document.getElementById("upgrade").addEventListener('click', async function selectedFilechanged2( ) {
    keplrCurrentAddr = await getLatestKeplrAccount();
    let address2 = keplrCurrentAddr;
    document.getElementById("loading2").style.display = 'block';
    if (address2 !== keplrAddr2) {
      alert("请在Keplr切换至部署合约时填写的账号地址");
      document.getElementById("loading2").style.display = 'none';
      return false;
    }

    // 1. 上传
    let result = null;
    try {
      result = await client.upload(address2,filedata2,{"amount":parseCoins("200000000000000000wei"),"gas":"20000000"})
    } catch (e) {
      alert("异常：请检查是否已上传合约文件，" + JSON.stringify(e));
      document.getElementById("loading2").style.display = 'none';
      throw new Error('异常退出');
      return false;
    }
    if (!result) {
      return false;
    }

    document.getElementById("loading2").style.display = 'block';
    // HTML展示
    let dom = document.createElement("div"); dom.innerHTML = "开始上传升级后的合约，我的地址：" + address2;
    document.getElementById("upgradeContract").appendChild(dom);

    console.log("1. upgrade wasm 上传完成", result)
    // HTML展示
    dom = document.createElement("div"); dom.innerHTML = "1. upgrade wasm 上传完成：" + JSON.stringify(result);
    document.getElementById("upgradeContract").appendChild(dom);

    let codes = await client.getCodes()
    console.log("get codes",codes)
    // HTML展示
    dom = document.createElement("div"); dom.innerHTML = "getCodes：" + JSON.stringify(codes).substr(0, 100) + "......内容较长，请移动光标到文本上方查看完整内容";
    dom.setAttribute("title", JSON.stringify(result))
    document.getElementById("upgradeContract").appendChild(dom);

    let codeId = result.codeId
    let code = await client.getCodeDetails(codeId)
    console.log("get code",code)
    // HTML展示
    dom = document.createElement("div"); dom.innerHTML = "getCodeDetails(codeId=" + codeId + ")：" + JSON.stringify(code);
    document.getElementById("upgradeContract").appendChild(dom);

    let tx = await client.getTx(result.transactionHash)
    console.log("get tx",tx)
    // HTML展示
    dom = document.createElement("div"); dom.innerHTML = "getTx(hash=" + result.transactionHash + ")：" + JSON.stringify(tx);
    document.getElementById("upgradeContract").appendChild(dom);

    tx = await client.searchTx({ height: result.height })
    console.log("search tx",tx)
    // HTML展示
    dom = document.createElement("div"); dom.innerHTML = "searchTx：（height="+ result.height +"）" + JSON.stringify(tx).substr(0, 100) + "......内容较长，请移动光标到文本上方查看完整内容";
    dom.setAttribute("title", JSON.stringify(tx));
    document.getElementById("upgradeContract").appendChild(dom);

    // 2. 更新
    result = await client.migrate(address2,contractaddress,codeId,{"payout": address2},{"amount":parseCoins("200000000000000000wei"),"gas":"20000000"})
    console.log("2. wasm 更新完成(migrate)",result)
    // HTML展示
    dom = document.createElement("div"); dom.innerHTML = "2. wasm 更新完成(migrate)：" + JSON.stringify(result);
    document.getElementById("upgradeContract").appendChild(dom);

    let account = await client.getAccount(address2)
    console.log("get account",account)
    let contract = await client.getContract(contractaddress);
    console.log("get contract",contract)

    let history = await client.getContractCodeHistory(contractaddress);
    console.log("get contract",history)
    // HTML展示
    dom = document.createElement("div"); dom.innerHTML = "getContractCodeHistory(contractAddress=" + contractaddress +  ")：" + contract.admin;
    document.getElementById("upgradeContract").appendChild(dom);

    // 3. 清除管理员
    result = await client.clearAdmin(address2,contractaddress,{"amount":parseCoins("200000000000000000wei"),"gas":"20000000"})
    console.log("wasm clear admin完成", result)
    // HTML展示
    dom = document.createElement("div"); dom.innerHTML = "wasm clearAdmin完成：" + JSON.stringify(result);
    document.getElementById("upgradeContract").appendChild(dom);

    contract = await client.getContract(contractaddress);
    console.log("get contract admin",contract.admin)
    // HTML展示
    dom = document.createElement("div"); dom.innerHTML = "再次查看 contract admin：" + contract.admin;
    document.getElementById("upgradeContract").appendChild(dom);

    document.getElementById("loading2").style.display = 'none';
  });






  // TODO
  // upload wasm code

  // const codes = await client.getCodes();
  // console.log(codes);
  // const info = await client.instantiate(keplrAddr, 1, {"decimals":10,"initial_balances":[{"address":keplrAddr,"amount":"100000000"}],"name":"my test token", "symbol":"MTT"}, "hello world", {"amount":parseCoins("20000000000000wei"),"gas":"200000"}, {"funds":parseCoins("1okt")});
  // console.log(info);
  // const contract = await client.getContract(info.contractAddress);
  // console.log(contract);
  // const res3 = await client.execute(keplrAddr, info.contractAddress, {"transfer":{"amount":"10","recipient":captain}}, {"amount":parseCoins("20000000000000wei"),"gas":"200000"}, "", null);
  // console.log(res3);
  // const res4 = await client.queryContractSmart(info.contractAddress, {"balance":{"address":keplrAddr}})
  // console.log(res4);
  // const res2 = await client.queryContractSmart(info.contractAddress, {"balance":{"address":captain}})
  // console.log(res2);
}




//ArrayBuffer转字符串
// function ab2str(u,f) {
//   var b = new Blob([u]);
//   var r = new FileReader();
//   r.readAsText(b, 'utf-8');
//   r.onload = function (){if(f)f.call(null,r.result)}
// }
//字符串转字符串ArrayBuffer
// function str2ab(s,f) {
//   var b = new Blob([s],{type:'text/plain;charset=utf-8'});
//   var r = new FileReader();
//   r.readAsArrayBuffer(b);
//   r.onload = function (){if(f)f.call(null,r.result)}
// }




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
          features: ["stargate", "ibc-transfer", "no-legacy-stdTx", "ibc-go", "eth-address-gen","eth-key-sign"],
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


