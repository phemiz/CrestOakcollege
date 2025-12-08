import React, { useState } from 'react';
import { useTheme } from '../hooks/useTheme';

const Chatbot: React.FC = () => {
    const { theme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Array<{ text: string; isBot: boolean }>>([
        { text: 'Hello! How can I help you today?', isBot: true }
    ]);
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (!input.trim()) return;

        setMessages([...messages, { text: input, isBot: false }]);
        setInput('');

        // Simulate bot response
        setTimeout(() => {
            setMessages(prev => [...prev, {
                text: 'Thank you for your message. Our team will get back to you soon!',
                isBot: true
            }]);
        }, 1000);
    };

    return (
        <>
            {/* Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 w-14 h-14 rounded-full ${theme.button.primary.background} ${theme.button.primary.text} shadow-lg flex items-center justify-center z-50 transition-transform hover:scale-110`}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className={`fixed bottom-24 right-6 w-80 h-96 ${theme.card.background} rounded-lg shadow-xl z-50 flex flex-col`}>
                    <div className={`${theme.button.primary.background} ${theme.button.primary.text} p-4 rounded-t-lg`}>
                        <h3 className="font-semibold">Chat with us</h3>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                                <div className={`max-w-[70%] p-3 rounded-lg ${msg.isBot ? 'bg-gray-200 text-gray-900' : `${theme.button.primary.background} ${theme.button.primary.text}`}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-4 border-t ${theme.card.border}">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type a message..."
                                className={`flex-1 px-3 py-2 rounded-lg border ${theme.card.border} ${theme.text}`}
                            />
                            <button
                                onClick={handleSend}
                                className={`px-4 py-2 rounded-lg ${theme.button.primary.background} ${theme.button.primary.text}`}
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Chatbot;
