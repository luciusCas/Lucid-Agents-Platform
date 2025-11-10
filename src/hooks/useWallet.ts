import { useState, useCallback, useEffect } from 'react'

export interface WalletConnection {
    address: string
    provider: string
    chainId?: number
    isConnected: boolean
}

export function useWallet() {
    const [wallet, setWallet] = useState<WalletConnection>({
        address: '',
        provider: '',
        chainId: undefined,
        isConnected: false
    })
    const [error, setError] = useState('')

    // Check if wallet is already connected on mount
    useEffect(() => {
        checkExistingConnection()
    }, [])

    const checkExistingConnection = async () => {
        try {
            const ethereum = (window as any).ethereum
            if (ethereum) {
                const accounts = await ethereum.request({ method: 'eth_accounts' })
                if (accounts.length > 0) {
                    const chainId = await ethereum.request({ method: 'eth_chainId' })
                    setWallet({
                        address: accounts[0],
                        provider: 'MetaMask',
                        chainId: parseInt(chainId),
                        isConnected: true
                    })
                }
            }
        } catch (err) {
            console.error('Error checking existing connection:', err)
        }
    }

    const connectWallet = useCallback(async (address: string, provider: string) => {
        try {
            setError('')

            // Try to get chain ID
            let chainId = undefined
            try {
                const ethereum = (window as any).ethereum
                if (ethereum) {
                    const hexChainId = await ethereum.request({ method: 'eth_chainId' })
                    chainId = parseInt(hexChainId)
                }
            } catch (err) {
                console.warn('Could not get chain ID:', err)
            }

            setWallet({
                address,
                provider,
                chainId,
                isConnected: true
            })
        } catch (err: any) {
            setError(err.message || 'Failed to connect wallet')
        }
    }, [])

    const disconnectWallet = useCallback(() => {
        setWallet({
            address: '',
            provider: '',
            chainId: undefined,
            isConnected: false
        })
        setError('')
    }, [])

    const switchToBaseNetwork = useCallback(async () => {
        try {
            const ethereum = (window as any).ethereum
            if (!ethereum) throw new Error('Ethereum provider not found')

            // Base mainnet chain ID (8453 in decimal)
            const baseChainId = '0x2105'

            try {
                await ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: baseChainId }]
                })
            } catch (err: any) {
                if (err.code === 4902) {
                    // Chain not added, add it
                    await ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: baseChainId,
                                chainName: 'Base',
                                rpcUrls: ['https://mainnet.base.org'],
                                blockExplorerUrls: ['https://basescan.org'],
                                nativeCurrency: {
                                    name: 'Ether',
                                    symbol: 'ETH',
                                    decimals: 18
                                }
                            }
                        ]
                    })
                } else {
                    throw err
                }
            }

            // Update wallet chain ID
            const newChainId = parseInt(baseChainId)
            setWallet(prev => ({
                ...prev,
                chainId: newChainId
            }))
        } catch (err: any) {
            setError(err.message || 'Failed to switch network')
            throw err
        }
    }, [])

    return {
        wallet,
        error,
        connectWallet,
        disconnectWallet,
        switchToBaseNetwork,
        isConnected: wallet.isConnected,
        address: wallet.address,
        provider: wallet.provider,
        chainId: wallet.chainId
    }
}

export default useWallet
