import { HexString } from "@/types/address";
import { TokenData } from "@/types/tokens";
import {
  OrderBookApi,
  OrderQuoteRequest,
  OrderQuoteSideKindSell,
  OrderSigningUtils,
  SigningScheme,
  SupportedChainId,
} from "@cowprotocol/cow-sdk";
import { ethers } from "ethers";
import { parseEther, parseUnits } from "viem";

export async function orderCowSwapTester({
  account,
  sendToken = "0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1",
  receiveToken = "0x9c58bacc331c9aa871afd802db6379a98e80cedb",
  chainId,
  amt = parseEther("0.001").toString(),
}: {
  account: HexString;
  chainId: number;
  sendToken?: HexString;
  receiveToken?: HexString;
  amt?: string;
}) {
  const orderBookApi = new OrderBookApi({
    env: "staging",
    chainId: chainId as SupportedChainId,
  });
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = await provider.getSigner();

  const quoteRequest: OrderQuoteRequest = {
    sellToken: sendToken,
    buyToken: receiveToken,
    from: account as HexString,
    receiver: account,
    sellAmountBeforeFee: amt,
    kind: OrderQuoteSideKindSell.SELL,
  };

  // Get quote
  const { quote } = await orderBookApi.getQuote(quoteRequest);
  const feeAmt = "0";

  // Sign order
  const orderSigningResult = await OrderSigningUtils.signOrder(
    {
      ...quote,
      receiver: account as HexString,
      feeAmount: feeAmt,
      sellAmount: amt,
    },
    chainId as SupportedChainId,
    signer
  );

  // Send order to the order-book
  const orderUid = await orderBookApi.sendOrder({
    ...quote,
    from: account as HexString,
    feeAmount: feeAmt,
    sellAmount: amt,
    signature: orderSigningResult.signature,
    signingScheme: orderSigningResult.signingScheme as string as SigningScheme,
  });

  // Get order data
  const order = await orderBookApi.getOrder(orderUid);
  return order;
  // Get order trades
  //   const trades = await orderBookApi.getTrades({ orderUid });
}

async function processOrderForChain(
  chainId: SupportedChainId,
  sendToken: string,
  receiveToken: string,
  account: HexString,
  amt: string
) {
  const orderBookApi = new OrderBookApi({
    env: "staging",
    chainId,
  });

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = await provider.getSigner();

  const quoteRequest: OrderQuoteRequest = {
    sellToken: sendToken,
    buyToken: receiveToken,
    from: account,
    receiver: account,
    sellAmountBeforeFee: amt,
    kind: OrderQuoteSideKindSell.SELL,
  };

  try {
    // Get quote
    const { quote } = await orderBookApi.getQuote(quoteRequest);
    const feeAmt = "0";

    // Sign order
    const orderSigningResult = await OrderSigningUtils.signOrder(
      {
        ...quote,
        receiver: account,
        feeAmount: feeAmt,
        sellAmount: amt,
      },
      chainId,
      signer
    );

    // Send order to the order-book
    const orderUid = await orderBookApi.sendOrder({
      ...quote,
      from: account,
      feeAmount: feeAmt,
      sellAmount: amt,
      signature: orderSigningResult.signature,
      signingScheme:
        orderSigningResult.signingScheme as string as SigningScheme,
    });

    // Get order data
    const order = await orderBookApi.getOrder(orderUid);
    return { chainId, order }; // Return chainId and order data
  } catch (error) {
    console.error(`Error processing chainId ${chainId}:`, error);
    return { chainId, error }; // Return error for the chainId
  }
}

export async function placeCowSwapOrder({
  account,
  sendTokenData,
  receiveTokenData,
  totalAmount,
}: {
  account: HexString;
  receiveTokenData: TokenData;
  sendTokenData: TokenData;
  totalAmount: string;
}) {
  let remainingAmt = parseUnits(
    totalAmount,
    Object.values(sendTokenData.addresses)[0].decimals // Assume uniform decimals across chains
  );

  const results = [];
  const chainEntries = Object.entries(sendTokenData.addresses);

  for (const [chainId, chainData] of chainEntries) {
    // Check if receiveToken is available on the current chainId
    if (!receiveTokenData.addresses[chainId]) {
      console.warn(
        `Receive token is not available on chainId ${chainId}. Skipping.`
      );
      continue;
    }

    const chainIdNum = Number(chainId);
    const maxAmountForChain = BigInt(chainData.balance);
    const sendAmount =
      remainingAmt > maxAmountForChain ? maxAmountForChain : remainingAmt;

    if (sendAmount > 0n) {
      try {
        const result = await processOrderForChain(
          chainIdNum,
          chainData.address,
          receiveTokenData.addresses[chainId].address,
          account,
          sendAmount.toString()
        );

        results.push(result);

        // Deduct the amount from remainingAmt
        remainingAmt -= sendAmount;

        if (remainingAmt <= 0n) {
          console.log("All transactions completed. No remaining amount.");
          break;
        }
      } catch (error) {
        console.error(`Error processing chainId ${chainIdNum}:`, error);
        results.push({ chainId: chainIdNum, error });
      }
    } else {
      console.log(`No remaining amount for chainId ${chainId}. Skipping.`);
    }
  }

  if (remainingAmt > 0n) {
    console.warn(
      `Could not complete transactions. Remaining amount: ${remainingAmt.toString()}`
    );
  }

  return results;
}
