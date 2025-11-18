
import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { useApi } from '../hooks/useApi';
import { StudentClub } from '../types';
import { useTheme } from '../hooks/useTheme';
import { SkeletonGrid } from '../components/SkeletonLoader';
import ErrorDisplay from '../components/ErrorDisplay';

const ClubCard: React.FC<{ club: StudentClub }> = ({ club }) => {
    const { theme } = useTheme();
    return (
        <div className={`${theme.card.background} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border} ${theme.card.transition} ${theme.card.hover} overflow-hidden flex flex-col`}>
            <Link to={`/clubs/${club.id}`} aria-label={`View details for ${club.name}`}>
                <img src={club.imageUrl} alt={`${club.name} banner`} className="w-full h-48 object-cover" loading="lazy" />
            </Link>
            <div className="p-6 flex-grow flex flex-col">
                <h3 className={`text-2xl font-bold ${theme.card.text} mb-2`}>
                    <Link to={`/clubs/${club.id}`} className="hover:underline">{club.name}</Link>
                </h3>
                <p className={`${theme.card.textMuted} leading-relaxed flex-grow`}>{club.description}</p>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                    <Link to={`/clubs/${club.id}`} className={`font-semibold ${theme.accent} hover:underline`}>
                        Learn More &rarr;
                    </Link>
                </div>
            </div>
        </div>
    );
};

const ClubsPage: React.FC = () => {
    const { data: clubs, loading, error, refetch } = useApi<StudentClub[]>('/api/clubs');
    const { theme } = useTheme();

    const categorizedClubs = useMemo(() => {
        if (!clubs) return {};
        return clubs.reduce((acc, club) => {
            const category = club.category || 'General';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(club);
            return acc;
        }, {} as Record<string, StudentClub[]>);
    }, [clubs]);

    const categoryOrder = ['Academic', 'Religious', 'Social', 'General'];
    
    return (
        <PageWrapper
            title="Student Clubs & Organizations"
            subtitle="Get involved, meet new people, and explore your passions outside the classroom."
        >
             {loading && <SkeletonGrid count={3} type="card" />}
             {error && <ErrorDisplay message={`Could not load clubs: ${error}`} onRetry={refetch} />}
            
            {!loading && !error && clubs && (
                 <div className="space-y-16">
                    {categoryOrder.map(category => {
                        if (categorizedClubs[category] && categorizedClubs[category].length > 0) {
                            return (
                                <section key={category}>
                                    <h2 className={`text-3xl font-bold ${theme.text} mb-8 border-b-2 pb-4 ${theme.input.border}`}>{category}</h2>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {categorizedClubs[category].map(club => (
                                            <ClubCard key={club.id} club={club} />
                                        ))}
                                    </div>
                                </section>
                            );
                        }
                        return null;
                    })}
                </div>
            )}
        </PageWrapper>
    );
};

export default ClubsPage;
