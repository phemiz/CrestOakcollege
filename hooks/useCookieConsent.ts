import { useState, useEffect, useCallback } from 'react';

type ConsentStatus = 'given' | 'denied' | 'pending';

const COOKIE_CONSENT_KEY = 'crestview_cookie_consent';

export const useCookieConsent = () => {
    const [consentStatus, setConsentStatus] = useState<ConsentStatus>('pending');

    useEffect(() => {
        try {
            const storedStatus = localStorage.getItem(COOKIE_CONSENT_KEY);
            if (storedStatus === 'given' || storedStatus === 'denied') {
                setConsentStatus(storedStatus);
            }
        } catch (error) {
            console.error("Could not access localStorage for cookie consent:", error);
        }
    }, []);

    const updateConsent = useCallback((status: 'given' | 'denied') => {
        try {
            localStorage.setItem(COOKIE_CONSENT_KEY, status);
            setConsentStatus(status);
        } catch (error) {
            console.error("Could not save cookie consent to localStorage:", error);
        }
    }, []);

    const onAccept = () => updateConsent('given');
    const onReject = () => updateConsent('denied');

    return {
        showBanner: consentStatus === 'pending',
        onAccept,
        onReject,
    };
};
