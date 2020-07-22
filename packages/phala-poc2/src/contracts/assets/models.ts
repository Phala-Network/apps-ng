export interface BalanceReq {
  id: number;
  account: string;
}

export interface BalanceResp {
  balance: string;
}

export interface MetadataResp {
  metadata: Array<AssetMetadata>;
}

export interface AssetMetadata {
  owner: string;
  totalSupply: string;
  symbol: string;
  id: number;
}
