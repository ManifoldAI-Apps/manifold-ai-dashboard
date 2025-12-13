/**
 * Encryption utilities for sensitive data like subscription passwords
 * 
 * Note: For production, consider using Supabase's pgcrypto extension
 * or a proper encryption service. This is a basic implementation.
 */

const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-key-change-in-production';

/**
 * Simple base64 encoding (NOT secure encryption, just obfuscation)
 * For production, use proper encryption like AES-256
 */
export function encodePassword(password: string): string {
    try {
        return btoa(password);
    } catch (error) {
        console.error('Error encoding password:', error);
        return password;
    }
}

/**
 * Decode base64 encoded password
 */
export function decodePassword(encodedPassword: string): string {
    try {
        return atob(encodedPassword);
    } catch (error) {
        console.error('Error decoding password:', error);
        return encodedPassword;
    }
}

/**
 * More secure encryption using Web Crypto API (for modern browsers)
 * This is a better approach for client-side encryption
 */
export async function encryptPassword(password: string): Promise<string> {
    try {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const key = await getEncryptionKey();

        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encryptedData = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            data
        );

        // Combine IV and encrypted data
        const combined = new Uint8Array(iv.length + encryptedData.byteLength);
        combined.set(iv);
        combined.set(new Uint8Array(encryptedData), iv.length);

        // Convert to base64
        return btoa(String.fromCharCode(...combined));
    } catch (error) {
        console.error('Error encrypting password:', error);
        // Fallback to simple encoding
        return encodePassword(password);
    }
}

/**
 * Decrypt password encrypted with encryptPassword
 */
export async function decryptPassword(encryptedPassword: string): Promise<string> {
    try {
        // Convert from base64
        const combined = Uint8Array.from(atob(encryptedPassword), c => c.charCodeAt(0));

        // Extract IV and encrypted data
        const iv = combined.slice(0, 12);
        const encryptedData = combined.slice(12);

        const key = await getEncryptionKey();
        const decryptedData = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv },
            key,
            encryptedData
        );

        const decoder = new TextDecoder();
        return decoder.decode(decryptedData);
    } catch (error) {
        console.error('Error decrypting password:', error);
        // Fallback to simple decoding
        return decodePassword(encryptedPassword);
    }
}

/**
 * Generate encryption key from environment variable
 */
async function getEncryptionKey(): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = encoder.encode(ENCRYPTION_KEY);

    // Hash the key material to get a proper 256-bit key
    const keyHash = await crypto.subtle.digest('SHA-256', keyMaterial);

    return crypto.subtle.importKey(
        'raw',
        keyHash,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt']
    );
}

/**
 * Mask password for display (show only first and last characters)
 */
export function maskPassword(password: string): string {
    if (!password || password.length <= 2) {
        return '••••••••';
    }

    const firstChar = password[0];
    const lastChar = password[password.length - 1];
    const middleLength = Math.min(password.length - 2, 8);
    const middle = '•'.repeat(middleLength);

    return `${firstChar}${middle}${lastChar}`;
}
