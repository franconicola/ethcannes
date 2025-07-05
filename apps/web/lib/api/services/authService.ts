// Authentication service
import { AuthInfo, EnvVars } from '../types';

// Handle the Privy import issue gracefully
let PrivyClient: any = null;
try {
  const { PrivyClient: PrivyClientClass } = require('@privy-io/server-auth');
  PrivyClient = PrivyClientClass;
} catch (error) {
  console.warn('Failed to import PrivyClient:', error);
}

// Create Privy client instance
function createPrivyClient(env: EnvVars): any {
  if (!PrivyClient) {
    throw new Error('PrivyClient not available due to dependency issues');
  }
  return new PrivyClient(env.PRIVY_APP_ID, env.PRIVY_APP_SECRET);
}

// Validate Privy token and return user info
export async function validatePrivyToken(
  authHeader: string | undefined, 
  env: EnvVars
): Promise<AuthInfo> {
  // If Privy is not available, return unauthenticated
  if (!PrivyClient) {
    console.warn('Privy authentication unavailable, returning unauthenticated');
    return { isAuthenticated: false };
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { isAuthenticated: false };
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const privyClient = createPrivyClient(env);
    
    // Verify the token with Privy (returns claims if valid, throws if invalid)
    const claims = await privyClient.verifyAuthToken(token);
    
    // Get user info from Privy
    const privyUser = await privyClient.getUser(claims.userId);
    
    // Return structured user info
    return {
      isAuthenticated: true,
      user: {
        id: privyUser.id,
        privyUserId: privyUser.id,
        email: privyUser.email?.address,
        displayName: privyUser.email?.address || privyUser.wallet?.address,
        walletAddress: privyUser.wallet?.address,
      }
    };
  } catch (error) {
    console.error('Token validation error:', error);
    return { isAuthenticated: false };
  }
}

// Extract user ID from token without full validation (for performance)
export function extractUserIdFromToken(token: string): string | null {
  try {
    // This is a simplified implementation
    // In production, you might want to decode the JWT properly
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    return payload.sub || payload.userId || null;
  } catch (error) {
    console.error('Token parsing error:', error);
    return null;
  }
}

// Check if user has required permissions
export function hasPermission(
  authInfo: AuthInfo, 
  requiredPermission: string
): boolean {
  if (!authInfo.isAuthenticated || !authInfo.user) {
    return false;
  }
  
  // Add your permission logic here
  // For now, all authenticated users have all permissions
  return true;
}

// Get user subscription tier
export function getUserSubscriptionTier(authInfo: AuthInfo): 'FREE' | 'PREMIUM' | 'ENTERPRISE' {
  if (!authInfo.isAuthenticated || !authInfo.user) {
    return 'FREE';
  }
  
  // Add your subscription logic here
  // For now, all users are on the free tier
  return 'FREE';
} 