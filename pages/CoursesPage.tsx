
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import PageWrapper from '../components/PageWrapper';
import { useApi } from '../hooks/useApi';
import { Course, Department } from '../types';
import { useTheme } from '../hooks/useTheme';
import { SkeletonGrid } from '../components/SkeletonLoader';
import StructuredData from '../components/StructuredData';
import ErrorDisplay from '../components/ErrorDisplay';

const CourseCard: React.FC<{ course: Course; departmentName: string }> = ({ course, departmentName }) => {
    const { theme } = useTheme();
    const creditPillBg = theme.name === 'light' ? 'bg-gray-200' : 'bg-white/10';
    const borderColor = theme.name === 'light' ? 'border-gray-200' : theme.name === 'modern' ? 'border-neutral-200' : 'border-white/20';
    return (
        <div className={`${theme.card.background} ${theme.card.rounded} ${theme.card.shadow} ${theme.card.border} p-6 ${theme.card.transition} hover:shadow-lg flex flex-col h-full`}>
            <div className="flex-grow">
                <p className={`text-sm font-semibold ${theme.accent}`}>{course.code}</p>
                <h3 className={`text-xl font-bold ${theme.card.text} mt-1`}>{course.title}</h3>
                <p className={`${theme.card.textMuted} mt-2 text-sm`}>{course.description}</p>
            </div>
            <div className={`mt-4 pt-4 border-t ${borderColor} flex justify-between items-center`}>
                <p className={`text-sm ${theme.textMuted}`}>{departmentName}</p>
                <span className={`${creditPillBg} ${theme.text} text-xs font-bold px-2.5 py-1 rounded-full`}>{course.creditHours} Credits</span>
            </div>
        </div>
    );
};

const CoursesPage: React.FC = () => {
  const { data: courses, loading: coursesLoading, error: coursesError, refetch: refetchCourses } = useApi<Course[]>('/api/courses');
  const { data: departments, loading: deptsLoading, error: deptsError, refetch: refetchDepts } = useApi<Department[]>('/api/departments');
  
  const [activeTab, setActiveTab] = useState<'degree' | 'diploma'>('degree');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const { theme } = useTheme();

  useEffect(() => {
    // Reset filters when tab changes
    setSearchQuery('');
    setDepartmentFilter('all');
  }, [activeTab]);

  const departmentMap = useMemo(() => {
    if (!departments) return {};
    return departments.reduce((acc, dept) => {
      acc[dept.id] = dept.name;
      return acc;
    }, {} as Record<string, string>);
  }, [departments]);
  
  const degreeDepartments = useMemo(() => departments?.filter(d => d.programType === 'Degree') || [], [departments]);
  const diplomaDepartments = useMemo(() => departments?.filter(d => d.programType === 'Diploma') || [], [departments]);
  const degreeCourses = useMemo(() => courses?.filter(c => c.programType === 'Degree') || [], [courses]);
  const diplomaCourses = useMemo(() => courses?.filter(c => c.programType === 'Diploma') || [], [courses]);

  const departmentsForFilter = useMemo(() => {
    return activeTab === 'degree' ? degreeDepartments : diplomaDepartments;
  }, [activeTab, degreeDepartments, diplomaDepartments]);

  const filteredCourses = useMemo(() => {
    const sourceCourses = activeTab === 'degree' ? degreeCourses : diplomaCourses;

    return sourceCourses.filter(course => {
        const query = searchQuery.toLowerCase();
        const searchMatch = (
            course.title.toLowerCase().includes(query) ||
            course.code.toLowerCase().includes(query)
        );
        const departmentMatch = departmentFilter === 'all' || course.departmentId === departmentFilter;

        return searchMatch && departmentMatch;
    });
  }, [searchQuery, departmentFilter, activeTab, degreeCourses, diplomaCourses]);


  const loading = coursesLoading || deptsLoading;
  const error = coursesError || deptsError;
  const refetchAll = useCallback(() => {
    refetchCourses();
    refetchDepts();
  }, [refetchCourses, refetchDepts]);

  const coursesPageSchema = useMemo(() => {
    if (!courses || !departments) return null;
    const items = filteredCourses;
    return {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "name": "Crestview College Academic Programs",
        "description": "A list of degree and diploma programs offered at Crestview College.",
        "itemListElement": items.map((course, index) => ({
            "@type": "Course",
            "position": index + 1,
            "name": `${course.code}: ${course.title}`,
            "description": course.description,
            "provider": {
                "@type": "CollegeOrUniversity",
                "name": "Crestview College",
                "department": departmentMap[course.departmentId] || "Unknown"
            }
        }))
    };
  }, [filteredCourses, courses, departments, departmentMap]);
  
  const tabButtonClasses = (tabName: 'degree' | 'diploma') => `px-6 py-2.5 text-sm font-semibold rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.input.focus} ${
      activeTab === tabName
      ? `${theme.button.primary.background} ${theme.button.primary.text} shadow-md`
      : `${theme.card.background} ${theme.text} hover:bg-gray-200 dark:hover:bg-gray-700`
  }`;

  return (
    <>
      {coursesPageSchema && <StructuredData data={coursesPageSchema} id="courses-schema" />}
      <PageWrapper
        title="Academic Programs"
        subtitle="Discover a wide range of programs designed to prepare you for success."
      >
        <div className="max-w-6xl mx-auto">
          {/* Tabs */}
          <div className="mb-8 flex justify-center">
              <div className={`flex space-x-2 p-1.5 ${theme.name === 'light' ? 'bg-gray-200' : 'bg-white/10'} rounded-full`} role="tablist" aria-label="Program types">
                  <button role="tab" aria-selected={activeTab === 'degree'} onClick={() => setActiveTab('degree')} className={tabButtonClasses('degree')}>Degree Programs (B.Sc / B.A)</button>
                  <button role="tab" aria-selected={activeTab === 'diploma'} onClick={() => setActiveTab('diploma')} className={tabButtonClasses('diploma')}>Diploma Programs (N.D)</button>
              </div>
          </div>
          
          {loading && <SkeletonGrid count={6} type="card" />}
          {error && <ErrorDisplay message={`Error loading data: ${error}`} onRetry={refetchAll} />}
          
          {!loading && !error && (
            <>
              {/* Filter Bar */}
              <div className="mb-8 grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
                <select 
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className={`block w-full ${theme.input.background} ${theme.input.border} ${theme.input.text} ${theme.input.placeholder} px-4 py-3 rounded-md shadow-sm focus:outline-none ${theme.input.focus}`}
                    aria-label="Filter by faculty"
                >
                    <option value="all">All Faculty</option>
                    {departmentsForFilter.map(dept => (
                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                    ))}
                </select>
                <input 
                    type="search"
                    placeholder="Search courses by title or code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`block w-full ${theme.input.background} ${theme.input.border} ${theme.input.text} ${theme.input.placeholder} px-4 py-3 rounded-md shadow-sm focus:outline-none ${theme.input.focus}`}
                    aria-label="Search courses"
                />
              </div>

              {/* Courses Grid */}
              {filteredCourses.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course) => (
                        <CourseCard key={course.id} course={course} departmentName={departmentMap[course.departmentId] || 'Unknown'} />
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                    <h3 className={`text-2xl font-semibold ${theme.text}`}>No Programs Found</h3>
                    <p className={`${theme.textMuted} mt-2`}>There are no programs matching your current filters.</p>
                </div>
              )}
            </>
          )}
        </div>
      </PageWrapper>
    </>
  );
};

export default CoursesPage;