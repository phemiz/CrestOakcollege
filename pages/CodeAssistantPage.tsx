

import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import PageWrapper from '../components/PageWrapper';
import { useTheme } from '../hooks/useTheme';
import CodeEditor from '../components/CodeEditor';

// Declare Prism on the window object for TypeScript
declare global {
    interface Window {
        Prism: any;
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
        JSHINT: any;
    }
}

interface HistoryItem {
    id: string;
    prompt: string;
    code: string;
    explanation: string;
}

interface LintError {
    line: number;
    character: number;
    reason: string;
    code: string;
}

const CodeAssistantPage: React.FC = () => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<'assistant' | 'preview'>('assistant');
    const [prompt, setPrompt] = useState<string>('');
    const [activeCode, setActiveCode] = useState<string>('');
    const [explanation, setExplanation] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);
    const [copyStatus, setCopyStatus] = useState('');
    
    // Speech Recognition State
    const [isListening, setIsListening] = useState(false);
    const [speechError, setSpeechError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);

    // Linting State
    const [lintErrors, setLintErrors] = useState<LintError[]>([]);
    const [lintAnnouncement, setLintAnnouncement] = useState<string>('');
    const prevErrorCount = useRef(0);

    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.onstart = () => {
                setIsListening(true);
                setSpeechError(null);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.onerror = (event: any) => {
                if (event.error === 'not-allowed') {
                    setSpeechError("Microphone access was denied. Please enable it in your browser settings to use this feature.");
                } else {
                    setSpeechError(`Speech recognition error: ${event.error}`);
                }
                setIsListening(false);
            };

            recognition.onresult = (event: any) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setPrompt(prev => (prev ? prev + ' ' : '') + finalTranscript);
                }
            };
            
            recognitionRef.current = recognition;
        } else {
            setSpeechError("Speech recognition is not supported by your browser.");
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Lint code whenever it changes, with accessibility announcements
    useEffect(() => {
        const handler = setTimeout(() => {
            if (activeTab === 'preview' && activeCode && window.JSHINT) {
                const scriptRegex = /<script.*?>([\s\S]*?)<\/script>/i;
                const match = activeCode.match(scriptRegex);
                
                let currentErrors: LintError[] = [];
                if (match && match[1]) {
                    const jsCode = match[1];
                    const options = { esversion: 11, browser: true, undef: true, unused: 'vars' };
                    try {
                        const success = window.JSHINT(jsCode, options);
                        if (!success) {
                            currentErrors = window.JSHINT.errors.map((err: any) => ({
                                line: err.line,
                                character: err.character,
                                reason: err.reason,
                                code: err.code
                            })).filter(Boolean);
                        }
                    } catch (e) {
                        console.error("JSHINT Error:", e);
                    }
                }

                setLintErrors(currentErrors);

                if (currentErrors.length > 0 && prevErrorCount.current === 0) {
                    setLintAnnouncement(`Code analysis found ${currentErrors.length} issue${currentErrors.length > 1 ? 's' : ''}.`);
                } else if (currentErrors.length === 0 && prevErrorCount.current > 0) {
                    setLintAnnouncement('All code issues have been resolved.');
                } else {
                    setLintAnnouncement('');
                }
                
                prevErrorCount.current = currentErrors.length;
                
            } else {
                setLintErrors([]);
                if (prevErrorCount.current > 0) {
                    setLintAnnouncement('All code issues have been resolved.');
                }
                prevErrorCount.current = 0;
            }
        }, 500); // 500ms debounce to avoid running on every keystroke

        return () => {
            clearTimeout(handler);
        };
    }, [activeCode, activeTab]);

    const handleMicClick = () => {
        if (!recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };


    // Load history from local storage on mount
    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem('codeAssistantHistory');
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        } catch (e) {
            console.error("Failed to load history from local storage", e);
        }
    }, []);

    // Save history to local storage on change
    useEffect(() => {
        try {
            localStorage.setItem('codeAssistantHistory', JSON.stringify(history));
        } catch (e) {
            console.error("Failed to save history to local storage", e);
        }
    }, [history]);

    const handleGenerate = async () => {
        if (!prompt) {
            setError('Please enter a prompt.');
            return;
        }
        setLoading(true);
        setError(null);
        setActiveCode('');
        setExplanation('');
        setLintErrors([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const fullPrompt = `Generate a brief explanation in Markdown of the code you are about to create. Then, on a new line, provide a single, complete HTML file with embedded CSS and JavaScript for the following request: "${prompt}". The response must start with the Markdown explanation, followed by the HTML code enclosed in a single markdown code block with the language set to html. Do not include any other text outside of these two parts.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: fullPrompt,
            });
            
            let responseText = response.text;
            
            const codeBlockRegex = /```html\n([\s\S]*?)\n```/;
            const match = responseText.match(codeBlockRegex);
            
            let code = '';
            let explanationText = '';
            
            if (match && match[1]) {
                code = match[1].trim();
                explanationText = responseText.substring(0, match.index).trim();
            } else {
                explanationText = responseText.trim();
                setError("The AI response did not contain a valid HTML code block. Displaying explanation only.");
            }

            const newHistoryItem: HistoryItem = {
                id: crypto.randomUUID(),
                prompt,
                code,
                explanation: explanationText,
            };

            setHistory(prev => [newHistoryItem, ...prev]);
            setActiveCode(code);
            setExplanation(explanationText);
            setSelectedHistoryId(newHistoryItem.id);
            setPrompt(''); // Clear prompt after successful generation
            setActiveTab('preview'); // Switch to preview after generation
        } catch (err) {
            console.error(err);
            setError('Failed to generate code. Please check your API key and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleHistoryClick = (item: HistoryItem) => {
        setPrompt(item.prompt);
        setActiveCode(item.code);
        setExplanation(item.explanation);
        setSelectedHistoryId(item.id);
    };

    const handleClearHistory = () => {
        if (window.confirm("Are you sure you want to clear your entire history? This cannot be undone.")) {
            setHistory([]);
            setActiveCode('');
            setExplanation('');
            setPrompt('');
            setSelectedHistoryId(null);
            setLintErrors([]);
        }
    };

    const handleCopy = () => {
        if (!activeCode || isCopied) return;
        navigator.clipboard.writeText(activeCode).then(() => {
            setIsCopied(true);
            setCopyStatus('Code copied to clipboard!');
            setTimeout(() => {
                setIsCopied(false);
                setCopyStatus('');
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy code: ', err);
            setError('Could not copy code to clipboard.');
        });
    };

    const handleSaveToFile = () => {
        if (!activeCode) return;
        const currentHistoryItem = history.find(item => item.id === selectedHistoryId);
        const promptText = currentHistoryItem?.prompt || 'generated-code';
        
        const filename = promptText
            .toLowerCase()
            .slice(0, 30)
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '')
            .trim()
            .replace(/^-+|-+$/g, '') || 'component';

        const blob = new Blob([activeCode], { type: 'text/html;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleEmailCode = () => {
        if (!activeCode) return;
        const subject = `Generated Code from Crestview Assistant`;
        const body = `Hello,\n\nPlease find the code generated by the Crestview Code Assistant below:\n\n---\n\n${activeCode}`;
        const mailtoLink = `mailto:support@crestview.edu.ng?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoLink;
    };

    const tabButtonClasses = (tabName: 'assistant' | 'preview') => 
        `px-6 py-2 rounded-full font-semibold transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.input.focus} ${
            activeTab === tabName
            ? `${theme.button.primary.background} ${theme.button.primary.text}`
            : `${theme.card.background} ${theme.text} hover:bg-gray-200 dark:hover:bg-gray-700`
        }`;

    const actionButtonClasses = `flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors duration-200 ${theme.card.background} ${theme.text} border ${theme.input.border} hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.input.focus} focus:ring-offset-transparent disabled:opacity-60`;

    return (
        <PageWrapper title="Code Assistant" subtitle="Describe the component you want to build, and let AI bring it to life.">
            {/* Visually hidden container for screen reader announcements */}
            <div className="sr-only" role="status" aria-live="polite">
                {copyStatus}
            </div>
            <div className="sr-only" role="alert" aria-live="assertive">
                {lintAnnouncement}
            </div>
            <div className={`max-w-7xl mx-auto ${theme.card.background} ${theme.card.rounded} ${theme.card.shadow} p-6 md:p-8`}>
                {/* Tabs */}
                <div className="flex justify-center mb-6">
                    <div className={`flex space-x-2 p-1 ${theme.name === 'light' ? 'bg-gray-200' : 'bg-white/10'} rounded-full`} role="tablist" aria-label="Code Assistant sections">
                        <button
                            id="tab-assistant"
                            role="tab"
                            aria-selected={activeTab === 'assistant'}
                            aria-controls="tabpanel-assistant"
                            onClick={() => setActiveTab('assistant')} className={tabButtonClasses('assistant')}>
                            Assistant
                        </button>
                        <button
                             id="tab-preview"
                             role="tab"
                             aria-selected={activeTab === 'preview'}
                             aria-controls="tabpanel-preview"
                            onClick={() => setActiveTab('preview')} className={tabButtonClasses('preview')}>
                            Preview & Edit
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div>
                    <div
                        id="tabpanel-assistant"
                        role="tabpanel"
                        aria-labelledby="tab-assistant"
                        hidden={activeTab !== 'assistant'}
                    >
                        {activeTab === 'assistant' && (
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Left: Prompt Input */}
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="prompt" className={`block text-sm font-medium ${theme.textMuted} mb-2`}>
                                            What would you like to create?
                                        </label>
                                        <div className="relative">
                                            <textarea
                                                id="prompt"
                                                rows={8}
                                                value={prompt}
                                                onChange={(e) => setPrompt(e.target.value)}
                                                placeholder="e.g., a responsive pricing table with three tiers"
                                                className={`w-full p-3 pr-12 rounded-md shadow-sm focus:outline-none transition-shadow duration-300 ${theme.input.background} ${theme.input.text} ${theme.input.border} ${theme.input.focus} ${theme.input.placeholder} ${isListening ? (theme.name === 'faith' ? 'ring-2 ring-yellow-400' : 'ring-2 ring-blue-500') : ''}`}
                                            />
                                            <button 
                                                onClick={handleMicClick}
                                                disabled={!recognitionRef.current}
                                                className={`absolute top-3 right-3 p-2 rounded-full transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${isListening ? 'bg-red-500/20' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                                aria-label={isListening ? 'Stop listening' : 'Start listening'}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${isListening ? `text-red-500 animate-pulse` : theme.textMuted}`} viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm-1 4a1 1 0 011-1h4a1 1 0 110 2H7a1 1 0 01-1-1zm-3 2a1 1 0 000 2h12a1 1 0 100-2H3z" clipRule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                        {speechError && <p role="alert" className="mt-2 text-sm text-center text-red-500">{speechError}</p>}
                                    </div>
                                    <button
                                        onClick={handleGenerate}
                                        disabled={loading}
                                        className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-lg font-bold ${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover} disabled:opacity-50 transition-colors duration-300`}
                                    >
                                        {loading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                Generating...
                                            </>
                                        ) : 'Generate Code'}
                                    </button>
                                    {error && <p role="alert" className="mt-2 text-sm text-center text-red-500">{error}</p>}
                                </div>

                                {/* Right: History */}
                                <div className="flex flex-col">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 id="history-heading" className={`text-lg font-semibold ${theme.text}`}>History</h3>
                                        {history.length > 0 && (
                                            <button onClick={handleClearHistory} className="text-sm text-red-500 hover:text-red-700">
                                                Clear History
                                            </button>
                                        )}
                                    </div>
                                    <div className={`flex-grow border ${theme.input.border} rounded-md p-2 overflow-y-auto h-64 md:h-auto`}>
                                        {history.length > 0 ? (
                                            <ul className="space-y-2" aria-labelledby="history-heading">
                                                {history.map(item => (
                                                    <li key={item.id}>
                                                        <button 
                                                            onClick={() => handleHistoryClick(item)}
                                                            aria-pressed={selectedHistoryId === item.id}
                                                            className={`w-full text-left p-3 rounded-md text-sm truncate transition-colors duration-200 ${selectedHistoryId === item.id ? `${theme.button.primary.background} ${theme.button.primary.text}` : `${theme.name === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-white/5 hover:bg-white/10'} ${theme.text}`}`}
                                                        >
                                                            {item.prompt}
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-center">
                                                <p className={`${theme.textMuted}`}>Your generation history will appear here.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    
                    <div
                        id="tabpanel-preview"
                        role="tabpanel"
                        aria-labelledby="tab-preview"
                        hidden={activeTab !== 'preview'}
                    >
                        {activeTab === 'preview' && (
                           <div>
                                {activeCode || explanation ? (
                                    <div className="flex flex-col space-y-4">
                                        {explanation && (
                                            <div>
                                                <h3 id="explanation-heading" className={`block text-sm font-medium ${theme.textMuted} mb-2`}>AI Explanation</h3>
                                                <div
                                                    aria-labelledby="explanation-heading"
                                                    className={`p-4 border rounded-md prose prose-sm max-w-none ${theme.input.border} ${theme.name === 'dark' || theme.name === 'faith' ? 'prose-invert' : ''}`}
                                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(explanation)) }}
                                                />
                                            </div>
                                        )}
                                        {activeCode && (
                                           <div>
                                                <div className="flex justify-between items-center">
                                                    <h3 id="code-editor-heading" className={`block text-sm font-medium ${theme.textMuted}`}>Live Code Editor</h3>
                                                    <div className="flex items-center space-x-2">
                                                        <button onClick={handleCopy} className={actionButtonClasses} disabled={isCopied}>
                                                            {isCopied ? (
                                                                <>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                                                                    <span>Copied!</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                                                    <span>Copy Code</span>
                                                                </>
                                                            )}
                                                        </button>
                                                        <button onClick={handleEmailCode} className={actionButtonClasses}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                                                            <span>Email Code</span>
                                                        </button>
                                                        <button onClick={handleSaveToFile} className={actionButtonClasses}>
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                                            <span>Save as File</span>
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="w-full h-[60vh] mt-2">
                                                    <CodeEditor
                                                        value={activeCode}
                                                        onChange={setActiveCode}
                                                        aria-labelledby="code-editor-heading"
                                                    />
                                                </div>
                                                {lintErrors.length > 0 && (
                                                    <div role="region" aria-labelledby="lint-errors-heading" className="mt-4">
                                                        <h4 id="lint-errors-heading" className={`text-sm font-semibold mb-2 ${theme.text}`}>JavaScript Code Issues Found:</h4>
                                                        <ul className={`text-xs space-y-1 p-3 border rounded-md max-h-32 overflow-y-auto ${theme.name === 'light' ? 'bg-red-50 border-red-200' : 'bg-red-900/20 border-red-500/30'}`}>
                                                            {lintErrors.map((error, index) => (
                                                                <li key={index} className="flex font-mono">
                                                                    <span className="mr-2 font-bold text-red-500" aria-hidden="true">L{error.line}:</span>
                                                                    <span className="sr-only">Line {error.line}: </span>
                                                                    <span className={theme.textMuted}>{error.reason} ({error.code})</span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                           </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <h3 className={`text-2xl font-semibold ${theme.text}`}>Nothing to preview</h3>
                                        <p className={`${theme.textMuted} mt-2`}>Generate some code in the Assistant tab to see a preview here.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </PageWrapper>
    );
};

export default CodeAssistantPage;