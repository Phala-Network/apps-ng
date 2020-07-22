import { u8aToHexCompact } from '../../utils';
import * as Aead from './aead';
import * as Ecdh from './ecdh';

export async function dumpKeyData(key: CryptoKey): Promise<ArrayBuffer> {
  if (key.type == 'public' || key.type == 'secret') {
    return await crypto.subtle.exportKey('raw', key);
  } else if (key.type == 'private') {
    return await crypto.subtle.exportKey('pkcs8', key);
  } else {
    throw new Error('Unsupported key type');
  }
}

export async function dumpKeyString(key: CryptoKey): Promise<string> {
  try { 
    let data = await dumpKeyData(key);
    return u8aToHexCompact(new Uint8Array(data));
  } catch (err) {
    // Firefox apparently doesn't like to export pkcs8 for ecdh privkey
    return '#ERR:' + err.message;
  }
}

interface EcdhChannelCore {
  localPair: CryptoKeyPair;
  remotePubkey?: CryptoKey;
  agreedSecret?: CryptoKey;
}

export interface EcdhChannel {
  core: EcdhChannelCore;
  localPubkeyHex?: string;
  localPrivkeyHex?: string;
  remotePubkeyHex?: string;
  agreedSecretHex?: string;
}

export async function newChannel(): Promise<EcdhChannel> {
  const localPair = await Ecdh.generateKeyPair();
  return {
    core: {localPair},
    localPubkeyHex: await dumpKeyString(localPair.publicKey),
    localPrivkeyHex: await dumpKeyString(localPair.privateKey)
  };
}

export async function joinChannel(ch: EcdhChannel, remotePubkeyHex: string): Promise<EcdhChannel> {
  if (ch.remotePubkeyHex == remotePubkeyHex) {
    return ch;
  }
  const localPair = ch.core.localPair;
  const remotePubkey = await Ecdh.importPubkeyHex(remotePubkeyHex);
  const agreedSecret = await Ecdh.deriveSecretKey(localPair.privateKey, remotePubkey);

  return {
    core: {localPair, remotePubkey, agreedSecret},
    localPubkeyHex: await dumpKeyString(localPair.publicKey),
    localPrivkeyHex: await dumpKeyString(localPair.privateKey),
    agreedSecretHex: await dumpKeyString(agreedSecret),
    remotePubkeyHex
  }
}

export default {
  Aead, Ecdh,
  dumpKeyData,
  dumpKeyString,
  newChannel,
  joinChannel
}
