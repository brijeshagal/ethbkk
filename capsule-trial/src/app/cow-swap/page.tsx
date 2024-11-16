"use client";

import { orderCowSwap } from "@/service/cowdao/order";
import { FormEvent, useCallback } from "react";
import { useAccount } from "wagmi";

export default function QuickStartPage() {
  const { address: account, chainId } = useAccount();

  const getOrders = useCallback(
    async (event: FormEvent) => {
      event.preventDefault();
      if (chainId && account) {
        const res = await orderCowSwap({
          account,
          chainId,
          sendToken: "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
          receiveToken: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
        });
        console.log({ res });
      }
    },
    [chainId, account]
  );

  return (
    <div>
      <div className="form">
        <div>
          <button
            onClick={(event) => {
              getOrders(event);
            }}
          >
            Get orders
          </button>
        </div>
      </div>
    </div>
  );
}
