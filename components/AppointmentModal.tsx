import React, { useState, useEffect } from 'react';
import { StaffMember } from '../types';
import Modal from './Modal';
import { useTheme } from '../hooks/useTheme';
import { getCurrentStudent } from '../hooks/useApi';

interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    staff: StaffMember;
    onSubmit: (data: { staffId: string; studentName: string; date: string; time: string; reason: string; }) => Promise<{ success: boolean; message: string; }>;
}

const AppointmentModal: React.FC<AppointmentModalProps> = ({ isOpen, onClose, staff, onSubmit }) => {
    const { theme } = useTheme();
    const [selectedSlot, setSelectedSlot] = useState('');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (isOpen) {
            setSelectedSlot('');
            setReason('');
            setError('');
            setSuccess('');
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSlot || !reason) {
            setError('Please select a time slot and provide a reason for the appointment.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        const [date, time] = selectedSlot.split('_');
        const student = getCurrentStudent();

        const result = await onSubmit({
            staffId: staff.id,
            studentName: student?.name || 'A Student', // Fallback
            date,
            time,
            reason
        });

        if (result.success) {
            setSuccess(result.message);
            setTimeout(() => onClose(), 2000);
        } else {
            setError(result.message || 'An error occurred.');
        }
        setLoading(false);
    };

    const inputClasses = `mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${theme.input.background} ${theme.input.text} ${theme.input.border} ${theme.input.focus} ${theme.input.placeholder}`;

    // Mocking available dates - in a real app, this would come from an API
    const availableDates = [new Date(Date.now() + 2 * 24*60*60*1000), new Date(Date.now() + 4 * 24*60*60*1000)];

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Book Appointment with ${staff.name}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className={`block text-sm font-medium ${theme.textMuted}`}>Available Office Hours</label>
                    <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {availableDates.map(date => 
                            staff.officeHours?.map(hour => {
                                const slotValue = `${date.toISOString().split('T')[0]}_${hour.time}`;
                                if (hour.day !== date.toLocaleDateString('en-US', { weekday: 'long' })) return null;

                                return (
                                    <button
                                        key={slotValue}
                                        type="button"
                                        onClick={() => setSelectedSlot(slotValue)}
                                        className={`p-2 rounded-md font-semibold text-center text-sm transition-colors duration-200 border-2 ${selectedSlot === slotValue ? `${theme.button.primary.background} ${theme.button.primary.text} border-transparent` : `${theme.input.background} ${theme.input.border} ${theme.text} hover:border-blue-500`}`}
                                    >
                                        <span className="block">{date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                        <span className="block">{hour.time}</span>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                <div>
                    <label htmlFor="reason" className={`block text-sm font-medium ${theme.textMuted}`}>Reason for Appointment</label>
                    <textarea name="reason" id="reason" rows={3} value={reason} onChange={e => setReason(e.target.value)} className={inputClasses} required />
                </div>

                {error && <p className="text-sm text-red-600 text-center">{error}</p>}
                {success && <p className="text-sm text-green-600 text-center">{success}</p>}

                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className={`py-2 px-6 rounded-full border ${theme.name === 'light' ? 'border-gray-300' : 'border-white/50'} hover:bg-gray-100`} disabled={loading}>Cancel</button>
                    <button type="submit" disabled={loading || !selectedSlot} className={`py-2 px-6 rounded-full ${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover} disabled:opacity-50`}>
                        {loading ? 'Booking...' : 'Book Appointment'}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AppointmentModal;
