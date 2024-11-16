import optimismTokens from "@/tokens/10_tokens.json";
import polygonTokens from "@/tokens/137_tokens.json";
import arbitrumTokens from "@/tokens/42161_tokens.json";
import AllTokens from "@/tokens/tokenlist.json";
import { HexString } from "@/types/address";
import { TokenAddressData, TokensList } from "@/types/tokens";
import { erc20Abi } from "viem";
import { multicallForBalance } from "../multicall";

export async function getTokensBalances(account: HexString) {
  const allTokensListByChainId = [
    // mainnetTokens,
    polygonTokens,
    arbitrumTokens,
    optimismTokens,
  ];

  // Create an array of promises for parallel multicalls
  const balancePromises = allTokensListByChainId.map((tokensList) => {
    const chainId = Object.values(tokensList)[0].chainId;
    const contracts = Object.keys(tokensList) as HexString[];

    return multicallForBalance(
      chainId,
      contracts,
      erc20Abi,
      "balanceOf",
      account
    );
  });

  // Resolve all promises in parallel
  const balances = await Promise.all(balancePromises);
  const mappedBalances: Record<
    string,
    Record<string, bigint>
  > = allTokensListByChainId.reduce((acc, tokensData, idx) => {
    const chainId = Object.values(tokensData)[0].chainId;
    // console.log(chainId, balances[idx])
    return {
      ...acc,
      [chainId]: balances[idx],
    };
  }, {});
  console.log({ mappedBalances });

  const tokensList = Object.entries(AllTokens as TokensList).reduce(
    (acc, [symbol, tokens]) => {
      let totalBal = 0n;
      const updatedAddressesObject: Record<string, TokenAddressData> = {};
      // console.log(tokens.addresses, symbol);
      Object.entries(tokens.addresses).forEach(([chainId, chainData]) => {
        // console.log(symbol, chainId, chainData);

        if (Boolean(mappedBalances[chainId])) {
          const bal =
            mappedBalances[chainId]?.[chainData.address]?.toString() || "0";
          updatedAddressesObject[chainId] = {
            ...tokens.addresses[chainId],
            balance: bal,
          };
          totalBal += BigInt(bal);
        }
      });
      return {
        ...acc,
        [symbol]: {
          ...(AllTokens as TokensList)[symbol],
          addresses: updatedAddressesObject,
          balance: totalBal,
        },
      };
    },
    {}
  );

  console.log({ tokensList });
  return tokensList as TokensList;
}
