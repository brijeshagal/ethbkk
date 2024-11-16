"use client";

import Token from "@/components/token/Token";
import TokensList from "@/components/tokens/TokensList";
import AllTokens from "@/tokens/tokenlist.json";
import { TokenData } from "@/types/tokens";
import { useState } from "react";

export default function Home() {
  const [showTokensList, setShowTokensList] = useState(false);
  const [sendTokenData, setSendTokenData] = useState<TokenData>(
    AllTokens["WETH"] as TokenData
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
  }

  return (
    <div className="w-full flex justify-center items-center">
      <div className="relative w-[600px] h-[400px] rounded-lg p-3 overflow-hidden">
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
            onClick={() => {}}
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
