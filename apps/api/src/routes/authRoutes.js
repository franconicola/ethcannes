import { corsHeaders } from '../utils/cors.js';

// GET /auth/me - Basic auth endpoint
export async function getAuthMe(request, env, authInfo, anonymousSession, prisma) {
  return new Response(JSON.stringify({
    success: authInfo.isAuthenticated,
    user: authInfo.user,
    isAuthenticated: authInfo.isAuthenticated,
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
} 