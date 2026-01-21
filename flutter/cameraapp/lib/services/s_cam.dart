import 'dart:typed_data';
import 'dart:convert';
import 'package:encrypt/encrypt.dart' as encrypt;
import 'crypt.dart';
import 'keys.dart';
import '../models/encrypted_data.dart';

class SCam {
  /// Encrypt image data with metadata for key rotation support
  static Future<EncryptedData> encryptImageData(
    Uint8List imageData, {
    bool forceNewKey = false,
  }) async {
    encrypt.Key key;
    encrypt.IV iv;
    
    if (forceNewKey) {
      key = await Keys.getCurrentKey();
      iv = encrypt.IV.fromBase64(base64Encode(EncryptionService.generateIV().bytes));
    } else {
      // Use current key but track for migration
      key = await Keys.getCurrentKey();
      iv = encrypt.IV.fromBase64(base64Encode(EncryptionService.generateIV().bytes));
    }
    
    final encrypted = EncryptionService.encryptAES(
      base64Encode(imageData),
      key,
      iv,
    );
    
    // Store with metadata for future migration
    return EncryptedData(
      encryptedContent: encrypted,
      keyVersion: await Keys.getCurrentKeyVersion(),
      encryptionDate: DateTime.now(),
      iv: base64Encode(iv.bytes),
    );
  }
  
  /// Efficient decryption that handles multiple key versions
  static Future<Uint8List> decryptImageData(EncryptedData encryptedData) async {
    final key = await Keys.getKeyByVersion(encryptedData.keyVersion);
    
    final decrypted = EncryptionService.decryptAES(
      encryptedData.encryptedContent,
      key,
      encrypt.IV.fromBase64(encryptedData.iv),
    );
    
    return base64Decode(decrypted);
  }
  
  /// Rotate keys and schedule background migration of old data
  static Future<void> rotateKeysWithMigration() async {
    await Keys.rotateKey();
    // In a real implementation, you would schedule background migration here
    // This could be done with isolates to avoid blocking the UI
  }
}