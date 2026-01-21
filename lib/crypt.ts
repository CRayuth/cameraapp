import crypto from 'crypto';
import { sha512String, sha512StringWithSalt } from './sha512';

export class EncryptionService {
    private static readonly ALGORITHM = 'aes-256-ctr';

    /**
     * Decrypts AES-256-CTR encrypted data.
     * Matches the Flutter implementation using pointycastle/encrypt package.
     * 
     * @param encryptedBase64 The encrypted data in Base64
     * @param keyBase64 The encryption key in Base64 (must be 32 bytes/256 bits)
     * @param ivBase64 The initialization vector in Base64 (must be 16 bytes/128 bits)
     */
    static decryptAES(encryptedBase64: string, keyBase64: string, ivBase64: string): string {
        const key = Buffer.from(keyBase64, 'base64');
        const iv = Buffer.from(ivBase64, 'base64');
        const encryptedText = Buffer.from(encryptedBase64, 'base64');

        if (key.length !== 32) throw new Error('Invalid key length: must be 32 bytes');
        if (iv.length !== 16) throw new Error('Invalid IV length: must be 16 bytes');

        const decipher = crypto.createDecipheriv(this.ALGORITHM, key, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);

        return decrypted.toString('utf8');
    }

    /**
     * Encrypts data using AES-256-CTR.
     * Useful for testing or sending commands back to the device.
     */
    static encryptAES(plainText: string, keyBase64: string, ivBase64: string): string {
        const key = Buffer.from(keyBase64, 'base64');
        const iv = Buffer.from(ivBase64, 'base64');

        if (key.length !== 32) throw new Error('Invalid key length: must be 32 bytes');
        if (iv.length !== 16) throw new Error('Invalid IV length: must be 16 bytes');

        const cipher = crypto.createCipheriv(this.ALGORITHM, key, iv);
        let encrypted = cipher.update(plainText, 'utf8');
        encrypted = Buffer.concat([encrypted, cipher.final()]);

        return encrypted.toString('base64');
    }

    /**
     * Generates a random 16-byte initialization vector (IV).
     */
    static generateIV(): string {
        return crypto.randomBytes(16).toString('base64');
    }

    /**
     * Hashes data using SHA-512 according to the proper algorithm specification.
     */
    static hashSHA512(data: string): string {
        return sha512String(data);
    }

    /**
     * Hashes data using SHA-512 with a salt.
     * The salt is appended to the data: data + salt.
     */
    static hashSHA512WithSalt(data: string, salt: string): string {
        // Note: Verify if Flutter implementation does salt + data or data + salt.
        // Based on Flutter code: '$input$salt' -> data + salt
        return sha512StringWithSalt(data, salt);
    }

    /**
     * Derive an AES key from a password using SHA-512
     * This creates a deterministic key from the password that can be used for AES encryption
     */
    static deriveKeyFromPassword(password: string, salt?: string): string {
        const input = salt ? password + salt : password;
        const hash = sha512String(input);
        
        // Take the first 32 bytes (256 bits) of the hash to create an AES-256 key
        const keyHex = hash.substring(0, 64); // 64 hex chars = 32 bytes
        
        return keyHex;
    }
}
