import 'dart:convert';
import 'package:encrypt/encrypt.dart' as encrypt;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'crypt.dart';

class Keys {
  static const String _prefix = 'encryption_key_';
  static const FlutterSecureStorage _storage = FlutterSecureStorage();
  static final Map<String, encrypt.Key> _cache = {};

  /// Get current encryption key
  static Future<encrypt.Key> getCurrentKey() async {
    final version = await _getCurrentVersion();
    final keyStr = await _storage.read(key: '$_prefix$version');
    
    if (keyStr != null) return encrypt.Key.fromBase64(keyStr);
    
    // Generate and store new key
    final key = EncryptionService.generateAESKey();
    await _storage.write(key: '$_prefix$version', value: base64Encode(key.bytes));
    return key;
  }

  /// Rotate to new encryption key
  static Future<void> rotateKey() async {
    final currentVer = await _getCurrentVersion();
    final newVer = 'v${int.parse(currentVer.substring(1)) + 1}';
    
    // Generate and store new key
    final newKey = EncryptionService.generateAESKey();
    await _storage.write(key: '$_prefix$newVer', value: base64Encode(newKey.bytes));
    
    // Cache old key and update version
    _cache[currentVer] = await _getKey(currentVer);
    await _storage.write(key: 'current_key_version', value: newVer);
  }

  /// Get key by version (handles current and old keys)
  static Future<encrypt.Key> getKeyByVersion(String version) async {
    if (version == await _getCurrentVersion()) {
      return await getCurrentKey();
    }
    return _cache[version] ?? await _getKey(version);
  }

  /// Get current key version
  static Future<String> getCurrentKeyVersion() async {
    return await _getCurrentVersion();
  }

  // Private helpers
  static Future<String> _getCurrentVersion() async {
    return await _storage.read(key: 'current_key_version') ?? 'v1';
  }
  
  static Future<encrypt.Key> _getKey(String version) async {
    final keyStr = await _storage.read(key: '$_prefix$version');
    if (keyStr == null) throw Exception('Key not found: $version');
    return encrypt.Key.fromBase64(keyStr);
  }
}