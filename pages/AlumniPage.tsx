
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { useApi } from '../hooks/useApi';
import { Alumni, Department, Mentor } from '../types';
import { useTheme } from '../hooks/useTheme';
import SkeletonLoader from '../components/SkeletonLoader';
import ErrorDisplay from '../components/ErrorDisplay';

const SuccessStory: React.FC<{ alumni: Alumni; departmentName: string }> = ({ alumni, departmentName }) => {
    const { theme } = useTheme();
    return (
        <section className={`${theme.name === 'light' ? 'bg-white' : theme.card.background} p-8 rounded-lg ${theme.card.shadow} ${theme.card.border}`}>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img 
              src={alumni.imageUrl} 
              alt={alumni.name} 
              className="w-40 h-40 rounded-full object-cover flex-shrink-0"
              loading="lazy"
            />
            <div className={`${theme.textMuted} leading-relaxed`}>
              <p className="italic">"{alumni.testimonial}"</p>
              <p className={`mt-4 font-semibold ${theme.text}`}>- {alumni.name}, Class of {alumni.graduationYear}</p>
              <p className={`text-sm ${theme.accent}`}>{alumni.occupation} | {departmentName}</p>
            </div>
          </div>
        </section>
    );
};

const AlumniCard: React.FC<{ alumni: Alumni; departmentName: string }> = ({ alumni, departmentName }) => {
    const { theme } = useTheme();
    return (
         <div className={`${theme.card.background} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border} p-6 text-center`}>
            <img src={alumni.imageUrl} alt={alumni.name} className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />
            <h3 className={`text-lg font-bold ${theme.text}`}>{alumni.name}</h3>
            <p className={`${theme.accent} text-sm font-semibold`}>{alumni.occupation}</p>
            <p className={`${theme.textMuted} text-xs mt-2`}>{departmentName} &middot; '{String(alumni.graduationYear).slice(-2)}</p>
        </div>
    )
}

const AlumniPage: React.FC = () => {
    const { data: alumni, loading: alumniLoading, error: alumniError, refetch: refetchAlumni } = useApi<Alumni[]>('/api/alumni');
    const { data: mentors, loading: mentorsLoading, error: mentorsError, refetch: refetchMentors } = useApi<Mentor[]>('/api/mentors');
    const { data: departments, loading: deptsLoading, error: deptsError, refetch: refetchDepts } = useApi<Department[]>('/api/departments');
    const [searchQuery, setSearchQuery] = useState('');
    const { theme } = useTheme();

    const departmentMap = useMemo(() => {
        if (!departments) return {};
        return departments.reduce((acc, dept) => ({...acc, [dept.id]: dept.name}), {} as Record<string, string>);
    }, [departments]);
    
    const filteredAlumni = useMemo(() => {
        if (!alumni) return [];
        const lowercasedQuery = searchQuery.toLowerCase();
        return alumni.filter(a => 
            a.name.toLowerCase().includes(lowercasedQuery) ||
            a.occupation.toLowerCase().includes(lowercasedQuery) ||
            (departmentMap[a.departmentId] || '').toLowerCase().includes(lowercasedQuery)
        );
    }, [alumni, searchQuery, departmentMap]);
    
    const loading = alumniLoading || deptsLoading || mentorsLoading;
    const error = alumniError || deptsError || mentorsError;
    const refetchAll = () => {
        refetchAlumni();
        refetchMentors();
        refetchDepts();
    }

    return (
        <PageWrapper
            title="Alumni Network"
            subtitle="Connecting generations of Crestview leaders and innovators."
        >
            {loading && (
                <div className="space-y-8">
                    <SkeletonLoader type="card" className="h-48" />
                    <SkeletonLoader type="card" className="h-48" />
                </div>
            )}
            {error && <ErrorDisplay message={`Could not load alumni data: ${error}`} onRetry={refetchAll} />}

            {!loading && !error && (
                <div className="max-w-5xl mx-auto space-y-20">
                    <section>
                        <h2 className={`text-3xl font-bold ${theme.text} text-center`}>Alumni Success Stories</h2>
                        <div className="space-y-8 mt-8">
                            {alumni?.slice(0, 2).map(alum => (
                                <SuccessStory key={alum.id} alumni={alum} departmentName={departmentMap[alum.departmentId]} />
                            ))}
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-3xl font-bold ${theme.text} text-center mb-8`}>Mentorship Program</h2>
                        <p className={`text-center max-w-3xl mx-auto mb-8 ${theme.textMuted}`}>
                            Connect with experienced alumni who are eager to guide the next generation. Our mentors provide valuable career advice, industry insights, and support to current students.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {mentors?.map(mentor => (
                                <div key={mentor.id} className={`${theme.card.background} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border} p-4 text-center`}>
                                    <img src={mentor.imageUrl} alt={mentor.name} className="w-20 h-20 rounded-full mx-auto mb-3 object-cover" />
                                    <h4 className={`font-bold ${theme.text}`}>{mentor.name}</h4>
                                    <p className={`text-xs ${theme.textMuted}`}>{mentor.occupation}</p>
                                </div>
                            ))}
                        </div>
                        <div className="text-center mt-8">
                            <button className={`${theme.button.secondary.background} ${theme.button.secondary.text} ${theme.button.secondary.border} font-bold py-3 px-8 rounded-full ${theme.button.secondary.hover} transition-colors duration-300`}>
                                Request a Mentor
                            </button>
                        </div>
                    </section>

                    <section>
                        <h2 className={`text-3xl font-bold ${theme.text} text-center mb-8`}>Alumni Directory</h2>
                         <div className="mb-8 max-w-lg mx-auto">
                            <input 
                                type="search"
                                placeholder="Search by name, occupation, or department..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`block w-full ${theme.input.background} ${theme.input.border} ${theme.input.text} ${theme.input.placeholder} px-4 py-3 rounded-full shadow-sm focus:outline-none ${theme.input.focus}`}
                                aria-label="Search alumni directory"
                            />
                        </div>

                        {filteredAlumni.length > 0 ? (
                            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {filteredAlumni.map(alum => (
                                    <AlumniCard key={alum.id} alumni={alum} departmentName={departmentMap[alum.departmentId]} />
                                ))}
                            </div>
                        ) : (
                             <div className="text-center py-12">
                                <h3 className={`text-2xl font-semibold ${theme.text}`}>No Alumni Found</h3>
                                <p className={`${theme.textMuted} mt-2`}>No results match your search criteria.</p>
                            </div>
                        )}
                    </section>
                    
                    <section className={`text-center p-12 rounded-lg ${theme.name === 'light' ? 'bg-blue-600 text-white' : 'bg-blue-500/20'}`}>
                        <h2 className={`text-3xl font-bold ${theme.name === 'light' ? 'text-white' : theme.text}`}>Support Our Mission</h2>
                        <p className="mt-4 max-w-2xl mx-auto">Your contributions help fund scholarships, research, and campus development. Join us in building a brighter future.</p>
                        <Link to="/donate" className={`mt-6 inline-block ${theme.name === 'light' ? 'bg-white text-blue-600 hover:bg-gray-100' : `${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover}`} font-bold py-3 px-8 rounded-full text-lg transition-colors duration-300`}>
                            Donate Now
                        </Link>
                    </section>
                </div>
            )}
        </PageWrapper>
    );
};

export default AlumniPage;
