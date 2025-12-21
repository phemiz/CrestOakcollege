
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { useApi, postDynamicApplication } from '../hooks/useApi';
import { Course, DynamicApplicationData } from '../types';
import { useTheme } from '../hooks/useTheme';
import FormError from '../components/FormError';

const GraduationCapIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 14l6.16-3.422A12.083 12.083 0 0112 21a12.083 12.083 0 01-6.16-10.422L12 14z" />
    </svg>
);
const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
);
const EmailIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
);
const PhoneIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
);
const BookOpenIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-9-5.747h18" /><path d="M4 6a2 2 0 012-2h6a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" /><path d="M14 6a2 2 0 012-2h2a2 2 0 012 2v12a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" /></svg>
);
const ClockIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
);
const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
);
const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
);
const DocumentIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const ThemedRadio: React.FC<{
    name: string;
    label: string;
    value: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    hasError: boolean;
}> = ({ name, label, value, checked, onChange, hasError }) => {
    const { theme } = useTheme();
    const ringColorClass = theme.accent.replace(/text-(.+?)(?=\s|$)/, `peer-focus:ring-$1`);
    const checkedBgClass = theme.accent.replace('text-', 'bg-');
    const checkedBorderClass = theme.accent.replace('text-', 'border-');

    return (
        <label className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
            checked ? `${checkedBorderClass} ${theme.name === 'light' ? 'bg-blue-50' : 'bg-blue-500/10'}` : 
            `${hasError ? 'border-red-500' : theme.input.border} ${theme.name === 'light' ? 'hover:bg-gray-50 hover:border-gray-300' : 'hover:bg-white/5 hover:border-white/20'}`
        }`}>
            <input 
                type="radio" 
                name={name}
                value={value}
                checked={checked} 
                onChange={onChange}
                className="sr-only peer"
                aria-invalid={hasError}
            />
            <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors duration-200 
                ${checked ? checkedBorderClass : theme.input.border}
                peer-focus:ring-2 peer-focus:ring-offset-2 ${ringColorClass} ${theme.name === 'light' ? 'ring-offset-white' : 'ring-offset-gray-800'}`}>
                <span className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${checked ? checkedBgClass : ''}`}></span>
            </span>
            <span className={`font-semibold ${theme.text}`}>{label}</span>
        </label>
    );
};

const ProgressStep: React.FC<{ step: number; title: string; isCurrent: boolean; isCompleted: boolean }> = ({ step, title, isCurrent, isCompleted }) => {
    const { theme } = useTheme();
    const circleColor = isCompleted ? theme.accent.replace('text-', 'bg-') : isCurrent ? theme.accent.replace('text-', 'border-') : theme.input.border;
    const textColor = isCurrent || isCompleted ? theme.accent : theme.textMuted;
    
    return (
        <div className="flex flex-col items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 font-bold transition-colors duration-300 ${isCompleted ? `${circleColor} text-white` : isCurrent ? `border-2 ${circleColor}` : circleColor}`}>
                {isCompleted ? <CheckIcon className="w-5 h-5" /> : step}
            </div>
            <p className={`mt-2 text-xs font-semibold ${textColor}`}>{title}</p>
        </div>
    );
};

const ProgressIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = ['Personal', 'Program', 'Courses', 'Study Mode', 'Documents'];
    return (
        <div className="flex justify-between items-start mb-10 px-2">
            {steps.map((step, index) => (
                <React.Fragment key={step}>
                    <ProgressStep step={index + 1} title={step} isCurrent={currentStep === index + 1} isCompleted={currentStep > index + 1} />
                    {index < steps.length - 1 && <div className="flex-1 h-px bg-gray-300 mt-4 mx-2"></div>}
                </React.Fragment>
            ))}
        </div>
    );
};

