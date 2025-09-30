import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBalanceScale, FaArrowLeft, FaUpload, FaFileAlt, FaTimes } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';

function RegisterCase() {
  const [caseData, setCaseData] = useState({
    title: '',
    description: '',
    case_type: 'civil',
    deadline: '',
    estimated_cost: '',
  });

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const navigate = useNavigate();

  // API Configuration - based on your Django router
  const API_CONFIG = {
    baseURL: process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000',
    endpoints: {
      cases: '/cases/'  // This matches your Django router: router.register(r'cases', CaseViewSet)
    }
  };

  const caseTypes = [
    { value: 'criminal', label: 'Criminal Law' },
    { value: 'civil', label: 'Civil Law' },
    { value: 'family', label: 'Family Law' },
    { value: 'corporate', label: 'Corporate Law' },
    { value: 'immigration', label: 'Immigration Law' },
    { value: 'personal_injury', label: 'Personal Injury' },
    { value: 'property', label: 'Property Law' },
    { value: 'employment', label: 'Employment Law' },
    { value: 'tax', label: 'Tax Law' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCaseData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024; // 10MB limit
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/jpg'
    ];

    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        setMessage(`File ${file.name} is too large. Maximum size is 10MB.`);
        setMessageType('error');
        return false;
      }
      if (!allowedTypes.includes(file.type)) {
        setMessage(`File ${file.name} is not a supported format.`);
        setMessageType('error');
        return false;
      }
      return true;
    });

    setDocuments(prev => [...prev, ...validFiles]);
  };

  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setMessage('Please login to register a case');
        setMessageType('error');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', caseData.title);
      formData.append('description', caseData.description);
      formData.append('case_type', caseData.case_type);
      formData.append('priority_level', 3); // Default medium priority
      formData.append('deadline', caseData.deadline || '');
      formData.append('estimated_cost', caseData.estimated_cost || '');
      formData.append('status', 'filed');

      // Add documents
      documents.forEach((file, index) => {
        formData.append(`document_${index}`, file);
      });

      // Use the correct endpoint based on your Django router configuration
      const url = `${API_CONFIG.baseURL}${API_CONFIG.endpoints.cases}`;
      
      console.log(`Connecting to: ${url}`);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        
        if (response.status === 404) {
          throw new Error('API endpoint not found. Please ensure the backend server is running on http://127.0.0.1:8000');
        } else if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Permission denied. You may not have access to register cases.');
        }
      }

      const responseData = await response.json();

      if (response.ok) {
        setMessage(`Case registered successfully! Case Number: ${responseData.case_number || 'Assigned'}`);
        setMessageType('success');
        
        // Reset form
        setCaseData({
          title: '',
          description: '',
          case_type: 'civil',
          deadline: '',
          estimated_cost: '',
        });
        setDocuments([]);

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          const userType = localStorage.getItem('userType');
          if (userType === 'lawyer') {
            navigate('/lawfirmdashboard');
          } else {
            navigate('/user-dashboard');
          }
        }, 3000);

      } else {
        // Handle validation errors
        if (responseData.title) {
          setMessage(`Title: ${responseData.title[0]}`);
        } else if (responseData.description) {
          setMessage(`Description: ${responseData.description[0]}`);
        } else if (responseData.error) {
          setMessage(responseData.error);
        } else {
          setMessage('Failed to register case. Please check your details.');
        }
        setMessageType('error');
      }

    } catch (error) {
      console.error('Error registering case:', error);
      setMessage('Network error. Please try again.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#f8f9fc' }}>
      {/* Header */}
      <header className="shadow-sm" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="container-fluid">
          <div className="d-flex align-items-center justify-content-between py-4 px-4">
            <div className="d-flex align-items-center text-white">
              <FaBalanceScale size={36} className="me-3" />
              <div>
                <h1 className="h3 mb-0 fw-bold">Legal Nexus</h1>
                <small className="opacity-75">Professional Legal Services</small>
              </div>
            </div>
            <button 
              onClick={handleBack}
              className="btn btn-light btn-lg px-4"
              style={{ borderRadius: '50px' }}
            >
              <FaArrowLeft className="me-2" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container-fluid py-5">
        <div className="row justify-content-center">
          <div className="col-xl-10 col-lg-11">
            <div className="card border-0 shadow-lg" style={{ borderRadius: '20px' }}>
              {/* Card Header */}
              <div 
                className="card-header text-white p-5 border-0"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '20px 20px 0 0'
                }}
              >
                <div className="text-center">
                  <h2 className="mb-2 fw-bold fs-1">Register Your Case</h2>
                  <p className="mb-0 fs-5 opacity-90">Provide your case details and supporting documents</p>
                </div>
              </div>

              <div className="card-body p-5">
                {/* Success/Error Message */}
                {message && (
                  <div 
                    className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-danger'} alert-dismissible fade show mb-5`}
                    role="alert"
                    style={{ borderRadius: '15px', fontSize: '1.1rem' }}
                  >
                    <div className="d-flex align-items-center">
                      <div className="flex-grow-1">
                        <strong>{messageType === 'success' ? '✅ Success!' : '❌ Error!'}</strong> {message}
                      </div>
                      <button 
                        type="button" 
                        className="btn-close" 
                        onClick={() => setMessage('')}
                      ></button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    {/* Left Column */}
                    <div className="col-lg-6">
                      {/* Case Title */}
                      <div className="mb-5">
                        <label className="form-label fw-bold fs-5 text-primary mb-3">
                          Case Title *
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={caseData.title}
                          onChange={handleChange}
                          className="form-control form-control-lg py-3"
                          placeholder="Enter a clear and descriptive case title"
                          required
                          disabled={loading}
                          style={{ borderRadius: '12px', fontSize: '1.1rem' }}
                        />
                        <small className="text-muted fs-6 mt-2">
                          Provide a concise title that summarizes your legal matter
                        </small>
                      </div>

                      {/* Case Type */}
                      <div className="mb-5">
                        <label className="form-label fw-bold fs-5 text-primary mb-3">
                          Case Type *
                        </label>
                        <select
                          name="case_type"
                          value={caseData.case_type}
                          onChange={handleChange}
                          className="form-select form-select-lg py-3"
                          required
                          disabled={loading}
                          style={{ borderRadius: '12px', fontSize: '1.1rem' }}
                        >
                          {caseTypes.map(type => (
                            <option key={type.value} value={type.value}>
                              {type.label}
                            </option>
                          ))}
                        </select>
                        <small className="text-muted fs-6 mt-2">
                          Select the category that best describes your case
                        </small>
                      </div>

                      {/* Deadline */}
                      <div className="mb-5">
                        <label className="form-label fw-bold fs-5 text-primary mb-3">
                          Case Deadline
                        </label>
                        <input
                          type="datetime-local"
                          name="deadline"
                          value={caseData.deadline}
                          onChange={handleChange}
                          className="form-control form-control-lg py-3"
                          disabled={loading}
                          style={{ borderRadius: '12px', fontSize: '1.1rem' }}
                        />
                        <small className="text-muted fs-6 mt-2">
                          Optional: Set a deadline if there's a time constraint
                        </small>
                      </div>

                      {/* Estimated Cost */}
                      <div className="mb-5">
                        <label className="form-label fw-bold fs-5 text-primary mb-3">
                          Budget Range
                        </label>
                        <div className="input-group input-group-lg">
                          <span 
                            className="input-group-text fs-4 fw-bold"
                            style={{ borderRadius: '12px 0 0 12px' }}
                          >
                            ₹
                          </span>
                          <input
                            type="number"
                            name="estimated_cost"
                            value={caseData.estimated_cost}
                            onChange={handleChange}
                            className="form-control py-3"
                            placeholder="Enter your budget"
                            step="1000"
                            min="0"
                            disabled={loading}
                            style={{ borderRadius: '0 12px 12px 0', fontSize: '1.1rem' }}
                          />
                        </div>
                        <small className="text-muted fs-6 mt-2">
                          Optional: Your estimated budget for legal services
                        </small>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="col-lg-6">
                      {/* Case Description */}
                      <div className="mb-5">
                        <label className="form-label fw-bold fs-5 text-primary mb-3">
                          Case Description *
                        </label>
                        <textarea
                          name="description"
                          value={caseData.description}
                          onChange={handleChange}
                          className="form-control"
                          rows="8"
                          placeholder="Provide detailed information about your case, including relevant facts, circumstances, and any background information that would help us understand your legal matter better..."
                          required
                          disabled={loading}
                          style={{ 
                            borderRadius: '12px', 
                            fontSize: '1.1rem',
                            lineHeight: '1.6',
                            resize: 'vertical'
                          }}
                        ></textarea>
                        <small className="text-muted fs-6 mt-2">
                          Include all relevant details that will help our lawyers understand your case
                        </small>
                      </div>

                      {/* Document Upload */}
                      <div className="mb-5">
                        <label className="form-label fw-bold fs-5 text-primary mb-3">
                          Supporting Documents
                        </label>
                        
                        <div 
                          className="border border-2 border-dashed rounded-4 p-4 text-center position-relative"
                          style={{ 
                            borderColor: '#667eea',
                            backgroundColor: '#f8f9fc',
                            minHeight: '150px'
                          }}
                        >
                          <input
                            type="file"
                            id="documents"
                            onChange={handleFileUpload}
                            className="position-absolute w-100 h-100 opacity-0"
                            style={{ cursor: 'pointer' }}
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            disabled={loading}
                          />
                          
                          <div className="py-3">
                            <FaUpload size={40} className="text-primary mb-3" />
                            <h5 className="text-primary fw-bold">Upload Documents</h5>
                            <p className="text-muted mb-0">
                              Click here or drag and drop files<br />
                              <small>PDF, Word, Images (Max 10MB each)</small>
                            </p>
                          </div>
                        </div>

                        {/* Uploaded Documents List */}
                        {documents.length > 0 && (
                          <div className="mt-4">
                            <h6 className="fw-bold text-primary mb-3">Uploaded Documents:</h6>
                            <div className="list-group">
                              {documents.map((file, index) => (
                                <div 
                                  key={index} 
                                  className="list-group-item d-flex align-items-center justify-content-between py-3"
                                  style={{ borderRadius: '10px', marginBottom: '8px' }}
                                >
                                  <div className="d-flex align-items-center">
                                    <FaFileAlt className="text-primary me-3" size={20} />
                                    <div>
                                      <div className="fw-semibold">{file.name}</div>
                                      <small className="text-muted">{formatFileSize(file.size)}</small>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm rounded-circle"
                                    onClick={() => removeDocument(index)}
                                    disabled={loading}
                                  >
                                    <FaTimes />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <small className="text-muted fs-6 mt-2">
                          Upload any relevant documents, contracts, correspondence, or evidence
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* Information Box */}
                  <div className="alert alert-info border-0 p-4 mb-5" style={{ borderRadius: '15px', backgroundColor: '#e8f4fd' }}>
                    <div className="d-flex align-items-start">
                      <div className="flex-shrink-0 me-3">
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center text-primary"
                          style={{ width: '40px', height: '40px', backgroundColor: '#ffffff' }}
                        >
                          ℹ️
                        </div>
                      </div>
                      <div>
                        <h6 className="fw-bold text-primary mb-2">What happens next?</h6>
                        <p className="mb-0 text-primary">
                          Once you submit your case, our system will automatically assign it to the most suitable lawyer 
                          based on the case type and complexity. You'll receive a confirmation email with your case number, 
                          and a lawyer will contact you within 24 hours to discuss your case in detail.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="text-center">
                    <div className="d-flex gap-4 justify-content-center flex-wrap">
                      <button
                        type="submit"
                        className="btn btn-lg px-5 py-3 fw-bold"
                        disabled={loading}
                        style={{
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          border: 'none',
                          borderRadius: '50px',
                          color: 'white',
                          fontSize: '1.2rem',
                          minWidth: '200px'
                        }}
                      >
                        {loading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Processing...
                          </>
                        ) : (
                          '📋 Register Case'
                        )}
                      </button>

                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-lg px-5 py-3 fw-bold"
                        onClick={handleBack}
                        disabled={loading}
                        style={{
                          borderRadius: '50px',
                          fontSize: '1.2rem',
                          minWidth: '150px'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-white text-center py-4 mt-5" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <div className="container">
          <p className="mb-0 fs-5">&copy; 2025 Legal Nexus. Providing professional legal services with excellence.</p>
        </div>
      </footer>
    </div>
  );
}

export default RegisterCase;