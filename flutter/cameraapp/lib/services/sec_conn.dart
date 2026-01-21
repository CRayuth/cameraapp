import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:encrypt/encrypt.dart' as encrypt;
import 'package:http/http.dart' as http;
import 'crypt.dart';
import 'keys.dart';
import '../models/encrypted_data.dart';

class SecConn {
  /// Encrypt data before sending to the server
  static Future<EncryptedData> encryptForServerTransmission(Uint8List data) async {
    try {
      // Get the current encryption key
      final key = await Keys.getCurrentKey();
      final iv = encrypt.IV.fromBase64(base64Encode(EncryptionService.generateIV().bytes));
      
      // Encrypt the data
      final encrypted = EncryptionService.encryptAES(
        base64Encode(data),
        key,
        iv,
      );
      
      // Create encrypted data object with metadata
      return EncryptedData(
        encryptedContent: encrypted,
        keyVersion: await Keys.getCurrentKeyVersion(),
        encryptionDate: DateTime.now(),
        iv: base64Encode(iv.bytes),
      );
    } catch (e) {
      throw Exception('Failed to encrypt data for server transmission: $e');
    }
  }

  /// Register the current key with the backend
  static Future<bool> registerKey(String baseUrl, {String? pin}) async {
    try {
      final keyVersion = await Keys.getCurrentKeyVersion();
      final key = await Keys.getCurrentKey();
      
      final url = Uri.parse(baseUrl);
      
      final requestBody = {
        'type': 'register_key',
        'version': keyVersion,
        'key': base64Encode(key.bytes),
      };
      
      // Include PIN if provided for validation
      if (pin != null) {
        requestBody['accessKey'] = pin;  // Using accessKey field to maintain compatibility
      }
      
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: jsonEncode(requestBody),
      );
      
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Error registering key: $e');
      return false;
    }
  }

  /// Send encrypted data to the backend
  static Future<bool> sendData(String baseUrl, EncryptedData data) async {
    try {
      final url = Uri.parse(baseUrl);
      
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: jsonEncode({
          'type': 'data',
          ...data.toJson(),
        }),
      );
      
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Error sending data: $e');
      return false;
    }
  }
  
  /// Send encrypted GPS data to the backend
  static Future<bool> sendGPSData(String baseUrl, EncryptedData data) async {
    try {
      final url = Uri.parse(baseUrl);
      
      final response = await http.post(
        url,
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true',
        },
        body: jsonEncode({
          'type': 'gps',
          ...data.toJson(),
        }),
      );
      
      return response.statusCode == 200;
    } catch (e) {
      debugPrint('Error sending GPS data: $e');
      return false;
    }
  }
  
  /// Fetch and decrypt pending commands from server
  static Future<List<Map<String, dynamic>>?> fetchCommands(String commandUrl) async {
    try {
      final url = Uri.parse(commandUrl);
      
      final response = await http.get(
        url,
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
      );
      
      if (response.statusCode != 200) {
        return null;
      }
      
      final data = jsonDecode(response.body);
      final commands = data['commands'] as List?;
      
      if (commands == null || commands.isEmpty) {
        return [];
      }
      
      // Decrypt each command
      final List<Map<String, dynamic>> decryptedCommands = [];
      
      for (final cmd in commands) {
        try {
          final keyVersion = cmd['keyVersion'] as String;
          final key = await Keys.getKeyByVersion(keyVersion);
          
          final decrypted = EncryptionService.decryptAES(
            cmd['encryptedContent'],
            key,
            encrypt.IV.fromBase64(cmd['iv']),
          );
          
          final commandData = jsonDecode(decrypted) as Map<String, dynamic>;
          decryptedCommands.add(commandData);
        } catch (e) {
// Command decryption error
        }
      }
      
      return decryptedCommands;
    } catch (e) {
// Command fetch error
      return null;
    }
  }
  
  /// Decrypt data received from the server
  static Future<Uint8List> decryptFromServerTransmission(String encryptedDataString) async {
    try {
      // Parse the encrypted data
      final encryptedData = EncryptedData.fromEncryptedString(encryptedDataString);
      
      // Get the appropriate key based on the version used for encryption
      final key = await Keys.getKeyByVersion(encryptedData.keyVersion);
      
      // Decrypt the data
      final decrypted = EncryptionService.decryptAES(
        encryptedData.encryptedContent,
        key,
        encrypt.IV.fromBase64(encryptedData.iv),
      );
      
      return base64Decode(decrypted);
    } catch (e) {
      throw Exception('Failed to decrypt data from server: $e');
    }
  }
  
  /// Hash sensitive data (like passwords or keys) using SHA512 before transmission
  static String hashForSecureTransmission(String data) {
    try {
      return EncryptionService.hashSHA512(data);
    } catch (e) {
      throw Exception('Failed to hash data for secure transmission: $e');
    }
  }
  
  /// Hash with salt for additional security
  static String hashWithSaltForSecureTransmission(String data) {
    try {
      final salt = EncryptionService.generateSalt();
      return EncryptionService.hashSHA512WithSalt(data, salt);
    } catch (e) {
      throw Exception('Failed to hash data with salt for secure transmission: $e');
    }
  }
  
  /// Verify if data needs to be re-encrypted with newer key (for migration)
  static Future<bool> needsReEncryption(EncryptedData encryptedData) async {
    final currentVersion = await Keys.getCurrentKeyVersion();
    return encryptedData.keyVersion != currentVersion;
  }
}