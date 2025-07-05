// Universal JavaScript API entry point
// Works for both Node.js (local development) and Cloudflare Workers (production)

import { handleRequest } from './handler.js';

// Detect if we're running in Node.js environment
const isNodeJS = typeof process !== 'undefined' && process.versions && process.versions.node;

// Environment setup
const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  OPENAI_MODEL: process.env.OPENAI_MODEL,
  OPENAI_MAX_TOKENS: process.env.OPENAI_MAX_TOKENS,
  OPENAI_TEMPERATURE: process.env.OPENAI_TEMPERATURE,
  PRIVY_APP_ID: process.env.PRIVY_APP_ID,
  PRIVY_APP_SECRET: process.env.PRIVY_APP_SECRET,
};

// Start automatic session cleanup (runs every 30 seconds)
const startSessionCleanup = () => {
  setInterval(async () => {
    try {
      const { cleanupInactiveSessions } = await import('./services/sessionService.js');
      const { PrismaClient } = await import('@prisma/client');
      
      const prisma = new PrismaClient({
        datasources: { db: { url: env.DATABASE_URL } },
      });
      
      const cleanedCount = await cleanupInactiveSessions(prisma, env);
      if (cleanedCount > 0) {
        console.log(`🧹 Auto-cleanup completed: ${cleanedCount} sessions closed`);
      }
      
      await prisma.$disconnect();
    } catch (error) {
      console.error('❌ Auto-cleanup error:', error.message);
    }
  }, 30000); // Run every 30 seconds
};

// Cloudflare Workers export
export default {
  async fetch(request, env, ctx) {
    return handleRequest(request, env);
  },
};

// Node.js server setup for local development
if (isNodeJS) {
  import('http').then(({ createServer }) => {
    const port = process.env.PORT || 3001;
    
    const server = createServer(async (req, res) => {
      try {
        // Convert Node.js request to Web API Request
        const url = new URL(req.url, `http://${req.headers.host}`);
        const headers = new Headers();
        
        // Copy headers from Node.js request
        Object.entries(req.headers).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach(v => headers.append(key, v));
          } else if (value) {
            headers.set(key, value);
          }
        });
        
        // Handle request body for POST/PUT requests
        let body = null;
        if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
          const chunks = [];
          for await (const chunk of req) {
            chunks.push(chunk);
          }
          body = Buffer.concat(chunks).toString();
        }
        
        // Create Web API Request
        const request = new Request(url, {
          method: req.method,
          headers: headers,
          body: body,
        });
        
        // Call our worker handler
        const response = await handleRequest(request, env);
        
        // Convert Web API Response back to Node.js response
        res.statusCode = response.status;
        
        // Set response headers
        response.headers.forEach((value, key) => {
          res.setHeader(key, value);
        });
        
        // Send response body
        const responseText = await response.text();
        res.end(responseText);
        
      } catch (error) {
        console.error('Server error:', error);
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({
          success: false,
          error: 'Internal server error',
          message: error.message
        }));
      }
    });
    
    server.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Local URL: http://localhost:${port}`);
      
      // Start automatic session cleanup
      startSessionCleanup();
      console.log(`🧹 Auto-cleanup started: inactive sessions will be closed after 1 minute`);
    });
    
    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('🛑 Shutting down server...');
      server.close(() => {
        process.exit(0);
      });
    });
  });
} 