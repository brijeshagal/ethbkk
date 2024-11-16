"use client";

import Token from "@/components/token/Token";
import TokensList from "@/components/tokens/TokensList";
import { placeCowSwapOrder } from "@/service/cowdao/order";
import AllTokens from "@/tokens/tokenlist.json";
import { HexString } from "@/types/address";
import { TokenData } from "@/types/tokens";
import { useState } from "react";
import { useAccount } from "wagmi";

export default function Home() {
  const { address: account, chainId } = useAccount();
  const [showTokensList, setShowTokensList] = useState(false);
  const [sendTokenData, setSendTokenData] = useState<TokenData>(
    AllTokens["USDT"] as TokenData
  );
  const [receiveTokenData, setReceiveTokenData] = useState<TokenData>(
    AllTokens["USDC"] as TokenData
  );
  const [isSend, setIsSend] = useState(true);
  function closeTokenList() {
    setShowTokensList(false);
  }

  function setTokenData(tokenData: TokenData) {
    if (isSend) {
      setSendTokenData(tokenData);
    } else {
      setReceiveTokenData(tokenData);
    }
    closeTokenList();
  }

  return (
    <div className="w-full flex justify-center items-center">
      <div className="relative w-[450px] h-[450px] rounded-lg p-3 overflow-hidden">
        <div
          className={`${
            showTokensList
              ? "hidden"
              : "flex flex-col justify-center items-center gap-4 w-full h-full"
          }`}
        >
          <div className="w-full flex justify-between items-center px-20">
            <Token
              onClick={() => {
                setShowTokensList(true);
                setIsSend(true);
              }}
              tokenData={sendTokenData}
            />

            <Token
              onClick={() => {
                setShowTokensList(true);
                setIsSend(false);
              }}
              tokenData={receiveTokenData}
            />
          </div>
          <button
            className="mx-auto w-3/4 rounded-lg px-4 py-2 border"
            type="button"
            onClick={() => {
              placeCowSwapOrder({
                account: account as HexString,
                receiveTokenData,
                sendTokenData,
                totalAmount: "1",
                currChainId: chainId as number,
              });
            }}
          >
            LFG
          </button>
        </div>
        <div className={`${showTokensList ? "w-full h-full" : "hidden"}`}>
          <TokensList
            closeTokenList={closeTokenList}
            setTokenData={setTokenData}
          />
        </div>
      </div>
    </div>
  );
}
