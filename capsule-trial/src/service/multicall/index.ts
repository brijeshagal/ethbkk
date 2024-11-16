import { getMulticall3Address, getPublicClient } from "@/client/publicClient";
import { multicall3Abi } from "@/constants/chains";
import { HexString } from "@/types/address";
import { isNativeCurrency } from "@/utils/tokens";
import { Abi, MulticallResponse } from "viem";

export const multicallSameAbi = async ({
  chainId,
  contracts,
  abi,
  allMethods,
  allParams,
}: {
  chainId: number;
  contracts: HexString[];
  abi: Abi;
  allMethods: string[];
  allParams: unknown[][];
}) => {
  if (contracts.length && contracts.length === allMethods.length) {
    const results: Record<HexString, string> = {};

    const publicClient = getPublicClient(chainId);

    while (contracts.length > 0) {
      const chunk = contracts.splice(0, 400);
      const multiCallResults = (await publicClient.multicall({
        contracts: chunk.map((contract, idx) => {
          return {
            address: contract,
            abi,
            functionName: allMethods[idx],
            args: allParams[idx],
          };
        }),
      })) as MulticallResponse[];
      console.log({ chunk, multiCallResults });
      multiCallResults.forEach((result, idx) => {
        const val = result.result || (0n as bigint);
        results[contracts[idx]] = val.toString();
      });
    }
    return results;
  }
  return {};
};

export const multicallForBalance = async (
  chainId: number,
  contracts: string[],
  abi: Abi,
  method: string,
  params: string
) => {
  try {
    if (contracts.length) {
      const data = contracts.map((contract: string) => {
        if (isNativeCurrency(contract)) {
          return {
            address: getMulticall3Address(chainId),
            abi: multicall3Abi,
            functionName: "getEthBalance",
            args: [params],
          };
        }
        return {
          address: contract as HexString,
          abi,
          functionName: method,
          args: [params],
        };
      });
      let results = {};

      while (data.length > 0) {
        const chunk = data.splice(0, 600);
        const multiCallResults = (await getPublicClient(chainId).multicall({
          contracts: chunk,
        })) as MulticallResponse[];
        const res = multiCallResults.reduce((acc, result, idx) => {
          const val = result.result as bigint;
          return { ...acc, [contracts[idx]]: val || 0n };
        }, {});
        results = {
          ...results,
          ...res,
        };
      }
      console.log({ results, chainId });
      return results;
    }
    return {};
  } catch (err: unknown) {
    console.error(err);
    return {};
  }
};
