import { u8aToHex, hexToU8a } from '@polkadot/util';
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto';

export function u8aToHexCompact(data: Uint8Array): string {
  return u8aToHex(data).substring(2);
}

export function ss58ToHex(ss58: string): string {
  const pubkeyData = decodeAddress(ss58);
  return u8aToHexCompact(pubkeyData);
}

export function hexToSs58(hex: string): string {
  // const pk = hexToU8a(hex);
  return encodeAddress(hex);
}
