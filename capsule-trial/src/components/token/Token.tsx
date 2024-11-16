import { TokenData } from "@/types/tokens";
import { FallBackIcon } from "@/utils/fallbackIcon";
import { formatUnits } from "viem";

const Token = ({
  tokenData,
  onClick,
  isSend,
}: {
  tokenData: TokenData;
  onClick: () => void;
  isSend: boolean;
}) => {
  return (
    <div className="">
      <div className="animate-bounce absolute top-20 text-2xl font-bold">{isSend ? "Send" : "Receive"}</div>
      <button className="w-32 h-24 border rounded p-3" onClick={onClick}>
        <div className="w-full h-full overflow-hidden flex flex-col justify-center items-center gap-2">
          <div className="flex gap-2 justify-center items-center">
            <img
              loading="lazy"
              src={tokenData.logo || FallBackIcon} // Use fallback icon if tokenData.logo is null or undefined
              className="w-10 h-10 rounded-full"
              onError={(event) => {
                event.currentTarget.src = FallBackIcon; // Replace with fallback icon on error
              }}
            />
            <div>{tokenData.symbol}</div>
          </div>
          <div>
            <div className="flex text-left w-full">
              Bal:{" "}
              {BigInt(tokenData.balance) > 0n
                ? Number(
                    formatUnits(
                      BigInt(tokenData.balance),
                      Object.values(tokenData.addresses)[0].decimals || 18
                    )
                  ).toFixed(4)
                : 0}
            </div>
          </div>
        </div>
      </button>
    </div>
  );
};

export default Token;
