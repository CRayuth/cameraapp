// Rotate right by n bits
function rotr(x: bigint, n: bigint): bigint {
  return ((x >> n) | (x << (64n - n))) & 0xFFFFFFFFFFFFFFFFn;
}

// Shift right by n bits
function shr(x: bigint, n: bigint): bigint {
  return x >> n;
}

// σ0 for message schedule
function sigma0(x: bigint): bigint {
  return rotr(x, 1n) ^ rotr(x, 8n) ^ shr(x, 7n);
}

// σ1 for message schedule
function sigma1(x: bigint): bigint {
  return rotr(x, 19n) ^ rotr(x, 61n) ^ shr(x, 6n);
}

// Σ0 for compression
function bigSigma0(x: bigint): bigint {
  return rotr(x, 28n) ^ rotr(x, 34n) ^ rotr(x, 39n);
}

// Σ1 for compression
function bigSigma1(x: bigint): bigint {
  return rotr(x, 14n) ^ rotr(x, 18n) ^ rotr(x, 41n);
}

// Choice function
function ch(x: bigint, y: bigint, z: bigint): bigint {
  return (x & y) ^ (~x & z);
}

// Majority function
function maj(x: bigint, y: bigint, z: bigint): bigint {
  return (x & y) ^ (x & z) ^ (y & z);
}

// SHA-512 Constants K[0..79]
const K: bigint[] = [
  0x428a2f98d728ae22n, 0x7137449123ef65cdn, 0xb5c0fbcfec4d3b2fn, 0xe9b5dba58189dbbcn,
  0x3956c25bf348b538n, 0x59f111f1b605d019n, 0x923f82a4af194f9bn, 0xab1c5ed5da6d8118n,
  0xd807aa98a3030242n, 0x12835b0145706fben, 0x243185be4ee4b28cn, 0x550c7dc3d5ffb4e2n,
  0x72be5d74f27b896fn, 0x80deb1fe3b1696b1n, 0x9bdc06a725c71235n, 0xc19bf174cf692694n,
  0xe49b69c19ef14ad2n, 0xefbe4786384f25e3n, 0x0fc19dc68b8cd5b5n, 0x240ca1cc77ac9c65n,
  0x2de92c6f592b0275n, 0x4a7484aa6ea6e483n, 0x5cb0a9dcbd41fbd4n, 0x76f988da831153b5n,
  0x983e5152ee66dfabn, 0xa831c66d2db43210n, 0xb00327c898fb213fn, 0xbf597fc7beef0ee4n,
  0xc6e00bf33da88fc2n, 0xd5a79147930aa725n, 0x06ca6351e003826fn, 0x142929670a0e6e70n,
  0x27b70a8546d22ffcn, 0x2e1b21385c26c926n, 0x4d2c6dfc5ac42aedn, 0x53380d139d95b3dfn,
  0x650a73548baf63den, 0x766a0abb3c77b2a8n, 0x81c2c92e47edaee6n, 0x92722c851482353bn,
  0xa2bfe8a14cf10364n, 0xa81a664bbc423001n, 0xc24b8b70d0f89791n, 0xc76c51a30654be30n,
  0xd192e819d6ef5218n, 0xd69906245565a910n, 0xf40e35855771202an, 0x106aa07032bbd1b8n,
  0x19a4c116b8d2d0c8n, 0x1e376c085141ab53n, 0x2748774cdf8eeb99n, 0x34b0bcb5e19b48a8n,
  0x391c0cb3c5c95a63n, 0x4ed8aa4ae3418acbn, 0x5b9cca4f7763e373n, 0x682e6ff3d6b2b8a3n,
  0x748f82ee5defb2fcn, 0x78a5636f43172f60n, 0x84c87814a1f0ab72n, 0x8cc702081a6439ecn,
  0x90befffa23631e28n, 0xa4506cebde82bde9n, 0xbef9a3f7b2c67915n, 0xc67178f2e372532bn,
  0xca273eceea26619cn, 0xd186b8c721c0c207n, 0xeada7dd6cde0eb1en, 0xf57d4f7fee6ed178n,
  0x06f067aa72176fb4n, 0x0a637dc5a2c898a6n, 0x113f9804bef90dae5n, 0x1b710b35131c471bn,
  0x28db77f523047d84n, 0x32caab7b40c72493n, 0x3c9ebe0a15c9bedbn, 0x431d67c49c100d4cn,
  0x4cc5d4becb3e42b6n, 0x597f299cfc657e2an, 0x5fcb6fab3ad6faecn, 0x6c44198c4a475817n
];

