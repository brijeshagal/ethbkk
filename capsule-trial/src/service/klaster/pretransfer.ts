import { getPublicClient } from "@/client/publicClient";
import { walletClient } from "@/client/walletClient";
import { HexString } from "@/types/address";
import axios from "axios";
import {
  buildItx,
  initKlaster,
  klasterNodeHost,
  loadBicoV2Account,
  rawTx,
  singleTx,
} from "klaster-sdk";
import {
  encodeAbiParameters,
  encodeFunctionData,
  zeroHash
} from "viem";
import { sepolia } from "viem/chains";

export async function preTransactKlaster({
  gasFeeChainId,
  account,
  amount,
}: {
  gasFeeChainId: number;
  account: HexString;
  amount: bigint;
}) {
  const klaster = await initKlaster({
    accountInitData: loadBicoV2Account({
      owner: account,
    }),
    nodeUrl: klasterNodeHost.default,
  });
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
    args: ["0xA22042a57270F95169a230b7e766265a67759eBF" as HexString, amount],
    functionName: "transfer",
  });

  const sendErc20 = rawTx({
    gasLimit: 75000n,
    to: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14", //WETH on sepolia
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
      "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
      0n,
      erc20CalldataForExecute,
    ],
    functionName: "execute",
  });

  const iTx = buildItx({
    steps: [
      singleTx(sepolia.id, sendErc20),
      // singleTx(arbitrumSepolia.id, sendETH),
    ],
    feeTx: klaster.encodePaymentFee(gasFeeChainId, "WETH"),
  });

  console.log({ iTx });

  const userOps = iTx.steps.map((step) => {
    const tx = step.txs[0];
    return {
      callData: emptyCallData,
      callGasLimit: tx.gasLimit.toString(),
      chainId: sepolia.id.toString(),
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
    args: [smartWalletAddress as HexString, amount],
    functionName: "transfer",
  });
  console.log(erc20Calldata);
  console.log(quoteRes.data.itxHash.slice(2));
  console.log({ data: `${erc20Calldata}${quoteRes.data.itxHash.slice(2)}` });

  const txnHash = await walletClient(gasFeeChainId).sendTransaction({
    account,
    to: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
    // value: amount,
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
