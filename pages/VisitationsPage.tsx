
import React, { useMemo } from 'react';
import PageWrapper from '../components/PageWrapper';
import { useApi } from '../hooks/useApi';
import { Visitation } from '../types';
import { useTheme } from '../hooks/useTheme';
import { SkeletonGrid } from '../components/SkeletonLoader';
import ErrorDisplay from '../components/ErrorDisplay';

const VisitationCard: React.FC<{ visitation: Visitation }> = ({ visitation }) => {
    const { theme } = useTheme();
    return (
        <div className={`${theme.card.background} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border} ${theme.card.transition} ${theme.card.hover} overflow-hidden flex flex-col`}>
            <img src={visitation.imageUrl} alt={`${visitation.title} banner`} className="w-full h-48 object-cover" loading="lazy" />
            <div className="p-6 flex-grow flex flex-col">
                <p className={`text-sm font-semibold ${theme.accent}`}>{visitation.category}</p>
                <h3 className={`text-2xl font-bold ${theme.card.text} mt-1`}>{visitation.title}</h3>
                <p className={`${theme.card.textMuted} text-sm mt-1`}>Date: {new Date(visitation.date).toLocaleDateString()}</p>
                <p className={`${theme.card.textMuted} leading-relaxed flex-grow mt-2`}>{visitation.description}</p>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10">
                    <button className={`w-full text-center ${theme.button.secondary.background} ${theme.button.secondary.text} ${theme.button.secondary.border} font-bold py-2 px-6 rounded-full inline-block ${theme.button.secondary.hover} transition-colors duration-300`}>
                        Register Interest
                    </button>
                </div>
            </div>
        </div>
    );
};

const VisitationsPage: React.FC = () => {
    const { data: visitations, loading, error, refetch } = useApi<Visitation[]>('/api/visitations');
    const { theme } = useTheme();

    const categorizedVisitations = useMemo(() => {
        if (!visitations) return {};
        return visitations.reduce((acc, visitation) => {
            const category = visitation.category;
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(visitation);
            return acc;
        }, {} as Record<string, Visitation[]>);
    }, [visitations]);

    const categoryOrder: ('Educational' | 'Departmental' | 'Recreational')[] = ['Educational', 'Departmental', 'Recreational'];
    
    return (
        <PageWrapper
            title="Visitations & Excursions"
            subtitle="Explore beyond the classroom with our curated educational and recreational trips."
        >
             {loading && <SkeletonGrid count={3} type="card" />}
             {error && <ErrorDisplay message={`Could not load visitations: ${error}`} onRetry={refetch} />}
            
            {!loading && !error && visitations && (
                 <div className="space-y-16">
                    {categoryOrder.map(category => {
                        if (categorizedVisitations[category] && categorizedVisitations[category].length > 0) {
                            return (
                                <section key={category}>
                                    <h2 className={`text-3xl font-bold ${theme.text} mb-8 border-b-2 pb-4 ${theme.input.border}`}>{category} Trips</h2>
                                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                        {categorizedVisitations[category].map(visitation => (
                                            <VisitationCard key={visitation.id} visitation={visitation} />
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

export default VisitationsPage;
