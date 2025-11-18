

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import PageWrapper from '../components/PageWrapper';
// FIX: Import student management functions
import {
  fetchAdminAdmissions, updateApplicationStatus, addCourse, updateCourse, deleteCourse,
  staffLogin, staffLogout, getCurrentStaff, studentLogin, addStudent, updateStudent, deleteStudent,
  addStaff, updateStaff, deleteStaff, addAnnouncement, updateAnnouncement, deleteAnnouncement,
  addTimetableEntry, updateTimetableEntry, deleteTimetableEntry,
  deleteCourseMaterial,
  updateStudentEnrollments,
  addOrUpdateCourseGrade,
} from '../hooks/useApi';
import { useApi } from '../hooks/useApi';
// FIX: Renamed AdminTask to Task and imported Student, Fee, and Payment types
import { Department, Application, ApplicationStatus, Course, StaffMember, StaffRole, Task, AnalyticsData, Student, Announcement, TimetableEntry, Fee, Payment, FeeStatus, CourseMaterial, CourseGrade } from '../types';
import { useTheme } from '../hooks/useTheme';
import { useTaskManager } from '../hooks/useTaskManager';
import Modal from '../components/Modal';
import MaterialUploadModal from '../components/MaterialUploadModal';
import EnrollmentModal from '../components/EnrollmentModal';
import { TableSkeleton } from '../components/SkeletonLoader';


// --- Helper Components & Functions ---

const getStatusColor = (status: ApplicationStatus | FeeStatus) => {
    switch(status) {
        case ApplicationStatus.Approved:
        case FeeStatus.Paid:
             return 'text-green-800 bg-green-100';
        case ApplicationStatus.Rejected:
        case FeeStatus.Overdue:
             return 'text-red-800 bg-red-100';
        case ApplicationStatus.Pending:
        case FeeStatus.Due:
        default: return 'text-yellow-800 bg-yellow-100';
    }
};

// --- Admissions Management ---

