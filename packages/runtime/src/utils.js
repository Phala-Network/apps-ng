import stringToU8a from '@polkadot/util/string/toU8a'
import u8aToString from '@polkadot/util/u8a/toString'
import * as base64 from 'base64-js'
import * as Models from './models'
import { u8aToHex } from '@polkadot/util'
import { decodeAddress, encodeAddress } from '@polkadot/util-crypto'
import * as Aead from './crypto/aead'
import * as Crypto from './crypto'

export function u8aToHexCompact(data) {
  return u8aToHex(data).substring(2)
}

export function ss58ToHex(ss58) {
  const pubkeyData = decodeAddress(ss58)
  return u8aToHexCompact(pubkeyData)
}

export function hexToSs58(hex) {
  return encodeAddress(hex);
}


export function nonce () {
  return { id: Math.random() * 65535 | 0 }
}

export async function decrypt (channel, cipher) {
  if (!channel.core.agreedSecret) {
    throw new Error('EcdhChannel remote not joined')
  }
  const iv = base64.toByteArray(cipher.ivB64)
  const cipherData = base64.toByteArray(cipher.cipherB64)
  // const pubkeyB64 = base64.toByteArray(cipher.pubkeyB64);  // TODO: check pubkey
  // const msgData = await Aead.decrypt(iv, channel.core.agreedSecret, cipherData)
  return  Aead.decrypt(iv, channel.core.agreedSecret, cipherData)
}

export async function decryptObj (channel, cipher) {
  const data = await decrypt(channel, cipher)
  const json = u8aToString(new Uint8Array(data))
  const apiObj = JSON.parse(json)
  return Models.fromApi(apiObj)
}

export async function decodePayload(channel, payload) {
  if (payload.Plain) {
    const apiObj = JSON.parse(payload.Plain)
    return Models.fromApi(apiObj)
  } else {
    return await decryptObj(channel, payload.Cipher)
  }
}

// Encrypt `data` by AEAD-AES-GCM with the secret key derived by ECDH
export async function encrypt(channel, data) {
  if (!channel.core.agreedSecret) {
    throw new Error('EcdhChannel remote not joined')
  }
  const key = channel.core.agreedSecret
  const iv = Aead.generateIv()
  const cipher = await Aead.encrypt(iv, key, data)
  const pkData = await Crypto.dumpKeyData(channel.core.localPair.publicKey)
  // console.log('AGREED', channel.agreedSecretHex)
  // console.log('DATA', u8aToHex(new Uint8Array(data)))
  // console.log('CIPHER', u8aToHex(new Uint8Array(cipher)))
  return {
    ivB64: base64.fromByteArray(iv),
    cipherB64: base64.fromByteArray(new Uint8Array(cipher)),
    pubkeyB64: base64.fromByteArray(new Uint8Array(pkData)),
  }
}

// Serialize and encrypt `obj` by AEAD-AES-GCM with the secret key derived by ECDH
export async function encryptObj (channel, obj) {
  // console.log('encryptObj', [channel, obj])
  const apiObj = Models.toApi(obj)
  const objJson = JSON.stringify(apiObj)
  const data = stringToU8a(objJson)
  return encrypt(channel, data)
}

export function signQuery(query, keypair) {
  const apiQuery = Models.toApi(query)
  const queryJson = JSON.stringify(apiQuery)
  const data = stringToU8a(queryJson)
  const signedQuery = { queryPayload: queryJson }
  if (keypair) {
    const sig = keypair.sign(data)
    signedQuery.origin = {
      origin:  u8aToHexCompact(keypair.publicKey),
      sigB64: base64.fromByteArray(sig),
      sigType: keypair.type
    }
  }
  return signedQuery
}

export async function measure (op) {
  const startedAt = Date.now()
  op && (await op())
  return Date.now() - startedAt
}
