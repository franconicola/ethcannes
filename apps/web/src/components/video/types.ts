import type { AIAgentSession } from '@/contexts/SessionContext'
import type { Avatar } from '../avatar/types'

export type Session = AIAgentSession

export interface VideoSectionProps {
    session: Session
    avatars: Avatar[]
    wsConnected: boolean
    speaking: boolean
    loading: boolean
    onCloseSession: () => void
  }