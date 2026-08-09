import React, { useEffect, useState } from 'react';

export default function BursarLedger() {
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ student_id: '', amount: '', status: 'PAID' });
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState('');

  const loadLedger = async () => {
    try {
      const res = await fetch('https://crestoakcollege.com.ng/api/bursar/fees.php');
      const data = await res.json();
      if (data.success) setLedger(data.ledger);
    } catch (err) {
      console.error('Failed to fetch ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLedger(); }, []);

  const handlePostPayment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg('');

    try {
      const res = await fetch('https://crestoakcollege.com.ng/api/bursar/fees.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.success) {
        setMsg(`Success! Issued Receipt: ${data.receipt_number}`);
        setFormData({ student_id: '', amount: '', status: 'PAID' });
        loadLedger();
      } else {
        setMsg(`Error: ${data.message}`);
      }
    } catch (err) {
      setMsg('Connection error.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white shadow rounded-lg my-6">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Bursary Payment Reconciliation & Ledger</h2>

      {/* Record Payment Form */}
      <form onSubmit={handlePostPayment} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded border mb-6">
        <input
          type="number"
          placeholder="Student ID (e.g. 2)"
          value={formData.student_id}
          onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
          className="p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Amount (NGN)"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="p-2 border rounded"
          required
        />
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="p-2 border rounded bg-white"
        >
          <option value="PAID">PAID</option>
          <option value="PENDING">PENDING</option>
        </select>
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-900 text-white font-semibold rounded p-2 hover:bg-blue-800"
        >
          {submitting ? 'Recording...' : 'Log Fee Payment'}
        </button>
      </form>

      {msg && <div className="p-3 mb-4 bg-blue-50 text-blue-900 rounded font-medium">{msg}</div>}

      {/* Ledger Table */}
      {loading ? (
        <div className="text-center py-4">Loading financial records...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">Receipt No</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">Student Name</th>
                <th className="px-4 py-2 text-left text-xs font-bold text-gray-600 uppercase">Amount</th>
                <th className="px-4 py-2 text-center text-xs font-bold text-gray-600 uppercase">Status</th>
                <th className="px-4 py-2 text-center text-xs font-bold text-gray-600 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {ledger.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-2 font-mono font-bold text-blue-900">{row.receipt_number}</td>
                  <td className="px-4 py-2">{row.student_name}</td>
                  <td className="px-4 py-2 font-medium">NGN {Number(row.amount).toLocaleString()}</td>
                  <td className="px-4 py-2 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${row.status === 'PAID' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <a
                      href={`https://crestoakcollege.com.ng/api/student/download-receipt.php?student_id=${row.student_id}&fee_id=${row.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-900 underline font-semibold text-xs"
                    >
                      View Receipt
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
