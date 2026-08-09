import React, { useState, useEffect } from 'react';

export default function RegistrarMatriculation() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [msg, setMsg] = useState('');

  const fetchApplications = async () => {
    try {
      const res = await fetch('https://crestoakcollege.com.ng/api/admin/dashboard.php');
      const data = await res.json();
      if (data.success) {
        // Filter only ACCEPTED applications
        const accepted = data.recent_applications.filter(a => a.status === 'ACCEPTED');
        setApplications(accepted);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, []);

  const handleMatriculate = async (appId) => {
    setProcessingId(appId);
    setMsg('');

    try {
      const res = await fetch('https://crestoakcollege.com.ng/api/registrar/matriculate.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ application_id: appId })
      });
      const data = await res.json();

      if (data.success) {
        setMsg(`Success! Matriculation Number Issued: ${data.matric_no}`);
        fetchApplications();
      } else {
        setMsg(`Error: ${data.message}`);
      }
    } catch (err) {
      setMsg('Connection error.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow rounded-lg my-6">
      <h2 className="text-2xl font-bold text-blue-900 mb-2">Registrar Student Clearance & Matriculation</h2>
      <p className="text-sm text-gray-600 mb-6">Convert accepted admissions into enrolled students with official matriculation numbers.</p>

      {msg && <div className="p-3 mb-4 bg-blue-50 text-blue-900 rounded font-medium">{msg}</div>}

      {loading ? (
        <div className="text-center py-4">Loading accepted applications...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">App Ref</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">Applicant Name</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">Program</th>
                <th className="px-4 py-2 text-center text-xs font-bold text-gray-600 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {applications.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-4 text-center text-gray-500">No pending accepted applicants to matriculate.</td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.id}>
                    <td className="px-4 py-2 font-mono font-bold text-blue-900">CCHMT-ADM-{String(app.id).padStart(5, '0')}</td>
                    <td className="px-4 py-2">{app.applicant_name}</td>
                    <td className="px-4 py-2">{app.program_applied}</td>
                    <td className="px-4 py-2 text-center">
                      <button
                        onClick={() => handleMatriculate(app.id)}
                        disabled={processingId === app.id}
                        className="px-3 py-1 bg-green-700 hover:bg-green-800 text-white font-bold rounded text-xs"
                      >
                        {processingId === app.id ? 'Processing...' : 'Issue Matric Number'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
