function algorithm(iv) {
  return {
    name: 'AES-GCM',
    iv: iv,
    tagLength: 128,
  };
}
export async function importKey(key) {
  return crypto.subtle.importKey('raw', key, 'AES-GCM', true, ['encrypt', 'decrypt']);
}
export function generateIv() {
  return crypto.getRandomValues(new Uint8Array(12));
}
export async function encrypt(iv, secret, data) {
  return await crypto.subtle.encrypt(algorithm(iv), secret, data);
}
export async function decrypt(iv, secret, data) {
  return await crypto.subtle.decrypt(algorithm(iv), secret, data);
}
