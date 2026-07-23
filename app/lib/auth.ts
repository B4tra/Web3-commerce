const encoder = new TextEncoder();

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const keyData = encoder.encode(secret);
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Membuat token JWT sederhana yang ditandatangani secara kriptografis menggunakan HMAC-SHA256.
 * Rahasia (secret) digunakan untuk verifikasi dan tidak akan bocor ke klien.
 */
export async function signToken(payload: any, secret: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  
  // Base64Url encoding
  const encodedHeader = btoa(JSON.stringify(header))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
    
  const encodedPayload = btoa(JSON.stringify(payload))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
    
  const key = await getCryptoKey(secret);
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(`${encodedHeader}.${encodedPayload}`)
  );
  
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureString = String.fromCharCode(...signatureArray);
  const encodedSignature = btoa(signatureString)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
    
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

/**
 * Memverifikasi token JWT dan mengembalikan payload jika valid, atau null jika tidak valid/diutak-atik.
 */
export async function verifyToken(token: string, secret: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const [encodedHeader, encodedPayload, encodedSignature] = parts;
    const key = await getCryptoKey(secret);
    
    // Decode Base64Url ke Uint8Array
    const signatureStr = atob(encodedSignature.replace(/-/g, '+').replace(/_/g, '/'));
    const signatureArray = new Uint8Array(signatureStr.length);
    for (let i = 0; i < signatureStr.length; i++) {
      signatureArray[i] = signatureStr.charCodeAt(i);
    }
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureArray,
      encoder.encode(`${encodedHeader}.${encodedPayload}`)
    );
    
    if (!isValid) return null;
    
    // Decode payload
    const payloadStr = atob(encodedPayload.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadStr);
    
    // Cek kadaluwarsa (opsional, misalnya 8 jam dari ts)
    // Jika token memiliki timestamp 'ts', kita bisa membatasi validitasnya
    if (payload.ts) {
      const eightHours = 8 * 60 * 60 * 1000;
      if (Date.now() - payload.ts > eightHours) {
        return null; // Kedaluwarsa
      }
    }
    
    return payload;
  } catch (error) {
    return null;
  }
}