// Message preprocessing (padding)
function padMessage(msg: Uint8Array): Uint8Array {
  const l = BigInt(msg.length) * 8n;
  const k = (1024n - (l + 1n + 128n) % 1024n) % 1024n;
  const totalLength = Number((l + 1n + k + 128n) / 8n);

  const padded = new Uint8Array(totalLength);
  padded.set(msg);
  padded[msg.length] = 0x80; // append 1 bit + 7 zeros

  // append length in last 16 bytes
  const view = new DataView(padded.buffer);
  view.setBigUint64(totalLength - 16, 0n); // high 64 bits (assuming < 2^64 bits)
  view.setBigUint64(totalLength - 8, l);   // low 64 bits

  return padded;
}

// Message Schedule W[0..79]
function createMessageSchedule(block: Uint8Array): bigint[] {
  const W: bigint[] = new Array(80).fill(0n);
  const view = new DataView(block.buffer);

  for (let i = 0; i < 16; i++) {
    W[i] = view.getBigUint64(i * 8, false); // Use big endian
  }

  for (let i = 16; i < 80; i++) {
    W[i] = (sigma1(W[i - 2]) + W[i - 7] + sigma0(W[i - 15]) + W[i - 16]) & 0xFFFFFFFFFFFFFFFFn;
  }

  return W;
}

// Proper SHA-512 implementation according to specification
export function sha512(msg: Uint8Array): string {
  const H = [
    0x6a09e667f3bcc908n,
    0xbb67ae8584caa73bn,
    0x3c6ef372fe94f82bn,
    0xa54ff53a5f1d36f1n,
    0x510e527fade682d1n,
    0x9b05688c2b3e6c1fn,
    0x1f83d9abfb41bd6bn,
    0x5be0cd19137e2179n
  ];

  const padded = padMessage(msg);

  for (let i = 0; i < padded.length; i += 128) {
    const block = padded.subarray(i, i + 128);
    const W = createMessageSchedule(block);

    let [a,b,c,d,e,f,g,h] = H;

    for (let t = 0; t < 80; t++) {
      const T1 = (h + bigSigma1(e) + ch(e,f,g) + K[t] + W[t]) & 0xFFFFFFFFFFFFFFFFn;
      const T2 = (bigSigma0(a) + maj(a,b,c)) & 0xFFFFFFFFFFFFFFFFn;

      h = g; g = f; f = e; e = (d + T1) & 0xFFFFFFFFFFFFFFFFn;
      d = c; c = b; b = a; a = (T1 + T2) & 0xFFFFFFFFFFFFFFFFn;
    }

    H[0] = (H[0] + a) & 0xFFFFFFFFFFFFFFFFn;
    H[1] = (H[1] + b) & 0xFFFFFFFFFFFFFFFFn;
    H[2] = (H[2] + c) & 0xFFFFFFFFFFFFFFFFn;
    H[3] = (H[3] + d) & 0xFFFFFFFFFFFFFFFFn;
    H[4] = (H[4] + e) & 0xFFFFFFFFFFFFFFFFn;
    H[5] = (H[5] + f) & 0xFFFFFFFFFFFFFFFFn;
    H[6] = (H[6] + g) & 0xFFFFFFFFFFFFFFFFn;
    H[7] = (H[7] + h) & 0xFFFFFFFFFFFFFFFFn;
  }

  return H.map(h => h.toString(16).padStart(16,'0')).join('');
}

// Convenience function to hash a string
export function sha512String(input: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  return sha512(data);
}

// Convenience function to hash a string with salt
export function sha512StringWithSalt(input: string, salt: string): string {
  return sha512String(input + salt);
}