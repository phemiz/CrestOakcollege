import React, { useState } from 'react';
import PageWrapper from '../components/PageWrapper';
import { useTheme } from '../hooks/useTheme';

const DonationPage: React.FC = () => {
    const { theme } = useTheme();
    const [amount, setAmount] = useState(5000);
    const [customAmount, setCustomAmount] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const PRESET_AMOUNTS = [1000, 5000, 10000, 25000];

    const handleAmountClick = (value: number) => {
        setAmount(value);
        setCustomAmount('');
    };

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, '');
        setCustomAmount(value);
        if (value) {
            setAmount(parseInt(value, 10));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (amount <= 0) return;
        setStatus('loading');
        // Mock API call
        setTimeout(() => {
            setStatus('success');
        }, 1500);
    };

    const formBg = theme.name === 'light' ? 'bg-white' : theme.card.background;

    return (
        <PageWrapper
            title="Support Crestview College"
            subtitle="Your generous contribution helps us empower the next generation of leaders."
        >
            <div className={`max-w-2xl mx-auto p-8 rounded-lg ${formBg} ${theme.card.shadow} ${theme.card.border}`}>
                {status === 'success' ? (
                    <div className="text-center py-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        <h2 className={`text-2xl font-bold ${theme.text}`}>Thank You!</h2>
                        <p className={`${theme.textMuted} mt-2`}>Your donation of ₦{amount.toLocaleString()} is greatly appreciated.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <h2 className={`text-2xl font-bold ${theme.text} mb-6 text-center`}>Make a Donation</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                            {PRESET_AMOUNTS.map(preset => (
                                <button
                                    key={preset}
                                    type="button"
                                    onClick={() => handleAmountClick(preset)}
                                    className={`p-4 rounded-md font-bold text-center transition-colors duration-200 border-2 ${amount === preset && !customAmount ? `${theme.button.primary.background} ${theme.button.primary.text} border-transparent` : `${theme.input.background} ${theme.input.border} ${theme.text} hover:border-blue-500`}`}
                                >
                                    ₦{preset.toLocaleString()}
                                </button>
                            ))}
                        </div>
                        <div className="mb-6">
                            <label htmlFor="customAmount" className={`block text-sm font-medium ${theme.textMuted}`}>Or enter a custom amount (₦)</label>
                            <input
                                type="text"
                                id="customAmount"
                                value={customAmount}
                                onChange={handleCustomAmountChange}
                                placeholder="e.g., 50000"
                                className={`mt-1 block w-full px-4 py-3 text-lg rounded-md shadow-sm focus:outline-none ${theme.input.background} ${theme.input.text} ${theme.input.border} ${theme.input.focus} ${theme.input.placeholder}`}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={status === 'loading' || amount <= 0}
                            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-lg font-bold ${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover} disabled:opacity-50 transition-colors duration-300`}
                        >
                            {status === 'loading' ? 'Processing...' : `Donate ₦${amount.toLocaleString()}`}
                        </button>
                    </form>
                )}
            </div>
        </PageWrapper>
    );
};

export default DonationPage;