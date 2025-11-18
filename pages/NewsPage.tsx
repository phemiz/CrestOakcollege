
import React from 'react';
import PageWrapper from '../components/PageWrapper';
import { useApi } from '../hooks/useApi';
import { Announcement } from '../types';
import { useTheme } from '../hooks/useTheme';
import SkeletonLoader from '../components/SkeletonLoader';
import ErrorDisplay from '../components/ErrorDisplay';

const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const NewsCard: React.FC<{ announcement: Announcement; featured?: boolean }> = ({ announcement, featured = false }) => {
    const { theme } = useTheme();

    if (featured) {
        return (
            <div className={`${theme.card.background} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border} overflow-hidden md:col-span-2 lg:col-span-3`}>
                <div className="p-8 md:p-10">
                    <p className={`text-sm font-semibold ${theme.accent} mb-2 uppercase tracking-wider`}>Featured Story</p>
                    <h3 className={`text-3xl font-bold ${theme.text} mb-3`}>{announcement.title}</h3>
                    <p className={`${theme.textMuted} text-sm mb-4`}>Published on {formatDate(announcement.createdAt)}</p>
                    <p className={`${theme.textMuted} leading-relaxed`}>{announcement.content}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`${theme.card.background} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border} ${theme.card.transition} ${theme.card.hover} overflow-hidden flex flex-col`}>
            <div className="p-6 flex-grow">
                <h3 className={`text-xl font-bold ${theme.text} mb-2`}>{announcement.title}</h3>
                <p className={`${theme.textMuted} text-sm mb-3`}>Published on {formatDate(announcement.createdAt)}</p>
                <p className={`${theme.textMuted} leading-relaxed text-sm line-clamp-3`}>{announcement.content}</p>
            </div>
            <div className={`${theme.name === 'light' ? 'bg-gray-50 border-gray-100' : 'bg-white/5 border-white/10'} p-4 mt-auto border-t`}>
                <a href="#" onClick={e => e.preventDefault()} className={`font-semibold ${theme.text} hover:${theme.accent} transition-colors duration-300`}>Read More &rarr;</a>
            </div>
        </div>
    );
};

const NewsPage: React.FC = () => {
    const { theme } = useTheme();
    const { data: announcements, loading, error, refetch } = useApi<Announcement[]>('/api/announcements');

    const featuredAnnouncement = announcements?.[0];
    const otherAnnouncements = announcements?.slice(1);

    return (
        <PageWrapper
            title="News & Events"
            subtitle="Stay updated with the latest happenings at Crestview College."
        >
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div className="md:col-span-2 lg:col-span-3">
                        <SkeletonLoader type="card" className="h-48" />
                    </div>
                    <SkeletonLoader type="card" className="h-64" />
                    <SkeletonLoader type="card" className="h-64" />
                    <SkeletonLoader type="card" className="h-64" />
                </div>
            )}
            {error && <ErrorDisplay message={`Could not load news: ${error}`} onRetry={refetch} />}
            
            {!loading && !error && announcements && announcements.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredAnnouncement && <NewsCard announcement={featuredAnnouncement} featured={true} />}
                    {otherAnnouncements?.map((announcement) => (
                        <NewsCard key={announcement.id} announcement={announcement} />
                    ))}
                </div>
            )}

            {!loading && !error && (!announcements || announcements.length === 0) && (
                 <div className="text-center py-12">
                    <h3 className={`text-2xl font-semibold ${theme.text}`}>No News Yet</h3>
                    <p className={`${theme.textMuted} mt-2`}>Please check back later for the latest updates.</p>
                </div>
            )}
        </PageWrapper>
    );
};

export default NewsPage;
