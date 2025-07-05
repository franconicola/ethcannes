// Cloudflare Workers entry point - uses modular handler
import { handleRequest } from './handler.js';

// Export for Cloudflare Workers
export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  },
}; 