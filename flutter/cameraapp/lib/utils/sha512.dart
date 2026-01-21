import 'dart:convert';
import 'dart:typed_data';

class SHA512 {
  static final BigInt _mask64 = (BigInt.one << 64) - BigInt.one;

  // SHA-512 constants (hex strings)
  static const List<String> _kStrings = [
    '428a2f98d728ae22','7137449123ef65cd','b5c0fbcfec4d3b2f','e9b5dba58189dbbc',
    '3956c25bf348b538','59f111f1b605d019','923f82a4af194f9b','ab1c5ed5da6d8118',
    'd807aa98a3030242','12835b0145706fbe','243185be4ee4b28c','550c7dc3d5ffb4e2',
    '72be5d74f27b896f','80deb1fe3b1696b1','9bdc06a725c71235','c19bf174cf692694',
    'e49b69c19ef14ad2','efbe4786384f25e3','0fc19dc68b8cd5b5','240ca1cc77ac9c65',
    '2de92c6f592b0275','4a7484aa6ea6e483','5cb0a9dcbd41fbd4','76f988da831153b5',
    '983e5152ee66dfab','a831c66d2db43210','b00327c898fb213f','bf597fc7beef0ee4',
    'c6e00bf33da88fc2','d5a79147930aa725','06ca6351e003826f','142929670a0e6e70',
    '27b70a8546d22ffc','2e1b21385c26c926','4d2c6dfc5ac42aed','53380d139d95b3df',
    '650a73548baf63de','766a0abb3c77b2a8','81c2c92e47edaee6','92722c851482353b',
    'a2bfe8a14cf10364','a81a664bbc423001','c24b8b70d0f89791','c76c51a30654be30',
    'd192e819d6ef5218','d69906245565a910','f40e35855771202a','106aa07032bbd1b8',
    '19a4c116b8d2d0c8','1e376c085141ab53','2748774cdf8eeb99','34b0bcb5e19b48a8',
    '391c0cb3c5c95a63','4ed8aa4ae3418acb','5b9cca4f7763e373','682e6ff3d6b2b8a3',
    '748f82ee5defb2fc','78a5636f43172f60','84c87814a1f0ab72','8cc702081a6439ec',
    '90befffa23631e28','a4506cebde82bde9','bef9a3f7b2c67915','c67178f2e372532b',
    'ca273eceea26619c','d186b8c721c0c207','eada7dd6cde0eb1e','f57d4f7fee6ed178',
    '06f067aa72176fb4','0a637dc5a2c898a6','113f9804bef90dae','1b710b35131c471b',
    '28db77f523047d84','32caab7b40c72493','3c9ebe0a15c9bedb','431d67c49c100d4c',
    '4cc5d4becb3e42b6','597f299cfc657e2a','5fcb6fab3ad6face','6c44198c4a475817'
  ];

  static final List<BigInt> _k =
      _kStrings.map((s) => BigInt.parse(s, radix: 16)).toList();

  static BigInt _rotr(BigInt x, int n) =>
      ((x >> n) | (x << (64 - n))) & _mask64;

  static BigInt _shr(BigInt x, int n) => x >> n;

  static BigInt _sigma0(BigInt x) =>
      _rotr(x, 1) ^ _rotr(x, 8) ^ _shr(x, 7);

  static BigInt _sigma1(BigInt x) =>
      _rotr(x, 19) ^ _rotr(x, 61) ^ _shr(x, 6);

  static BigInt _bigSigma0(BigInt x) =>
      _rotr(x, 28) ^ _rotr(x, 34) ^ _rotr(x, 39);

  static BigInt _bigSigma1(BigInt x) =>
      _rotr(x, 14) ^ _rotr(x, 18) ^ _rotr(x, 41);

  static BigInt _ch(BigInt x, BigInt y, BigInt z) =>
      ((x & y) ^ ((~x & _mask64) & z)) & _mask64;

  static BigInt _maj(BigInt x, BigInt y, BigInt z) =>
      ((x & y) ^ (x & z) ^ (y & z)) & _mask64;

  static Uint8List _pad(Uint8List msg) {
    final bitLen = BigInt.from(msg.length) * BigInt.from(8);
    final k = (BigInt.from(1024) -
            (bitLen + BigInt.one + BigInt.from(128)) %
                BigInt.from(1024)) %
        BigInt.from(1024);

    final totalBytes =
        ((bitLen + BigInt.one + k + BigInt.from(128)) ~/ BigInt.from(8))
            .toInt();

    final padded = Uint8List(totalBytes);
    padded.setAll(0, msg);
    padded[msg.length] = 0x80;

    final lenBytes = Uint8List(16);
    var temp = bitLen;
    for (int i = 15; i >= 0; i--) {
      lenBytes[i] = (temp & BigInt.from(0xff)).toInt();
      temp >>= 8;
    }
    padded.setAll(totalBytes - 16, lenBytes);

    return padded;
  }

  static String compute(String input) {
    final msg = Uint8List.fromList(utf8.encode(input));
    final padded = _pad(msg);

    var h = [
      BigInt.parse('6a09e667f3bcc908', radix: 16),
      BigInt.parse('bb67ae8584caa73b', radix: 16),
      BigInt.parse('3c6ef372fe94f82b', radix: 16),
      BigInt.parse('a54ff53a5f1d36f1', radix: 16),
      BigInt.parse('510e527fade682d1', radix: 16),
      BigInt.parse('9b05688c2b3e6c1f', radix: 16),
      BigInt.parse('1f83d9abfb41bd6b', radix: 16),
      BigInt.parse('5be0cd19137e2179', radix: 16),
    ];

    for (int i = 0; i < padded.length; i += 128) {
      final w = List<BigInt>.filled(80, BigInt.zero);

      for (int t = 0; t < 16; t++) {
        BigInt v = BigInt.zero;
        for (int j = 0; j < 8; j++) {
          v = (v << 8) | BigInt.from(padded[i + t * 8 + j]);
        }
        w[t] = v;
      }

      for (int t = 16; t < 80; t++) {
        w[t] = (_sigma1(w[t - 2]) +
                w[t - 7] +
                _sigma0(w[t - 15]) +
                w[t - 16]) &
            _mask64;
      }

      var a = h[0], b = h[1], c = h[2], d = h[3];
      var e = h[4], f = h[5], g = h[6], hh = h[7];

      for (int t = 0; t < 80; t++) {
        final t1 =
            (hh + _bigSigma1(e) + _ch(e, f, g) + _k[t] + w[t]) & _mask64;
        final t2 = (_bigSigma0(a) + _maj(a, b, c)) & _mask64;

        hh = g;
        g = f;
        f = e;
        e = (d + t1) & _mask64;
        d = c;
        c = b;
        b = a;
        a = (t1 + t2) & _mask64;
      }

      h[0] = (h[0] + a) & _mask64;
      h[1] = (h[1] + b) & _mask64;
      h[2] = (h[2] + c) & _mask64;
      h[3] = (h[3] + d) & _mask64;
      h[4] = (h[4] + e) & _mask64;
      h[5] = (h[5] + f) & _mask64;
      h[6] = (h[6] + g) & _mask64;
      h[7] = (h[7] + hh) & _mask64;
    }

    return h.map((x) => x.toRadixString(16).padLeft(16, '0')).join();
  }

  /// Convenience method to hash a string
  static String hashString(String input) {
    return compute(input);
  }

  /// Convenience method to hash a string with salt
  static String hashStringWithSalt(String input, String salt) {
    return compute(input + salt);
  }
}
