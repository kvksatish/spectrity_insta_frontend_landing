/**
 * OAuth State Management for CSRF Protection
 *
 * Generates and validates state parameters for OAuth flows
 * to prevent Cross-Site Request Forgery (CSRF) attacks.
 */

const OAUTH_STATE_KEY = "oauth_state";
const STATE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

interface OAuthState {
  state: string;
  timestamp: number;
}

/**
 * Generate a random state parameter for OAuth flow
 */
export const generateOAuthState = (): string => {
  // Generate cryptographically secure random string
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
};

/**
 * Store OAuth state in sessionStorage with timestamp
 */
export const storeOAuthState = (state: string): void => {
  const stateData: OAuthState = {
    state,
    timestamp: Date.now(),
  };
  sessionStorage.setItem(OAUTH_STATE_KEY, JSON.stringify(stateData));
};

/**
 * Validate and consume OAuth state from sessionStorage
 * Returns true if state is valid, false otherwise
 * Clears state after validation attempt
 */
export const validateAndConsumeOAuthState = (
  receivedState?: string | null,
): boolean => {
  try {
    const storedData = sessionStorage.getItem(OAUTH_STATE_KEY);

    // Always clear state after validation attempt
    sessionStorage.removeItem(OAUTH_STATE_KEY);

    if (!storedData) {
      console.error("OAuth state validation failed: No stored state found");
      return false;
    }

    const stateData: OAuthState = JSON.parse(storedData);

    // Check if state has expired
    if (Date.now() - stateData.timestamp > STATE_EXPIRY_MS) {
      console.error("OAuth state validation failed: State has expired");
      return false;
    }

    // NOTE: Currently, the backend doesn't return the state parameter in the callback.
    // Until the backend is updated to include state in the callback URL,
    // we can only validate that a state was generated (indicating OAuth was initiated from our site).
    // For full CSRF protection, the backend must:
    // 1. Accept a state parameter when generating OAuth URL
    // 2. Include that state in the OAuth redirect
    // 3. Return it in the callback URL for frontend validation

    // If backend provides state, validate it matches
    if (receivedState !== undefined && receivedState !== null) {
      if (receivedState !== stateData.state) {
        console.error("OAuth state validation failed: State mismatch");
        return false;
      }
    }

    // State is valid (or at least we know OAuth was initiated from our site)
    return true;
  } catch (error) {
    console.error("OAuth state validation failed:", error);
    sessionStorage.removeItem(OAUTH_STATE_KEY);
    return false;
  }
};

/**
 * Clear OAuth state from sessionStorage
 */
export const clearOAuthState = (): void => {
  sessionStorage.removeItem(OAUTH_STATE_KEY);
};
