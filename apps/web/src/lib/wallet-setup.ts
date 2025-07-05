// Wallet setup utility to handle MetaMask and other wallet extension conflicts
'use client'

interface EthereumProvider {
  isMetaMask?: boolean
  isCoinbaseWallet?: boolean
  isConnected?: boolean
  providers?: EthereumProvider[]
  on?: (event: string, handler: (...args: any[]) => void) => void
  request?: (args: { method: string; params?: any[] }) => Promise<any>
}

// Type-safe way to access window.ethereum
const getEthereum = (): EthereumProvider | undefined => {
  if (typeof window === 'undefined') return undefined
  return (window as any).ethereum
}

const setEthereum = (provider: EthereumProvider) => {
  if (typeof window === 'undefined') return
  ;(window as any).ethereum = provider
}

// Fix MetaMask "read only property" error by ensuring window.ethereum is configurable
export const setupWalletProviders = () => {
  if (typeof window === 'undefined') return

  try {
    // Check if window.ethereum exists and is read-only
    const descriptor = Object.getOwnPropertyDescriptor(window, 'ethereum')
    
    if (descriptor && !descriptor.configurable) {
      // If ethereum property is not configurable, try to make it configurable
      console.log('🔧 Fixing MetaMask ethereum property configuration...')
      
      // Store existing ethereum object
      const existingEthereum = getEthereum()
      
      // Delete the read-only property
      delete (window as any).ethereum
      
      // Redefine it as configurable
      Object.defineProperty(window, 'ethereum', {
        value: existingEthereum,
        writable: true,
        configurable: true,
        enumerable: true
      })
      
      console.log('✅ MetaMask ethereum property fixed')
    }
  } catch (error) {
    console.warn('⚠️ Could not fix MetaMask ethereum property:', error)
  }
}

// Handle multiple wallet providers gracefully
export const handleWalletProviders = () => {
  if (typeof window === 'undefined') return

  try {
    // Store all detected providers
    const providers: EthereumProvider[] = []
    const ethereum = getEthereum()
    
    // Check for multiple providers
    if (ethereum?.providers && Array.isArray(ethereum.providers)) {
      providers.push(...ethereum.providers)
    } else if (ethereum) {
      providers.push(ethereum)
    }
    
    // Log detected providers
    if (providers.length > 0) {
      console.log('🔌 Detected wallet providers:', providers.map(p => p.isMetaMask ? 'MetaMask' : p.isCoinbaseWallet ? 'Coinbase' : 'Unknown'))
    }
    
    // Ensure Privy can work with multiple providers
    if (providers.length > 1) {
      console.log('🔄 Multiple wallet providers detected, ensuring compatibility...')
      
      // Create a wrapper that exposes the first provider as default
      const primaryProvider = providers[0]
      
      // Ensure the primary provider is accessible
      if (primaryProvider && ethereum !== primaryProvider) {
        setEthereum(primaryProvider)
      }
    }
  } catch (error) {
    console.warn('⚠️ Error handling wallet providers:', error)
  }
}

// Initialize wallet setup
export const initializeWalletSetup = () => {
  if (typeof window === 'undefined') return

  try {
    // Run setup immediately
    setupWalletProviders()
    handleWalletProviders()
    
    // Also run on ethereum provider changes
    const ethereum = getEthereum()
    if (ethereum && typeof ethereum.on === 'function') {
      ethereum.on('accountsChanged', () => {
        console.log('🔄 Ethereum accounts changed, rerunning wallet setup...')
        handleWalletProviders()
      })
      
      ethereum.on('chainChanged', () => {
        console.log('🔄 Ethereum chain changed, rerunning wallet setup...')
        handleWalletProviders()
      })
    }
    
    // Listen for new providers being added
    window.addEventListener('ethereum#initialized', () => {
      console.log('🔌 New ethereum provider initialized')
      setupWalletProviders()
      handleWalletProviders()
    })
    
    console.log('✅ Wallet setup initialized successfully')
  } catch (error) {
    console.warn('⚠️ Error initializing wallet setup:', error)
  }
} 