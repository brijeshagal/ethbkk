import {
  buildItx,
  initKlaster,
  klasterNodeHost,
  loadBicoV2Account,
  rawTx,
  singleTx,
} from "klaster-sdk";
import { parseEther } from "viem";
import { arbitrumSepolia, sepolia } from "viem/chains";

export async function initializeKlaster() {
  const klaster = await initKlaster({
    accountInitData: loadBicoV2Account({
      owner: "0x62414d44AaE1aA532630eDa14Df7F449C475759C",
    }),
    // NodeURL provided by the SDK is hosted by Klaster
    nodeUrl: klasterNodeHost.default,
  });
  
  const smartWalletAddress = klaster.account.getAddress(137);
  console.log({ smartWalletAddress });

  const sendETH = rawTx({
    gasLimit: 75000n,
    to: "0xA22042a57270F95169a230b7e766265a67759eBF", // Send back to the sender address. This is just for demo purposes
    //   data: "",
    value: parseEther("0.001"),
  });
  console.log({ sendETH });

  const iTx = buildItx({
    steps: [
      singleTx(sepolia.id, sendETH),
      //   singleTx(base.id, sendETH)
    ],
    feeTx: klaster.encodePaymentFee(arbitrumSepolia.id, "ETH"),
  });
  console.log({ iTx });

  // const quote = await klaster.getQuote(iTx);
  // console.log({ quote });

  // const signed = await walletClient(arbitrumSepolia.id).signMessage({
  //   account: "0x62414d44AaE1aA532630eDa14Df7F449C475759C",
  //   message: {
  //     raw: quote.itxHash,
  //   },
  // });
  // console.log({ signed });
  // const result = await klaster.execute(quote, signed);
  // console.log({ result });
}
