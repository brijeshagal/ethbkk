import { HexString } from "@/types/address";
import Typewriter from "typewriter-effect";
import { useAccount } from "wagmi";

export default function Typer({ txnHash }: { txnHash: HexString }) {
  const { chainId } = useAccount();
  return (
    <Typewriter
      options={{
        strings: ["View", "your", "txn", "here"],
      }}
    />
  );
}