const AdmissionsManagement: React.FC<{ departmentMap: Record<string, string> }> = ({ departmentMap }) => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { theme } = useTheme();

  const loadAdmissions = useCallback(async () => {
    setLoading(true);
    setError('');
    const result = await fetchAdminAdmissions();
    if (result.success && result.applications) {
      setApplications(result.applications);
    } else {
      setError(result.message || 'Failed to load applications.');
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadAdmissions(); }, [loadAdmissions]);
  
  const handleStatusUpdate = async (id: string, status: ApplicationStatus.Approved | ApplicationStatus.Rejected) => {
    const originalApplications = [...applications];
    setApplications(prev => prev.map(app => app.id === id ? {...app, status} : app));
    const result = await updateApplicationStatus(id, status);
    if (!result.success) {
      setApplications(originalApplications);
      alert(`Failed to update status: ${result.message}`);
    }
  };

  const exportToCsv = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Gender', 'Department', 'Status', 'Submitted At'];
    const rows = applications.map(app => [app.id, `"${app.name.replace(/"/g, '""')}"`, app.email, app.phone, app.gender, `"${departmentMap[app.departmentId] || 'Unknown'}"`, app.status, new Date(app.createdAt).toLocaleString()].join(','));
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'admissions_export.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="text-center p-8">Loading applications...</div>;
  if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

  const tableClasses = {
      container: `${theme.card.background} ${theme.card.shadow} ${theme.card.rounded} overflow-x-auto`,
      header: `${theme.name === 'light' ? 'bg-gray-50' : 'bg-white/5'}`,
      headerCell: `px-6 py-3 text-left text-xs font-bold ${theme.textMuted} uppercase tracking-wider`,
      body: `${theme.name === 'light' ? 'bg-white divide-gray-200' : 'bg-transparent divide-white/10'} divide-y`,
      cell: `px-6 py-4 align-middle text-sm`,
  };

  return (
    <div>
        <div className="flex justify-end mb-6"><button onClick={exportToCsv} disabled={applications.length === 0} className={`${theme.button.primary.background} ${theme.button.primary.text} font-bold py-2 px-6 rounded-full ${theme.button.primary.hover} transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed`}>Export to CSV</button></div>
        <div className={tableClasses.container}>
            <table className="min-w-full divide-y divide-gray-200">
                <thead className={tableClasses.header}>
                <tr>
                    <th scope="col" className={tableClasses.headerCell}>Applicant</th>
                    <th scope="col" className={tableClasses.headerCell}>Department</th>
                    <th scope="col" className={tableClasses.headerCell}>Status</th>
                    <th scope="col" className={tableClasses.headerCell}>Submitted</th>
                    <th scope="col" className={tableClasses.headerCell}>Actions</th>
                </tr>
                </thead>
                <tbody className={tableClasses.body}>
                {applications.map(app => (
                    <tr key={app.id}>
                        <td className={tableClasses.cell}><div className={`font-medium ${theme.text}`}>{app.name}</div><div className={theme.textMuted}>{app.email}</div></td>
                        <td className={`${tableClasses.cell} ${theme.textMuted}`}>{departmentMap[app.departmentId] || 'Unknown'}</td>
                        <td className={tableClasses.cell}><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>{app.status}</span></td>
                        <td className={`${tableClasses.cell} ${theme.textMuted}`}>{new Date(app.createdAt).toLocaleDateString()}</td>
                        <td className={`${tableClasses.cell} font-medium space-x-2 whitespace-nowrap`}>
                            <button onClick={() => handleStatusUpdate(app.id, ApplicationStatus.Approved)} disabled={app.status !== ApplicationStatus.Pending} className="text-green-600 hover:text-green-800 disabled:text-gray-400" aria-label={`Approve application for ${app.name}`}>Approve</button>
                            <button onClick={() => handleStatusUpdate(app.id, ApplicationStatus.Rejected)} disabled={app.status !== ApplicationStatus.Pending} className="text-red-600 hover:text-red-800 disabled:text-gray-400" aria-label={`Reject application for ${app.name}`}>Reject</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
            { applications.length === 0 && <div className={`text-center p-8 ${theme.textMuted}`}>No applications found.</div> }
        </div>
    </div>
  );
};


// --- Course Management ---
const CourseFormModal: React.FC<{ isOpen: boolean; onClose: () => void; onSubmit: (courseData: Omit<Course, 'id'>) => Promise<{ success: boolean; message: string; }>; departments: Department[]; courseToEdit: Course | null;}> = ({ isOpen, onClose, onSubmit, departments, courseToEdit }) => {
    const { theme } = useTheme();
    // FIX: Add programType to initialFormState to match the Course type and satisfy useState type constraint.
    const initialFormState: Omit<Course, 'id' | 'lecturerId'> = { code: '', title: '', description: '', creditHours: 3, departmentId: '', programType: 'Degree' };
    const [formData, setFormData] = useState<Omit<Course, 'id' | 'lecturerId'>>(initialFormState);
    const [errors, setErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    useEffect(() => {
        // FIX: Destructure courseToEdit to omit 'id' and 'lecturerId' before setting form state, preventing type mismatch.
        if (courseToEdit) { 
            const { id, lecturerId, ...editableData } = courseToEdit;
            setFormData(editableData);
        } else {
             setFormData(initialFormState);
        }
        setErrors({}); setApiError('');
    }, [courseToEdit, isOpen]);
    
    const inputClasses = (hasError: boolean) => `mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${theme.input.background} ${theme.input.text} ${hasError ? 'border-red-500' : theme.input.border} ${theme.input.focus} ${theme.input.placeholder}`;

    const validate = () => {
        const newErrors: any = {};
        if (!/^[A-Z]{3}\d{3}$/.test(formData.code)) newErrors.code = 'Must be in ABC123 format.';
        if (!formData.title || formData.title.length < 3) newErrors.title = 'Required (min 3 chars).';
        if (!formData.description || formData.description.length < 10) newErrors.description = 'Required (min 10 chars).';
        if (formData.creditHours < 1 || formData.creditHours > 6) newErrors.creditHours = 'Must be between 1-6.';
        if (!formData.departmentId) newErrors.departmentId = 'Required.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setApiError(''); if (!validate()) return;
        setLoading(true);
        const result = await onSubmit(formData);
        if (result.success) { onClose(); } else { setApiError(result.message); }
        setLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        // FIX: Update programType automatically when department changes to ensure data consistency.
        setFormData(prev => {
            const newFormData = { ...prev, [name]: type === 'number' ? parseInt(value, 10) : value };
            if (name === 'departmentId') {
                const selectedDept = departments.find(d => d.id === value);
                if (selectedDept) {
                    newFormData.programType = selectedDept.programType;
                }
            }
            return newFormData;
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={courseToEdit ? 'Edit Course' : 'Add New Course'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className={`block text-sm font-medium ${theme.textMuted}`}>Course Code</label><input name="code" value={formData.code} onChange={handleChange} maxLength={6} className={inputClasses(!!errors.code)} />{errors.code && <p className="mt-1 text-sm text-red-600">{errors.code}</p>}</div>
                <div><label className={`block text-sm font-medium ${theme.textMuted}`}>Course Title</label><input name="title" value={formData.title} onChange={handleChange} className={inputClasses(!!errors.title)} />{errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}</div>
                <div><label className={`block text-sm font-medium ${theme.textMuted}`}>Description</label><textarea name="description" value={formData.description} onChange={handleChange} rows={3} className={inputClasses(!!errors.description)} />{errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}</div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className={`block text-sm font-medium ${theme.textMuted}`}>Credit Hours</label><input name="creditHours" type="number" value={formData.creditHours.toString()} onChange={handleChange} min="1" max="6" className={inputClasses(!!errors.creditHours)} />{errors.creditHours && <p className="mt-1 text-sm text-red-600">{errors.creditHours}</p>}</div>
                    <div><label className={`block text-sm font-medium ${theme.textMuted}`}>Department</label><select name="departmentId" value={formData.departmentId} onChange={handleChange} className={inputClasses(!!errors.departmentId)}><option value="">Select...</option>{departments.map(d => ({ value: d.id, label: d.name })).map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>{errors.departmentId && <p className="mt-1 text-sm text-red-600">{errors.departmentId}</p>}</div>
                </div>
                {apiError && <p className="text-sm text-red-600 text-center">{apiError}</p>}
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className={`py-2 px-6 rounded-full border ${theme.name === 'light' ? 'border-gray-300' : 'border-white/50'} hover:bg-gray-100`}>Cancel</button>
                    <button type="submit" disabled={loading} className={`py-2 px-6 rounded-full ${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover} disabled:opacity-50`}>{loading ? 'Saving...' : 'Save Course'}</button>
                </div>
            </form>
        </Modal>
    );
};
const CourseManagement: React.FC<{ departments: Department[], departmentMap: Record<string, string> }> = ({ departments, departmentMap }) => {
    const { data: courses, loading, error, refetch } = useApi<Course[]>('/api/courses');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);
    const { theme } = useTheme();

    const handleAddClick = () => { setCourseToEdit(null); setIsModalOpen(true); };
    const handleEditClick = (course: Course) => { setCourseToEdit(course); setIsModalOpen(true); };
    const handleDeleteClick = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            const result = await deleteCourse(id);
            if(result.success) refetch(); else alert(`Error: ${result.message}`);
        }
    };
    const handleFormSubmit = async (courseData: Omit<Course, 'id'>) => {
        const result = courseToEdit ? await updateCourse(courseToEdit.id, courseData) : await addCourse(courseData);
        if (result.success) refetch();
        return result;
    };
    
    if (loading) return <div className="text-center p-8">Loading courses...</div>
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>
    
    const tableClasses = {
        container: `${theme.card.background} ${theme.card.shadow} ${theme.card.rounded} overflow-x-auto`,
        header: `${theme.name === 'light' ? 'bg-gray-50' : 'bg-white/5'}`,
        headerCell: `px-6 py-3 text-left text-xs font-bold ${theme.textMuted} uppercase tracking-wider`,
        body: `${theme.name === 'light' ? 'bg-white divide-gray-200' : 'bg-transparent divide-white/10'} divide-y`,
        cell: `px-6 py-4 align-middle text-sm`,
    };

    return (
        <div>
            <div className="flex justify-end mb-6"><button onClick={handleAddClick} className={`${theme.button.primary.background} ${theme.button.primary.text} font-bold py-2 px-6 rounded-full ${theme.button.primary.hover}`}>Add New Course</button></div>
            <div className={tableClasses.container}>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className={tableClasses.header}><tr>
                        <th scope="col" className={tableClasses.headerCell}>Code</th>
                        <th scope="col" className={tableClasses.headerCell}>Title</th>
                        <th scope="col" className={tableClasses.headerCell}>Department</th>
                        <th scope="col" className={`${tableClasses.headerCell} text-center`}>Credits</th>
                        <th scope="col" className={tableClasses.headerCell}>Actions</th>
                    </tr></thead>
                     <tbody className={tableClasses.body}>{courses?.map(course => (
                         <tr key={course.id}>
                           <td className={`${tableClasses.cell} font-medium ${theme.text}`}>{course.code}</td>
                           <td className={`${tableClasses.cell} ${theme.textMuted}`}>{course.title}</td>
                           <td className={`${tableClasses.cell} ${theme.textMuted}`}>{departmentMap[course.departmentId] || 'N/A'}</td>
                           <td className={`${tableClasses.cell} ${theme.textMuted} text-center`}>{course.creditHours}</td>
                           <td className={tableClasses.cell}>
                                <div className="flex items-center justify-start space-x-3">
                                    <button 
                                        onClick={() => handleEditClick(course)} 
                                        className={`${theme.textMuted} hover:${theme.text} p-1.5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${theme.input.focus}`} 
                                        aria-label={`Edit ${course.title}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" />
                                        </svg>
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteClick(course.id)} 
                                        className="text-red-500 hover:text-red-700 p-1.5 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500" 
                                        aria-label={`Delete ${course.title}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                </div>
                           </td>
                         </tr>
                       ))}</tbody>
                </table>
                { (!courses || courses.length === 0) && <div className={`text-center p-8 ${theme.textMuted}`}>No courses found.</div> }
            </div>
            <CourseFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleFormSubmit} departments={departments} courseToEdit={courseToEdit}/>
        </div>
    );
};

// --- Course Materials Management ---
const CourseMaterialsManagement: React.FC<{ user: StaffMember }> = ({ user }) => {
    const { theme } = useTheme();
    const { data: courses, loading: cLoading } = useApi<Course[]>('/api/courses');
    const { data: materials, loading: mLoading, refetch: refetchMaterials } = useApi<CourseMaterial[]>('/api/course-materials');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    const managedCourses = useMemo(() => {
        if (!courses) return [];
        if (user.role === StaffRole.Admin) return courses;
        if (user.role === StaffRole.AcademicOfficer) return courses.filter(c => c.departmentId === user.departmentId);
        if (user.role === StaffRole.Lecturer) return courses.filter(c => c.lecturerId === user.id);
        return [];
    }, [courses, user]);

    const handleUploadClick = (course: Course) => {
        setSelectedCourse(course);
        setIsModalOpen(true);
    };

    const handleDeleteMaterial = async (materialId: string) => {
        if (window.confirm('Are you sure you want to delete this material?')) {
            const result = await deleteCourseMaterial(materialId);
            if (result.success) {
                refetchMaterials();
            } else {
                alert(`Error: ${result.message}`);
            }
        }
    };

    if (cLoading || mLoading) return <div className="text-center p-8">Loading course data...</div>;

    return (
        <div className="space-y-8">
            {managedCourses.length > 0 ? managedCourses.map(course => {
                const courseMaterials = materials?.filter(m => m.courseId === course.id) || [];
                return (
                    <div key={course.id} className={`${theme.card.background} ${theme.card.shadow} ${theme.card.rounded} p-6 ${theme.card.border}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className={`text-xl font-bold ${theme.text}`}>{course.code}: {course.title}</h3>
                            <button onClick={() => handleUploadClick(course)} className={`${theme.button.primary.background} ${theme.button.primary.text} font-bold py-2 px-4 rounded-full text-sm ${theme.button.primary.hover}`}>
                                Upload Material
                            </button>
                        </div>
                        {courseMaterials.length > 0 ? (
                            <ul className="space-y-3">
                                {courseMaterials.map(material => (
                                    <li key={material.id} className={`flex items-center justify-between p-3 rounded-md ${theme.name === 'light' ? 'bg-gray-50' : 'bg-white/5'}`}>
                                        <div className="flex items-center gap-3">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${material.fileType === 'PDF' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>{material.fileType}</span>
                                            <div>
                                                <p className={`font-semibold text-sm ${theme.text}`}>{material.title}</p>
                                                <p className={`text-xs ${theme.textMuted}`}>Uploaded: {new Date(material.uploadedAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDeleteMaterial(material.id)} className="text-red-500 hover:text-red-700 p-1.5 rounded-full" aria-label={`Delete material ${material.title}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className={theme.textMuted}>No materials uploaded for this course yet.</p>
                        )}
                    </div>
                );
            }) : (
                <div className={`text-center p-8 ${theme.card.background} ${theme.card.shadow} ${theme.card.rounded}`}>
                    <p className={theme.textMuted}>You are not assigned to any courses for material management.</p>
                </div>
            )}
            <MaterialUploadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                course={selectedCourse}
                onUploadSuccess={refetchMaterials}
            />
        </div>
    );
};


// --- Task Management ---

const TaskItem: React.FC<{ task: Task; onToggle: (id: string) => void; onDelete: (id: string) => void; onUpdate: (id: string, newTitle: string) => void; }> = ({ task, onToggle, onDelete, onUpdate }) => {
    const { theme } = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(task.title);
    const inputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditing) { inputRef.current?.focus(); inputRef.current?.select(); }
    }, [isEditing]);

    const handleUpdate = () => {
        if (title.trim() !== task.title) onUpdate(task.id, title);
        setIsEditing(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleUpdate();
        else if (e.key === 'Escape') { setTitle(task.title); setIsEditing(false); }
    };

    const actionButtonClasses = `flex-shrink-0 p-1.5 ${theme.textMuted} hover:${theme.text} rounded-full transition-colors duration-200`;

    return (
        <li className={`flex items-center gap-3 p-3 rounded-lg ${theme.name === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/10'}`}>
            <input type="checkbox" checked={task.completed} onChange={() => onToggle(task.id)} className={`h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer`} aria-labelledby={`task-title-${task.id}`} />
            <div className="flex-grow">
                {isEditing ? (
                    <input ref={inputRef} type="text" value={title} onChange={(e) => setTitle(e.target.value)} onBlur={handleUpdate} onKeyDown={handleKeyDown} className={`w-full text-sm px-2 py-1 rounded-md ${theme.input.background} ${theme.input.border} ${theme.input.text} ${theme.input.focus}`} />
                ) : (
                    <span id={`task-title-${task.id}`} className={`text-sm ${theme.text} ${task.completed ? 'line-through opacity-60' : ''} cursor-pointer`} onDoubleClick={() => setIsEditing(true)}>{task.title}</span>
                )}
            </div>
            <div className="flex items-center gap-1">
                 <button onClick={() => setIsEditing(true)} className={actionButtonClasses} aria-label={`Edit task: ${task.title}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg></button>
                 <button onClick={() => onDelete(task.id)} className={actionButtonClasses} aria-label={`Delete task: ${task.title}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
            </div>
        </li>
    );
};

const TaskManagement: React.FC<{ userId: string }> = ({ userId }) => {
    const { theme } = useTheme();
    const { tasks, addTask, toggleTask, deleteTask, updateTaskTitle, clearCompletedTasks } = useTaskManager(userId);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault(); addTask(newTaskTitle); setNewTaskTitle('');
    };
    
    const completedCount = useMemo(() => tasks.filter(t => t.completed).length, [tasks]);

    return (
        <div className={`${theme.card.background} ${theme.card.shadow} ${theme.card.rounded} p-6 max-w-2xl mx-auto`}>
            <h3 className={`text-2xl font-bold ${theme.text} mb-4`}>My To-Do List</h3>
            <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
                <input type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} placeholder="Add a new task..." className={`flex-grow block w-full px-4 py-2 border rounded-full shadow-sm focus:outline-none ${theme.input.background} ${theme.input.text} ${theme.input.border} ${theme.input.focus} ${theme.input.placeholder}`} />
                <button type="submit" className={`px-5 py-2 rounded-full font-semibold ${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover} disabled:opacity-50`} disabled={!newTaskTitle.trim()}>Add</button>
            </form>
            <ul className="space-y-1">{tasks.map(task => (<TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} onUpdate={updateTaskTitle} />))}</ul>
            {tasks.length === 0 && (<p className={`text-center py-4 ${theme.textMuted}`}>You have no tasks. Add one above to get started!</p>)}
            {tasks.length > 0 && (
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 dark:border-white/10 text-sm">
                    <span className={theme.textMuted}>{tasks.length - completedCount} tasks left</span>
                     {completedCount > 0 && (<button onClick={clearCompletedTasks} className={`font-medium text-red-500 hover:text-red-700`}>Clear completed ({completedCount})</button>)}
                </div>
            )}
        </div>
    );
};

