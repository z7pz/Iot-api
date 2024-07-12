import crypto from "crypto";

// AES Encryption Key
const aesKey = Buffer.from([0x2B, 0x7E, 0x15, 0x16, 0x28, 0xAE, 0xD2, 0xA6, 0xAB, 0xF7, 0x15, 0x88, 0x09, 0xCF, 0x4F, 0x3C]);

// General initialization vector
const aesIv = Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

// Example encrypted data (you need to replace this with your actual encrypted data)

// Decrypt the data
export function decryptAes(encryptedData) {
	const decipher = crypto.createDecipheriv('aes-128-cbc', aesKey, aesIv);
  let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Replace 'YOUR_ENCRYPTED_DATA_HERE' with your actual encrypted data in base64 format
