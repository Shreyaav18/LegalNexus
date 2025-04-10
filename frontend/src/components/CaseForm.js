import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

function CaseForm() {
  const [caseData, setCaseData] = useState({ case_type: '', evidence_count: '', case_date: '', case_details: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCaseData({ ...caseData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('http://localhost:8000/api/cases/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(caseData),
      });

      if (response.ok) {
        setMessage('Case added successfully!');
        setTimeout(() => navigate('/cases'), 1500);
      } else {
        setMessage('Failed to add case. Please try again.');
      }
    } catch (error) {
      setMessage('An error occurred. Please check your connection.');
    }
    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Add New Case</h2>
      {message && <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'}`}>{message}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Case Type:</label>
          <input type="text" name="case_type" value={caseData.case_type} onChange={handleChange} className="form-control" />
        </div>

        <div className="mb-3">
          <label className="form-label">Evidence Count:</label>
          <input type="number" name="evidence_count" value={caseData.evidence_count} onChange={handleChange} className="form-control" />
        </div>

        <div className="mb-3">
          <label className="form-label">Case Date:</label>
          <input type="date" name="case_date" value={caseData.case_date} onChange={handleChange} className="form-control" />
        </div>

        <div className="mb-3">
          <label className="form-label">Case Details:</label>
          <textarea name="case_details" value={caseData.case_details} onChange={handleChange} className="form-control" rows="4" placeholder="Provide detailed information about the case..." />
        </div>

        <p className="text-muted">Case urgency will be determined automatically by the system.</p>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Case'}
        </button>
      </form>
    </div>
  );
}

export default CaseForm;