// --- Analytics Dashboard ---
const AnalyticsDashboard: React.FC = () => {
    const { data: analyticsData, loading, error } = useApi<AnalyticsData>('/api/analytics');
    const { theme } = useTheme();

    if (loading) return <div className="text-center p-8">Loading analytics...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;
    if (!analyticsData) return null;

    const PIE_COLORS = ['#4ade80', '#fbbf24', '#f87171'];
    const BAR_COLORS = ['#22d3ee', '#6366f1', '#a855f7'];

    const pieData = analyticsData.applicationsByStatus.map(item => ({ name: item.status, value: item.count }));
    const barData = analyticsData.enrollmentByDepartment.map(item => ({ name: item.departmentName, students: item.count }));

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            <div className={`${theme.card.background} ${theme.card.shadow} ${theme.card.rounded} p-6`}>
                <h3 className={`text-xl font-bold ${theme.text} mb-4`}>Application Status</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                            {pieData.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className={`${theme.card.background} ${theme.card.shadow} ${theme.card.rounded} p-6`}>
                <h3 className={`text-xl font-bold ${theme.text} mb-4`}>Enrollment by Department</h3>
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <XAxis dataKey="name" tick={{ fill: theme.textMuted, fontSize: 12 }} />
                        <YAxis tick={{ fill: theme.textMuted, fontSize: 12 }} />
                        <Tooltip cursor={{fill: 'rgba(128, 128, 128, 0.1)'}} contentStyle={{ backgroundColor: theme.card.background, border: `1px solid ${theme.input.border}` }} />
                        <Bar dataKey="students" fill="#8884d8">
                           {barData.map((entry, index) => (<Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// --- Student Data Management ---
const StudentFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (studentData: any) => Promise<{ success: boolean; message: string; }>;
    departments: Department[];
    studentToEdit: Student | null;
}> = ({ isOpen, onClose, onSubmit, departments, studentToEdit }) => {
    const { theme } = useTheme();
    const initialFormState = { studentId: '', name: '', email: '', phone: '', departmentId: '', password: '' };
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    useEffect(() => {
        if (studentToEdit) {
            setFormData({ ...initialFormState, ...studentToEdit });
        } else {
            setFormData(initialFormState);
        }
        setErrors({});
        setApiError('');
    }, [studentToEdit, isOpen]);

    const inputClasses = (hasError: boolean) => `mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${theme.input.background} ${theme.input.text} ${hasError ? 'border-red-500' : theme.input.border} ${theme.input.focus} ${theme.input.placeholder}`;

    const validate = () => {
        const newErrors: any = {};
        if (!formData.name.trim() || formData.name.length < 3) newErrors.name = 'Full name is required (min 3 chars).';
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(formData.email)) newErrors.email = 'A valid email is required.';
        if (!formData.studentId.trim() || !/^[A-Z]{3}\/\d{2}\/\d{3}$/i.test(formData.studentId)) newErrors.studentId = 'Student ID must be in the format CST/21/001.';
        if (!formData.departmentId) newErrors.departmentId = 'Department is required.';
        if (!studentToEdit && (!formData.password || formData.password.length < 8)) newErrors.password = 'Password is required (min 8 chars).';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError('');
        if (!validate()) return;
        setLoading(true);
        const result = await onSubmit(formData);
        if (result.success) {
            onClose();
        } else {
            setApiError(result.message);
        }
        setLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={studentToEdit ? 'Edit Student' : 'Add New Student'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div><label className={`block text-sm font-medium ${theme.textMuted}`}>Full Name</label><input name="name" value={formData.name} onChange={handleChange} className={inputClasses(!!errors.name)} />{errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}</div>
                    <div><label className={`block text-sm font-medium ${theme.textMuted}`}>Student ID</label><input name="studentId" value={formData.studentId} onChange={handleChange} className={inputClasses(!!errors.studentId)} disabled={!!studentToEdit} placeholder="e.g., CST/21/001" />{errors.studentId && <p className="mt-1 text-sm text-red-600">{errors.studentId}</p>}</div>
                </div>
                <div><label className={`block text-sm font-medium ${theme.textMuted}`}>Email Address</label><input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClasses(!!errors.email)} />{errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}</div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className={`block text-sm font-medium ${theme.textMuted}`}>Phone Number (Optional)</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClasses(!!errors.phone)} />{errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}</div>
                    <div><label className={`block text-sm font-medium ${theme.textMuted}`}>Department</label><select name="departmentId" value={formData.departmentId} onChange={handleChange} className={inputClasses(!!errors.departmentId)}><option value="">Select...</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>{errors.departmentId && <p className="mt-1 text-sm text-red-600">{errors.departmentId}</p>}</div>
                </div>
                {!studentToEdit && <div><label className={`block text-sm font-medium ${theme.textMuted}`}>Password</label><input type="password" name="password" value={formData.password} onChange={handleChange} className={inputClasses(!!errors.password)} />{errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}</div>}
                {apiError && <p className="text-sm text-red-600 text-center">{apiError}</p>}
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className={`py-2 px-6 rounded-full border ${theme.name === 'light' ? 'border-gray-300' : 'border-white/50'} hover:bg-gray-100`} disabled={loading}>Cancel</button>
                    <button type="submit" disabled={loading} className={`py-2 px-6 rounded-full ${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover} disabled:opacity-50`}>{loading ? 'Saving...' : 'Save Student'}</button>
                </div>
            </form>
        </Modal>
    );
};

const StudentDataManagement: React.FC<{ departmentMap: Record<string, string>, departments: Department[] }> = ({ departmentMap, departments }) => {
    const { data: students, loading, error, refetch } = useApi<Student[]>('/api/students');
    const { data: courses, loading: coursesLoading } = useApi<Course[]>('/api/courses');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
    const [studentToEnroll, setStudentToEnroll] = useState<Student | null>(null);
    const [filters, setFilters] = useState({ query: '', departmentId: 'all' });
    const { theme } = useTheme();

    const filteredStudents = useMemo(() => {
        if (!students) return [];
        const lowercasedQuery = filters.query.toLowerCase();
        return students.filter(s =>
            (s.name.toLowerCase().includes(lowercasedQuery) || s.studentId.toLowerCase().includes(lowercasedQuery) || s.email.toLowerCase().includes(lowercasedQuery)) &&
            (filters.departmentId === 'all' || s.departmentId === filters.departmentId)
        );
    }, [students, filters]);

    const handleAddClick = () => { setStudentToEdit(null); setIsModalOpen(true); };
    const handleEditClick = (student: Student) => { setStudentToEdit(student); setIsModalOpen(true); };
    const handleManageCoursesClick = (student: Student) => setStudentToEnroll(student);
    const handleDeleteClick = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete the student "${name}"? This action cannot be undone.`)) {
            const result = await deleteStudent(id);
            if (result.success) refetch(); else alert(`Error: ${result.message}`);
        }
    };
    const handleFormSubmit = async (studentData: any) => {
        const dataToSubmit = { ...studentData };
        if (studentToEdit) { delete dataToSubmit.password; }
        const result = studentToEdit
            ? await updateStudent(studentToEdit.id, dataToSubmit)
            : await addStudent(dataToSubmit);
        if (result.success) refetch();
        return result;
    };
     const handleEnrollmentSubmit = async (studentId: string, courseIds: string[]) => {
        const result = await updateStudentEnrollments(studentId, courseIds);
        if (result.success) {
            setStudentToEnroll(null); // Close modal on success
        }
        return result;
    };


    if (loading || coursesLoading) return <div className="text-center p-8">Loading students...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    const tableClasses = {
        container: `${theme.card.background} ${theme.card.shadow} ${theme.card.rounded} overflow-x-auto`,
        header: `${theme.name === 'light' ? 'bg-gray-50' : 'bg-white/5'}`,
        headerCell: `px-6 py-3 text-left text-xs font-bold ${theme.textMuted} uppercase tracking-wider`,
        body: `${theme.name === 'light' ? 'bg-white divide-gray-200' : 'bg-transparent divide-white/10'} divide-y`,
        cell: `px-6 py-4 align-middle text-sm`,
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="flex gap-4 w-full md:w-auto">
                    <input type="search" placeholder="Search name, email, or ID..." value={filters.query} onChange={e => setFilters(prev => ({...prev, query: e.target.value}))} className={`w-full md:w-64 px-4 py-2 border rounded-full ${theme.input.background} ${theme.input.border} ${theme.input.text} ${theme.input.focus}`} />
                    <select value={filters.departmentId} onChange={e => setFilters(prev => ({...prev, departmentId: e.target.value}))} className={`w-full md:w-64 px-4 py-2 border rounded-full ${theme.input.background} ${theme.input.border} ${theme.input.text} ${theme.input.focus}`}>
                        <option value="all">All Departments</option>
                        {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                </div>
                <button onClick={handleAddClick} className={`${theme.button.primary.background} ${theme.button.primary.text} font-bold py-2 px-6 rounded-full ${theme.button.primary.hover} w-full md:w-auto flex-shrink-0`}>Add New Student</button>
            </div>
            <div className={tableClasses.container}>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className={tableClasses.header}><tr>
                        <th scope="col" className={tableClasses.headerCell}>Student</th>
                        <th scope="col" className={tableClasses.headerCell}>Student ID</th>
                        <th scope="col" className={tableClasses.headerCell}>Department</th>
                        <th scope="col" className={tableClasses.headerCell}>Actions</th>
                    </tr></thead>
                    <tbody className={tableClasses.body}>{filteredStudents.map(student => (
                        <tr key={student.id}>
                            <td className={tableClasses.cell}><div className={`font-medium ${theme.text}`}>{student.name}</div><div className={theme.textMuted}>{student.email}</div></td>
                            <td className={`${tableClasses.cell} ${theme.textMuted}`}>{student.studentId}</td>
                            <td className={`${tableClasses.cell} ${theme.textMuted}`}>{departmentMap[student.departmentId] || 'N/A'}</td>
                            <td className={tableClasses.cell}>
                                <div className="flex items-center justify-start space-x-1">
                                    <button onClick={() => handleEditClick(student)} title="Edit Student" className={`${theme.textMuted} hover:${theme.text} p-1.5 rounded-full`} aria-label={`Edit ${student.name}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg></button>
                                    <button onClick={() => handleManageCoursesClick(student)} title="Manage Courses" className={`${theme.textMuted} hover:${theme.text} p-1.5 rounded-full`} aria-label={`Manage courses for ${student.name}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg></button>
                                    <button onClick={() => handleDeleteClick(student.id, student.name)} title="Delete Student" className="text-red-500 hover:text-red-700 p-1.5 rounded-full" aria-label={`Delete ${student.name}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                </div>
                            </td>
                        </tr>
                    ))}</tbody>
                </table>
                {filteredStudents.length === 0 && <div className={`text-center p-8 ${theme.textMuted}`}>No students found matching your criteria.</div>}
            </div>
            <StudentFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleFormSubmit} departments={departments} studentToEdit={studentToEdit}/>
            {studentToEnroll && (
                <EnrollmentModal
                    isOpen={!!studentToEnroll}
                    onClose={() => setStudentToEnroll(null)}
                    student={studentToEnroll}
                    allCourses={courses || []}
                    departments={departments}
                    onSubmit={handleEnrollmentSubmit}
                />
            )}
        </div>
    );
};

