/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
"use client";

import { getTokensBalances } from "@/service/tokens/getBalances";
import AllTokens from "@/tokens/tokenlist.json";
import { TokenData, TokensList } from "@/types/tokens";
import { FallBackIcon } from "@/utils/fallbackIcon";
import { sortTokensByBalanceAsObject } from "@/utils/tokens";
import { useEffect, useRef, useState } from "react";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

const Tokens = () => {
  const { address: account } = useAccount();

  const [tokensList, setTokensList] = useState<TokenData[]>(
    Object.values(AllTokens as TokensList)
  );

  const [isFetched, setIsFetched] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // const { visibleTokens } = useInfiniteScroll({
  //   tokensData: tokensList,
  //   batchSize: 5,
  //   containerRef,
  // });

  useEffect(() => {
    if (account) {
      getTokensBalances(account).then((listWithBalances) => {
        const sortedTokensList = sortTokensByBalanceAsObject(listWithBalances);
        setTokensList(sortedTokensList);
        setIsFetched(true);
      });
    } else {
      console.log("Account not found");
    }
  }, [account]);

  return (
    isFetched && (
      <div className="md:w-1/3 h-[500px] w-full rounded">
        <div
          ref={containerRef}
          className="flex flex-col gap-3 p-3 h-full overflow-y-auto"
        >
          {tokensList.map((tokenData) => {
            const tokenBal = Number(
              formatUnits(
                BigInt(tokenData.balance),
                Object.values(tokenData.addresses)[0]?.decimals || 18 //update this later
              )
            );
            return (
              <button
                className="flex justify-between px-4 py-2 rounded hover:bg-gray-700 w-full"
                key={tokenData.symbol}
              >
                <div className="flex gap-4">
                  <div>
                    <img
                      loading="lazy"
                      src={tokenData.logo || FallBackIcon} // Use fallback icon if tokenData.logo is null or undefined
                      className="w-5 h-5 rounded-full"
                      onError={(event) => {
                        event.currentTarget.src = FallBackIcon; // Replace with fallback icon on error
                      }}
                    />
                  </div>
                  <div className="flex text-white flex-col justify-center w-20 items-center">
                    <div>{tokenData.name}</div>
                    <div>{tokenData.symbol}</div>
                  </div>
                </div>
                {tokenBal > 0 && <div>{tokenBal.toFixed(5)}</div>}
              </button>
            );
          })}
        </div>
      </div>
    )
  );
};

export default Tokens;
