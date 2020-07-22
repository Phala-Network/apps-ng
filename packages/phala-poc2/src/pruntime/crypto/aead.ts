function algorithm(iv: ArrayBuffer) {
  return {
    name: 'AES-GCM',
    iv: iv,
    tagLength: 128,
  }
}

export async function importKey(key: Uint8Array) {
  return crypto.subtle.importKey('raw', key, 'AES-GCM', true, ['encrypt', 'decrypt']);
}

export function generateIv(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12));
}

export async function encrypt(iv: ArrayBuffer, secret: CryptoKey, data: ArrayBuffer): Promise<ArrayBuffer> {
  return await crypto.subtle.encrypt(algorithm(iv), secret, data);
}

export async function decrypt(iv: ArrayBuffer, secret: CryptoKey, data: ArrayBuffer): Promise<ArrayBuffer> {
  return await crypto.subtle.decrypt(algorithm(iv), secret, data);
}
