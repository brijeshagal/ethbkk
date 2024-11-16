import { parseAbi } from "viem";

export const multicall3Abi = parseAbi(['function getEthBalance(address) returns (uint256)']);

export const chainIds = {
  polygon: 137,
  zkSync: 324,
};

export const DEFAULT_MULTICALL_ADDRESS = '0xca11bde05977b3631167028862be2a173976ca11';
