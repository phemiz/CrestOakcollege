
import React, { useState, useMemo, useEffect } from 'react';
import PageWrapper from '../components/PageWrapper';
import { useApi, getCurrentStudent } from '../hooks/useApi'; // Assuming bookAppointment is in useApi
import { StaffMember, Department, StaffRole } from '../types';
import { useTheme } from '../hooks/useTheme';
import Breadcrumbs from '../components/Breadcrumbs';
import Pagination from '../components/Pagination';
import AppointmentModal from '../components/AppointmentModal';
import { SkeletonGrid } from '../components/SkeletonLoader';
import ErrorDisplay from '../components/ErrorDisplay';

const StaffCard: React.FC<{ staff: StaffMember; departmentName?: string; onBookAppointment: (staff: StaffMember) => void; isStudent: boolean; }> = ({ staff, departmentName, onBookAppointment, isStudent }) => {
    const { theme } = useTheme();

    const accentBg = theme.name === 'light' ? 'bg-blue-500' : theme.button.primary.background;
    const cardBorder = theme.name === 'light' ? 'border-white' : 'border-gray-800';

    return (
        <div className={`relative flex flex-col ${theme.card.background} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border} ${theme.card.transition} hover:shadow-xl hover:-translate-y-2 overflow-hidden`}>
            {/* Decorative background */}
            <div className={`absolute top-0 left-0 right-0 h-24 ${accentBg} opacity-80`}></div>
            
            <div className="relative z-10 flex flex-col flex-grow p-6">
                {/* Header Section */}
                <div className="flex flex-col items-center text-center pb-6">
                    <img
                        src={staff.imageUrl}
                        alt={`Photo of ${staff.name}`}
                        className={`w-28 h-28 rounded-full mb-4 object-cover border-4 ${cardBorder} shadow-lg`}
                        loading="lazy"
                    />
                    <h3 className={`text-xl font-bold ${theme.text}`}>{staff.name}</h3>
                    <p className={`${theme.accent} text-sm font-semibold`}>{staff.role}</p>
                    {departmentName && <p className={`${theme.textMuted} text-xs mt-1`}>{departmentName}</p>}
                </div>

                {/* Bio Section */}
                <p className={`${theme.textMuted} text-sm text-center flex-grow border-t ${theme.input.border} pt-4`}>
                    {staff.bio || "Dedicated member of the Crestview faculty."}
                </p>

                {/* Details Section */}
                <div className={`mt-4 pt-4 border-t ${theme.input.border} space-y-3 text-sm`}>
                    {staff.officeHours && staff.officeHours.length > 0 && (
                        <div className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-3 mt-0.5 flex-shrink-0 ${theme.textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <div>
                                <p className={`font-semibold ${theme.textMuted}`}>Office Hours:</p>
                                {staff.officeHours.map(oh => (
                                    <p key={oh.day} className={theme.textMuted}>{oh.day}, {oh.time}</p>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-3 flex-shrink-0 ${theme.textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        <a href={`mailto:${staff.email}`} className={`font-semibold ${theme.accent} hover:underline break-all`}>
                            {staff.email}
                        </a>
                    </div>
                </div>

                {/* Action Button */}
                {isStudent && staff.role === StaffRole.Lecturer && (
                    <div className="mt-6">
                        <button
                            onClick={() => onBookAppointment(staff)}
                            className={`w-full ${theme.button.secondary.background} ${theme.button.secondary.text} ${theme.button.secondary.border} text-sm font-bold py-2.5 px-4 rounded-full ${theme.button.secondary.hover} transition-colors duration-300 transform active:scale-95`}
                        >
                            Book Appointment
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const StaffDirectoryPage: React.FC = () => {
    const { data: staff, loading: staffLoading, error: staffError, refetch: refetchStaff } = useApi<StaffMember[]>('/api/staff');
    const { data: departments, loading: deptsLoading, error: deptsError, refetch: refetchDepts } = useApi<Department[]>('/api/departments');
    const [filters, setFilters] = useState({ query: '', departmentId: 'all' });
    const [currentPage, setCurrentPage] = useState(1);
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);

    const { theme } = useTheme();
    const isStudent = !!getCurrentStudent();
    
    const ITEMS_PER_PAGE = 9;
    
    const departmentMap = useMemo(() => {
        if (!departments) return {};
        return departments.reduce((acc, dept) => ({...acc, [dept.id]: dept.name}), {} as Record<string, string>);
    }, [departments]);
    
    const filteredStaff = useMemo(() => {
        if (!staff) return [];
        const lowercasedQuery = filters.query.toLowerCase();
        return staff.filter(s => 
            (s.name.toLowerCase().includes(lowercasedQuery) || s.role.toLowerCase().includes(lowercasedQuery)) &&
            (filters.departmentId === 'all' || s.departmentId === filters.departmentId)
        );
    }, [staff, filters]);

    // Reset to page 1 whenever filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [filters]);

    // Paginate the filtered results
    const paginatedStaff = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredStaff.slice(startIndex, endIndex);
    }, [filteredStaff, currentPage]);

    const totalPages = Math.ceil(filteredStaff.length / ITEMS_PER_PAGE);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleOpenAppointmentModal = (staffMember: StaffMember) => {
        setSelectedStaff(staffMember);
        setIsAppointmentModalOpen(true);
    };

    // This would be a new function in useApi.ts, mocked for now.
    const handleBookAppointment = async (data: any) => {
        console.log("Booking appointment with:", data);
        await new Promise(res => setTimeout(res, 1000));
        return { success: true, message: "Appointment request sent successfully! You will receive a notification upon confirmation." };
    };

    const loading = staffLoading || deptsLoading;
    const error = staffError || deptsError;
    const refetchAll = () => {
        refetchStaff();
        refetchDepts();
    }
    
    const breadcrumbs = [
        { name: 'Home', path: '/' },
        { name: 'Staff Directory' }
    ];

    return (
        <PageWrapper
            title="Staff & Faculty Directory"
            subtitle="Connect with the dedicated professionals at Crestview College."
        >
            <div className="max-w-6xl mx-auto">
                <Breadcrumbs crumbs={breadcrumbs} />
                 <div className={`max-w-3xl mx-auto p-6 rounded-xl mb-12 ${theme.card.background} ${theme.card.shadow} ${theme.card.border}`}>
                    <div className="grid sm:grid-cols-2 gap-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${theme.textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                            </div>
                            <input
                                type="search"
                                name="query"
                                placeholder="Search by name or role..."
                                value={filters.query}
                                onChange={handleFilterChange}
                                className={`w-full ${theme.input.background} ${theme.input.border} ${theme.input.text} ${theme.input.placeholder} pl-10 pr-4 py-2 rounded-md shadow-sm focus:outline-none ${theme.input.focus}`}
                                aria-label="Search by name or role"
                            />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${theme.textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                            </div>
                            <select
                                name="departmentId"
                                value={filters.departmentId}
                                onChange={handleFilterChange}
                                className={`w-full appearance-none ${theme.input.background} ${theme.input.border} ${theme.input.text} pl-10 pr-10 py-2 rounded-md shadow-sm focus:outline-none ${theme.input.focus}`}
                                aria-label="Filter by department"
                            >
                                <option value="all">All Departments</option>
                                {departments?.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                <svg className={`h-5 w-5 ${theme.textMuted}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {loading && <SkeletonGrid count={6} type="card" />}
                {error && <ErrorDisplay message={`Could not load staff directory: ${error}`} onRetry={refetchAll} />}
                
                {!loading && !error && (
                    filteredStaff.length > 0 ? (
                        <>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {paginatedStaff.map(member => (
                                    <StaffCard 
                                        key={member.id} 
                                        staff={member} 
                                        departmentName={member.departmentId ? departmentMap[member.departmentId] : undefined}
                                        onBookAppointment={handleOpenAppointmentModal}
                                        isStudent={isStudent}
                                    />
                                ))}
                            </div>
                             {totalPages > 1 && (
                                <Pagination 
                                    currentPage={currentPage} 
                                    totalPages={totalPages} 
                                    onPageChange={setCurrentPage} 
                                />
                            )}
                        </>
                    ) : (
                         <div className="text-center py-12">
                            <h3 className={`text-2xl font-semibold ${theme.text}`}>No Staff Found</h3>
                            <p className={`${theme.textMuted} mt-2`}>No staff members match your filter criteria.</p>
                        </div>
                    )
                )}
            </div>
            {selectedStaff && (
                <AppointmentModal 
                    isOpen={isAppointmentModalOpen}
                    onClose={() => setIsAppointmentModalOpen(false)}
                    staff={selectedStaff}
                    onSubmit={handleBookAppointment}
                />
            )}
        </PageWrapper>
    );
};

export default StaffDirectoryPage;
