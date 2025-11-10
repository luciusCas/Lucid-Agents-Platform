import React, { useEffect, useRef, useState } from 'react';
import { X, Copy, Download, Loader } from 'lucide-react';
import { useTerminalSocket } from '../hooks/useTerminalSocket';

interface TerminalLine {
    id: string;
    text: string;
    type: 'info' | 'success' | 'error' | 'warning' | 'output';
    timestamp: Date;
}

interface TerminalOutputProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    agentName?: string;
}

export const TerminalOutput: React.FC<TerminalOutputProps> = ({
    isOpen,
    onClose,
    title = 'Terminal Output',
    agentName
}) => {
    const scrollEndRef = useRef<HTMLDivElement>(null);
    const lineCountRef = useRef(0);
    const { isConnected, messages } = useTerminalSocket(isOpen, agentName);
    const [displayLines, setDisplayLines] = useState<TerminalLine[]>([]);

    // Convert hook messages to display lines
    useEffect(() => {
        const lines = messages.map((msg, idx) => ({
            id: `line-${lineCountRef.current + idx}`,
            text: msg.message,
            type: msg.type as TerminalLine['type'],
            timestamp: msg.timestamp
        }));
        setDisplayLines(lines);
        lineCountRef.current += messages.length;
    }, [messages]);

    // Auto-scroll to bottom
    useEffect(() => {
        scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [displayLines]);

    const copyToClipboard = () => {
        const text = displayLines.map((l) => l.text).join('\n');
        navigator.clipboard.writeText(text);
    };

    const downloadLog = () => {
        const text = displayLines.map((l) => {
            const time = l.timestamp.toISOString();
            return `[${time}] [${l.type}] ${l.text}`;
        }).join('\n');

        const element = document.createElement('a');
        element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(text)}`);
        element.setAttribute('download', `terminal-${Date.now()}.log`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    };

    const clearTerminal = () => {
        setDisplayLines([]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center">
            <div className="bg-gray-900 rounded-lg shadow-2xl w-11/12 h-3/4 max-w-4xl flex flex-col border border-gray-700">
                {/* Header */}
                <div className="bg-gray-800 px-6 py-4 border-b border-gray-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                        <h2 className="text-white font-mono text-lg">
                            {title}
                            {agentName && ` - ${agentName}`}
                            {isConnected && ' [CONNECTED]'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-200 transition"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Terminal Output */}
                <div className="flex-1 bg-gray-950 overflow-auto font-mono text-sm p-4 space-y-1">
                    {displayLines.length === 0 ? (
                        <div className="text-gray-500 text-center py-20">
                            Waiting for output...
                        </div>
                    ) : (
                        displayLines.map((line) => (
                            <div
                                key={line.id}
                                className={`font-mono text-sm flex gap-2 ${line.type === 'error'
                                        ? 'text-red-400'
                                        : line.type === 'success'
                                            ? 'text-green-400'
                                            : line.type === 'warning'
                                                ? 'text-yellow-400'
                                                : line.type === 'info'
                                                    ? 'text-blue-400'
                                                    : 'text-gray-300'
                                    }`}
                            >
                                <span className="text-gray-600">[{line.timestamp.toLocaleTimeString()}]</span>
                                <span className="flex-1 break-words">{line.text}</span>
                            </div>
                        ))
                    )}
                    <div ref={scrollEndRef} />
                </div>

                {/* Footer with Controls */}
                <div className="bg-gray-800 px-6 py-3 border-t border-gray-700 flex items-center justify-between">
                    <div className="flex gap-2">
                        <button
                            onClick={copyToClipboard}
                            disabled={displayLines.length === 0}
                            className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <Copy size={16} /> Copy
                        </button>
                        <button
                            onClick={downloadLog}
                            disabled={displayLines.length === 0}
                            className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <Download size={16} /> Download
                        </button>
                        <button
                            onClick={clearTerminal}
                            className="px-3 py-1 bg-red-900 hover:bg-red-800 text-red-200 rounded text-sm transition"
                        >
                            Clear
                        </button>
                    </div>
                    <div className="text-gray-400 text-xs">
                        Lines: {displayLines.length}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TerminalOutput;
