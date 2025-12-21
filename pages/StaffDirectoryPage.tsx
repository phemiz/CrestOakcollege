
import React, { useState, useMemo, useEffect } from 'react';
import PageWrapper from '../components/PageWrapper';
import { useApi, getCurrentStudent } from '../hooks/useApi';
import { StaffMember, Department, StaffRole } from '../types';
import { useTheme } from '../hooks/useTheme';
import Breadcrumbs from '../components/Breadcrumbs';
import Pagination from '../components/Pagination';
import AppointmentModal from '../components/AppointmentModal';
import { SkeletonGrid } from '../components/SkeletonLoader';
import ErrorDisplay from '../components/ErrorDisplay';

const StaffCard: React.FC<{ staff: StaffMember; departmentName?: string; onBookAppointment: (staff: StaffMember) => void; isStudent: boolean; }> = ({ staff, departmentName, onBookAppointment, isStudent }) => {
    const { theme } = useTheme();

    return (
        <div className={`${theme.card.background} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border} p-6 flex flex-col h-full`}>
            <div className="flex items-center space-x-4 mb-4">
                <img 
                    src={staff.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.name)}&background=random`} 
                    alt={staff.name} 
                    className="w-16 h-16 rounded-full object-cover flex-shrink-0" 
                />
                <div className="min-w-0">
                    <h3 className={`text-lg font-bold ${theme.text} break-words`}>{staff.name}</h3>
                    <p className={`text-sm ${theme.accent}`}>{staff.role}</p>
                    {departmentName && <p className={`text-xs ${theme.textMuted} truncate`}>{departmentName}</p>}
                </div>
            </div>
            
            <div className="space-y-2 mb-6 flex-grow">
                <div className="flex items-center text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 flex-shrink-0 ${theme.textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <a href={`mailto:${staff.email}`} className={`${theme.text} hover:${theme.accent} truncate block`}>{staff.email}</a>
                </div>
                {staff.phone && (
                    <div className="flex items-center text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 flex-shrink-0 ${theme.textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        <a href={`tel:${staff.phone}`} className={`${theme.text} hover:${theme.accent}`}>{staff.phone}</a>
                    </div>
                )}
            </div>

            {isStudent && (
                <button 
                    onClick={() => onBookAppointment(staff)}
                    className={`w-full mt-auto py-2.5 px-4 rounded-md text-sm font-bold transition-colors duration-200 ${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover}`}
                >
                    Book Appointment
                </button>
            )}
        </div>
    );
};

const StaffDirectoryPage: React.FC = () => {
    const { theme } = useTheme();
    const { data: staffList, loading: staffLoading, error: staffError, refetch: refetchStaff } = useApi<StaffMember[]>('/api/staff');
    const { data: departments, loading: deptsLoading, error: deptsError, refetch: refetchDepts } = useApi<Department[]>('/api/departments');
    
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [deptFilter, setDeptFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
    const [isStudent, setIsStudent] = useState(false);

    const itemsPerPage = 9;

    useEffect(() => {
        setIsStudent(!!getCurrentStudent());
    }, []);

    const departmentMap = useMemo(() => {
        if (!departments) return {};
        return departments.reduce((acc, dept) => ({ ...acc, [dept.id]: dept.name }), {} as Record<string, string>);
    }, [departments]);

    const filteredStaff = useMemo(() => {
        if (!staffList) return [];
        return staffList.filter(staff => {
            const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                  staff.email.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = roleFilter === 'all' || staff.role === roleFilter;
            const matchesDept = deptFilter === 'all' || staff.departmentId === deptFilter;
            
            return matchesSearch && matchesRole && matchesDept;
        });
    }, [staffList, searchQuery, roleFilter, deptFilter]);

    const paginatedStaff = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredStaff.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredStaff, currentPage]);

    const totalPages = Math.ceil(filteredStaff.length / itemsPerPage);

    const handleBookAppointment = (staff: StaffMember) => {
        setSelectedStaff(staff);
    };

    const handleAppointmentSubmit = async (data: any) => {
        // Mock appointment booking
        return new Promise<{ success: boolean; message: string }>((resolve) => {
            setTimeout(() => {
                resolve({ success: true, message: 'Appointment booked successfully!' });
            }, 1000);
        });
    };

    const loading = staffLoading || deptsLoading;
    const error = staffError || deptsError;
    const refetchAll = () => { refetchStaff(); refetchDepts(); };

    const breadcrumbs = [
        { name: 'Home', path: '/' },
        { name: 'Staff Directory' }
    ];

    return (
        <PageWrapper title="Staff Directory" subtitle="Meet the dedicated faculty and staff at CrestOAK College.">
            <Breadcrumbs crumbs={breadcrumbs} />
            
            <div className="max-w-7xl mx-auto">
                {/* Filters */}
                <div className={`p-6 rounded-lg mb-8 ${theme.card.background} ${theme.card.shadow} border ${theme.card.border}`}>
                    <div className="grid md:grid-cols-3 gap-4">
                        <input 
                            type="search" 
                            placeholder="Search by name or email..." 
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                            className={`w-full px-4 py-2 rounded-md border ${theme.input.border} ${theme.input.background} ${theme.input.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        <select 
                            value={roleFilter} 
                            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
                            className={`w-full px-4 py-2 rounded-md border ${theme.input.border} ${theme.input.background} ${theme.input.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                            <option value="all">All Roles</option>
                            {Object.values(StaffRole).map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                        <select 
                            value={deptFilter} 
                            onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
                            className={`w-full px-4 py-2 rounded-md border ${theme.input.border} ${theme.input.background} ${theme.input.text} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        >
                            <option value="all">All Departments</option>
                            {departments?.map(dept => (
                                <option key={dept.id} value={dept.id}>{dept.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {loading && <SkeletonGrid count={6} type="card" />}
                {error && <ErrorDisplay message={`Error loading directory: ${error}`} onRetry={refetchAll} />}

                {!loading && !error && (
                    <>
                        {paginatedStaff.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {paginatedStaff.map(staff => (
                                    <StaffCard 
                                        key={staff.id} 
                                        staff={staff} 
                                        departmentName={staff.departmentId ? departmentMap[staff.departmentId] : undefined}
                                        onBookAppointment={handleBookAppointment}
                                        isStudent={isStudent}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <p className={`${theme.textMuted} text-lg`}>No staff members found matching your criteria.</p>
                            </div>
                        )}

                        {totalPages > 1 && (
                            <Pagination 
                                currentPage={currentPage} 
                                totalPages={totalPages} 
                                onPageChange={setCurrentPage} 
                            />
                        )}
                    </>
                )}
            </div>

            {selectedStaff && (
                <AppointmentModal 
                    isOpen={!!selectedStaff} 
                    onClose={() => setSelectedStaff(null)} 
                    staff={selectedStaff}
                    onSubmit={handleAppointmentSubmit}
                />
            )}
        </PageWrapper>
    );
};

export default StaffDirectoryPage;