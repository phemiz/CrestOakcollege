
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../components/PageWrapper';
import { useTheme } from '../hooks/useTheme';
import { studentLogin, staffLogin, getCurrentStudent, getCurrentStaff } from '../hooks/useApi';

const PortalPage: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'student' | 'staff'>('student');
  
  // Form states
  const [studentId, setStudentId] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (getCurrentStudent()) {
      navigate('/student-dashboard');
    } else if (getCurrentStaff()) {
      navigate('/admin');
    }
  }, [navigate]);

  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await studentLogin(studentId, studentPassword);
    if (result.success) {
      navigate('/student-dashboard');
    } else {
      setError(result.message || 'Login failed');
      setLoading(false);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const result = await staffLogin(staffEmail, staffPassword);
    if (result.success) {
      navigate('/admin');
    } else {
      setError(result.message || 'Login failed');
      setLoading(false);
    }
  };

  const inputClass = `w-full px-4 py-3 rounded-lg border ${theme.input.border} ${theme.input.background} ${theme.input.text} focus:outline-none focus:ring-2 focus:ring-blue-500`;
  const labelClass = `block mb-2 text-sm font-bold ${theme.textMuted}`;
  const tabClass = (isActive: boolean) => `flex-1 py-3 text-center font-bold transition-colors duration-200 ${isActive ? `${theme.button.primary.background} ${theme.button.primary.text}` : `${theme.card.background} ${theme.text} hover:bg-gray-100 dark:hover:bg-white/5`}`;

  return (
    <PageWrapper title="College Portals" subtitle="Secure access for students and staff.">
      <div className="max-w-md mx-auto mt-8">
        <div className={`${theme.card.background} rounded-xl shadow-2xl overflow-hidden border ${theme.card.border}`}>
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button onClick={() => { setActiveTab('student'); setError(''); }} className={tabClass(activeTab === 'student')}>Student Portal</button>
            <button onClick={() => { setActiveTab('staff'); setError(''); }} className={tabClass(activeTab === 'staff')}>Staff Portal</button>
          </div>
          
          <div className="p-8">
            {error && <div className="mb-6 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">{error}</div>}
            
            {activeTab === 'student' ? (
              <form onSubmit={handleStudentLogin} className="space-y-6">
                 <div className="text-center mb-6">
                    <h3 className={`text-xl font-bold ${theme.text}`}>Student Login</h3>
                    <p className={`text-sm ${theme.textMuted}`}>Access course materials, results, and fees.</p>
                 </div>
                 <div>
                    <label className={labelClass}>Matric Number</label>
                    <input type="text" value={studentId} onChange={e => setStudentId(e.target.value)} className={inputClass} placeholder="e.g., COC/24/001" required />
                 </div>
                 <div>
                    <label className={labelClass}>Password</label>
                    <input type="password" value={studentPassword} onChange={e => setStudentPassword(e.target.value)} className={inputClass} placeholder="Password" required />
                 </div>
                 <button type="submit" disabled={loading} className={`w-full py-3 rounded-lg font-bold ${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover} transition duration-200 disabled:opacity-50`}>
                    {loading ? 'Logging in...' : 'Login'}
                 </button>
                 <p className="text-center text-xs text-gray-500 mt-4">
                   Demo: ID: <strong>COC/24/001</strong> | Pass: <strong>StudentPass1!</strong>
                 </p>
              </form>
            ) : (
              <form onSubmit={handleStaffLogin} className="space-y-6">
                 <div className="text-center mb-6">
                    <h3 className={`text-xl font-bold ${theme.text}`}>Staff Login</h3>
                    <p className={`text-sm ${theme.textMuted}`}>Manage admissions, courses, and students.</p>
                 </div>
                 <div>
                    <label className={labelClass}>Email Address</label>
                    <input type="email" value={staffEmail} onChange={e => setStaffEmail(e.target.value)} className={inputClass} placeholder="provost@crestoak.edu.ng" required />
                 </div>
                 <div>
                    <label className={labelClass}>Password</label>
                    <input type="password" value={staffPassword} onChange={e => setStaffPassword(e.target.value)} className={inputClass} placeholder="••••••••" required />
                 </div>
                 <button type="submit" disabled={loading} className={`w-full py-3 rounded-lg font-bold ${theme.button.primary.background} ${theme.button.primary.text} ${theme.button.primary.hover} transition duration-200 disabled:opacity-50`}>
                    {loading ? 'Logging in...' : 'Login'}
                 </button>
                 <p className="text-center text-xs text-gray-500 mt-4">
                   Demo: Email: <strong>provost@crestoak.edu.ng</strong> | Pass: <strong>AdminPass1!</strong>
                 </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default PortalPage;
