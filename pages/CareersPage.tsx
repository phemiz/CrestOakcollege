
import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { useApi } from '../hooks/useApi';
import { JobOpening } from '../types';
import { useTheme } from '../hooks/useTheme';
import SkeletonLoader from '../components/SkeletonLoader';
import ErrorDisplay from '../components/ErrorDisplay';

const CultureItem: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => {
    const { theme } = useTheme();
    return (
        <div className="flex items-start space-x-4">
            <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${theme.name === 'light' ? 'bg-blue-100 text-blue-600' : 'bg-white/10 text-white'}`}>
                {icon}
            </div>
            <div>
                <h3 className={`text-lg font-bold ${theme.text}`}>{title}</h3>
                <p className={`${theme.textMuted} mt-1`}>{children}</p>
            </div>
        </div>
    );
};

const JobAccordion: React.FC<{ job: JobOpening; isOpen: boolean; onToggle: () => void }> = ({ job, isOpen, onToggle }) => {
    const { theme } = useTheme();

    return (
        <div className={`${theme.card.background} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border}`}>
            <button
                onClick={onToggle}
                aria-expanded={isOpen}
                className="w-full text-left p-6 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors duration-200"
            >
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className={`text-xl font-bold ${theme.accent}`}>{job.title}</h3>
                        <p className={`text-sm ${theme.textMuted} mt-1`}>
                            {job.department} &middot; {job.location} &middot; {job.type}
                        </p>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>
            <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
                <div className="p-6 border-t border-gray-200 dark:border-white/10">
                    <p className={`${theme.textMuted} mb-6`}>{job.description}</p>
                    
                    <h4 className={`text-md font-semibold ${theme.text} mb-2`}>Responsibilities</h4>
                    <ul className={`list-disc list-inside space-y-1 mb-6 ${theme.textMuted}`}>
                        {job.responsibilities.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>

                    <h4 className={`text-md font-semibold ${theme.text} mb-2`}>Qualifications</h4>
                    <ul className={`list-disc list-inside space-y-1 mb-6 ${theme.textMuted}`}>
                        {job.qualifications.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>

                    <Link to={`/careers/apply/${job.id}`} className={`inline-block ${theme.button.primary.background} ${theme.button.primary.text} font-bold py-2 px-6 rounded-full ${theme.button.primary.hover} transition-colors duration-300`}>
                        Apply Now
                    </Link>
                </div>
            </div>
        </div>
    );
};

const CareersPage: React.FC = () => {
    const { theme } = useTheme();
    const { data: jobs, loading, error, refetch } = useApi<JobOpening[]>('/api/careers');
    const [openJobId, setOpenJobId] = useState<string | null>(null);

    const [filters, setFilters] = useState({ department: 'all', type: 'all' });

    useEffect(() => {
        document.title = 'Careers - CrestOAK College';
        const metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', 'Explore career opportunities at CrestOAK College and join our team of dedicated professionals.');
        }
    }, []);

    const handleToggle = (jobId: string) => {
        setOpenJobId(prevId => (prevId === jobId ? null : jobId));
    };

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({...prev, [name]: value}));
    };

    const uniqueDepartments = useMemo(() => {
        if (!jobs) return [];
        return [...new Set(jobs.map(job => job.department))];
    }, [jobs]);

    const uniqueTypes = useMemo(() => {
        if (!jobs) return [];
        return [...new Set(jobs.map(job => job.type))];
    }, [jobs]);

    const { featuredJobs, regularJobs } = useMemo(() => {
        if (!jobs) return { featuredJobs: [], regularJobs: [] };
        const featured = jobs.filter(job => job.featured);
        const regular = jobs.filter(job => !job.featured);
        return { featuredJobs: featured, regularJobs: regular };
    }, [jobs]);

    const filteredJobs = useMemo(() => {
        return regularJobs.filter(job => 
            (filters.department === 'all' || job.department === filters.department) &&
            (filters.type === 'all' || job.type === filters.type)
        );
    }, [regularJobs, filters]);

    return (
        <>
            <PageWrapper
                title="Careers at CrestOAK"
                subtitle="Join our team of dedicated professionals and help shape the future of education."
            >
                 <div className="max-w-4xl mx-auto mb-16">
                    <h2 className={`text-3xl font-bold ${theme.text} text-center mb-8`}>Why Work With Us?</h2>
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <CultureItem
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v11.494m-9-5.747h18" /></svg>}
                            title="Make an Impact"
                        >
                            Contribute to the growth and development of the next generation of leaders in Nigeria.
                        </CultureItem>
                        <CultureItem
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9V3" /></svg>}
                            title="Professional Growth"
                        >
                            We are committed to the continuous learning and development of our staff.
                        </CultureItem>
                        <CultureItem
                            icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                            title="Collaborative Community"
                        >
                            Work in a supportive and inclusive environment that values teamwork and innovation.
                        </CultureItem>
                    </div>
                </div>
            </PageWrapper>

            <div className={`py-16 sm:py-24 ${theme.name === 'light' ? 'bg-gray-50' : theme.card.background}`}>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                     <h2 className={`text-3xl font-bold ${theme.text} text-center mb-4`}>Current Openings</h2>
                     <p className={`text-center max-w-2xl mx-auto mb-8 ${theme.textMuted}`}>Find your next opportunity at CrestOAK College. We are always looking for talented individuals to join us.</p>
                     
                    {loading && (
                        <div className="max-w-3xl mx-auto space-y-4">
                            <SkeletonLoader type="line" className="h-24 w-full" />
                            <SkeletonLoader type="line" className="h-24 w-full" />
                            <SkeletonLoader type="line" className="h-24 w-full" />
                        </div>
                    )}
                    {error && <div className="max-w-3xl mx-auto"><ErrorDisplay message={`Could not load job openings: ${error}`} onRetry={refetch} /></div>}
                    
                    {jobs && (
                        <div className="max-w-3xl mx-auto">
                            {featuredJobs.length > 0 && (
                                <div className="mb-12">
                                    <h3 className={`text-2xl font-bold ${theme.text} mb-4 text-center`}>Featured Positions</h3>
                                    <div className="space-y-4">
                                        {featuredJobs.map(job => (
                                            <JobAccordion key={job.id} job={job} isOpen={openJobId === job.id} onToggle={() => handleToggle(job.id)} />
                                        ))}
                                    </div>
                                    <hr className={`my-8 ${theme.input.border}`} />
                                </div>
                            )}

                            {/* Filter Bar */}
                            <div className={`p-4 rounded-lg mb-8 flex flex-col sm:flex-row justify-center gap-4 ${theme.name === 'light' ? 'bg-white' : 'bg-white/5'}`}>
                                <div className="flex-1">
                                    <label htmlFor="department-filter" className={`block text-sm font-medium ${theme.textMuted} mb-1`}>Department</label>
                                    <select
                                        id="department-filter"
                                        name="department"
                                        value={filters.department}
                                        onChange={handleFilterChange}
                                        className={`block w-full ${theme.input.background} ${theme.input.border} ${theme.input.text} px-4 py-2 rounded-md shadow-sm focus:outline-none ${theme.input.focus}`}
                                    >
                                        <option value="all">All Departments</option>
                                        {uniqueDepartments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1">
                                    <label htmlFor="type-filter" className={`block text-sm font-medium ${theme.textMuted} mb-1`}>Job Type</label>
                                    <select
                                        id="type-filter"
                                        name="type"
                                        value={filters.type}
                                        onChange={handleFilterChange}
                                        className={`block w-full ${theme.input.background} ${theme.input.border} ${theme.input.text} px-4 py-2 rounded-md shadow-sm focus:outline-none ${theme.input.focus}`}
                                    >
                                        <option value="all">All Types</option>
                                         {uniqueTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            {filteredJobs.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredJobs.map(job => (
                                        <JobAccordion key={job.id} job={job} isOpen={openJobId === job.id} onToggle={() => handleToggle(job.id)} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <h3 className={`text-2xl font-semibold ${theme.text}`}>No Openings Found</h3>
                                    <p className={`${theme.textMuted} mt-2`}>There are no job openings matching your criteria. Please check back later.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};

export default CareersPage;