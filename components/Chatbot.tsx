
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from '@google/genai';
import { useTheme } from '../hooks/useTheme';
import { useApi } from '../hooks/useApi';
import { Course, Department } from '../types';

interface Message {
    role: 'user' | 'model';
    text: string;
}

const Chatbot: React.FC = () => {
    const { theme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'model',
            text: "Hello! I'm the CrestOAK College AI assistant. How can I help you today? You can ask me about our courses, departments, or admission process."
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [chat, setChat] = useState<Chat | null>(null);

    const { data: departments } = useApi<Department[]>('/api/departments');
    const { data: courses } = useApi<Course[]>('/api/courses');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (departments && courses && !chat) {
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const departmentInfo = departments.map(d => `- ${d.name}: ${d.description}`).join('\n');
                const courseList = courses.map(c => `${c.code} ${c.title}`).join(', ');

                const systemInstruction = `
You are a friendly and helpful AI assistant for CrestOAK College, a college in Lagos, Nigeria.
Your goal is to answer questions from prospective students and encourage them to apply.
Use the following information to answer questions. Do not make up information. If you don't know the answer, say that you don't have that information and suggest they contact the admissions office via email at info@crestoak.edu.ng.

**About CrestOAK College:**
CrestOAK College is a leading institution in Africa, focused on Health Science, Administration, and Technology. Our mission is to provide an innovative learning environment to equip students for successful careers.

**Departments & Courses:**
We offer a range of Degree (B.Sc / B.A) and National Diploma (N.D) programs across the following faculties:
${departmentInfo}
Some of our courses include: ${courseList}. For detailed course descriptions, please refer to the Courses page on our website.

**Admissions Information:**
- The process is: 1. Submit online application. 2. Take entrance exam. 3. Receive admission offer.
- Key requirements: O'Level results (WAEC/NECO), JAMB results.
- Students can apply or check their status on the Admissions Portal page.

**Contact:**
- Email: info@crestoak.edu.ng
- Phone: +234 801 234 5678

Keep your answers concise, friendly, and professional.
`;
                const chatSession = ai.chats.create({
                    model: 'gemini-2.5-flash',
                    config: {
                        systemInstruction: systemInstruction,
                    },
                });
                setChat(chatSession);
            } catch (err) {
                console.error("Failed to initialize AI Chat:", err);
                setError("Could not start AI assistant at this time.");
            }
        }
    }, [departments, courses, chat]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    useEffect(() => {
        if (isOpen) {
            // Delay focus to allow for transition
            const timer = setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading || !chat) return;

        const userMessage: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setIsLoading(true);
        setError('');

        try {
            const result = await chat.sendMessage({ message: currentInput });
            const modelMessage: Message = { role: 'model', text: result.text };
            setMessages(prev => [...prev, modelMessage]);
        } catch (err) {
            console.error("Chat Error:", err);
            const errorMessage: Message = { role: 'model', text: "Sorry, I'm having trouble connecting right now. Please try again in a moment."};
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const ChatBubble: React.FC<{ message: Message }> = ({ message }) => {
        const isUser = message.role === 'user';
        const bubbleClasses = isUser
            ? `bg-blue-600 text-white self-end`
            : `${theme.card.background} ${theme.card.text} self-start shadow-sm`;
        
        const formattedText = message.text.split('\n').map((line, index) => (
            <React.Fragment key={index}>
                {line}
                <br />
            </React.Fragment>
        ));

        return (
            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${bubbleClasses}`}>
                <p className="text-sm" dangerouslySetInnerHTML={{ __html: message.text.replace(/\n/g, '<br />') }} />
            </div>
        );
    };

    const TypingIndicator = () => (
        <div className="flex items-center space-x-1 self-start">
            <div className={`p-3 rounded-2xl ${theme.card.background} shadow-sm`}>
                <div className="flex items-center justify-center space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 w-16 h-16 rounded-full ${theme.button.primary.background} ${theme.button.primary.hover} text-white shadow-lg flex items-center justify-center transform transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.input.focus} z-50`}
                aria-label="Toggle Chat"
                aria-expanded={isOpen}
            >
                {isOpen ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                )}
            </button>

            <div
                role="dialog"
                aria-labelledby="chat-header"
                className={`fixed bottom-24 right-6 left-6 ml-auto max-w-sm h-[70vh] max-h-[600px] flex flex-col ${theme.background} rounded-2xl shadow-2xl transition-all duration-300 ease-in-out origin-bottom-right z-50 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}
            >
                {/* Header */}
                <div className={`p-4 border-b ${theme.name === 'light' ? 'border-gray-200' : 'border-white/20'} flex-shrink-0`}>
                    <h3 id="chat-header" className={`text-lg font-bold ${theme.text}`}>CrestOAK AI Assistant</h3>
                </div>

                {/* Messages */}
                <div role="log" aria-live="polite" className="flex-grow p-4 overflow-y-auto flex flex-col space-y-4">
                    {messages.map((msg, index) => <ChatBubble key={index} message={msg} />)}
                    {isLoading && <TypingIndicator />}
                    <div ref={messagesEndRef} />
                </div>
                
                {error && <p className="p-4 text-sm text-red-500 text-center flex-shrink-0">{error}</p>}

                {/* Input */}
                <div className={`p-4 border-t ${theme.name === 'light' ? 'border-gray-200' : 'border-white/20'} flex-shrink-0`}>
                    <form onSubmit={handleSend} className="flex items-center space-x-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={chat ? "Ask a question..." : "Connecting..."}
                            disabled={!chat || isLoading}
                            className={`flex-grow block w-full px-4 py-2 rounded-full shadow-sm focus:outline-none ${theme.input.background} ${theme.input.text} ${theme.input.border} ${theme.input.focus} ${theme.input.placeholder}`}
                            aria-label="Chat input"
                        />
                        <button type="submit" disabled={!chat || isLoading || !input.trim()} className={`w-10 h-10 flex-shrink-0 rounded-full ${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover} text-white flex items-center justify-center disabled:opacity-50`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" /></svg>
                        </button>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Chatbot;