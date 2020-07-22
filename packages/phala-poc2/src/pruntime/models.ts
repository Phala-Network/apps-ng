import camelcaseKeys from 'camelcase-keys';
import snakecaseKeys from 'snakecase-keys';

export interface GetInfoResp {
  initialized: boolean;
  blocknum: number;
  publicKey: string;
  ecdhPublicKey: string;
}

export interface GetItemsResp {
  GetItems?: {
    items?: Array<any>
  }
}

export interface GetOrdersResp {
  GetOrders?: {
    orders?: Array<any>
  }
}

export interface TestReq {
  testBlockParse?: boolean;
  testBridge?: boolean;
  testEcdh?: TestEcdhParam;
}
export interface TestEcdhParam {
  pubkeyHex?: string;
  messageB64?: string;
}
export interface TestResp {}

export interface Payload {
  Plain?: string;
  Cipher?: AeadCipher;
}

export interface AeadCipher {
  ivB64: string;
  cipherB64: string;
  pubkeyB64: string;
}

export interface SignedQuery {
  queryPayload: string;
  origin?: Origin;
}

export interface Origin {
  origin: string;
  sigB64: string;
  sigType: 'ed25519' | 'sr25519' | 'ecdsa';
}

export interface Query<T> {
  contractId: number;
  nonce: number;
  request: T;
}

const kRegexpEnumName = /^[A-Z][A-Za-z0-9]*$/;

// Loads the model and covnerts the snake case keys to camel case.
export function fromApi<T>(obj: {[key: string]: any}): T {
  return camelcaseKeys(obj, {deep: true, exclude: [kRegexpEnumName]}) as unknown as T;
}

export function toApi<T>(obj: T): any {
  return snakecaseKeys(obj, {deep: true, exclude: [kRegexpEnumName]});
}
