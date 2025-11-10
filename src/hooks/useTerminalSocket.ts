import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface TerminalMessage {
    type: 'log' | 'error' | 'success' | 'warning' | 'info';
    message: string;
    timestamp: Date;
}

export const useTerminalSocket = (shouldConnect: boolean, agentName?: string) => {
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<TerminalMessage[]>([]);
    const socketRef = useRef<Socket | null>(null);

    const addMessage = useCallback((type: TerminalMessage['type'], message: string) => {
        setMessages((prev) => [
            ...prev,
            {
                type,
                message,
                timestamp: new Date(),
            },
        ]);
    }, []);

    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    useEffect(() => {
        if (!shouldConnect) return;

        const connectSocket = () => {
            try {
                const socketUrl = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001`;

                socketRef.current = io(socketUrl, {
                    reconnection: true,
                    reconnectionDelay: 1000,
                    reconnectionDelayMax: 5000,
                    reconnectionAttempts: 5
                });

                socketRef.current.on('connect', () => {
                    setIsConnected(true);
                    addMessage('info', '✓ Connected to server');
                });

                // Listen for both 'agent-output' and 'terminal-output' for compatibility
                socketRef.current.on('agent-output', (data: { type: string; message: string; agentName?: string }) => {
                    try {
                        if (agentName && data.agentName !== agentName) return;

                        if (data.type === 'output') {
                            addMessage('log', data.message);
                        } else if (data.type === 'error') {
                            addMessage('error', `❌ ${data.message}`);
                        } else if (data.type === 'success') {
                            addMessage('success', `✓ ${data.message}`);
                        } else if (data.type === 'warning') {
                            addMessage('warning', `⚠ ${data.message}`);
                        } else if (data.type === 'info') {
                            addMessage('info', `ℹ ${data.message}`);
                        }
                    } catch (e) {
                        console.error('Error processing agent output:', e);
                    }
                });

                socketRef.current.on('terminal-output', (data: { type: string; message: string; agentName?: string }) => {
                    try {
                        if (agentName && data.agentName !== agentName) return;

                        if (data.type === 'output') {
                            addMessage('log', data.message);
                        } else if (data.type === 'error') {
                            addMessage('error', `❌ ${data.message}`);
                        } else if (data.type === 'success') {
                            addMessage('success', `✓ ${data.message}`);
                        } else if (data.type === 'warning') {
                            addMessage('warning', `⚠ ${data.message}`);
                        } else if (data.type === 'info') {
                            addMessage('info', `ℹ ${data.message}`);
                        }
                    } catch (e) {
                        console.error('Error processing terminal output:', e);
                    }
                });

                socketRef.current.on('disconnect', () => {
                    setIsConnected(false);
                    addMessage('warning', 'Connection closed');
                });

                socketRef.current.on('error', (error: Error) => {
                    addMessage('error', `Connection error: ${error.message}`);
                    setIsConnected(false);
                });
            } catch (error) {
                addMessage('error', `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        };

        connectSocket();

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [shouldConnect, agentName, addMessage]);

    const sendMessage = useCallback((message: string) => {
        if (socketRef.current?.connected) {
            socketRef.current.emit('terminal-command', {
                message,
                agentName,
            });
        }
    }, [agentName]);

    return {
        isConnected,
        messages,
        addMessage,
        clearMessages,
        sendMessage,
    };
};

export default useTerminalSocket;
