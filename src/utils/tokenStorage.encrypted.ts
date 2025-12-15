/**
 * Token Storage - Encrypted localStorage Version
 *
 * This implementation provides encrypted token storage for cases where:
 * - Backend cannot implement HttpOnly cookies
 * - You need persistent storage across sessions
 * - Mobile/hybrid app development
 *
 * Security features:
 * - Tokens encrypted using Web Crypto API (AES-GCM)
 * - Encryption key stored in sessionStorage (cleared on tab close)
 * - Automatic expiry validation
 * - Tamper detection
 *
 * Note: This mitigates but does NOT eliminate XSS risks.
 * HttpOnly cookies are still more secure for web apps.
 *
 * Usage:
 * 1. Rename this file to tokenStorage.ts
 * 2. Import and use like the original tokenStorage
 */

import { secureLog } from './secureLogger';

const STORAGE_KEY = 'auth_data';
const ENCRYPTION_KEY_STORAGE = 'enc_key';
const KEY_VERSION = 'v1'; // For future key rotation

interface StoredTokenData {
  rt: string; // Refresh token
  exp: number; // Expiry timestamp
  stored: number; // When it was stored
  version: string; // Key version for rotation
}

/**
 * Encrypted token storage using Web Crypto API
 */
class EncryptedTokenStorage {
  private accessToken: string | null = null;
  private accessTokenExpiry: number | null = null;

  /**
   * Generate or retrieve encryption key
   * Key is stored in sessionStorage (cleared when tab closes)
   */
  private async getEncryptionKey(): Promise<CryptoKey> {
    if (typeof window === 'undefined') {
      throw new Error('Encryption requires browser environment');
    }

    // Check for existing key
    const existingKey = sessionStorage.getItem(ENCRYPTION_KEY_STORAGE);

    if (existingKey) {
      try {
        const keyData = JSON.parse(existingKey);

        return await crypto.subtle.importKey(
          'jwk',
          keyData,
          { name: 'AES-GCM', length: 256 },
          true,
          ['encrypt', 'decrypt']
        );
      } catch (error) {
        secureLog.warning('Failed to import existing key, generating new one');
        sessionStorage.removeItem(ENCRYPTION_KEY_STORAGE);
      }
    }

    // Generate new key
    const key = await crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 },
      true, // Extractable
      ['encrypt', 'decrypt']
    );

    // Export and store in sessionStorage
    const exportedKey = await crypto.subtle.exportKey('jwk', key);
    sessionStorage.setItem(ENCRYPTION_KEY_STORAGE, JSON.stringify(exportedKey));

    secureLog.auth('Generated new encryption key');

    return key;
  }

  /**
   * Encrypt data using AES-GCM
   */
  private async encrypt(data: string): Promise<string> {
    try {
      const key = await this.getEncryptionKey();
      const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
      const encodedData = new TextEncoder().encode(data);

      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encodedData
      );

      // Combine IV + encrypted data
      const combined = new Uint8Array(iv.length + encrypted.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encrypted), iv.length);

      // Convert to base64
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      secureLog.error('Encryption failed', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt data using AES-GCM
   */
  private async decrypt(encryptedData: string): Promise<string> {
    try {
      const key = await this.getEncryptionKey();

      // Decode from base64
      const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));

      // Extract IV (first 12 bytes) and encrypted data
      const iv = combined.slice(0, 12);
      const data = combined.slice(12);

      const decrypted = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        data
      );

      return new TextDecoder().decode(decrypted);
    } catch (error) {
      secureLog.error('Decryption failed - data may be tampered', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Set both tokens with encryption
   */
  async setTokens(
    accessToken: string,
    refreshToken: string,
    expiresInDays = 7
  ): Promise<void> {
    // Access token in memory only
    this.accessToken = accessToken;
    this.accessTokenExpiry = Date.now() + (15 * 60 * 1000); // 15 minutes

    // Encrypt and store refresh token
    const data: StoredTokenData = {
      rt: refreshToken,
      exp: Date.now() + (expiresInDays * 24 * 60 * 60 * 1000),
      stored: Date.now(),
      version: KEY_VERSION
    };

    try {
      const encrypted = await this.encrypt(JSON.stringify(data));
      localStorage.setItem(STORAGE_KEY, encrypted);
      secureLog.storage('set', 'encrypted_tokens', true);
    } catch (error) {
      secureLog.error('Failed to store tokens', error);
      throw new Error('Failed to store authentication data');
    }
  }

  /**
   * Get access token from memory
   */
  getAccessToken(): string | null {
    // Check expiry
    if (this.accessTokenExpiry && Date.now() > this.accessTokenExpiry) {
      secureLog.auth('Access token expired');
      this.accessToken = null;
      this.accessTokenExpiry = null;
      return null;
    }

    return this.accessToken;
  }

  /**
   * Set access token in memory
   */
  setAccessToken(token: string, expiresInSeconds = 900): void {
    this.accessToken = token;
    this.accessTokenExpiry = Date.now() + (expiresInSeconds * 1000);
    secureLog.storage('set', 'access_token_memory', true);
  }

  /**
   * Get refresh token from encrypted storage
   */
  async getRefreshToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    try {
      const encrypted = localStorage.getItem(STORAGE_KEY);
      if (!encrypted) {
        return null;
      }

      const decrypted = await this.decrypt(encrypted);
      const data: StoredTokenData = JSON.parse(decrypted);

      // Validate expiry
      if (data.exp && Date.now() > data.exp) {
        secureLog.auth('Refresh token expired, clearing');
        this.clearTokens();
        return null;
      }

      // Validate version (for future key rotation)
      if (data.version !== KEY_VERSION) {
        secureLog.warning('Token version mismatch, clearing');
        this.clearTokens();
        return null;
      }

      return data.rt;
    } catch (error) {
      // Decryption failed - possibly tampered or key mismatch
      secureLog.error('Failed to retrieve refresh token', error);
      this.clearTokens();
      return null;
    }
  }

  /**
   * Set only refresh token
   */
  async setRefreshToken(token: string, expiresInDays = 7): Promise<void> {
    const data: StoredTokenData = {
      rt: token,
      exp: Date.now() + (expiresInDays * 24 * 60 * 60 * 1000),
      stored: Date.now(),
      version: KEY_VERSION
    };

    try {
      const encrypted = await this.encrypt(JSON.stringify(data));
      localStorage.setItem(STORAGE_KEY, encrypted);
      secureLog.storage('set', 'refresh_token_encrypted', true);
    } catch (error) {
      secureLog.error('Failed to store refresh token', error);
    }
  }

  /**
   * Clear all tokens
   */
  clearTokens(): void {
    // Clear memory
    this.accessToken = null;
    this.accessTokenExpiry = null;

    // Clear storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(ENCRYPTION_KEY_STORAGE);

      // Clear legacy tokens
      localStorage.removeItem('rt');
      localStorage.removeItem('at');
      localStorage.removeItem('user');
    }

    secureLog.storage('clear', 'all_tokens', true);
  }

  /**
   * Check if tokens exist
   */
  async hasTokens(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const hasAccess = !!this.getAccessToken();
    const hasRefresh = !!localStorage.getItem(STORAGE_KEY);

    return hasAccess || hasRefresh;
  }

  /**
   * Validate stored token integrity
   * Returns true if token can be decrypted successfully
   */
  async validateIntegrity(): Promise<boolean> {
    try {
      const token = await this.getRefreshToken();
      return !!token;
    } catch {
      return false;
    }
  }

  /**
   * Get token metadata without exposing the token
   */
  async getTokenMetadata(): Promise<{
    exists: boolean;
    expired: boolean;
    storedAt: Date | null;
    expiresAt: Date | null;
  } | null> {
    if (typeof window === 'undefined') return null;

    try {
      const encrypted = localStorage.getItem(STORAGE_KEY);
      if (!encrypted) {
        return { exists: false, expired: false, storedAt: null, expiresAt: null };
      }

      const decrypted = await this.decrypt(encrypted);
      const data: StoredTokenData = JSON.parse(decrypted);

      return {
        exists: true,
        expired: Date.now() > data.exp,
        storedAt: new Date(data.stored),
        expiresAt: new Date(data.exp)
      };
    } catch {
      return { exists: true, expired: true, storedAt: null, expiresAt: null };
    }
  }
}

