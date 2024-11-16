import { nativeCurrencyAddresses } from "@/constants/tokens";
import { TokensList } from "@/types/tokens";

export const getTokensByPairKey = (pairKey: string, isSwap: boolean = true) => {
  const [sendToken, receiveToken] = pairKey.split("-");
  if (isSwap) return { sendToken, receiveToken };
  const sendChainToken = sendToken.split("_");
  const receiveChainToken = receiveToken.split("_");
  return {
    sendToken: sendChainToken[1],
    receiveToken: receiveChainToken[1],
    destChainId: Number(receiveChainToken[0]),
    srcChainId: Number(sendChainToken[0]),
  };
};

export const isNativeCurrency = (contract: string) =>
  nativeCurrencyAddresses.includes(contract);

export function sortTokensByBalanceAsObject(
  tokensList: TokensList
) {
  // Convert the tokens list to an array and sort
  const sortedArray = Object.values(tokensList).sort((a, b) => {
    const balanceA = BigInt(a.balance || "0");
    const balanceB = BigInt(b.balance || "0");
    return Number(balanceB - balanceA); // Descending order
  });

  // Rebuild the TokensList object in sorted order
  return sortedArray
}
