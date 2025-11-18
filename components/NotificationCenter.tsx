import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Notification } from '../types';
import { useTheme } from '../hooks/useTheme';

interface NotificationCenterProps {
    isOpen: boolean;
    notifications: Notification[];
    onClose: () => void;
    onMarkAsRead: (id?: string) => void;
}

const NotificationIcon: React.FC<{ type: Notification['type'] }> = ({ type }) => {
    const iconBaseClass = "w-6 h-6";
    switch(type) {
        case 'grade':
            return <svg xmlns="http://www.w3.org/2000/svg" className={`${iconBaseClass} text-green-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
        case 'announcement':
            return <svg xmlns="http://www.w3.org/2000/svg" className={`${iconBaseClass} text-blue-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-3.174 7.625-7.25V3" /></svg>;
        case 'fee':
            return <svg xmlns="http://www.w3.org/2000/svg" className={`${iconBaseClass} text-yellow-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>;
        case 'appointment':
             return <svg xmlns="http://www.w3.org/2000/svg" className={`${iconBaseClass} text-purple-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>;
        default:
             return <svg xmlns="http://www.w3.org/2000/svg" className={`${iconBaseClass} text-gray-500`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
};

const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, notifications, onClose, onMarkAsRead }) => {
    const { theme } = useTheme();
    const navigate = useNavigate();

    const handleNotificationClick = (notification: Notification) => {
        onMarkAsRead(notification.id);
        if (notification.path) {
            navigate(notification.path);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div 
             className={`absolute top-20 right-0 w-80 max-w-sm rounded-lg shadow-2xl border ${theme.card.background} ${theme.card.border} z-50 overflow-hidden`}
             role="dialog"
             aria-modal="true"
             aria-labelledby="notifications-heading"
        >
            <div className="p-4 flex justify-between items-center border-b border-gray-200 dark:border-white/10">
                <h3 id="notifications-heading" className={`text-lg font-bold ${theme.text}`}>Notifications</h3>
                {notifications.some(n => !n.read) && (
                    <button onClick={() => onMarkAsRead()} className={`text-xs font-semibold ${theme.accent}`}>Mark all as read</button>
                )}
            </div>
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    <ul>
                        {notifications.map(notif => (
                            <li key={notif.id}>
                                <button
                                    onClick={() => handleNotificationClick(notif)} 
                                    className={`w-full text-left p-4 flex items-start gap-4 transition-colors duration-200 ${notif.read ? 'opacity-70' : ''} ${theme.name === 'light' ? 'hover:bg-gray-50' : 'hover:bg-white/5'}`}
                                >
                                    <div className="flex-shrink-0 mt-1"><NotificationIcon type={notif.type} /></div>
                                    <div className="flex-grow">
                                        <p className={`text-sm font-semibold ${theme.text}`}>{notif.title}</p>
                                        <p className={`text-xs ${theme.textMuted}`}>{notif.content}</p>
                                         <p className={`text-xs mt-1 ${theme.textMuted}`}>{new Date(notif.createdAt).toLocaleString()}</p>
                                    </div>
                                    {!notif.read && <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 flex-shrink-0" aria-label="Unread"></div>}
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className={`p-8 text-center text-sm ${theme.textMuted}`}>You have no new notifications.</p>
                )}
            </div>
        </div>
    );
};

export default NotificationCenter;
