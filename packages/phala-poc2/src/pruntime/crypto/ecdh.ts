import { hexToU8a } from '@polkadot/util';

const kAllowExport = true;
const kAlgorithm = {name: "ECDH", namedCurve: "P-256"};
const kSymmetricAlgorithm = {name: 'AES-GCM', length: 256};

export async function generateKeyPair(): Promise<CryptoKeyPair> {
  return await window.crypto.subtle.generateKey(
    kAlgorithm, kAllowExport,
    ["deriveKey", "deriveBits"]) as CryptoKeyPair;
}

async function importPubkey(key: Uint8Array): Promise<CryptoKey> {
  return await crypto.subtle.importKey('raw', key, kAlgorithm, true, []);
}

export async function importPubkeyHex(pubkeyHex: string): Promise<CryptoKey> {
  const pubkeyData = hexToU8a('0x' + pubkeyHex);
  return await importPubkey(pubkeyData);
}

export async function deriveSecretKey(privkey: CryptoKey, remotePubkey: CryptoKey): Promise<CryptoKey> {  
  const shared = await crypto.subtle.deriveKey(
    {name: 'ECDH', public: remotePubkey},
    privkey,
    kSymmetricAlgorithm,
    kAllowExport,
    ['encrypt', 'decrypt']
  );

  return shared;
}
