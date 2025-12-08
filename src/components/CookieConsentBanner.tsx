import React, { useState, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';

const CookieConsentBanner: React.FC = () => {
    const { theme } = useTheme();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('cookieConsent');
        if (!consent) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('cookieConsent', 'accepted');
        setIsVisible(false);
    };

    const handleDecline = () => {
        localStorage.setItem('cookieConsent', 'declined');
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-gray-900 text-white shadow-lg">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <p className="text-sm">
                    We use cookies to enhance your browsing experience and analyze our traffic.
                    By clicking "Accept", you consent to our use of cookies.
                </p>
                <div className="flex gap-3">
                    <button
                        onClick={handleDecline}
                        className="px-4 py-2 rounded-lg border border-white text-white hover:bg-white hover:text-gray-900 transition-colors"
                    >
                        Decline
                    </button>
                    <button
                        onClick={handleAccept}
                        className={`px-4 py-2 rounded-lg ${theme.button.primary.background} ${theme.button.primary.text}`}
                    >
                        Accept
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsentBanner;
