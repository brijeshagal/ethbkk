import { HexString } from "@/types/address";
import {
  OrderBookApi,
  OrderQuoteRequest,
  OrderQuoteSideKindSell,
  OrderSigningUtils,
  SigningScheme,
  SupportedChainId,
} from "@cowprotocol/cow-sdk";
import { ethers } from "ethers";
import { parseEther } from "viem";

export async function orderCowSwap({
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
  console.log({ chainId, sendToken, receiveToken, account });
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
    { ...quote, receiver: account as HexString, feeAmount: feeAmt, sellAmount:amt },
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
