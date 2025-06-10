
import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'lifebook-health-encryption-key'; // In production, this should be from environment

export class DataEncryption {
  private static key = ENCRYPTION_KEY;

  static encrypt(data: any): string {
    const jsonString = JSON.stringify(data);
    return CryptoJS.AES.encrypt(jsonString, this.key).toString();
  }

  static decrypt(encryptedData: string): any {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.key);
      const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decryptedString);
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  static hashData(data: string): string {
    return CryptoJS.SHA256(data).toString();
  }

  static secureStore(key: string, data: any): void {
    const encryptedData = this.encrypt(data);
    localStorage.setItem(key, encryptedData);
  }

  static secureRetrieve(key: string): any {
    const encryptedData = localStorage.getItem(key);
    if (!encryptedData) return null;
    return this.decrypt(encryptedData);
  }
}
