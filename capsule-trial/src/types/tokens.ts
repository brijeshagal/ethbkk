import { HexString } from "./address";

export type TokenAddressData = {
  address: HexString; // Token contract address
  balance: string; // Token balance for the given chain
  decimals: number;
};

export type TokenData = {
  name: string; // Token name
  coinKey: string | null;
  logo: string | null;
  symbol: string; // Token symbol
  addresses: Record<string, TokenAddressData>; // Chain-specific token data
  balance: string;
};

export type TokensList = Record<string, TokenData>; // Tokens indexed by their symbol
