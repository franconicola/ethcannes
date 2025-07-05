// Session management service
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

// Anonymous session interface
interface AnonymousSessionData {
  id: string;
  sessionIdentifier: string;
  freeMessagesUsed: number;
  canUseFreeMessages: boolean;
  createdAt: Date;
  lastUsed: Date;
  ipAddress?: string;
  userAgent?: string;
}

// Create or get existing anonymous session
export async function getOrCreateAnonymousSession(
  sessionIdentifier: string | undefined, 
  prisma: PrismaClient
): Promise<AnonymousSessionData | null> {
  try {
    // If no session identifier provided, return null
    if (!sessionIdentifier) {
      return null;
    }

    // Try to find existing session
    let anonymousSession = await prisma.anonymousSession.findUnique({
      where: { sessionIdentifier }
    });

    // If session doesn't exist, create a new one
    if (!anonymousSession) {
      anonymousSession = await prisma.anonymousSession.create({
        data: {
          sessionIdentifier,
          freeMessagesUsed: 0,
          createdAt: new Date(),
          lastUsed: new Date(),
        }
      });
    } else {
      // Update last used timestamp
      anonymousSession = await prisma.anonymousSession.update({
        where: { id: anonymousSession.id },
        data: { lastUsed: new Date() }
      });
    }

    // Check if user can still use free messages (limit: 10 per session)
    const canUseFreeMessages = anonymousSession.freeMessagesUsed < 10;

    return {
      id: anonymousSession.id,
      sessionIdentifier: anonymousSession.sessionIdentifier,
      freeMessagesUsed: anonymousSession.freeMessagesUsed,
      canUseFreeMessages,
      createdAt: anonymousSession.createdAt,
      lastUsed: anonymousSession.lastUsed,
      ipAddress: anonymousSession.ipAddress,
      userAgent: anonymousSession.userAgent,
    };
  } catch (error) {
    console.error('Error managing anonymous session:', error);
    return null;
  }
}

// Update free message usage for anonymous session
export async function updateAnonymousSessionUsage(
  sessionId: string, 
  messagesUsed: number, 
  prisma: PrismaClient
): Promise<boolean> {
  try {
    await prisma.anonymousSession.update({
      where: { id: sessionId },
      data: {
        freeMessagesUsed: { increment: messagesUsed },
        lastUsed: new Date()
      }
    });
    return true;
  } catch (error) {
    console.error('Error updating anonymous session usage:', error);
    return false;
  }
}

// Clean up inactive sessions (older than specified duration)
export async function cleanupInactiveSessions(
  prisma: PrismaClient, 
  inactiveAfterMinutes: number = 60
): Promise<number> {
  try {
    const cutoffTime = new Date(Date.now() - inactiveAfterMinutes * 60 * 1000);
    
    // Clean up anonymous sessions
    const deletedAnonymousSessions = await prisma.anonymousSession.deleteMany({
      where: {
        lastUsed: { lt: cutoffTime }
      }
    });

    // Clean up agent sessions that are still active but haven't been used
    const endedSessions = await prisma.agentSession.updateMany({
      where: {
        status: 'ACTIVE',
        lastUsed: { lt: cutoffTime }
      },
      data: {
        status: 'ENDED',
        endedAt: new Date()
      }
    });

    console.log(`🧹 Cleanup completed: ${deletedAnonymousSessions.count} anonymous sessions deleted, ${endedSessions.count} agent sessions ended`);
    
    return deletedAnonymousSessions.count + endedSessions.count;
  } catch (error) {
    console.error('Error during session cleanup:', error);
    return 0;
  }
}

// Generate secure session identifier
export function generateSessionIdentifier(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Validate session identifier format
export function isValidSessionIdentifier(identifier: string): boolean {
  return typeof identifier === 'string' && 
         identifier.length === 64 && 
         /^[a-f0-9]+$/.test(identifier);
}

// Get session statistics
export async function getSessionStatistics(
  prisma: PrismaClient
): Promise<{
  totalAnonymousSessions: number;
  activeAgentSessions: number;
  totalAgentSessions: number;
  averageSessionDuration: number;
}> {
  try {
    const [
      totalAnonymousSessions,
      activeAgentSessions,
      totalAgentSessions,
      sessionDurations
    ] = await Promise.all([
      prisma.anonymousSession.count(),
      prisma.agentSession.count({ where: { status: 'ACTIVE' } }),
      prisma.agentSession.count(),
      prisma.agentSession.findMany({
        where: { 
          status: 'ENDED',
          duration: { not: null }
        },
        select: { duration: true }
      })
    ]);

    const averageSessionDuration = sessionDurations.length > 0
      ? sessionDurations.reduce((sum, session) => sum + (session.duration || 0), 0) / sessionDurations.length
      : 0;

    return {
      totalAnonymousSessions,
      activeAgentSessions,
      totalAgentSessions,
      averageSessionDuration
    };
  } catch (error) {
    console.error('Error getting session statistics:', error);
    return {
      totalAnonymousSessions: 0,
      activeAgentSessions: 0,
      totalAgentSessions: 0,
      averageSessionDuration: 0
    };
  }
}

// Check if session is rate limited
export function isSessionRateLimited(
  sessionData: AnonymousSessionData,
  requestsPerMinute: number = 10
): boolean {
  // Simple rate limiting based on free messages used
  // In a production app, you'd implement more sophisticated rate limiting
  return sessionData.freeMessagesUsed >= requestsPerMinute;
}

// Get remaining free messages for session
export function getRemainingFreeMessages(
  sessionData: AnonymousSessionData,
  maxFreeMessages: number = 10
): number {
  return Math.max(0, maxFreeMessages - sessionData.freeMessagesUsed);
} 