const ApplicationFormPage: React.FC = () => {
    const { theme } = useTheme();
    const { data: courses, loading: coursesLoading } = useApi<Course[]>('/api/courses');
    
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        gender: '',
        programType: '',
        firstChoice: '',
        secondChoice: '',
        studyMode: '',
        transcript: null as File | null,
        transcriptPreview: null as string | null,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [responseMessage, setResponseMessage] = useState('');
    const errorSummaryRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

     // Cleanup object URL on unmount
    useEffect(() => {
        return () => {
            if (formData.transcriptPreview) {
                URL.revokeObjectURL(formData.transcriptPreview);
            }
        };
    }, [formData.transcriptPreview]);

    const currentStep = useMemo(() => {
        const { fullName, email, phone, gender, programType, firstChoice, studyMode, transcript } = formData;
        if (!fullName || !email || !phone || !gender) return 1;
        if (!programType) return 2;
        if (!firstChoice) return 3;
        if (!studyMode) return 4;
        if (!transcript) return 5;
        return 6; // Completed
    }, [formData]);

    const pageBg = useMemo(() => {
        switch (theme.name) {
          case 'light': return 'bg-gray-50';
          case 'modern': return 'bg-neutral-100';
          default: return theme.background;
        }
    }, [theme]);

    const availableCourses = useMemo(() => {
        if (!courses || !formData.programType) return [];
        return courses.filter(course => course.programType === formData.programType);
    }, [courses, formData.programType]);

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let input = e.target.value.replace(/[^\d]/g, '');
        // Handle Nigerian numbers, assuming they start with 234 and are 13 digits total
        if (input.startsWith('234')) {
            input = input.substring(3);
        }
        if (input.length > 10) {
            input = input.substring(0, 10);
        }

        let formatted = '+234';
        if (input.length > 0) {
            formatted += ' ' + input.substring(0, 3);
        }
        if (input.length > 3) {
            formatted += ' ' + input.substring(3, 6);
        }
        if (input.length > 6) {
            formatted += ' ' + input.substring(6, 10);
        }
        setFormData(prev => ({ ...prev, phone: formatted }));
        if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (formData.transcriptPreview) URL.revokeObjectURL(formData.transcriptPreview);
        setFormData(prev => ({...prev, transcript: null, transcriptPreview: null}));
        setErrors(prev => ({...prev, transcript: undefined}));

        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                setErrors(prev => ({...prev, transcript: 'File is too large (max 2MB).'}));
                return;
            }
            if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
                setErrors(prev => ({...prev, transcript: 'Invalid file type (PDF, JPG, PNG only).'}));
                return;
            }
            setFormData(prev => ({...prev, transcript: file, transcriptPreview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null }));
        }
    };
    
    const handleRemoveFile = () => {
        if (formData.transcriptPreview) URL.revokeObjectURL(formData.transcriptPreview);
        setFormData(prev => ({...prev, transcript: null, transcriptPreview: null}));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'programType') {
            setFormData(prev => ({
                ...prev,
                programType: value,
                firstChoice: '',
                secondChoice: '',
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };
    
    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (formData.fullName.trim().length < 3) newErrors.fullName = 'Full name must be at least 3 characters.';
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(formData.email)) newErrors.email = 'Please enter a valid email address.';
        const phoneDigits = formData.phone.replace(/[^\d]/g, '');
        if (phoneDigits.length !== 13 || !phoneDigits.startsWith('234')) newErrors.phone = 'Please enter a valid 10-digit Nigerian phone number (e.g., +234 801 234 5678).';
        if (!formData.gender) newErrors.gender = 'Please select your gender.';
        if (!formData.programType) newErrors.programType = 'Please select a program type.';
        if (!formData.firstChoice) newErrors.firstChoice = 'Please select your first choice course.';
        if (formData.firstChoice && formData.firstChoice === formData.secondChoice) newErrors.secondChoice = 'Second choice must be different from the first.';
        if (!formData.studyMode) newErrors.studyMode = 'Please select a mode of study.';
        if (!formData.transcript) newErrors.transcript = 'Please upload your transcript or academic records.';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) {
            errorSummaryRef.current?.focus();
            return;
        }
        setStatus('loading');
        
        const submissionData: DynamicApplicationData = {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            gender: formData.gender as 'Male' | 'Female',
            programTypes: formData.programType ? [formData.programType as 'Degree' | 'Diploma'] : [],
            firstChoiceCourseId: formData.firstChoice,
            secondChoiceCourseId: formData.secondChoice || undefined,
            studyModes: formData.studyMode ? [formData.studyMode as 'Full-Time' | 'Part-Time'] : [],
            transcript: formData.transcript,
        };

        const result = await postDynamicApplication(submissionData);
        if (result.success) {
            setStatus('success');
            setResponseMessage(result.message);
        } else {
            setStatus('error');
            setResponseMessage(result.message || 'An unexpected error occurred.');
        }
    };

    const formBg = theme.name === 'light' ? 'bg-white' : theme.card.background;
    const inputBaseClasses = `w-full px-4 py-3 border-2 rounded-lg shadow-sm focus:outline-none ${theme.input.background} ${theme.input.text} ${theme.input.focus} ${theme.input.placeholder}`;
    const inputClasses = (hasError: boolean) => `${inputBaseClasses} ${hasError ? 'border-red-500' : theme.input.border}`;
    const legendClasses = `text-lg font-bold ${theme.text} mb-4`;

    if (status === 'success') {
        return (
            <PageWrapper title="Application Received!">
                <div className={`max-w-xl mx-auto p-8 text-center rounded-lg ${formBg} ${theme.card.shadow}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500 mx-auto mb-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                    <p className={`${theme.textMuted} text-lg`}>{responseMessage}</p>
                    <Link to="/" className={`mt-6 inline-block ${theme.button.primary.background} ${theme.button.primary.text} font-bold py-3 px-8 rounded-full ${theme.button.primary.hover} transition-colors duration-300`}>
                        Back to Home
                    </Link>
                </div>
            </PageWrapper>
        );
    }
    
    return (
        <div className={`py-12 sm:py-16 ${pageBg}`}>
             <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <div className={`flex justify-center items-center gap-4 ${theme.accent}`}>
                        <GraduationCapIcon className="w-10 h-10 icon-float-1" />
                        <GraduationCapIcon className="w-16 h-16 icon-float-2" />
                        <GraduationCapIcon className="w-10 h-10 icon-float-3" />
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mt-4">
                        <span className={theme.text}>Your Future Starts </span>
                        <span className={theme.accent}>HERE</span>
                    </h1>
                    <p className={`mt-4 max-w-2xl mx-auto text-lg ${theme.textMuted}`}>Fill out the form below to begin your journey with CrestOAK College.</p>
                </div>

                <div className={`max-w-2xl mx-auto p-8 rounded-2xl ${formBg} ${theme.card.shadow} ${theme.card.border}`}>
                     <ProgressIndicator currentStep={currentStep} />
                     <form onSubmit={handleSubmit} noValidate className="space-y-8">
                        {Object.keys(errors).length > 0 && (
                            <div ref={errorSummaryRef} tabIndex={-1} role="alert" className="p-4 rounded-md bg-red-50 border border-red-200">
                                <h3 className="text-sm font-medium text-red-800">Please correct the following errors:</h3>
                                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                                    {Object.values(errors).map((error, index) => <li key={index}>{error}</li>)}
                                </ul>
                            </div>
                        )}

                        <fieldset>
                             <legend className={legendClasses}>1. Personal Information</legend>
                             <div className="space-y-6">
                                <div className="relative">
                                    <label htmlFor="fullName" className="sr-only">Full Name</label>
                                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${theme.textMuted}`}><UserIcon className="w-5 h-5" /></div>
                                    <input type="text" name="fullName" id="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleInputChange} className={`${inputClasses(!!errors.fullName)} pl-12`} required aria-invalid={!!errors.fullName} aria-describedby={errors.fullName ? "fullName-error" : undefined} />
                                </div>
                                <FormError id="fullName-error" message={errors.fullName} />

                                <div className="relative">
                                    <label htmlFor="email" className="sr-only">Email Address</label>
                                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${theme.textMuted}`}><EmailIcon className="w-5 h-5" /></div>
                                    <input type="email" name="email" id="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} className={`${inputClasses(!!errors.email)} pl-12`} required aria-invalid={!!errors.email} aria-describedby={errors.email ? "email-error" : undefined} />
                                </div>
                                <FormError id="email-error" message={errors.email} />
                                
                                <div className="relative">
                                    <label htmlFor="phone" className="sr-only">Phone Number</label>
                                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${theme.textMuted}`}><PhoneIcon className="w-5 h-5" /></div>
                                    <input type="tel" name="phone" id="phone" placeholder="+234 801 234 5678" value={formData.phone} onChange={handlePhoneChange} className={`${inputClasses(!!errors.phone)} pl-12`} required aria-invalid={!!errors.phone} aria-describedby={errors.phone ? "phone-error" : undefined} />
                                </div>
                                <FormError id="phone-error" message={errors.phone} />

                                <div>
                                    <span className={`block text-sm font-medium mb-2 ${theme.textMuted}`} id="gender-group-label">Gender</span>
                                    <div className="grid grid-cols-2 gap-4" role="radiogroup" aria-labelledby="gender-group-label">
                                        <ThemedRadio name="gender" label="Male" value="Male" checked={formData.gender === 'Male'} onChange={handleInputChange} hasError={!!errors.gender} />
                                        <ThemedRadio name="gender" label="Female" value="Female" checked={formData.gender === 'Female'} onChange={handleInputChange} hasError={!!errors.gender} />
                                    </div>
                                    <FormError id="gender-error" message={errors.gender} />
                                </div>
                            </div>
                        </fieldset>

                        <fieldset>
                            <legend className={legendClasses}>2. Program of Interest</legend>
                            <div className="grid grid-cols-2 gap-4" role="radiogroup" aria-label="Program of Interest">
                                <ThemedRadio name="programType" label="Degree (B.Sc / B.A)" value="Degree" checked={formData.programType === 'Degree'} onChange={handleInputChange} hasError={!!errors.programType} />
                                <ThemedRadio name="programType" label="Diploma (N.D)" value="Diploma" checked={formData.programType === 'Diploma'} onChange={handleInputChange} hasError={!!errors.programType} />
                            </div>
                            <FormError id="programType-error" message={errors.programType} />
                        </fieldset>


                        <fieldset>
                            <legend className={legendClasses}>3. Course Selection</legend>
                            <div className="space-y-6">
                                <div className="relative">
                                    <label htmlFor="firstChoice" className="sr-only">First Choice Course</label>
                                     <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${theme.textMuted}`}><BookOpenIcon className="w-5 h-5" /></div>
                                    <select name="firstChoice" id="firstChoice" value={formData.firstChoice} onChange={handleInputChange} disabled={availableCourses.length === 0} className={`${inputClasses(!!errors.firstChoice)} pl-12 appearance-none`} required aria-invalid={!!errors.firstChoice} aria-describedby={errors.firstChoice ? "firstChoice-error" : undefined}>
                                        <option value="" disabled>First Choice Course...</option>
                                        {availableCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                    </select>
                                    <div className={`absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none ${theme.textMuted}`}><ChevronDownIcon className="w-5 h-5" /></div>
                                </div>
                                <FormError id="firstChoice-error" message={errors.firstChoice} />
                                <div className="relative">
                                    <label htmlFor="secondChoice" className="sr-only">Second Choice Course</label>
                                    <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none ${theme.textMuted}`}><BookOpenIcon className="w-5 h-5" /></div>
                                    <select name="secondChoice" id="secondChoice" value={formData.secondChoice} onChange={handleInputChange} disabled={availableCourses.length === 0} className={`${inputClasses(!!errors.secondChoice)} pl-12 appearance-none`} aria-invalid={!!errors.secondChoice} aria-describedby={errors.secondChoice ? "secondChoice-error" : undefined}>
                                        <option value="">Second Choice (Optional)...</option>
                                        {availableCourses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                    </select>
                                    <div className={`absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none ${theme.textMuted}`}><ChevronDownIcon className="w-5 h-5" /></div>
                                </div>
                                <FormError id="secondChoice-error" message={errors.secondChoice} />
                            </div>
                        </fieldset>

                        <fieldset>
                            <legend className={legendClasses}>4. Mode of Study</legend>
                            <div className="grid grid-cols-2 gap-4" role="radiogroup" aria-label="Mode of Study">
                                <ThemedRadio name="studyMode" label="Full-Time" value="Full-Time" checked={formData.studyMode === 'Full-Time'} onChange={handleInputChange} hasError={!!errors.studyMode} />
                                <ThemedRadio name="studyMode" label="Part-Time" value="Part-Time" checked={formData.studyMode === 'Part-Time'} onChange={handleInputChange} hasError={!!errors.studyMode} />
                            </div>
                            <FormError id="studyMode-error" message={errors.studyMode} />
                        </fieldset>

                        <fieldset>
                             <legend className={legendClasses}>5. Documents</legend>
                             <div>
                                <label htmlFor="transcript" className={`block text-sm font-medium mb-2 ${theme.textMuted}`}>Upload Transcript (PDF, JPG, PNG - max 2MB)</label>
                                <input ref={fileInputRef} type="file" name="transcript" id="transcript" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg,.png" className={`block w-full text-sm ${theme.textMuted} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${theme.button.secondary.background} ${theme.button.secondary.text} ${theme.button.secondary.hover}`} required aria-invalid={!!errors.transcript} aria-describedby={errors.transcript ? "transcript-error" : undefined} />
                                <FormError id="transcript-error" message={errors.transcript} />
                                
                                {formData.transcript && (
                                    <div className={`mt-4 p-3 border-2 ${theme.input.border} rounded-lg flex items-center justify-between`}>
                                        <div className="flex items-center gap-3">
                                            {formData.transcriptPreview ? (
                                                <img src={formData.transcriptPreview} alt="Transcript preview" className="w-12 h-12 object-cover rounded" />
                                            ) : (
                                                <DocumentIcon className={`w-10 h-10 ${theme.textMuted}`} />
                                            )}
                                            <div>
                                                <p className={`text-sm font-semibold ${theme.text}`}>{formData.transcript.name}</p>
                                                <p className={`text-xs ${theme.textMuted}`}>{ (formData.transcript.size / 1024 / 1024).toFixed(2) } MB</p>
                                            </div>
                                        </div>
                                        <button type="button" onClick={handleRemoveFile} className="p-2 rounded-full text-red-500 hover:bg-red-100 dark:hover:bg-red-500/10">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                        </button>
                                    </div>
                                )}
                             </div>
                        </fieldset>

                        <div>
                            <button type="submit" disabled={status === 'loading'} className={`w-full flex justify-center items-center gap-3 py-3 px-4 border border-transparent rounded-full shadow-sm text-lg font-bold ${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover} disabled:opacity-50 transition-colors duration-300`}>
                               {status === 'loading' ? 'Submitting...' : 'Submit Application'}
                               {status !== 'loading' && <ArrowRightIcon className="w-6 h-6" />}
                            </button>
                        </div>
                        {status === 'error' && <p className="mt-2 text-sm text-center text-red-600" role="alert">{responseMessage}</p>}
                     </form>
                </div>
            </div>
        </div>
    );
};

export default ApplicationFormPage;
