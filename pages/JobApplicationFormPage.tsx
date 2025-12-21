
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { useApi, postJobApplication } from '../hooks/useApi';
import { JobOpening, JobApplicationData } from '../types';
import { useTheme } from '../hooks/useTheme';
import Breadcrumbs from '../components/Breadcrumbs';
import NotFoundPage from './NotFoundPage';

const JobApplicationFormPage: React.FC = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const { data: jobs, loading: jobsLoading } = useApi<JobOpening[]>('/api/careers');
    const { theme } = useTheme();
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        resume: null as File | null,
        coverLetter: ''
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [responseMessage, setResponseMessage] = useState('');
    const errorSummaryRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const job = useMemo(() => jobs?.find(j => j.id === jobId), [jobs, jobId]);

    useEffect(() => {
        if (job) {
            document.title = `Apply for ${job.title} - CrestOAK College`;
        }
    }, [job]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        setErrors(prev => ({ ...prev, resume: undefined }));
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // 5MB limit
                setErrors(prev => ({ ...prev, resume: 'File size must not exceed 5MB.' }));
                if (fileInputRef.current) fileInputRef.current.value = '';
                setFormData(prev => ({ ...prev, resume: null }));
                return;
            }
            if (!['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type)) {
                setErrors(prev => ({ ...prev, resume: 'Only PDF and DOC/DOCX files are allowed.' }));
                if (fileInputRef.current) fileInputRef.current.value = '';
                setFormData(prev => ({ ...prev, resume: null }));
                return;
            }
            setFormData(prev => ({ ...prev, resume: file }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (formData.name.trim().length < 3) newErrors.name = 'Full name is required.';
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(formData.email)) newErrors.email = 'A valid email is required.';
        if (!formData.resume) newErrors.resume = 'Please upload your resume.';
        if (formData.coverLetter.trim().length < 20) newErrors.coverLetter = 'Cover letter must be at least 20 characters.';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate() || !jobId) {
             errorSummaryRef.current?.focus();
            return;
        }

        setStatus('loading');
        const submissionData = { ...formData, jobId };
        
        const result = await postJobApplication(submissionData as Omit<JobApplicationData, 'jobTitle'>);
        
        if (result.success) {
            setStatus('success');
            setResponseMessage(result.message);
        } else {
            setStatus('error');
            setResponseMessage(result.message || 'An unexpected error occurred.');
            setStatus('idle'); // Reset status to allow retry
        }
    };
    
    if (jobsLoading) {
        return <PageWrapper title="Loading Application Form..."><p className="text-center">Please wait...</p></PageWrapper>;
    }
    
    if (!job) {
        return <NotFoundPage />;
    }

    if (status === 'success') {
        return (
            <PageWrapper title="Application Submitted!">
                <div className={`max-w-xl mx-auto p-8 text-center rounded-lg ${theme.card.background} ${theme.card.shadow}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <h2 className={`text-2xl font-bold ${theme.text}`}>Thank You!</h2>
                    <p className={`${theme.textMuted} mt-2`}>{responseMessage}</p>
                    <button onClick={() => navigate('/careers')} className={`mt-6 ${theme.button.primary.background} ${theme.button.primary.text} font-bold py-3 px-8 rounded-full ${theme.button.primary.hover} transition-colors duration-300`}>
                        Back to Careers
                    </button>
                </div>
            </PageWrapper>
        );
    }
    
    const breadcrumbs = [
        { name: 'Home', path: '/' },
        { name: 'Careers', path: '/careers' },
        { name: `Apply: ${job.title}` }
    ];
    
    const inputClasses = (hasError: boolean) => `mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${theme.input.background} ${theme.input.text} ${hasError ? 'border-red-500' : theme.input.border} ${theme.input.focus} ${theme.input.placeholder}`;

    return (
        <PageWrapper title="Apply for Position">
            <div className="max-w-2xl mx-auto">
                <Breadcrumbs crumbs={breadcrumbs} />
                <div className={`${theme.card.background} ${theme.card.border} ${theme.card.shadow} ${theme.card.rounded} p-8`}>
                    <h2 className={`text-3xl font-bold ${theme.text}`}>{job.title}</h2>
                    <p className={`text-sm ${theme.textMuted} mt-1`}>{job.department} &middot; {job.location}</p>
                    
                    <hr className={`my-6 ${theme.input.border}`} />

                    {Object.keys(errors).length > 0 && (
                        <div ref={errorSummaryRef} tabIndex={-1} role="alert" className="p-4 mb-6 rounded-md bg-red-50 border border-red-200">
                            <h3 className="text-sm font-medium text-red-800">Please correct the following errors:</h3>
                            <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                                {Object.values(errors).map((error, index) => <li key={index}>{error}</li>)}
                            </ul>
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                        <div>
                            <label htmlFor="name" className={`block text-sm font-medium ${theme.textMuted}`}>Full Name</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} className={inputClasses(!!errors.name)} required />
                            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                        </div>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="email" className={`block text-sm font-medium ${theme.textMuted}`}>Email Address</label>
                                <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} className={inputClasses(!!errors.email)} required />
                                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                            </div>
                            <div>
                                <label htmlFor="phone" className={`block text-sm font-medium ${theme.textMuted}`}>Phone (Optional)</label>
                                <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleInputChange} className={inputClasses(!!errors.phone)} />
                            </div>
                        </div>
                         <div>
                            <label htmlFor="resume" className={`block text-sm font-medium ${theme.textMuted}`}>Resume (PDF, DOC, DOCX - max 5MB)</label>
                            <input ref={fileInputRef} type="file" name="resume" id="resume" onChange={handleFileChange} accept=".pdf,.doc,.docx" className={`mt-1 block w-full text-sm ${theme.textMuted} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${theme.button.secondary.background} ${theme.button.secondary.text} ${theme.button.secondary.hover}`} required />
                            {formData.resume && <p className={`mt-1 text-sm ${theme.textMuted}`}>Selected: {formData.resume.name}</p>}
                            {errors.resume && <p className="mt-1 text-sm text-red-600">{errors.resume}</p>}
                        </div>
                         <div>
                            <label htmlFor="coverLetter" className={`block text-sm font-medium ${theme.textMuted}`}>Cover Letter</label>
                            <textarea name="coverLetter" id="coverLetter" rows={6} value={formData.coverLetter} onChange={handleInputChange} className={inputClasses(!!errors.coverLetter)} required />
                            {errors.coverLetter && <p className="mt-1 text-sm text-red-600">{errors.coverLetter}</p>}
                        </div>

                        {status === 'error' && <p className="text-center text-sm text-red-500">{responseMessage}</p>}

                        <button type="submit" disabled={status === 'loading'} className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-lg font-bold ${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover} disabled:opacity-50 transition-colors duration-300`}>
                            {status === 'loading' ? 'Submitting Application...' : 'Submit Application'}
                        </button>
                    </form>
                </div>
            </div>
        </PageWrapper>
    );
};

export default JobApplicationFormPage;
