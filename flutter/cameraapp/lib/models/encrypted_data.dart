import 'dart:convert';

class EncryptedData {
  final String encryptedContent;
  final String keyVersion;
  final DateTime encryptionDate;
  final String iv;
  
  EncryptedData({
    required this.encryptedContent,
    required this.keyVersion,
    required this.encryptionDate,
    required this.iv,
  });
  
  Map<String, dynamic> toJson() => {
    'encryptedContent': encryptedContent,
    'keyVersion': keyVersion,
    'encryptionDate': encryptionDate.toIso8601String(),
    'iv': iv,
  };
  
  factory EncryptedData.fromJson(Map<String, dynamic> json) => EncryptedData(
    encryptedContent: json['data'],
    keyVersion: json['version'],
    encryptionDate: DateTime.parse(json['date']),
    iv: json['iv'],
  );
  
  String toEncryptedString() => jsonEncode(toJson());
  
  factory EncryptedData.fromEncryptedString(String encryptedString) {
    final json = jsonDecode(encryptedString);
    return EncryptedData.fromJson(json);
  }
}