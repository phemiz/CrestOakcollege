import React, { useEffect, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
    const { theme } = useTheme();
    const modalRef = useRef<HTMLDivElement>(null);

    // Focus trapping logic for accessibility
    useEffect(() => {
        if (!isOpen) return;

        const modalNode = modalRef.current;
        if (!modalNode) return;

        const focusableElements = modalNode.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            if (e.shiftKey) { // Shift+Tab
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else { // Tab
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        };

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        firstElement?.focus();

        modalNode.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keydown', handleEscape);

        return () => {
            modalNode.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-50 p-4" 
            onClick={onClose} 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="modal-title"
        >
            <div 
                ref={modalRef}
                className={`${theme.card.background} p-8 rounded-lg shadow-xl w-full max-w-lg`} 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-start">
                    <h2 id="modal-title" className={`text-2xl font-bold ${theme.text} mb-6`}>{title}</h2>
                    <button 
                        onClick={onClose} 
                        className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 -mt-2 -mr-2`} 
                        aria-label="Close modal"
                    >
                        <svg className={`h-6 w-6 ${theme.textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal;
