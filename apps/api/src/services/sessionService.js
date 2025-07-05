import { createError } from '../utils/errors.js';

// Anonymous session management
export async function getOrCreateAnonymousSession(sessionId, prisma) {
  if (!sessionId) {
    // Create new anonymous session
    const newSession = await prisma.anonymousSession.create({
      data: {
        sessionIdentifier: `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        freeMessagesUsed: 0,
      },
    });
    
    return {
      id: newSession.id,
      sessionIdentifier: newSession.sessionIdentifier,
      freeMessagesUsed: newSession.freeMessagesUsed,
      canUseFreeMessages: newSession.freeMessagesUsed < 5,
    };
  }

  // Find existing session
  const existingSession = await prisma.anonymousSession.findUnique({
    where: { id: sessionId },
  });

  if (existingSession) {
    return {
      id: existingSession.id,
      sessionIdentifier: existingSession.sessionIdentifier,
      freeMessagesUsed: existingSession.freeMessagesUsed,
      canUseFreeMessages: existingSession.freeMessagesUsed < 5,
    };
  }

  // Session not found, create new one
  const newSession = await prisma.anonymousSession.create({
    data: {
      sessionIdentifier: `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      freeMessagesUsed: 0,
    },
  });
  
  return {
    id: newSession.id,
    sessionIdentifier: newSession.sessionIdentifier,
    freeMessagesUsed: newSession.freeMessagesUsed,
    canUseFreeMessages: newSession.freeMessagesUsed < 5,
  };
}

// Increment free message usage
export async function incrementFreeMessageUsage(anonymousSessionId, prisma) {
  await prisma.anonymousSession.update({
    where: { id: anonymousSessionId },
    data: { freeMessagesUsed: { increment: 1 } },
  });
}

// Check usage limits
export async function checkUsageLimits(authInfo, anonymousSession, prisma) {
  if (authInfo.isAuthenticated && authInfo.user) {
    // Check subscription limits for authenticated users
    if (authInfo.user.subscriptionTier === 'FREE') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const todaySessionsCount = await prisma.avatarSession.count({
        where: {
          userId: authInfo.user.id,
          createdAt: {
            gte: today
          }
        }
      });

      if (todaySessionsCount >= 5) {
        throw createError('Daily session limit reached. Upgrade to Premium for unlimited sessions.', 429, 'LIMIT_REACHED');
      }
    }
  } else if (anonymousSession) {
    // Check free message limits for anonymous users
    if (!anonymousSession.canUseFreeMessages) {
      throw createError('Free session limit exceeded. Please log in to continue.', 403, 'FREE_LIMIT_EXCEEDED');
    }
  } else {
    throw createError('Session access denied', 403, 'ACCESS_DENIED');
  }
}

// Auto-cleanup inactive sessions (10 minute timeout)
export async function cleanupInactiveSessions(prisma, env) {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
    
    // Find sessions that haven't been used in the last 10 minutes
    const inactiveSessions = await prisma.avatarSession.findMany({
      where: {
        status: 'ACTIVE',
        lastUsed: {
          lt: tenMinutesAgo
        }
      }
    });

    console.log(`🧹 Found ${inactiveSessions.length} inactive sessions to cleanup`);

    // Close each inactive session
    for (const session of inactiveSessions) {
      try {
              // Session cleanup (AI agents don't need external cleanup)
      console.log(`🔒 Cleaned up AI agent session: ${session.id}`);

        // Update database status
        await prisma.avatarSession.update({
          where: { id: session.id },
          data: {
            status: 'ENDED',
            endedAt: new Date()
          }
        });

        console.log(`✅ Cleaned up inactive session: ${session.id}`);
      } catch (error) {
        console.error(`❌ Failed to cleanup session ${session.id}:`, error.message);
        // Continue with other sessions even if one fails
      }
    }

    return inactiveSessions.length;
  } catch (error) {
    console.error('❌ Error during session cleanup:', error);
    return 0;
  }
}

// Update session last used timestamp
export async function updateSessionActivity(sessionId, prisma) {
  try {
    await prisma.avatarSession.update({
      where: { id: sessionId },
      data: { lastUsed: new Date() }
    });
  } catch (error) {
    console.error(`❌ Failed to update session activity for ${sessionId}:`, error.message);
  }
} 