// --- NEW Finance Components ---
const StudentFinanceDetailsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    student: Student | null;
    studentFees: Fee[];
    studentPayments: Payment[];
}> = ({ isOpen, onClose, student, studentFees, studentPayments }) => {
    const { theme } = useTheme();
    const [activeTab, setActiveTab] = useState<'fees' | 'history'>('fees');

    if (!student) return null;

    const tabButtonClasses = (isActive: boolean) => `w-full py-2 text-center font-semibold text-sm transition-colors duration-300 border-b-2 ${
        isActive
        ? `${theme.accent} ${theme.name === 'light' ? 'border-blue-600' : 'border-blue-400'}`
        : `${theme.textMuted} hover:${theme.text} border-transparent`
    }`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Financial Details: ${student.name}`}>
            <div className="flex border-b mb-4">
                <button onClick={() => setActiveTab('fees')} className={tabButtonClasses(activeTab === 'fees')}>Fee Details</button>
                <button onClick={() => setActiveTab('history')} className={tabButtonClasses(activeTab === 'history')}>Payment History</button>
            </div>
            <div className="max-h-96 overflow-y-auto pr-2">
                {activeTab === 'fees' && (
                    <table className="w-full text-left text-sm">
                        <thead><tr>
                            <th className={`py-2 ${theme.textMuted}`}>Description</th>
                            <th className={`py-2 ${theme.textMuted} text-center`}>Status</th>
                            <th className={`py-2 ${theme.textMuted} text-right`}>Amount</th>
                        </tr></thead>
                        <tbody>
                            {studentFees.map(fee => (
                                <tr key={fee.id} className={`border-t ${theme.input.border}`}>
                                    <td className="py-2 pr-2"><p className={`font-medium ${theme.text}`}>{fee.description}</p><p className="text-xs text-gray-400">Due: {new Date(fee.dueDate).toLocaleDateString()}</p></td>
                                    <td className="py-2 text-center"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(fee.status)}`}>{fee.status}</span></td>
                                    <td className="py-2 text-right font-semibold">₦{fee.amount.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                {activeTab === 'history' && (
                    <ul className="space-y-2">
                        {studentPayments.map(payment => (
                            <li key={payment.id} className={`p-2 rounded-md border ${theme.input.border} flex justify-between items-center`}>
                                <div>
                                    <p className={`font-semibold text-sm ${theme.text}`}>{payment.description}</p>
                                    <p className={`text-xs ${theme.textMuted}`}>{new Date(payment.date).toLocaleString()}</p>
                                </div>
                                <p className={`font-bold text-sm ${theme.text}`}>₦{payment.amount.toLocaleString()}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </Modal>
    );
};

const FinanceManagement: React.FC<{ departmentMap: Record<string, string> }> = ({ departmentMap }) => {
    const { theme } = useTheme();
    const { data: students, loading: studentsLoading } = useApi<Student[]>('/api/students');
    const { data: fees, loading: feesLoading } = useApi<Fee[]>('/api/fees');
    const { data: payments, loading: paymentsLoading } = useApi<Payment[]>('/api/payments');

    const [filters, setFilters] = useState({ query: '' });
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loading = studentsLoading || feesLoading || paymentsLoading;

    const studentFinancials = useMemo(() => {
        if (!students || !fees || !payments) return [];
        return students.map(student => {
            const studentFees = fees.filter(f => f.studentId === student.id);
            const studentPayments = payments.filter(p => p.studentId === student.id);
            const totalFees = studentFees.reduce((sum, f) => sum + f.amount, 0);
            const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount, 0);
            return {
                ...student,
                totalFees,
                totalPaid,
                outstandingBalance: totalFees - totalPaid,
            };
        });
    }, [students, fees, payments]);

    const filteredStudents = useMemo(() => {
        const lowercasedQuery = filters.query.toLowerCase();
        return studentFinancials.filter(s =>
            s.name.toLowerCase().includes(lowercasedQuery) ||
            s.studentId.toLowerCase().includes(lowercasedQuery)
        );
    }, [studentFinancials, filters]);

    const handleRowClick = (student: Student) => {
        setSelectedStudent(student);
        setIsModalOpen(true);
    };

    if (loading) return <div className="text-center p-8">Loading financial data...</div>;

    const tableClasses = {
        container: `${theme.card.background} ${theme.card.shadow} ${theme.card.rounded} overflow-x-auto`,
        header: `${theme.name === 'light' ? 'bg-gray-50' : 'bg-white/5'}`,
        headerCell: `px-6 py-3 text-left text-xs font-bold ${theme.textMuted} uppercase tracking-wider`,
        body: `${theme.name === 'light' ? 'bg-white divide-gray-200' : 'bg-transparent divide-white/10'} divide-y`,
        cell: `px-6 py-4 align-middle text-sm`,
    };

    return (
        <div>
            <div className="mb-6">
                <input
                    type="search"
                    placeholder="Search by student name or ID..."
                    value={filters.query}
                    onChange={e => setFilters(prev => ({ ...prev, query: e.target.value }))}
                    className={`w-full max-w-sm px-4 py-2 border rounded-full ${theme.input.background} ${theme.input.border} ${theme.input.text} ${theme.input.focus}`}
                />
            </div>
            <div className={tableClasses.container}>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className={tableClasses.header}><tr>
                        <th scope="col" className={tableClasses.headerCell}>Student</th>
                        <th scope="col" className={tableClasses.headerCell}>Department</th>
                        <th scope="col" className={`${tableClasses.headerCell} text-right`}>Total Fees</th>
                        <th scope="col" className={`${tableClasses.headerCell} text-right`}>Total Paid</th>
                        <th scope="col" className={`${tableClasses.headerCell} text-right`}>Balance</th>
                    </tr></thead>
                    <tbody className={tableClasses.body}>
                        {filteredStudents.map(student => (
                            <tr key={student.id} onClick={() => handleRowClick(student)} className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5">
                                <td className={tableClasses.cell}><div className={`font-medium ${theme.text}`}>{student.name}</div><div className={theme.textMuted}>{student.studentId}</div></td>
                                <td className={`${tableClasses.cell} ${theme.textMuted}`}>{departmentMap[student.departmentId]}</td>
                                <td className={`${tableClasses.cell} text-right ${theme.textMuted}`}>₦{student.totalFees.toLocaleString()}</td>
                                <td className={`${tableClasses.cell} text-right text-green-600`}>₦{student.totalPaid.toLocaleString()}</td>
                                <td className={`${tableClasses.cell} text-right font-bold ${student.outstandingBalance > 0 ? 'text-red-500' : theme.text}`}>₦{student.outstandingBalance.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <StudentFinanceDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                student={selectedStudent}
                studentFees={fees?.filter(f => f.studentId === selectedStudent?.id) || []}
                studentPayments={payments?.filter(p => p.studentId === selectedStudent?.id) || []}
            />
        </div>
    );
};

// --- NEW Staff Components ---
const StaffFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (staffData: any) => Promise<{ success: boolean; message: string; }>;
    departments: Department[];
    staffToEdit: StaffMember | null;
}> = ({ isOpen, onClose, onSubmit, departments, staffToEdit }) => {
    const { theme } = useTheme();
    const initialFormState = { name: '', email: '', phone: '', role: StaffRole.Lecturer, departmentId: '', password: '' };
    const [formData, setFormData] = useState<any>(initialFormState);
    const [errors, setErrors] = useState<any>({});
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    useEffect(() => {
        if (staffToEdit) {
            setFormData({ ...initialFormState, ...staffToEdit, departmentId: staffToEdit.departmentId || '' });
        } else {
            setFormData(initialFormState);
        }
        setErrors({});
        setApiError('');
    }, [staffToEdit, isOpen]);

    const inputClasses = (hasError: boolean) => `mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${theme.input.background} ${theme.input.text} ${hasError ? 'border-red-500' : theme.input.border} ${theme.input.focus} ${theme.input.placeholder}`;

    const validate = () => {
        const newErrors: any = {};
        if (!formData.name.trim() || formData.name.length < 3) newErrors.name = 'Full name is required.';
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(formData.email)) newErrors.email = 'A valid email is required.';
        if (!formData.role) newErrors.role = 'Role is required.';
        if (!staffToEdit && (!formData.password || formData.password.length < 8)) newErrors.password = 'Password is required (min 8 chars).';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError('');
        if (!validate()) return;
        setLoading(true);
        const result = await onSubmit(formData);
        if (result.success) {
            onClose();
        } else {
            setApiError(result.message);
        }
        setLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={staffToEdit ? 'Edit Staff Member' : 'Add New Staff Member'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div><label className={`block text-sm font-medium ${theme.textMuted}`}>Full Name</label><input name="name" value={formData.name} onChange={handleChange} className={inputClasses(!!errors.name)} />{errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}</div>
                    <div><label className={`block text-sm font-medium ${theme.textMuted}`}>Email</label><input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClasses(!!errors.email)} />{errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className={`block text-sm font-medium ${theme.textMuted}`}>Phone (Optional)</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClasses(!!errors.phone)} /></div>
                    <div><label className={`block text-sm font-medium ${theme.textMuted}`}>Role</label><select name="role" value={formData.role} onChange={handleChange} className={inputClasses(!!errors.role)}>{Object.values(StaffRole).map(role => <option key={role} value={role}>{role}</option>)}</select>{errors.role && <p className="mt-1 text-sm text-red-600">{errors.role}</p>}</div>
                </div>
                <div><label className={`block text-sm font-medium ${theme.textMuted}`}>Department (Optional)</label><select name="departmentId" value={formData.departmentId} onChange={handleChange} className={inputClasses(false)}><option value="">Select Department...</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
                {!staffToEdit && <div><label className={`block text-sm font-medium ${theme.textMuted}`}>Password</label><input type="password" name="password" value={formData.password} onChange={handleChange} className={inputClasses(!!errors.password)} />{errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}</div>}
                {apiError && <p className="text-sm text-red-600 text-center">{apiError}</p>}
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className={`py-2 px-6 rounded-full border ${theme.name === 'light' ? 'border-gray-300' : 'border-white/50'} hover:bg-gray-100`} disabled={loading}>Cancel</button>
                    <button type="submit" disabled={loading} className={`py-2 px-6 rounded-full ${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover} disabled:opacity-50`}>{loading ? 'Saving...' : 'Save Staff'}</button>
                </div>
            </form>
        </Modal>
    );
};

const StaffManagement: React.FC<{ departments: Department[] }> = ({ departments }) => {
    const { data: staff, loading, error, refetch } = useApi<StaffMember[]>('/api/staff');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [staffToEdit, setStaffToEdit] = useState<StaffMember | null>(null);
    const [filters, setFilters] = useState({ query: '' });
    const { theme } = useTheme();

    const departmentMap = useMemo(() => departments.reduce((acc, dept) => ({ ...acc, [dept.id]: dept.name }), {} as Record<string, string>), [departments]);

    const filteredStaff = useMemo(() => {
        if (!staff) return [];
        const lowercasedQuery = filters.query.toLowerCase();
        return staff.filter(s =>
            (s.name.toLowerCase().includes(lowercasedQuery) || s.email.toLowerCase().includes(lowercasedQuery))
        );
    }, [staff, filters]);

    const handleAddClick = () => { setStaffToEdit(null); setIsModalOpen(true); };
    const handleEditClick = (staffMember: StaffMember) => { setStaffToEdit(staffMember); setIsModalOpen(true); };
    const handleDeleteClick = async (id: string, name: string) => {
        if (window.confirm(`Are you sure you want to delete the staff member "${name}"?`)) {
            const result = await deleteStaff(id);
            if (result.success) refetch(); else alert(`Error: ${result.message}`);
        }
    };
    const handleFormSubmit = async (staffData: any) => {
        const dataToSubmit = { ...staffData };
        if (staffToEdit) delete dataToSubmit.password;
        const result = staffToEdit ? await updateStaff(staffToEdit.id, dataToSubmit) : await addStaff(dataToSubmit);
        if (result.success) refetch();
        return result;
    };

    if (loading) return <div className="text-center p-8">Loading staff...</div>;
    if (error) return <div className="text-center p-8 text-red-500">{error}</div>;

    const tableClasses = {
        container: `${theme.card.background} ${theme.card.shadow} ${theme.card.rounded} overflow-x-auto`,
        header: `${theme.name === 'light' ? 'bg-gray-50' : 'bg-white/5'}`,
        headerCell: `px-6 py-3 text-left text-xs font-bold ${theme.textMuted} uppercase tracking-wider`,
        body: `${theme.name === 'light' ? 'bg-white divide-gray-200' : 'bg-transparent divide-white/10'} divide-y`,
        cell: `px-6 py-4 align-middle text-sm`,
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <input type="search" placeholder="Search by name or email..." value={filters.query} onChange={e => setFilters({ query: e.target.value })} className={`w-full max-w-sm px-4 py-2 border rounded-full ${theme.input.background} ${theme.input.border} ${theme.input.text} ${theme.input.focus}`} />
                <button onClick={handleAddClick} className={`${theme.button.primary.background} ${theme.button.primary.text} font-bold py-2 px-6 rounded-full ${theme.button.primary.hover}`}>Add New Staff</button>
            </div>
            <div className={tableClasses.container}>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className={tableClasses.header}><tr>
                        <th scope="col" className={tableClasses.headerCell}>Staff</th>
                        <th scope="col" className={tableClasses.headerCell}>Role</th>
                        <th scope="col" className={tableClasses.headerCell}>Department</th>
                        <th scope="col" className={tableClasses.headerCell}>Actions</th>
                    </tr></thead>
                    <tbody className={tableClasses.body}>{filteredStaff.map(staffMember => (
                        <tr key={staffMember.id}>
                            <td className={tableClasses.cell}><div className={`font-medium ${theme.text}`}>{staffMember.name}</div><div className={theme.textMuted}>{staffMember.email}</div></td>
                            <td className={`${tableClasses.cell} ${theme.textMuted}`}>{staffMember.role}</td>
                            <td className={`${tableClasses.cell} ${theme.textMuted}`}>{staffMember.departmentId ? departmentMap[staffMember.departmentId] : 'N/A'}</td>
                            <td className={tableClasses.cell}>
                                <div className="flex items-center space-x-3">
                                    <button onClick={() => handleEditClick(staffMember)} className={`${theme.textMuted} hover:${theme.text} p-1.5 rounded-full`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg></button>
                                    <button onClick={() => handleDeleteClick(staffMember.id, staffMember.name)} className="text-red-500 hover:text-red-700 p-1.5 rounded-full"><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                </div>
                            </td>
                        </tr>
                    ))}</tbody>
                </table>
            </div>
            <StaffFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleFormSubmit} departments={departments} staffToEdit={staffToEdit} />
        </div>
    );
};


// --- NEW Timetable Components ---
const TimetableFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<{ success: boolean; message: string }>;
    courses: Course[];
    lecturers: StaffMember[];
    entryToEdit: TimetableEntry | null;
}> = ({ isOpen, onClose, onSubmit, courses, lecturers, entryToEdit }) => {
    const { theme } = useTheme();
    const initialFormState = { courseId: '', dayOfWeek: 'Monday', startTime: '09:00', endTime: '11:00', location: '', lecturerId: '' };
    const [formData, setFormData] = useState<any>(initialFormState);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    useEffect(() => {
        if (entryToEdit) {
            setFormData({ ...entryToEdit, lecturerId: entryToEdit.lecturerId || '' });
        } else {
            setFormData(initialFormState);
        }
        setApiError('');
    }, [entryToEdit, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setApiError('');
        setLoading(true);
        const result = await onSubmit(formData);
        if (result.success) onClose(); else setApiError(result.message);
        setLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const inputClasses = `mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${theme.input.background} ${theme.input.text} ${theme.input.border} ${theme.input.focus}`;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={entryToEdit ? 'Edit Timetable Entry' : 'Add Timetable Entry'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div><label className={`block text-sm font-medium ${theme.textMuted}`}>Day of Week</label><select name="dayOfWeek" value={formData.dayOfWeek} onChange={handleChange} className={inputClasses}><option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option></select></div>
                    <div><label className={`block text-sm font-medium ${theme.textMuted}`}>Course</label><select name="courseId" value={formData.courseId} onChange={handleChange} className={inputClasses}><option value="">Select Course...</option>{courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.title}</option>)}</select></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className={`block text-sm font-medium ${theme.textMuted}`}>Start Time</label><input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className={inputClasses} /></div>
                    <div><label className={`block text-sm font-medium ${theme.textMuted}`}>End Time</label><input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className={inputClasses} /></div>
                </div>
                <div><label className={`block text-sm font-medium ${theme.textMuted}`}>Location</label><input name="location" value={formData.location} onChange={handleChange} className={inputClasses} placeholder="e.g., Hall A, Room 201" /></div>
                <div><label className={`block text-sm font-medium ${theme.textMuted}`}>Lecturer (Optional)</label><select name="lecturerId" value={formData.lecturerId} onChange={handleChange} className={inputClasses}><option value="">Select Lecturer...</option>{lecturers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}</select></div>
                {apiError && <p className="text-sm text-red-600 text-center">{apiError}</p>}
                <div className="flex justify-end gap-4 pt-4">
                    <button type="button" onClick={onClose} className={`py-2 px-6 rounded-full border ${theme.name === 'light' ? 'border-gray-300' : 'border-white/50'} hover:bg-gray-100`}>Cancel</button>
                    <button type="submit" disabled={loading} className={`py-2 px-6 rounded-full ${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover} disabled:opacity-50`}>{loading ? 'Saving...' : 'Save Entry'}</button>
                </div>
            </form>
        </Modal>
    );
};

const TimetableManagement: React.FC = () => {
    const { data: timetable, loading: ttLoading, refetch: refetchTimetable } = useApi<TimetableEntry[]>('/api/timetable');
    const { data: courses, loading: cLoading } = useApi<Course[]>('/api/courses');
    const { data: staff, loading: sLoading } = useApi<StaffMember[]>('/api/staff');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [entryToEdit, setEntryToEdit] = useState<TimetableEntry | null>(null);
    const { theme } = useTheme();

    const [filters, setFilters] = useState({ day: 'all', courseId: 'all', lecturerId: 'all' });
    const [sort, setSort] = useState<{ key: keyof TimetableEntry | 'course' | 'lecturer'; direction: 'asc' | 'desc' }>({ key: 'startTime', direction: 'asc' });

    const loading = ttLoading || cLoading || sLoading;

    const lecturers = useMemo(() => staff?.filter(s => s.role === StaffRole.Lecturer || s.role === StaffRole.AcademicOfficer) || [], [staff]);
    const courseMap = useMemo(() => courses?.reduce((acc, c) => ({ ...acc, [c.id]: c }), {} as Record<string, Course>) || {}, [courses]);
    const staffMap = useMemo(() => staff?.reduce((acc, s) => ({ ...acc, [s.id]: s }), {} as Record<string, StaffMember>) || {}, [staff]);
    
    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSort = (key: typeof sort.key) => {
        setSort(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    };

    const processedTimetable = useMemo(() => {
        if (!timetable) return [];
        let filtered = [...timetable];

        // Filtering
        if (filters.day !== 'all') filtered = filtered.filter(entry => entry.dayOfWeek === filters.day);
        if (filters.courseId !== 'all') filtered = filtered.filter(entry => entry.courseId === filters.courseId);
        if (filters.lecturerId !== 'all') filtered = filtered.filter(entry => entry.lecturerId === filters.lecturerId);

        // Sorting
        return filtered.sort((a, b) => {
            let valA: any, valB: any;
            const resolveValue = (entry: TimetableEntry, key: typeof sort.key) => {
                if (key === 'course') return courseMap[entry.courseId]?.title || '';
                if (key === 'lecturer') return staffMap[entry.lecturerId || '']?.name || '';
                return entry[key as keyof TimetableEntry];
            };
            valA = resolveValue(a, sort.key);
            valB = resolveValue(b, sort.key);

            if (valA < valB) return sort.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sort.direction === 'asc' ? 1 : -1;
            // Secondary sort by time if primary keys are equal
            if (a.startTime < b.startTime) return -1;
            if (a.startTime > b.startTime) return 1;
            return 0;
        });
    }, [timetable, filters, sort, courseMap, staffMap]);


    const handleAddClick = () => { setEntryToEdit(null); setIsModalOpen(true); };
    const handleEditClick = (entry: TimetableEntry) => { setEntryToEdit(entry); setIsModalOpen(true); };
    const handleDeleteClick = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this timetable entry?')) {
            const result = await deleteTimetableEntry(id);
            if (result.success) refetchTimetable(); else alert(`Error: ${result.message}`);
        }
    };
    const handleFormSubmit = async (data: any) => {
        const result = entryToEdit ? await updateTimetableEntry(entryToEdit.id, data) : await addTimetableEntry(data);
        if (result.success) refetchTimetable();
        return result;
    };

    if (loading) return <div className="text-center p-8">Loading timetable data...</div>;

    const DAYS_ORDER: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday')[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const tableClasses = {
        container: `${theme.card.background} ${theme.card.shadow} ${theme.card.rounded} overflow-x-auto`,
        header: `${theme.name === 'light' ? 'bg-gray-50' : 'bg-white/5'}`,
        headerCell: `px-6 py-3 text-left text-xs font-bold ${theme.textMuted} uppercase tracking-wider`,
        body: `${theme.name === 'light' ? 'bg-white divide-gray-200' : 'bg-transparent divide-white/10'} divide-y`,
        cell: `px-6 py-4 align-middle text-sm`,
    };
    const filterInputClasses = `w-full px-4 py-2 border rounded-md ${theme.input.background} ${theme.input.border} ${theme.input.text} ${theme.input.focus}`;
    const SortableHeader: React.FC<{ sortKey: typeof sort.key, children: React.ReactNode }> = ({ sortKey, children }) => (
        <th scope="col" className={tableClasses.headerCell}>
            <button onClick={() => handleSort(sortKey)} className="flex items-center gap-1 group">
                {children}
                <span className={`transition-opacity duration-200 ${sort.key === sortKey ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'}`}>
                    {sort.direction === 'asc' ? '▲' : '▼'}
                </span>
            </button>
        </th>
    );

    return (
        <div>
            <div className="flex justify-end mb-6"><button onClick={handleAddClick} className={`${theme.button.primary.background} ${theme.button.primary.text} font-bold py-2 px-6 rounded-full ${theme.button.primary.hover}`}>Add Entry</button></div>
             <div className="grid md:grid-cols-3 gap-4 mb-6">
                <select name="day" value={filters.day} onChange={handleFilterChange} className={filterInputClasses} aria-label="Filter by day">
                    <option value="all">All Days</option>{DAYS_ORDER.map(day => <option key={day} value={day}>{day}</option>)}
                </select>
                <select name="courseId" value={filters.courseId} onChange={handleFilterChange} className={filterInputClasses} aria-label="Filter by course">
                    <option value="all">All Courses</option>{courses?.map(c => <option key={c.id} value={c.id}>{c.code} - {c.title}</option>)}
                </select>
                <select name="lecturerId" value={filters.lecturerId} onChange={handleFilterChange} className={filterInputClasses} aria-label="Filter by lecturer">
                    <option value="all">All Lecturers</option>{lecturers.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
            </div>
            <div className={tableClasses.container}>
                 <table className="min-w-full divide-y divide-gray-200">
                    <thead className={tableClasses.header}><tr>
                        <SortableHeader sortKey="dayOfWeek">Day</SortableHeader>
                        <SortableHeader sortKey="startTime">Time</SortableHeader>
                        <SortableHeader sortKey="course">Course</SortableHeader>
                        <SortableHeader sortKey="lecturer">Lecturer</SortableHeader>
                        <th scope="col" className={tableClasses.headerCell}>Location</th>
                        <th scope="col" className={tableClasses.headerCell}>Actions</th>
                    </tr></thead>
                    <tbody className={tableClasses.body}>
                        {processedTimetable.map(entry => (
                            <tr key={entry.id}>
                                <td className={`${tableClasses.cell} font-semibold`}>{entry.dayOfWeek}</td>
                                <td className={`${tableClasses.cell} font-mono`}>{entry.startTime} - {entry.endTime}</td>
                                <td className={`${tableClasses.cell}`}>{courseMap[entry.courseId]?.title || 'N/A'}</td>
                                <td className={tableClasses.cell}>{entry.lecturerId ? staffMap[entry.lecturerId]?.name : 'N/A'}</td>
                                <td className={tableClasses.cell}>{entry.location}</td>
                                <td className={tableClasses.cell}>
                                    <div className="flex items-center space-x-3">
                                        <button onClick={() => handleEditClick(entry)} className={`${theme.textMuted} hover:${theme.text} p-1.5 rounded-full`} aria-label={`Edit entry for ${courseMap[entry.courseId]?.title}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg></button>
                                        <button onClick={() => handleDeleteClick(entry.id)} className="text-red-500 hover:text-red-700 p-1.5 rounded-full" aria-label={`Delete entry for ${courseMap[entry.courseId]?.title}`}><svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
                 {processedTimetable.length === 0 && <p className={`text-center p-8 ${theme.textMuted}`}>No timetable entries match your filters.</p>}
            </div>
            <TimetableFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleFormSubmit} courses={courses || []} lecturers={lecturers} entryToEdit={entryToEdit} />
        </div>
    );
};

// --- Grades Management ---
const GradesManagement: React.FC<{ user: StaffMember; departments: Department[] }> = ({ user, departments }) => {
    const { theme } = useTheme();
    const { data: students, loading: studentsLoading } = useApi<Student[]>('/api/students');
    const { data: courses, loading: coursesLoading } = useApi<Course[]>('/api/courses');

    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [filters, setFilters] = useState({ query: '' });

    const { data: enrolledCourseIds, loading: enrollmentsLoading } = useApi<string[]>(
        '/api/student-enrollments',
        selectedStudent?.id
    );
    const { data: courseGrades, loading: gradesLoading, refetch: refetchGrades } = useApi<CourseGrade[]>(
        '/api/course-grades-for-student',
        selectedStudent?.id
    );

    const loading = studentsLoading || coursesLoading;

    const studentsForUser = useMemo(() => {
        if (!students) return [];
        if (user.role === StaffRole.Admin) return students;
        if (user.role === StaffRole.AcademicOfficer) {
            return students.filter(s => s.departmentId === user.departmentId);
        }
        return [];
    }, [students, user]);

    const filteredStudents = useMemo(() => {
        const lowercasedQuery = filters.query.toLowerCase();
        return studentsForUser.filter(s =>
            s.name.toLowerCase().includes(lowercasedQuery) || s.studentId.toLowerCase().includes(lowercasedQuery)
        );
    }, [studentsForUser, filters]);

    const studentEnrolledCourses = useMemo(() => {
        if (!enrolledCourseIds || !courses) return [];
        return enrolledCourseIds.map(id => courses.find(c => c.id === id)).filter((c): c is Course => !!c);
    }, [enrolledCourseIds, courses]);
    
    const GradeInputRow: React.FC<{ course: Course }> = ({ course }) => {
        const grade = courseGrades?.find(g => g.courseId === course.id);
        const [score, setScore] = useState<string>(grade?.score?.toString() ?? '');
        const [semester, setSemester] = useState<string>(grade?.semester ?? 'Y1S1');
        const [isSaving, setIsSaving] = useState(false);
        const [rowError, setRowError] = useState('');

        const canEdit = useMemo(() => {
            if (user.role === StaffRole.Admin) return true;
            if (user.role === StaffRole.AcademicOfficer && course.departmentId === user.departmentId) return true;
            if (user.role === StaffRole.Lecturer && course.lecturerId === user.id) return true;
            return false;
        }, [course, user]);

        const handleSave = async () => {
            if (!selectedStudent || !canEdit) return;
            const scoreNum = parseInt(score, 10);
            if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
                setRowError('Score must be between 0 and 100.');
                return;
            }
            if (!/Y\d+S[12]/.test(semester)) {
                setRowError('Semester must be in format Y1S1, Y2S2, etc.');
                return;
            }
            setIsSaving(true);
            setRowError('');
            const result = await addOrUpdateCourseGrade({
                studentId: selectedStudent.id,
                courseId: course.id,
                semester: semester.toUpperCase(),
                score: scoreNum,
            });
            if (result.success) {
                refetchGrades();
            } else {
                setRowError(result.message);
            }
            setIsSaving(false);
        };
        
        return (
            <tr className={!canEdit ? 'opacity-60' : ''}>
                <td className="px-4 py-3 text-sm">{course.code} - {course.title}</td>
                <td className="px-4 py-3"><input type="text" value={semester} onChange={e => setSemester(e.target.value)} disabled={!canEdit} placeholder="e.g. Y1S1" className={`w-24 p-1 text-sm rounded ${theme.input.background} ${theme.input.border}`} /></td>
                <td className="px-4 py-3"><input type="number" min="0" max="100" value={score} onChange={e => setScore(e.target.value)} disabled={!canEdit} className={`w-20 p-1 text-sm rounded ${theme.input.background} ${theme.input.border}`} /></td>
                <td className="px-4 py-3">
                    <button onClick={handleSave} disabled={!canEdit || isSaving} className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors duration-300 ${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover} disabled:opacity-50`}>
                        {isSaving ? 'Saving...' : 'Save'}
                    </button>
                    {!canEdit && <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block ml-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>}
                </td>
            </tr>
        );
    };

    if (loading) return <TableSkeleton />;

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <h3 className={`text-xl font-bold ${theme.text} mb-4`}>Select a Student</h3>
                <input type="search" placeholder="Search students..." value={filters.query} onChange={e => setFilters({ query: e.target.value })} className={`w-full mb-4 px-4 py-2 border rounded-full ${theme.input.background} ${theme.input.border} ${theme.input.text} ${theme.input.focus}`} />
                <div className={`border rounded-lg ${theme.input.border} max-h-96 lg:max-h-[60vh] overflow-y-auto`}>
                    {filteredStudents.map(student => (
                        <button key={student.id} onClick={() => setSelectedStudent(student)} className={`w-full text-left p-3 transition-colors duration-200 ${selectedStudent?.id === student.id ? `${theme.button.primary.background} ${theme.button.primary.text}` : `${theme.name === 'light' ? 'hover:bg-gray-100' : 'hover:bg-white/5'}`}>
                            <p className="font-semibold">{student.name}</p>
                            <p className={`text-xs ${selectedStudent?.id === student.id ? 'text-white/80' : theme.textMuted}`}>{student.studentId}</p>
                        </button>
                    ))}
                </div>
            </div>
            <div className="lg:col-span-2">
                {selectedStudent ? (
                    <div className={`${theme.card.background} ${theme.card.shadow} ${theme.card.rounded} ${theme.card.border}`}>
                        <div className="p-4 border-b border-gray-200 dark:border-white/10">
                            <h3 className={`text-xl font-bold ${theme.text}`}>Grades for {selectedStudent.name}</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead className={`${theme.name === 'light' ? 'bg-gray-50' : 'bg-white/5'}`}>
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wider">Course</th>
                                        <th className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wider">Semester</th>
                                        <th className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wider">Score</th>
                                        <th className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wider">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(enrollmentsLoading || gradesLoading) ? (
                                        <tr><td colSpan={4} className="p-4 text-center">Loading grades...</td></tr>
                                    ) : studentEnrolledCourses.length > 0 ? (
                                        studentEnrolledCourses.map(course => <GradeInputRow key={course.id} course={course} />)
                                    ) : (
                                        <tr><td colSpan={4} className="p-4 text-center">This student is not enrolled in any courses.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className={`p-12 text-center rounded-lg border-2 border-dashed ${theme.input.border}`}>
                        <p className={theme.textMuted}>Select a student to manage their grades.</p>
                    </div>
                )}
            </div>
        </div>
    );
};


// --- Login Views ---
const StaffLoginView: React.FC<{ onLogin: (user: StaffMember) => void; }> = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [apiError, setApiError] = useState('');
    const [formErrors, setFormErrors] = useState<{ email?: string; password?: string }>({});
    const [loading, setLoading] = useState(false);
    const { theme } = useTheme();

    const errorInputClass = 'border-red-500 focus:ring-red-500 focus:border-red-500';
    const baseInputClasses = `mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${theme.input.background} ${theme.input.text} ${theme.input.border} ${theme.input.focus} ${theme.input.placeholder}`;

    const validateField = useCallback((name: 'email' | 'password', value: string): string | undefined => {
        switch (name) {
            case 'email':
                if (!value.trim()) return 'Email address is required.';
                if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) return 'Please enter a valid email address.';
                return undefined;
            case 'password':
                if (!value) return 'Password is required.';
                return undefined;
            default:
                return undefined;
        }
    }, []);

    const validateForm = useCallback(() => {
        const emailError = validateField('email', email);
        const passwordError = validateField('password', password);
        const newErrors = { email: emailError, password: passwordError };
        const filteredErrors = Object.fromEntries(Object.entries(newErrors).filter(([, v]) => v != null));
        setFormErrors(filteredErrors);
        return Object.keys(filteredErrors).length === 0;
    }, [email, password, validateField]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true); setApiError('');
        const result = await staffLogin(email, password);
        if (result.success && result.user) onLogin(result.user);
        else setApiError(result.message || 'Login failed.');
        setLoading(false);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target as { name: 'email' | 'password'; value: string };
        const error = validateField(name, value);
        setFormErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'email') setEmail(value);
        if (name === 'password') setPassword(value);
        if (formErrors[name as keyof typeof formErrors]) {
            setFormErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
                <label htmlFor="email" className={`block text-sm font-medium ${theme.textMuted}`}>Email Address</label>
                <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={handleChange} onBlur={handleBlur} required className={`${baseInputClasses} ${formErrors.email ? errorInputClass : ''}`} aria-invalid={!!formErrors.email} aria-describedby={formErrors.email ? "email-error" : undefined} />
                {formErrors.email && <p id="email-error" className="mt-1 text-sm text-red-600">{formErrors.email}</p>}
            </div>
            <div>
                <label htmlFor="password" className={`block text-sm font-medium ${theme.textMuted}`}>Password</label>
                <div className="relative">
                    <input id="password" name="password" type={isPasswordVisible ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={handleChange} onBlur={handleBlur} required className={`${baseInputClasses} pr-10 ${formErrors.password ? errorInputClass : ''}`} aria-invalid={!!formErrors.password} aria-describedby={formErrors.password ? "password-error" : undefined}/>
                    <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="absolute inset-y-0 right-0 pr-3 flex items-center" aria-label={isPasswordVisible ? "Hide password" : "Show password"}>
                        {isPasswordVisible ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${theme.textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.879 9.879A3 3 0 0112 9a3 3 0 012.121.879m7.5 3c-.878 1.025-1.945 1.945-3.121 2.75M1 1l22 22" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${theme.textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                    </button>
                </div>
                {formErrors.password && <p id="password-error" className="mt-1 text-sm text-red-600">{formErrors.password}</p>}
            </div>
            {apiError && <p className="text-sm text-red-600 text-center" role="alert">{apiError}</p>}
            <button type="submit" disabled={loading} className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-full shadow-sm text-lg font-bold ${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover} disabled:opacity-50`}>
                {loading ? (<><svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Signing in...</span></>) : `Sign In as Staff`}
            </button>
        </form>
    );
};


const StudentLoginView: React.FC = () => {
    const [studentId, setStudentId] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [apiError, setApiError] = useState('');
    const [formErrors, setFormErrors] = useState<{ studentId?: string; password?: string }>({});
    const [loading, setLoading] = useState(false);
    const { theme } = useTheme();
    const navigate = useNavigate();

    const errorInputClass = 'border-red-500 focus:ring-red-500 focus:border-red-500';
    const baseInputClasses = `mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${theme.input.background} ${theme.input.text} ${theme.input.border} ${theme.input.focus} ${theme.input.placeholder}`;

    const validateField = useCallback((name: 'studentId' | 'password', value: string): string | undefined => {
        switch (name) {
            case 'studentId':
                if (!value.trim()) return 'Student ID is required.';
                if (!/^[A-Z]{3}\/\d{2}\/\d{3}$/i.test(value)) return 'Please enter a valid Student ID format (e.g., CST/21/001).';
                return undefined;
            case 'password':
                if (!value) return 'Password is required.';
                return undefined;
            default:
                return undefined;
        }
    }, []);

    const validateForm = useCallback(() => {
        const studentIdError = validateField('studentId', studentId);
        const passwordError = validateField('password', password);
        const newErrors = { studentId: studentIdError, password: passwordError };
        const filteredErrors = Object.fromEntries(Object.entries(newErrors).filter(([, v]) => v != null));
        setFormErrors(filteredErrors);
        return Object.keys(filteredErrors).length === 0;
    }, [studentId, password, validateField]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        setApiError('');
        const result = await studentLogin(studentId, password);
        if (result.success && result.student) {
            navigate('/student-dashboard', { replace: true });
        } else {
            setApiError(result.message || 'Login failed.');
        }
        setLoading(false);
    };
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target as { name: 'studentId' | 'password'; value: string };
        const error = validateField(name, value);
        setFormErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === 'studentId') setStudentId(value.toUpperCase());
        if (name === 'password') setPassword(value);
        if (formErrors[name as keyof typeof formErrors]) {
            setFormErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };


    return (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            <div>
                <label htmlFor="studentId" className={`block text-sm font-medium ${theme.textMuted}`}>Student ID</label>
                <input id="studentId" name="studentId" type="text" autoComplete="username" value={studentId} onChange={handleChange} onBlur={handleBlur} required className={`${baseInputClasses} ${formErrors.studentId ? errorInputClass : ''}`} placeholder="e.g., CST/21/001" aria-invalid={!!formErrors.studentId} aria-describedby={formErrors.studentId ? "studentId-error" : undefined} />
                {formErrors.studentId && <p id="studentId-error" className="mt-1 text-sm text-red-600">{formErrors.studentId}</p>}
            </div>
            <div>
                <label htmlFor="student-password" className={`block text-sm font-medium ${theme.textMuted}`}>Password</label>
                <div className="relative">
                    <input id="student-password" name="password" type={isPasswordVisible ? 'text' : 'password'} autoComplete="current-password" value={password} onChange={handleChange} onBlur={handleBlur} required className={`${baseInputClasses} pr-10 ${formErrors.password ? errorInputClass : ''}`} aria-invalid={!!formErrors.password} aria-describedby={formErrors.password ? "password-error" : undefined} />
                    <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="absolute inset-y-0 right-0 pr-3 flex items-center" aria-label={isPasswordVisible ? "Hide password" : "Show password"}>
                        {isPasswordVisible ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${theme.textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.879 9.879A3 3 0 0112 9a3 3 0 012.121.879m7.5 3c-.878 1.025-1.945 1.945-3.121 2.75M1 1l22 22" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${theme.textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        )}
                    </button>
                </div>
                 {formErrors.password && <p id="password-error" className="mt-1 text-sm text-red-600">{formErrors.password}</p>}
            </div>
            {apiError && <p className="text-sm text-red-600 text-center" role="alert">{apiError}</p>}
            <button type="submit" disabled={loading} className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-full shadow-sm text-lg font-bold ${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover} disabled:opacity-50`}>
                 {loading ? (<><svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Signing in...</span></>) : 'Sign In as Student'}
            </button>
        </form>
    );
};


// --- Dashboard View ---
const DashboardView: React.FC<{ user: StaffMember; onLogout: () => void; departments: Department[], departmentMap: Record<string, string> }> = ({ user, onLogout, departments, departmentMap }) => {
    const { theme } = useTheme();
    
    const TABS: Record<string, { label: string; component: React.ReactNode; roles: StaffRole[] }> = useMemo(() => ({
        analytics: { label: 'Analytics', component: <AnalyticsDashboard />, roles: [StaffRole.Admin] },
        admissions: { label: 'Admissions', component: <AdmissionsManagement departmentMap={departmentMap} />, roles: [StaffRole.Admin, StaffRole.AdmissionsOfficer] },
        students: { label: 'Students', component: <StudentDataManagement departmentMap={departmentMap} departments={departments} />, roles: [StaffRole.Admin, StaffRole.AcademicOfficer] },
        grades: { label: 'Grades', component: <GradesManagement user={user} departments={departments} />, roles: [StaffRole.Admin, StaffRole.AcademicOfficer, StaffRole.Lecturer] },
        courses: { label: 'Courses', component: <CourseManagement departments={departments} departmentMap={departmentMap} />, roles: [StaffRole.Admin, StaffRole.AcademicOfficer] },
        materials: { label: 'Course Materials', component: <CourseMaterialsManagement user={user} />, roles: [StaffRole.Admin, StaffRole.AcademicOfficer, StaffRole.Lecturer] },
        staff: { label: 'Staff', component: <StaffManagement departments={departments} />, roles: [StaffRole.Admin] },
        timetable: { label: 'Timetable', component: <TimetableManagement />, roles: [StaffRole.Admin, StaffRole.AcademicOfficer] },
        announcements: { label: 'Announcements', component: <div>Announcements Management Coming Soon</div>, roles: [StaffRole.Admin] },
        finance: { label: 'Finance', component: <FinanceManagement departmentMap={departmentMap} />, roles: [StaffRole.Admin] },
        tasks: { label: 'My Tasks', component: <TaskManagement userId={user.id} />, roles: [StaffRole.Admin, StaffRole.AcademicOfficer, StaffRole.AdmissionsOfficer, StaffRole.Lecturer, StaffRole.Librarian] },
    }), [departmentMap, departments, user]);

    const userTabs = useMemo(() => Object.entries(TABS).filter(([, tab]) => tab.roles.includes(user.role)), [TABS, user.role]);
    const [activeTab, setActiveTab] = useState(userTabs[0]?.[0]);

    if (!activeTab) {
        return <div className={`text-center p-8 ${theme.textMuted}`}>You do not have any assigned roles. Please contact an administrator.</div>;
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className={`text-2xl font-bold ${theme.text}`}>Welcome, {user.name}</h2>
                    <p className={theme.textMuted}>{user.role}</p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={onLogout} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-300 ${theme.name === 'light' ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`} aria-label="Logout">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
            <div className={`border-b ${theme.name === 'light' ? 'border-gray-200' : 'border-white/20'} mb-6`}>
                <div role="tablist" className="-mb-px flex space-x-6 overflow-x-auto" aria-label="Admin Tabs">
                    {userTabs.map(([key, tab]) => (
                         <button key={key} id={`tab-${key}`} role="tab" aria-selected={activeTab === key} aria-controls={`tabpanel-${key}`} onClick={() => setActiveTab(key)} className={`whitespace-nowrap px-1 py-3 text-sm font-medium border-b-2 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent ${theme.input.focus} rounded-t-sm ${ activeTab === key ? `border-blue-500 ${theme.accent}` : `border-transparent ${theme.textMuted} hover:${theme.text}`}`}>
                           {tab.label}
                         </button>
                    ))}
                </div>
            </div>
            <div>
                {userTabs.map(([key, tab]) => (
                    <div key={key} id={`tabpanel-${key}`} role="tabpanel" aria-labelledby={`tab-${key}`} hidden={activeTab !== key} tabIndex={0}>
                        {activeTab === key && tab.component}
                    </div>
                ))}
            </div>
        </div>
    );
}

// --- Main Page Component ---
const AdminDashboardPage: React.FC = () => {
    const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(getCurrentStaff);
    const [activeForm, setActiveForm] = useState<'student' | 'staff'>('student');
    const { data: departments, loading: deptsLoading, error: deptsError } = useApi<Department[]>('/api/departments');
    const { theme } = useTheme();
    
    const departmentMap = useMemo(() => {
        if (!departments) return {};
        return departments.reduce((acc, dept) => ({ ...acc, [dept.id]: dept.name }), {} as Record<string, string>);
    }, [departments]);
    
    const handleLogin = (user: StaffMember) => setCurrentStaff(user);
    const handleLogout = () => { staffLogout(); setCurrentStaff(null); };

    const pageContent = () => {
        if (deptsLoading) return <div className="text-center py-12">Loading Portal...</div>;
        if (deptsError || !departments) return <div className="text-center py-12 text-red-500">Error loading essential data: {deptsError || 'Failed to load department information.'}</div>;

        if (currentStaff) {
            return <DashboardView user={currentStaff} onLogout={handleLogout} departments={departments} departmentMap={departmentMap} />;
        }
        
        const formBg = theme.name === 'light' ? 'bg-white' : theme.card.background;
        const tabButtonClasses = (isActive: boolean) => `w-full py-3 text-center font-semibold transition-colors duration-300 border-b-2 ${ isActive ? `${theme.accent} ${theme.name === 'light' ? 'border-blue-600' : 'border-blue-400'}` : `${theme.textMuted} hover:${theme.text} border-transparent`}`;
        
        return (
          <div className="max-w-md mx-auto mt-8">
            <div className={`p-4 mb-6 rounded-lg border text-sm ${theme.name === 'light' ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-blue-500/10 border-blue-500/20 text-blue-200'}`}>
                <h4 className="font-bold mb-2">Demo Credentials</h4>
                <ul className="space-y-1 list-disc list-inside">
                    <li><b>Staff (Admin):</b> <code className="font-mono bg-black/10 px-1 rounded">admin@crestview.edu.ng</code> / <code className="font-mono bg-black/10 px-1 rounded">AdminPass1!</code></li>
                    <li><b>Staff (Admissions):</b> <code className="font-mono bg-black/10 px-1 rounded">admissions@crestview.edu.ng</code> / <code className="font-mono bg-black/10 px-1 rounded">AdmissionsPass1!</code></li>
                    <li><b>Student:</b> <code className="font-mono bg-black/10 px-1 rounded">CST/21/001</code> / <code className="font-mono bg-black/10 px-1 rounded">StudentPass1!</code></li>
                </ul>
            </div>
            <div className={`${formBg} p-8 rounded-lg ${theme.card.shadow}`}>
                <div role="tablist" className="flex border-b mb-6">
                    <button role="tab" aria-selected={activeForm === 'student'} onClick={() => setActiveForm('student')} className={tabButtonClasses(activeForm === 'student')}>Student Login</button>
                    <button role="tab" aria-selected={activeForm === 'staff'} onClick={() => setActiveForm('staff')} className={tabButtonClasses(activeForm === 'staff')}>Staff Login</button>
                </div>
                {activeForm === 'student' ? 
                    (<StudentLoginView />) :
                    (<StaffLoginView onLogin={handleLogin} />)
                }
            </div>
          </div>
        );
    };

    return (
        <PageWrapper title="Student & Staff Portals" subtitle="Manage college data and operations.">
           {pageContent()}
        </PageWrapper>
    );
};

export default AdminDashboardPage;
