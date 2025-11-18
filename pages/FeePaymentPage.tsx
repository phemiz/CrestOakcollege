import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { useApi, getCurrentStudent } from '../hooks/useApi';
import { Fee, FeeStatus, Payment } from '../types';
import { useTheme } from '../hooks/useTheme';
import FeePaymentModal from '../components/FeePaymentModal';
import SkeletonLoader from '../components/SkeletonLoader';

const FeePaymentPage: React.FC = () => {
    const [student, setStudent] = useState(getCurrentStudent());
    const navigate = useNavigate();
    const { theme } = useTheme();

    const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);

    useEffect(() => {
        if (!student) {
            navigate('/admin');
        }
    }, [student, navigate]);

    const { data: fees, loading: feesLoading, refetch: refetchFees } = useApi<Fee[]>('/api/fees');
    const { data: paymentHistory, loading: historyLoading, refetch: refetchHistory } = useApi<Payment[]>('/api/payments');

    const loading = feesLoading || historyLoading;

    const outstandingFees = useMemo(() => fees?.filter(f => f.status !== FeeStatus.Paid) || [], [fees]);
    const totalDue = useMemo(() => outstandingFees.reduce((sum, f) => sum + f.amount, 0), [outstandingFees]);

    const handlePaymentSuccess = () => {
        refetchFees();
        refetchHistory();
    };
    
    const getStatusColor = (status: FeeStatus) => {
        switch (status) {
            case FeeStatus.Paid: return 'text-green-800 bg-green-100';
            case FeeStatus.Overdue: return 'text-red-800 bg-red-100';
            case FeeStatus.Due:
            default: return 'text-yellow-800 bg-yellow-100';
        }
    };
    
    if (!student) return null; // Render nothing while redirecting

    return (
        <PageWrapper
            title="Fee Payment Portal"
            subtitle="Manage your school fees and view your payment history."
        >
            <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 items-start">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-8">
                     {/* Outstanding Fees */}
                    <div className={`${theme.card.background} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border} p-6`}>
                        <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>Outstanding Fees</h2>
                        {loading && <SkeletonLoader type="line" className="h-24" />}
                        {!loading && outstandingFees.length > 0 && (
                            <table className="w-full text-left">
                                <thead>
                                    <tr>
                                        <th className={`py-2 ${theme.textMuted} text-sm`}>Description</th>
                                        <th className={`py-2 ${theme.textMuted} text-sm text-center`}>Status</th>
                                        <th className={`py-2 ${theme.textMuted} text-sm text-right`}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {outstandingFees.map(fee => (
                                        <tr key={fee.id} className={`border-t ${theme.input.border}`}>
                                            <td className="py-3 pr-4">
                                                <p className={`font-semibold ${theme.text}`}>{fee.description}</p>
                                                <p className="text-xs text-gray-400">Due: {new Date(fee.dueDate).toLocaleDateString()}</p>
                                            </td>
                                            <td className="py-3 text-center">
                                                <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(fee.status)}`}>{fee.status}</span>
                                            </td>
                                            <td className={`py-3 text-right font-semibold ${theme.text}`}>₦{fee.amount.toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                         {!loading && outstandingFees.length === 0 && (
                            <p className={theme.textMuted}>You have no outstanding fees. Well done!</p>
                        )}
                    </div>

                    {/* Payment History */}
                    <div className={`${theme.card.background} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border} p-6`}>
                         <h2 className={`text-2xl font-bold ${theme.text} mb-4`}>Payment History</h2>
                         {loading && <SkeletonLoader type="line" className="h-24" />}
                         {!loading && paymentHistory && paymentHistory.length > 0 ? (
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
                            !loading && <p className={theme.textMuted}>No payment history found.</p>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="md:col-span-1 space-y-6 sticky top-24">
                    <div className={`${theme.card.background} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border} p-6 text-center`}>
                        <h3 className={`text-lg font-semibold ${theme.textMuted} mb-1`}>Total Amount Due</h3>
                        <p className={`text-4xl font-extrabold ${totalDue > 0 ? 'text-red-500' : theme.text} mb-4`}>
                            ₦{totalDue.toLocaleString()}
                        </p>
                        <button
                            onClick={() => setIsFeeModalOpen(true)}
                            disabled={outstandingFees.length === 0}
                            className={`w-full text-center ${theme.button.primary.background} ${theme.button.primary.text} font-bold py-3 px-6 rounded-full inline-block ${theme.button.primary.hover} transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            Make a Payment
                        </button>
                    </div>
                </aside>
            </div>
             {fees && <FeePaymentModal 
                isOpen={isFeeModalOpen}
                onClose={() => setIsFeeModalOpen(false)}
                fees={fees}
                onPaymentSuccess={handlePaymentSuccess}
            />}
        </PageWrapper>
    );
};

export default FeePaymentPage;