

import React, { useEffect, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';

// Declare Prism on the window object for TypeScript
declare global {
    interface Window {
        Prism: any;
    }
}

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    'aria-labelledby'?: string;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ value, onChange, 'aria-labelledby': ariaLabelledBy }) => {
    const { theme } = useTheme();
    const codeBlockRef = useRef<HTMLElement>(null);
    const preRef = useRef<HTMLPreElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lineNumbersRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (codeBlockRef.current && window.Prism) {
            window.Prism.highlightElement(codeBlockRef.current);
        }
    }, [value]);
    
    const handleScroll = () => {
        if (textareaRef.current && preRef.current && lineNumbersRef.current) {
            const scrollTop = textareaRef.current.scrollTop;
            const scrollLeft = textareaRef.current.scrollLeft;
            
            preRef.current.scrollTop = scrollTop;
            preRef.current.scrollLeft = scrollLeft;
            
            lineNumbersRef.current.scrollTop = scrollTop;
        }
    };

    // FIX: Define padding as a variable to avoid type errors when reading from CSSProperties object.
    const editorPadding = '1rem';

    const editorStyles: React.CSSProperties = {
        fontFamily: "'Fira Code', 'Dank Mono', 'Consolas', 'Menlo', monospace",
        fontSize: '14px',
        lineHeight: '1.5',
        padding: editorPadding,
        margin: 0,
        border: 'none',
        overflow: 'auto',
        whiteSpace: 'pre',
        wordWrap: 'normal',
    };
    
    const containerStyles: React.CSSProperties = {
        display: 'flex',
        position: 'relative',
        width: '100%',
        height: '100%',
    };

    const lineNumbersStyles: React.CSSProperties = {
        ...editorStyles,
        paddingTop: editorPadding,
        paddingBottom: editorPadding,
        paddingLeft: '1rem',
        paddingRight: '1rem',
        textAlign: 'right',
        color: theme.textMuted,
        userSelect: 'none',
        overflow: 'hidden',
    };
    
    const codeAreaStyles: React.CSSProperties = {
        position: 'relative',
        flex: 1,
        height: '100%',
        overflow: 'hidden',
    };

    const textareaStyles: React.CSSProperties = {
        ...editorStyles,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        color: 'transparent',
        caretColor: theme.name === 'light' || theme.name === 'modern' ? 'black' : 'white',
        backgroundColor: 'transparent',
        resize: 'none',
        outline: 'none',
        zIndex: 1,
    };
    
    const preStyles: React.CSSProperties = {
        ...editorStyles,
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
    };

    const lineCount = value.split('\n').length;

    return (
        <div style={containerStyles} className={`${theme.input.background} ${theme.input.border} rounded-md shadow-sm overflow-hidden`}>
            <div ref={lineNumbersRef} style={lineNumbersStyles} aria-hidden="true" className={`border-r ${theme.input.border}`}>
                {Array.from({ length: lineCount }, (_, i) => (
                    <div key={i}>{i + 1}</div>
                ))}
            </div>
            <div style={codeAreaStyles}>
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onScroll={handleScroll}
                    style={textareaStyles}
                    spellCheck="false"
                    aria-label={!ariaLabelledBy ? "Live Code Editor" : undefined}
                    aria-labelledby={ariaLabelledBy}
                    data-gramm="false" // Disable Grammarly
                    role="textbox"
                    aria-multiline="true"
                />
                <pre ref={preRef} style={preStyles} className="language-html" aria-hidden="true">
                    <code ref={codeBlockRef} className="language-html">
                        {value + '\n'}
                    </code>
                </pre>
            </div>
        </div>
    );
};

export default CodeEditor;