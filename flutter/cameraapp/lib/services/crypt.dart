import 'dart:convert';
import 'dart:typed_data';
import 'dart:math';
import 'package:encrypt/encrypt.dart';

import '../utils/sha512.dart';

class EncryptionService {
  static const int _keySize = 32; // 256 bits for AES
  static const int _ivSize = 16;  // 128 bits for AES

  /// Generates a random key for AES encryption
  static Key generateAESKey() {
    final random = Random.secure();
    final key = List<int>.generate(_keySize, (i) => random.nextInt(256));
    return Key(Uint8List.fromList(key));
  }

  /// Generates a random initialization vector
  static IV generateIV() {
    final random = Random.secure();
    final iv = List<int>.generate(_ivSize, (i) => random.nextInt(256));
    return IV(Uint8List.fromList(iv));
  }

  /// Encrypts data using AES
  static String encryptAES(String plainText, Key key, [IV? iv]) {
    try {
      iv = iv ?? generateIV();
      final encrypter = Encrypter(AES(key, mode: AESMode.sic, padding: null));
      final encrypted = encrypter.encrypt(plainText, iv: iv);
      return encrypted.base64;
    } catch (e) {
      throw Exception('AES encryption failed: $e');
    }
  }

  /// Decrypts data using AES
  static String decryptAES(String encryptedText, Key key, IV iv) {
    try {
      final encrypter = Encrypter(AES(key, mode: AESMode.sic, padding: null));
      final decrypted = encrypter.decrypt64(encryptedText, iv: iv);
      return decrypted;
    } catch (e) {
      throw Exception('AES decryption failed: $e');
    }
  }

  /// Hashes data using SHA512 according to the proper algorithm specification
  static String hashSHA512(String input) {
    try {
      return SHA512.hashString(input);
    } catch (e) {
      throw Exception('SHA512 hashing failed: $e');
    }
  }

  /// Hashes data using SHA512 with salt according to the proper algorithm specification
  static String hashSHA512WithSalt(String input, String salt) {
    try {
      return SHA512.hashStringWithSalt(input, salt);
    } catch (e) {
      throw Exception('SHA512 hashing with salt failed: $e');
    }
  }

  /// Generates a random salt
  static String generateSalt() {
    final random = Random.secure();
    final saltBytes = List<int>.generate(32, (i) => random.nextInt(256));
    return base64Encode(saltBytes);
  }

  /// Derive an AES key from a password using SHA-512
  /// This creates a deterministic key from the password that can be used for AES encryption
  static Key deriveKeyFromPassword(String password, [String? salt]) {
    String input = salt != null ? password + salt : password;
    String hash = SHA512.hashString(input);
    
    // Take the first 32 bytes (256 bits) of the hash to create an AES-256 key
    String keyHex = hash.substring(0, 64); // 64 hex chars = 32 bytes
    
    // Convert hex string to bytes
    var keyBytes = <int>[];
    for (int i = 0; i < keyHex.length; i += 2) {
      keyBytes.add(int.parse(keyHex.substring(i, i + 2), radix: 16));
    }
    
    return Key(Uint8List.fromList(keyBytes));
  }
}