import { getPublicClient } from "@/client/publicClient";
import { walletClient } from "@/client/walletClient";
import { HexString } from "@/types/address";
import { TokenData } from "@/types/tokens";
import axios from "axios";
import {
  buildItx,
  initKlaster,
  klasterNodeHost,
  loadBicoV2Account,
  PaymentTokenSymbol,
  rawTx,
  singleTx,
} from "klaster-sdk";
import { encodeAbiParameters, encodeFunctionData, zeroHash } from "viem";

export async function preTransactKlaster({
  gasFeeChainId,
  account,
  amount,
  sendTokenData,
  receiveTokenData,
}: {
  gasFeeChainId: number;
  account: HexString;
  amount: bigint;
  sendTokenData: TokenData;
  receiveTokenData: TokenData;
}) {
  const klaster = await initKlaster({
    accountInitData: loadBicoV2Account({
      owner: account,
    }),
    nodeUrl: klasterNodeHost.default,
  });

  console.log({ sendTokenData, receiveTokenData });

  const factoryData = encodeAbiParameters(
    [
      { name: "owner", type: "address" },
      { name: "salt", type: "bytes32" },
    ],
    [account, zeroHash]
  );

  const erc20CalldataForExecute = encodeFunctionData({
    abi: [
      {
        type: "function",
        name: "transfer",
        stateMutability: "nonpayable",
        inputs: [
          {
            name: "recipient",
            type: "address",
          },
          {
            name: "amount",
            type: "uint256",
          },
        ],
        outputs: [
          {
            type: "bool",
          },
        ],
      },
    ],
    args: [account, amount],
    functionName: "transfer",
  });

  const sendErc20 = ({ to }: { to: HexString }) =>
    rawTx({
      gasLimit: 75000n,
      to,
      data: erc20CalldataForExecute,
    });

  const emptyCallData = encodeFunctionData({
    abi: [
      {
        inputs: [
          { name: "to", type: "address" },
          { name: "value", type: "uint256" },
          { name: "data", type: "bytes" },
        ],
        name: "execute",
        outputs: [],
        stateMutability: "payable",
        type: "function",
      },
    ],
    args: [
      receiveTokenData.addresses[gasFeeChainId].address,
      0n,
      erc20CalldataForExecute,
    ],
    functionName: "execute",
  });

  const iTx = buildItx({
    steps: [
      singleTx(
        Number(gasFeeChainId),
        sendErc20({ to: receiveTokenData.addresses[gasFeeChainId].address })
      ),
    ],
    feeTx: klaster.encodePaymentFee(
      gasFeeChainId,
      sendTokenData.symbol as PaymentTokenSymbol
    ),
  });

  console.log({ iTx });

  const userOps = iTx.steps.map((step) => {
    const tx = step.txs[0];
    return {
      callData: emptyCallData,
      callGasLimit: tx.gasLimit.toString(),
      chainId: gasFeeChainId.toString(),
      value: tx.value?.toString(),
    };
  });

  const quoteRes = await axios.post(
    "https://klaster-node.polycode.sh/v2/quote-generic",
    {
      walletProvider: "BICO_V2_EOA",
      factoryData,
      userOps,
      paymentInfo: {
        token: iTx.feeTx.token,
        chainId: iTx.feeTx.chainId.toString(),
      },
    }
  );

  const smartWalletAddress = quoteRes.data.userOps[0].userOp.sender;
  console.log({ smartWalletAddress });
  const erc20Calldata = encodeFunctionData({
    abi: [
      {
        type: "function",
        name: "transfer",
        stateMutability: "nonpayable",
        inputs: [
          {
            name: "recipient",
            type: "address",
          },
          {
            name: "amount",
            type: "uint256",
          },
        ],
        outputs: [
          {
            type: "bool",
          },
        ],
      },
    ],
    args: [
      smartWalletAddress,
      amount + BigInt(quoteRes.data.paymentInfo.tokenWeiAmount),
    ],
    functionName: "transfer",
  });
  console.log("amount", amount);
  console.log("fee", BigInt(quoteRes.data.paymentInfo.tokenWeiAmount));
  console.log(
    "amount+fee",
    amount + BigInt(quoteRes.data.paymentInfo.tokenWeiAmount)
  );
  console.log(erc20Calldata);
  console.log(quoteRes.data.itxHash.slice(2));
  console.log({ data: `${erc20Calldata}${quoteRes.data.itxHash.slice(2)}` });

  const txnHash = await walletClient(gasFeeChainId).sendTransaction({
    account,
    to: sendTokenData.addresses[gasFeeChainId].address,
    // value: amount, // add in case of native token
    data: `${erc20Calldata}${quoteRes.data.itxHash.slice(2)}`,
  });

  console.log({ txnHash });

  const receipt = await getPublicClient(
    gasFeeChainId
  ).waitForTransactionReceipt({ hash: txnHash });

  if (receipt.status === "success") {
    const encodedData = encodeAbiParameters(
      [
        { name: "hash", type: "bytes32" },
        { name: "chainId", type: "uint256" },
      ],
      [txnHash, BigInt(gasFeeChainId)]
    );
    const result = await axios.post(
      "https://klaster-node.polycode.sh/v2/execute-generic",
      {
        ...quoteRes.data,
        signature: `0x01${encodedData.slice(2)}`,
      }
    );
    console.log({ result });
  }
}
