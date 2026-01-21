import 'dart:convert';
import 'package:encrypt/encrypt.dart' as encrypt;

import 'crypt.dart';
import 'keys.dart';
import '../models/encrypted_data.dart';

class DataMigrationService {
  /// Decrypt with old key and re-encrypt with new key
  static Future<String> migrateEncryptedData(
    String oldEncryptedData,
    String oldKeyVersion,
    String oldIV,
  ) async {
    // Get the old key to decrypt
    final oldKey = await Keys.getKeyByVersion(oldKeyVersion);
    
    // Decrypt with old key
    final decrypted = EncryptionService.decryptAES(
      oldEncryptedData, 
      oldKey, 
      encrypt.IV.fromBase64(oldIV)
    );
    
    // Get new key and IV for re-encryption
    final newKey = await Keys.getCurrentKey();
    final newIV = encrypt.IV.fromBase64(base64Encode(EncryptionService.generateIV().bytes));
    
    // Re-encrypt with new key
    final reencrypted = EncryptionService.encryptAES(
      decrypted, 
      newKey, 
      newIV
    );
    
    // Create new encrypted data object with current version
    final newEncryptedData = EncryptedData(
      encryptedContent: reencrypted,
      keyVersion: await _getCurrentKeyVersion(),
      encryptionDate: DateTime.now(),
      iv: base64Encode(newIV.bytes),
    );
    
    return newEncryptedData.toEncryptedString();
  }
  
  /// Get current key version helper
  static Future<String> _getCurrentKeyVersion() async {
    return await Keys.getCurrentKeyVersion();
  }
  
  /// Batch migration for performance (stub implementation - would need actual data access)
  static Future<void> migrateAllData() async {
    // This would typically iterate through all stored encrypted data
    // and migrate it to use the latest key
// Migration process placeholder
  }
  
  /// Check if data needs migration based on key version
  static Future<bool> needsMigration(EncryptedData encryptedData) async {
    return encryptedData.keyVersion != await _getCurrentKeyVersion();
  }
}