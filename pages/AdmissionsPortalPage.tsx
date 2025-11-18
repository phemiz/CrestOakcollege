import React, { useState, useMemo, useRef } from 'react';
import PageWrapper from '../components/PageWrapper';
import { useApi, postApplication, fetchApplicationStatus } from '../hooks/useApi';
import { Department, ApplicationFormData, Application, ApplicationStatus } from '../types';
import { useTheme } from '../hooks/useTheme';

const AdmissionsPortalPage: React.FC = () => {
  const { theme } = useTheme();
  const formBg = theme.name === 'light' ? 'bg-white' : theme.card.background;
  const formRef = useRef<HTMLFormElement>(null);
  const errorSummaryRef = useRef<HTMLDivElement>(null);


  // --- Application Form State ---
  const { data: departments, loading: deptsLoading } = useApi<Department[]>('/api/departments');
  const [formData, setFormData] = useState<ApplicationFormData>({ name: '', email: '', phone: '', gender: '', departmentId: '', transcript: null });
  const [errors, setErrors] = useState<Partial<Record<keyof ApplicationFormData, string>>>({});
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formResponse, setFormResponse] = useState({ message: '', applicationId: '' });

  // --- Status Tracker State ---
  const [identifier, setIdentifier] = useState('');
  const [trackerStatus, setTrackerStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [foundApplication, setFoundApplication] = useState<Application | null>(null);
  const [trackerMessage, setTrackerMessage] = useState('');

  const departmentMap = useMemo(() => {
    if (!departments) return {};
    return departments.reduce((acc, dept) => {
      acc[dept.id] = dept.name;
      return acc;
    }, {} as Record<string, string>);
  }, [departments]);

  // --- Form Logic ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof ApplicationFormData]) {
        setErrors(prev => ({...prev, [name]: undefined}));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setErrors(prev => ({...prev, transcript: undefined}));
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setErrors(prev => ({...prev, transcript: 'File size must not exceed 5MB.'}));
        setFormData(prev => ({ ...prev, transcript: null }));
        return;
      }
      if (!['application/pdf', 'image/jpeg'].includes(file.type)) {
        setErrors(prev => ({...prev, transcript: 'Only PDF and JPG files are allowed.'}));
        setFormData(prev => ({ ...prev, transcript: null }));
        return;
      }
      setFormData(prev => ({ ...prev, transcript: file }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ApplicationFormData, string>> = {};
    if (formData.name.length < 3 || formData.name.length > 100) newErrors.name = 'Name must be between 3 and 100 characters.';
    if (!/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(formData.email)) newErrors.email = 'Please enter a valid email address.';
    if (!/^\+?[0-9]{10,14}$/.test(formData.phone)) newErrors.phone = 'Please enter a valid phone number.';
    if (!formData.gender) newErrors.gender = 'Please select a gender.';
    if (!formData.departmentId) newErrors.departmentId = 'Please select a department.';
    if (!formData.transcript) newErrors.transcript = 'Please upload your transcript.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) {
        setTimeout(() => {
            errorSummaryRef.current?.focus();
        }, 100);
        return;
    }
    setFormStatus('loading');
    setFormResponse({ message: '', applicationId: '' });
    try {
        const result = await postApplication(formData);
        if (result.success) {
          setFormStatus('success');
          setFormResponse({ message: result.message, applicationId: result.applicationId || ''});
          setFormData({ name: '', email: '', phone: '', gender: '', departmentId: '', transcript: null });
          formRef.current?.reset();
        } else {
          setFormStatus('error');
          setFormResponse({ message: result.message, applicationId: '' });
        }
    } catch (err) {
        console.error("Application submission failed:", err);
        setFormStatus('error');
        setFormResponse({ message: 'An unexpected error occurred during submission. Please try again.', applicationId: '' });
    }
  };
  
  // --- Tracker Logic ---
  const handleTrackerSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!identifier) return;
    setTrackerStatus('loading');
    setFoundApplication(null);
    setTrackerMessage('');
    const result = await fetchApplicationStatus(identifier);
    if (result.success && result.application) {
      setTrackerStatus('success');
      setFoundApplication(result.application);
    } else {
      setTrackerStatus('error');
      setTrackerMessage(result.message || 'An error occurred.');
    }
  };

  const getStatusColor = (status: ApplicationStatus) => {
    switch(status) {
        case ApplicationStatus.Approved: return 'text-green-600 bg-green-100';
        case ApplicationStatus.Rejected: return 'text-red-600 bg-red-100';
        case ApplicationStatus.Pending:
        default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const inputClasses = `mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none ${theme.input.background} ${theme.input.text} ${theme.input.border} ${theme.input.focus} ${theme.input.placeholder}`;

  return (
    <PageWrapper title="Admissions Portal" subtitle="Apply to Crestview or track your existing application.">
      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
        {/* Application Form Section */}
        <div className={`${formBg} p-8 rounded-lg ${theme.card.shadow} ${theme.card.border}`}>
          <h2 className={`text-3xl font-bold ${theme.text} mb-6`}>Apply to Crestview</h2>
          
          {Object.keys(errors).length > 0 && (
            <div ref={errorSummaryRef} tabIndex={-1} role="alert" className="p-4 mb-6 rounded-md bg-red-50 border border-red-200">
                <h3 className="text-sm font-medium text-red-800">Please correct the following errors:</h3>
                <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
                    {Object.values(errors).map((error, index) => <li key={index}>{error}</li>)}
                </ul>
            </div>
          )}
          <div aria-live="assertive" className="sr-only">
            {Object.keys(errors).length > 0 && `There are ${Object.keys(errors).length} errors on the form.`}
          </div>

          <form ref={formRef} onSubmit={handleFormSubmit} className="space-y-6" noValidate>
            <div>
              <label htmlFor="name" className={`block text-sm font-medium ${theme.textMuted}`}>Full Name</label>
              <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} className={inputClasses} required minLength={3} maxLength={100} aria-describedby="name-error" aria-invalid={!!errors.name} />
              {errors.name && <p id="name-error" className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
             <div>
              <label htmlFor="email" className={`block text-sm font-medium ${theme.textMuted}`}>Email Address</label>
              <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} className={inputClasses} required aria-describedby="email-error" aria-invalid={!!errors.email}/>
               {errors.email && <p id="email-error" className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
             <div>
              <label htmlFor="phone" className={`block text-sm font-medium ${theme.textMuted}`}>Phone Number</label>
              <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleInputChange} className={inputClasses} required aria-describedby="phone-error" aria-invalid={!!errors.phone}/>
              {errors.phone && <p id="phone-error" className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="gender" className={`block text-sm font-medium ${theme.textMuted}`}>Gender</label>
                <select name="gender" id="gender" value={formData.gender} onChange={handleInputChange} className={inputClasses} required aria-describedby="gender-error" aria-invalid={!!errors.gender}>
                  <option value="" disabled>Select...</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
                 {errors.gender && <p id="gender-error" className="mt-1 text-sm text-red-600">{errors.gender}</p>}
              </div>
              <div>
                <label htmlFor="departmentId" className={`block text-sm font-medium ${theme.textMuted}`}>Department</label>
                <select name="departmentId" id="departmentId" value={formData.departmentId} onChange={handleInputChange} className={inputClasses} required disabled={deptsLoading} aria-describedby="departmentId-error" aria-invalid={!!errors.departmentId}>
                  <option value="" disabled>Select...</option>
                  {departments?.map(dept => <option key={dept.id} value={dept.id}>{dept.name}</option>)}
                </select>
                {errors.departmentId && <p id="departmentId-error" className="mt-1 text-sm text-red-600">{errors.departmentId}</p>}
              </div>
            </div>
            <div>
              <label htmlFor="transcript" className={`block text-sm font-medium ${theme.textMuted}`}>Upload Transcript (PDF/JPG, max 5MB)</label>
              <input type="file" name="transcript" id="transcript" onChange={handleFileChange} accept=".pdf,.jpg,.jpeg" className={`mt-1 block w-full text-sm ${theme.textMuted} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold ${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover}`} required aria-describedby="transcript-error" aria-invalid={!!errors.transcript}/>
              {formData.transcript && <p className={`mt-1 text-sm ${theme.textMuted}`}>Selected: {formData.transcript.name} ({(formData.transcript.size / 1024 / 1024).toFixed(2)} MB)</p>}
              {errors.transcript && <p id="transcript-error" className="mt-1 text-sm text-red-600">{errors.transcript}</p>}
            </div>
            
            <button type="submit" disabled={formStatus === 'loading'} className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-lg font-bold ${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-crest-blue disabled:opacity-50 transition-colors duration-300`}>
              {formStatus === 'loading' ? 'Submitting...' : 'Submit Application'}
            </button>
          </form>

          {formResponse.message && (
            <div aria-live="polite" className={`mt-4 text-sm text-center p-3 rounded-md ${formStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <p>{formResponse.message}</p>
              {formResponse.applicationId && <p className="font-bold mt-1">Application ID: {formResponse.applicationId}</p>}
            </div>
          )}
        </div>

        {/* Status Tracker Section */}
        <div className={`${formBg} p-8 rounded-lg ${theme.card.shadow} ${theme.card.border}`}>
          <h2 className={`text-3xl font-bold ${theme.text} mb-6`}>Track Your Application</h2>
          <form onSubmit={handleTrackerSubmit}>
            <label htmlFor="identifier" className={`block text-sm font-medium ${theme.textMuted}`}>Application ID or Email</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input type="text" name="identifier" id="identifier" value={identifier} onChange={(e) => setIdentifier(e.target.value)} className={`flex-1 block w-full min-w-0 rounded-none rounded-l-md px-3 py-2 border focus:outline-none ${theme.input.background} ${theme.input.text} ${theme.input.border} ${theme.input.focus}`} placeholder="e.g., app-a1b2c3d4" required/>
              <button type="submit" disabled={trackerStatus === 'loading'} className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md ${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover} disabled:opacity-50`}>
                {trackerStatus === 'loading' ? '...' : 'Track'}
              </button>
            </div>
          </form>
          {trackerStatus !== 'idle' && (
            <div className="mt-6 border-t pt-6" aria-live="polite">
              {trackerStatus === 'loading' && <p className={theme.textMuted}>Searching...</p>}
              {trackerStatus === 'error' && <p className="text-red-600">{trackerMessage}</p>}
              {trackerStatus === 'success' && foundApplication && (
                <div className={`space-y-3 ${theme.text}`}>
                  <h3 className={`text-xl font-bold ${theme.text}`}>Application Found</h3>
                  <p><strong>Name:</strong> {foundApplication.name}</p>
                  <p><strong>Department:</strong> {departmentMap[foundApplication.departmentId]}</p>
                  <p><strong>Submitted:</strong> {new Date(foundApplication.createdAt).toLocaleDateString()}</p>
                  <p className="flex items-center"><strong>Status:</strong> <span className={`ml-2 px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusColor(foundApplication.status)}`}>{foundApplication.status}</span></p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default AdmissionsPortalPage;