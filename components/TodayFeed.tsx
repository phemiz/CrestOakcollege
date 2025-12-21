
import React, { useMemo } from 'react';
import { TimetableEntry, Course, Announcement, Fee, FeeStatus } from '../types';
import { useTheme } from '../hooks/useTheme';

interface TodayFeedProps {
    timetable: TimetableEntry[];
    courses: Course[];
    announcements: Announcement[];
    fees: Fee[];
}

const TodayFeed: React.FC<TodayFeedProps> = ({ timetable, courses, announcements, fees }) => {
    const { theme } = useTheme();

    const courseMap = useMemo(() => courses.reduce((acc, course) => {
        acc[course.id] = course;
        return acc;
    }, {} as Record<string, Course>), [courses]);

    const todaysClasses = useMemo(() => {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }); // e.g., "Monday"
        return timetable
            .filter(entry => entry.dayOfWeek === today)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));
    }, [timetable]);

    const recentAnnouncements = useMemo(() => {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return announcements
            .filter(ann => new Date(ann.createdAt) > oneWeekAgo)
            .slice(0, 2);
    }, [announcements]);

    const feeReminders = useMemo(() => {
        return fees.filter(fee => fee.status !== FeeStatus.Paid).slice(0, 2);
    }, [fees]);

    const feedItems = useMemo(() => {
        const items = [];
        if (todaysClasses.length > 0) {
            items.push({
                type: 'classes',
                title: "Today's Classes",
                data: todaysClasses,
            });
        }
        if (recentAnnouncements.length > 0) {
            items.push({
                type: 'announcements',
                title: 'Recent Announcements',
                data: recentAnnouncements,
            });
        }
        if (feeReminders.length > 0) {
            items.push({
                type: 'fees',
                title: 'Fee Reminders',
                data: feeReminders,
            });
        }
        return items;
    }, [todaysClasses, recentAnnouncements, feeReminders]);

    if (feedItems.length === 0) {
        return (
            <div className={`p-6 rounded-lg ${theme.card.background} ${theme.card.border} text-center`}>
                <p className={theme.textMuted}>Nothing scheduled for today. Enjoy your day!</p>
            </div>
        );
    }
    
    const cardBg = theme.name === 'light' ? 'bg-white' : theme.card.background;

    return (
        <div className={`${cardBg} ${theme.card.shadow} ${theme.card.rounded} p-6 ${theme.card.border}`}>
            <h2 className={`text-2xl font-bold ${theme.text} mb-6`}>Today at CrestOAK</h2>
            <div className="space-y-6">
                {feedItems.map(item => (
                    <div key={item.type}>
                        <h3 className={`font-bold ${theme.accent} border-b ${theme.input.border} pb-2 mb-3`}>{item.title}</h3>
                        <ul className="space-y-3">
                            {item.type === 'classes' && item.data.map(entry => {
                                const course = courseMap[entry.courseId];
                                return (
                                     <li key={entry.id} className="flex flex-col sm:flex-row justify-between sm:items-center text-sm gap-2">
                                        <div>
                                            <p className={`font-semibold ${theme.text}`}>{course?.title || 'Unknown Course'}</p>
                                            <p className={theme.textMuted}>{entry.location}</p>
                                        </div>
                                        <p className={`${theme.textMuted} font-mono self-start sm:self-center`}>{entry.startTime} - {entry.endTime}</p>
                                    </li>
                                );
                            })}
                             {item.type === 'announcements' && item.data.map(ann => (
                                <li key={ann.id} className="text-sm">
                                    <p className={`font-semibold ${theme.text}`}>{ann.title}</p>
                                    <p className={theme.textMuted}>{ann.content}</p>
                                </li>
                            ))}
                             {item.type === 'fees' && item.data.map(fee => (
                                <li key={fee.id} className="text-sm">
                                    <p className={`font-semibold ${theme.text}`}>{fee.description} - ₦{fee.amount.toLocaleString()}</p>
                                    <p className={fee.status === FeeStatus.Overdue ? 'text-red-500' : theme.textMuted}>
                                        Status: {fee.status} (Due: {new Date(fee.dueDate).toLocaleDateString()})
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TodayFeed;
