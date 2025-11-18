import React, { useState, useEffect, useMemo } from 'react';
import { Fee, FeeStatus, Payment } from '../types';
import Modal from './Modal';
import { useTheme } from '../hooks/useTheme';
import { useApi, postPayment, getCurrentStudent } from '../hooks/useApi';

interface FeePaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    fees: Fee[];
    onPaymentSuccess: () => void;
}

const FeePaymentModal: React.FC<FeePaymentModalProps> = ({ isOpen, onClose, fees, onPaymentSuccess }) => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<'payment' | 'history'>('payment');
    const [selectedFeeIds, setSelectedFeeIds] = useState<string[]>([]);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const { data: paymentHistory, loading: historyLoading, refetch: refetchHistory } = useApi<Payment[]>('/api/payments');

    const outstandingFees = useMemo(() => fees.filter(f => f.status !== FeeStatus.Paid), [fees]);
    const totalSelectedAmount = useMemo(() => {
        return outstandingFees
            .filter(f => selectedFeeIds.includes(f.id))
            .reduce((sum, f) => sum + f.amount, 0);
    }, [selectedFeeIds, outstandingFees]);

    useEffect(() => {
        if (isOpen) {
            setActiveTab('payment');
            setSelectedFeeIds([]);
            setStatus('idle');
            setMessage('');
            refetchHistory();
        }
    }, [isOpen]);

    const handleFeeSelection = (feeId: string) => {
        setSelectedFeeIds(prev =>
            prev.includes(feeId) ? prev.filter(id => id !== feeId) : [...prev, feeId]
        );
    };

    const handlePayNow = async () => {
        setStatus('loading');
        setMessage('');

        const student = getCurrentStudent();
        if (!student) {
            setStatus('error');
            setMessage('You must be logged in to make a payment.');
            return;
        }

        const result = await postPayment(selectedFeeIds, totalSelectedAmount, student.id);
        
        if (result.success) {
            setStatus('success');
            setMessage(result.message);
            onPaymentSuccess();
            refetchHistory();

            setTimeout(() => {
                onClose();
            }, 2500);
        } else {
            setStatus('error');
            setMessage(result.message || 'Payment failed. Please try again.');
        }
    };

    const tabButtonClasses = (isActive: boolean) => `w-full py-3 text-center font-semibold transition-colors duration-300 border-b-2 ${
        isActive
        ? `${theme.accent} ${theme.name === 'light' ? 'border-blue-600' : 'border-blue-400'}`
        : `${theme.textMuted} hover:${theme.text} border-transparent`
    }`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Fee Payment Portal">
            <div className="flex border-b mb-6">
                <button onClick={() => setActiveTab('payment')} className={tabButtonClasses(activeTab === 'payment')}>Make Payment</button>
                <button onClick={() => setActiveTab('history')} className={tabButtonClasses(activeTab === 'history')}>Payment History</button>
            </div>

            {activeTab === 'payment' && (
                <div>
                    {status === 'success' ? (
                         <div className="text-center py-8">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            <p className="text-green-600 font-semibold">{message}</p>
                        </div>
                    ) : (
                        <>
                            <h3 className={`text-lg font-bold ${theme.text} mb-4`}>Select Fees to Pay</h3>
                            <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                                {outstandingFees.length > 0 ? outstandingFees.map(fee => (
                                    <label key={fee.id} className={`flex items-center justify-between p-3 border rounded-md cursor-pointer ${theme.input.border} ${selectedFeeIds.includes(fee.id) ? 'bg-blue-50 dark:bg-blue-900/30' : ''}`}>
                                        <div className="flex items-center">
                                            <input type="checkbox" checked={selectedFeeIds.includes(fee.id)} onChange={() => handleFeeSelection(fee.id)} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                                            <div className="ml-3">
                                                <p className={`font-medium ${theme.text}`}>{fee.description}</p>
                                                <p className={`text-sm ${fee.status === FeeStatus.Overdue ? 'text-red-500' : theme.textMuted}`}>
                                                    Status: {fee.status}
                                                </p>
                                            </div>
                                        </div>
                                        <p className={`font-semibold ${theme.text}`}>₦{fee.amount.toLocaleString()}</p>
                                    </label>
                                )) : (
                                    <p className={theme.textMuted}>You have no outstanding fees.</p>
                                )}
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-white/20">
                                <p className={`text-xs text-center italic ${theme.textMuted} mb-4`}>Note: This is a simulated payment gateway for demonstration purposes.</p>
                                {message && status === 'error' && <p className="text-center text-sm text-red-500 mb-4">{message}</p>}
                                <div className="flex justify-between items-center text-xl font-bold mb-4">
                                    <span className={theme.text}>Total:</span>
                                    <span className={theme.accent}>₦{totalSelectedAmount.toLocaleString()}</span>
                                </div>
                                <button
                                    onClick={handlePayNow}
                                    disabled={totalSelectedAmount === 0 || status === 'loading'}
                                    className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-lg font-bold ${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover} disabled:opacity-50 transition-colors duration-300`}
                                >
                                    {status === 'loading' ? 'Processing...' : 'Pay Now'}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
            
            {activeTab === 'history' && (
                <div className="max-h-80 overflow-y-auto pr-2">
                    {historyLoading && <p>Loading history...</p>}
                    {paymentHistory && paymentHistory.length > 0 ? (
                        <ul className="space-y-3">
                            {paymentHistory.map(payment => (
                                <li key={payment.id} className={`p-3 rounded-md border ${theme.input.border} flex justify-between items-center`}>
                                    <div>
                                        <p className={`font-semibold ${theme.text}`}>{payment.description}</p>
                                        <p className={`text-sm ${theme.textMuted}`}>{new Date(payment.date).toLocaleString()}</p>
                                    </div>
                                    <p className={`font-bold ${theme.text}`}>₦{payment.amount.toLocaleString()}</p>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        !historyLoading && <p className={theme.textMuted}>No payment history found.</p>
                    )}
                </div>
            )}
        </Modal>
    );
};

export default FeePaymentModal;