// Wallet provider types
export interface WalletProvider {
    name: string
    icon: string
    id: string
    installed: boolean
}

export interface WalletConnection {
    address: string
    provider: string
    chainId?: number
    isConnected: boolean
}

export interface ChainConfig {
    chainId: string
    chainName: string
    rpcUrls: string[]
    blockExplorerUrls?: string[]
    nativeCurrency: {
        name: string
        symbol: string
        decimals: number
    }
}

// Ethereum provider type (for window.ethereum)
export interface EthereumProvider {
    isMetaMask?: boolean
    isCoinbaseWallet?: boolean
    isBraveWallet?: boolean
    request: (args: any) => Promise<any>
    on?: (event: string, callback: (...args: any[]) => void) => void
    removeListener?: (event: string, callback: (...args: any[]) => void) => void
}

// Phantom provider type
export interface PhantomProvider {
    isPhantom?: boolean
    connect: () => Promise<{ publicKey: any }>
    disconnect: () => Promise<void>
    request?: (args: any) => Promise<any>
}

// Payment transaction type
export interface PaymentTransaction {
    agent_id: string
    from_address: string
    to_address: string
    amount: number
    asset: string
    network: string
    transaction_hash: string
    resource: string
    description: string
}

// Agent deployment type
export interface AgentDeployment {
    agent_id: string
    wallet_address: string
    owner_address: string
    network: string
    status: 'pending' | 'active' | 'failed'
    created_at: string
    transaction_hash?: string
}

// Wallet selector callback type
export type WalletSelectCallback = (address: string, provider: string) => void
