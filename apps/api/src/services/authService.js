// Authentication service
export async function validatePrivyToken(authHeader, env) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { isAuthenticated: false, user: null };
  }

  const token = authHeader.substring(7);
  
  try {
    // Validate with Privy API
    const response = await fetch('https://auth.privy.io/api/v1/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'privy-app-id': env.PRIVY_APP_ID,
      },
    });

    if (!response.ok) {
      return { isAuthenticated: false, user: null };
    }

    const privyUser = await response.json();
    return { isAuthenticated: true, user: privyUser };
  } catch (error) {
    console.error('Auth validation error:', error);
    return { isAuthenticated: false, user: null };
  }
} 