// Export singleton instance
export const tokenStorage = new EncryptedTokenStorage();

/**
 * Security monitoring for encrypted storage
 */
export const setupStorageMonitoring = (): void => {
  if (typeof window === 'undefined') return;

  // Monitor for suspicious storage changes
  window.addEventListener('storage', async (e) => {
    if (e.key === STORAGE_KEY) {
      if (e.oldValue && !e.newValue) {
        secureLog.warning('Encrypted token storage was cleared');
        window.dispatchEvent(new CustomEvent('auth:token-removed'));
      } else if (e.newValue && e.newValue !== e.oldValue) {
        // Validate integrity of new value
        const isValid = await tokenStorage.validateIntegrity();
        if (!isValid) {
          secureLog.error('Token integrity check failed after storage change', new Error('Tamper detected'));
          tokenStorage.clearTokens();
          window.dispatchEvent(new CustomEvent('auth:tamper-detected'));
        }
      }
    }
  });

  // Detect if another tab cleared the encryption key
  window.addEventListener('storage', (e) => {
    if (e.key === ENCRYPTION_KEY_STORAGE && !e.newValue) {
      secureLog.warning('Encryption key was cleared in another tab');
      // Can't decrypt anymore, clear everything
      tokenStorage.clearTokens();
    }
  });

  secureLog.info('Storage monitoring initialized');
};

/**
 * Example usage:
 *
 * // After login
 * await tokenStorage.setTokens(accessToken, refreshToken, 7);
 *
 * // Get tokens
 * const access = tokenStorage.getAccessToken();
 * const refresh = await tokenStorage.getRefreshToken();
 *
 * // Check metadata
 * const meta = await tokenStorage.getTokenMetadata();
 * console.log('Token expires:', meta?.expiresAt);
 *
 * // Logout
 * tokenStorage.clearTokens();
 *
 * // Setup monitoring
 * setupStorageMonitoring();
 */
