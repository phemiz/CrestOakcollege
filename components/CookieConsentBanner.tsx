import React from 'react';
import { useCookieConsent } from '../hooks/useCookieConsent';
import { useTheme } from '../hooks/useTheme';

const CookieConsentBanner: React.FC = () => {
    const { showBanner, onAccept, onReject } = useCookieConsent();
    const { theme } = useTheme();

    if (!showBanner) {
        return null;
    }

    const bannerBg = theme.name === 'light' ? 'bg-gray-800' : theme.name === 'faith' ? 'bg-blue-900/80 backdrop-blur-sm' : theme.card.background;
    const bannerText = theme.name === 'light' ? 'text-white' : theme.text;
    const acceptBtn = `${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover}`;
    const rejectBtn = theme.name === 'light' ? 'bg-gray-600 hover:bg-gray-500 text-white' : `${theme.card.background} hover:bg-gray-700 ${theme.text}`;

    return (
        <div
            role="dialog"
            aria-live="polite"
            aria-label="Cookie consent"
            aria-describedby="cookie-consent-description"
            className={`fixed bottom-0 left-0 right-0 p-4 ${bannerBg} shadow-[0_-5px_15px_-5px_rgba(0,0,0,0.2)] z-50 transition-transform duration-500`}
        >
            <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                <p id="cookie-consent-description" className={`text-sm ${bannerText} flex-grow`}>
                    We use cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept", you consent to our use of cookies.
                </p>
                <div className="flex-shrink-0 flex items-center gap-3">
                    <button
                        onClick={onAccept}
                        className={`px-5 py-2 text-sm font-bold rounded-full transition-colors duration-300 ${acceptBtn}`}
                    >
                        Accept
                    </button>
                    <button
                        onClick={onReject}
                         className={`px-5 py-2 text-sm font-bold rounded-full transition-colors duration-300 ${rejectBtn}`}
                    >
                        Reject
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsentBanner;
