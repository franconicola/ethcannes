import { ConnectionState, Room, RoomEvent, Track, VideoTrack } from 'livekit-client'
import { useCallback, useEffect, useRef, useState } from 'react'

interface UseLiveKitProps {
  wsUrl: string
  token: string
  onConnected?: () => void
  onDisconnected?: () => void
  onError?: (error: Error) => void
}

export function useLiveKit({ wsUrl, token, onConnected, onDisconnected, onError }: UseLiveKitProps) {
  const [room, setRoom] = useState<Room | null>(null)
  const [videoTrack, setVideoTrack] = useState<VideoTrack | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>(ConnectionState.Disconnected)
  const [isConnecting, setIsConnecting] = useState(false)
  const roomRef = useRef<Room | null>(null)
  const isConnectingRef = useRef(false)
  const abortControllerRef = useRef<AbortController | null>(null)
  const mountedRef = useRef(true)
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const disconnect = useCallback(() => {
    // Only disconnect if we have an active room or connection attempt
    if (!roomRef.current && !isConnectingRef.current) {
      return
    }

    console.log('abort connection attempt', {
      room: roomRef.current?.name || '',
      roomID: undefined,
      participant: roomRef.current?.localParticipant?.identity || '',
      pID: roomRef.current?.localParticipant?.sid || ''
    });

    // Abort any ongoing connection attempt
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    // Clear any connection timeout
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current)
      connectionTimeoutRef.current = null
    }

    if (roomRef.current) {
      try {
        roomRef.current.disconnect()
      } catch (error) {
        console.warn('Error during room disconnect:', error)
      }
      roomRef.current = null
    }
    
    setRoom(null)
    setVideoTrack(null)
    setConnectionState(ConnectionState.Disconnected)
    setIsConnecting(false)
    isConnectingRef.current = false
  }, [])

  const connect = useCallback(async () => {
    // Prevent multiple simultaneous connections
    if (isConnectingRef.current || roomRef.current?.state === ConnectionState.Connected) {
      return
    }

    // Don't connect if component is unmounted
    if (!mountedRef.current) {
      return
    }

    try {
      setIsConnecting(true)
      isConnectingRef.current = true
      
      // Create abort controller for this connection attempt
      abortControllerRef.current = new AbortController()
      const { signal } = abortControllerRef.current
      
      // Clean up any existing room
      if (roomRef.current) {
        roomRef.current.disconnect()
      }

      // Check if aborted before proceeding
      if (signal.aborted || !mountedRef.current) {
        return
      }

      // Create new room
      const newRoom = new Room()
      roomRef.current = newRoom

      // Set up event listeners
      newRoom.on(RoomEvent.Connected, () => {
        if (!mountedRef.current) return
        console.log('LiveKit: Connected to room')
        setConnectionState(ConnectionState.Connected)
        onConnected?.()
      })

      newRoom.on(RoomEvent.Disconnected, () => {
        if (!mountedRef.current) return
        console.log('LiveKit: Disconnected from room')
        setConnectionState(ConnectionState.Disconnected)
        onDisconnected?.()
      })

      newRoom.on(RoomEvent.Reconnecting, () => {
        if (!mountedRef.current) return
        console.log('LiveKit: Reconnecting...')
        setConnectionState(ConnectionState.Reconnecting)
      })

      newRoom.on(RoomEvent.Reconnected, () => {
        if (!mountedRef.current) return
        console.log('LiveKit: Reconnected to room')
        setConnectionState(ConnectionState.Connected)
      })

      newRoom.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        if (!mountedRef.current) return
        console.log(`LiveKit: Track subscribed - ${track.kind} from ${participant.identity}`)
        
        if (track.kind === Track.Kind.Video) {
          setVideoTrack(track as VideoTrack)
        }
      })

      newRoom.on(RoomEvent.TrackUnsubscribed, (track, publication, participant) => {
        if (!mountedRef.current) return
        console.log(`LiveKit: Track unsubscribed - ${track.kind} from ${participant.identity}`)
        
        if (track.kind === Track.Kind.Video) {
          setVideoTrack(prev => prev === track ? null : prev)
        }
      })

      newRoom.on(RoomEvent.ConnectionQualityChanged, (quality, participant) => {
        if (!mountedRef.current) return
        console.log(`LiveKit: Connection quality changed to ${quality} for ${participant?.identity || 'local'}`)
      })

      // Check if aborted before connecting
      if (signal.aborted || !mountedRef.current) {
        newRoom.disconnect()
        return
      }

      // Set a timeout to prevent hanging connections
      connectionTimeoutRef.current = setTimeout(() => {
        if (isConnectingRef.current && mountedRef.current) {
          console.warn('LiveKit: Connection timeout, aborting')
          disconnect()
        }
      }, 10000) // 10 second timeout

      // Connect to room
      await newRoom.connect(wsUrl, token)
      
      // Clear timeout on successful connection
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current)
        connectionTimeoutRef.current = null
      }
      
      // Check if aborted after connecting
      if (signal.aborted || !mountedRef.current) {
        newRoom.disconnect()
        return
      }
      
      setRoom(newRoom)
      
    } catch (error) {
      if (!mountedRef.current) return
      console.error('LiveKit: Failed to connect', error)
      setConnectionState(ConnectionState.Disconnected)
      onError?.(error as Error)
      
      // Clear timeout on error
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current)
        connectionTimeoutRef.current = null
      }
      
      // Clean up on error
      if (roomRef.current) {
        roomRef.current.disconnect()
        roomRef.current = null
      }
    } finally {
      if (mountedRef.current) {
        setIsConnecting(false)
        isConnectingRef.current = false
      }
    }
  }, [wsUrl, token, onConnected, onDisconnected, onError, disconnect])

  // Auto-connect when props change, with a delay to handle React strict mode
  useEffect(() => {
    mountedRef.current = true
    
    if (wsUrl && token) {
      // Small delay to handle React strict mode double-mounting
      const timeoutId = setTimeout(() => {
        if (mountedRef.current) {
          connect()
        }
      }, 100)

      return () => {
        clearTimeout(timeoutId)
      }
    }
  }, [wsUrl, token, connect])

  // Cleanup effect
  useEffect(() => {
    return () => {
      mountedRef.current = false
      
      // Only disconnect if we have an active connection
      if (roomRef.current || isConnectingRef.current) {
        disconnect()
      }
    }
  }, [disconnect])

  return {
    room,
    videoTrack,
    connectionState,
    isConnecting,
    connect,
    disconnect,
    isConnected: connectionState === ConnectionState.Connected,
    isReconnecting: connectionState === ConnectionState.Reconnecting,
  }
} 