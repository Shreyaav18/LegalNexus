import React, { useState, useEffect } from 'react';
import { getCases, createCase, updateCase, deleteCase, getLawyerDetails } from '../services/caseService.js';
import { FaUserCircle, FaEnvelope, FaPhone, FaIdCard } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Carousel } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import {Table} from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function LawFirmDashboard(data) {
  const [selectedSection, setSelectedSection] = useState('dashboard');
  const [crimeData, setCrimeData] = useState([]);
  const [crimeUpdates, setCrimeUpdates] = useState([]);
  const [prioritizedCases, setPrioritizedCases] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [clients, setClients] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [lawyer, setLawyer] = useState();
  const [cases, setCases] = useState([]);
  const [currentUpdateIndex, setCurrentUpdateIndex] = useState(0);
  const [currentStage, setCurrentStage] = useState(0);

  const navigate = useNavigate();

  const handleCreateCase = () => {
    navigate("/create-case");
  };
  useEffect(() => {
    setCrimeData([
      { location: 'Delhi', cases: 250 },
      { location: 'Mumbai', cases: 180 },
      { location: 'Bangalore', cases: 150 },
      { location: 'Chennai', cases: 130 },
      { location: 'Kolkata', cases: 120 },
      { location: 'Hyderabad', cases: 140 },
      { location: 'Pune', cases: 100 },
      { location: 'Jaipur', cases: 90 },
      { location: 'Ahmedabad', cases: 110 },
      { location: 'Lucknow', cases: 95 }
    ])
}, []);

    useEffect (() => {
      const updates=[
        'Cybercrime cases increased by 20% this month in India.',
        'New AI regulations announced for criminal case management.',
        'Legal conference on AI-based crime analysis next month.',
        'Supreme Court advises on faster case resolutions using AI.',
        'Major breakthrough in financial fraud case using AI tools.',
        'Police adopt facial recognition for crime prevention.',
        'Human trafficking ring busted using AI surveillance.',
        'Cyber laws amended to include AI-generated crimes.',
        'Public awareness campaign on AI & legal rights launched.',
        'Law firms urged to adopt AI for evidence analysis.'
      ];

      setCrimeUpdates(updates);
      
      const interval = setInterval(() => {
        setCurrentUpdateIndex((prevIndex) => (prevIndex + 1) % 10);
      }, 1000);
    
      setPrioritizedCases([
        { caseID: 'P001', client: 'Raj Malhotra', priority: 'High', status: 'Pending' },
        { caseID: 'P002', client: 'Anjali Sharma', priority: 'Medium', status: 'Investigation' },
        { caseID: 'P003', client: 'Vikram Singh', priority: 'High', status: 'Hearing Scheduled' },
        { caseID: 'P004', client: 'Neha Batra', priority: 'Low', status: 'Closed' },
        { caseID: 'P005', client: 'Siddharth Jain', priority: 'High', status: 'Evidence Collection' },
        { caseID: 'P006', client: 'Aisha Khan', priority: 'Medium', status: 'Pending' },
        { caseID: 'P007', client: 'Ravi Verma', priority: 'High', status: 'Investigation' },
        { caseID: 'P008', client: 'Kiran Joshi', priority: 'Low', status: 'Hearing Scheduled' }
      ]);
    
      setTasks([
        { taskID: 'T001', assignedTo: 'Adv. Kumar', dueDate: '2025-03-30', status: 'Pending' },
        { taskID: 'T002', assignedTo: 'Adv. Singh', dueDate: '2025-03-28', status: 'Completed' },
        { taskID: 'T003', assignedTo: 'Adv. Verma', dueDate: '2025-04-01', status: 'In Progress' },
        { taskID: 'T004', assignedTo: 'Adv. Mehta', dueDate: '2025-04-05', status: 'Pending' },
        { taskID: 'T005', assignedTo: 'Adv. Kapoor', dueDate: '2025-04-10', status: 'Completed' },
        { taskID: 'T006', assignedTo: 'Adv. Chawla', dueDate: '2025-03-29', status: 'Overdue' },
        { taskID: 'T007', assignedTo: 'Adv. Thakur', dueDate: '2025-04-02', status: 'Pending' },
        { taskID: 'T008', assignedTo: 'Adv. Iyer', dueDate: '2025-04-03', status: 'In Progress' }
      ]);
    
      setDocuments([
        { docID: 'D001', title: 'Case Report 1', version: '1.2', dateUploaded: '2025-03-15' },
        { docID: 'D002', title: 'Evidence Summary', version: '1.0', dateUploaded: '2025-03-10' },
        { docID: 'D003', title: 'Client Statement', version: '1.1', dateUploaded: '2025-03-18' },
        { docID: 'D004', title: 'Investigation Notes', version: '1.0', dateUploaded: '2025-03-20' },
        { docID: 'D005', title: 'Legal Notice Draft', version: '2.0', dateUploaded: '2025-03-22' },
        { docID: 'D006', title: 'Witness List', version: '1.3', dateUploaded: '2025-03-25' },
        { docID: 'D007', title: 'Medical Report', version: '1.0', dateUploaded: '2025-03-27' },
        { docID: 'D008', title: 'Forensics Report', version: '1.0', dateUploaded: '2025-03-28' }
      ]);
    
      setClients([
        { clientID: 'C001', name: 'Raj Malhotra', contact: 'raj.m@example.com' },
        { clientID: 'C002', name: 'Anjali Sharma', contact: 'anjali.s@example.com' },
        { clientID: 'C003', name: 'Vikram Singh', contact: 'vikram.s@example.com' },
        { clientID: 'C004', name: 'Neha Batra', contact: 'neha.b@example.com' },
        { clientID: 'C005', name: 'Siddharth Jain', contact: 'sidd.j@example.com' },
        { clientID: 'C006', name: 'Aisha Khan', contact: 'aisha.k@example.com' },
        { clientID: 'C007', name: 'Ravi Verma', contact: 'ravi.v@example.com' },
        { clientID: 'C008', name: 'Kiran Joshi', contact: 'kiran.j@example.com' }
      ]);
    
      setInvoices([
        { invoiceID: 'I001', client: 'Raj Malhotra', amount: 15000, status: 'Paid' },
        { invoiceID: 'I002', client: 'Anjali Sharma', amount: 12000, status: 'Pending' },
        { invoiceID: 'I003', client: 'Vikram Singh', amount: 18000, status: 'Paid' },
        { invoiceID: 'I004', client: 'Neha Batra', amount: 9000, status: 'Pending' },
        { invoiceID: 'I005', client: 'Siddharth Jain', amount: 20000, status: 'Paid' },
        { invoiceID: 'I006', client: 'Aisha Khan', amount: 14000, status: 'Pending' },
        { invoiceID: 'I007', client: 'Ravi Verma', amount: 16000, status: 'Overdue' },
        { invoiceID: 'I008', client: 'Kiran Joshi', amount: 11000, status: 'Paid' }
      ]);
    
      fetchCases();
      return () => clearInterval(interval);
    }, []);
    

  const fetchCases = async () => {
    const data = await getCases();
    if (data) {
      setCases(data);
    }
  };

  

  const handleUpdateCase = async (id) => {
    const updatedData = { case_urgency: 5 };
    await updateCase(id, updatedData);
    fetchCases();
  };

  const handleDeleteCase = async (id) => {
    await deleteCase(id);
    fetchCases();
  };

  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      setMessages((prev) => [...prev, { text: inputMessage, sender: 'user' }]);
      setInputMessage('');
      setTimeout(() => {
        setMessages((prev) => [...prev, { text: 'Thank you for your query. Our team will respond shortly.', sender: 'bot' }]);
      }, 1000);
    }
  };

  useEffect(() => {
    const fetchLawyerData = async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No authentication token found");
                return; // Stop execution if there's no token
            }

            const response = await fetch("http://localhost:8000/api/lawyer-details/", {
                headers: { Authorization: `Token ${token}` },
            });

            if (!response.ok) throw new Error(`Failed to fetch lawyer data. Status: ${response.status}`);

            const data = await response.json();
            console.log("Fetched API Data:", data);

            if (!data || Object.keys(data).length === 0) {
                throw new Error("Empty response received");
            }

            setLawyer(data);
        } catch (error) {
            console.error("Error fetching lawyer data:", error);
        }
    };

    fetchLawyerData();
}, []);

  const renderTable = (data, columns) => (
    <Table striped bordered hover>
      <thead>
        <tr>
          {columns.map((col, index) => <th key={index}>{col}</th>)}
        </tr>
      </thead>
      <tbody>
        {data.map((item, rowIndex) => (
          <tr key={rowIndex}>
            {columns.map((col, colIndex) => <td key={colIndex}>{item[col.toLowerCase()]}</td>)}
          </tr>
        ))}
      </tbody>
    </Table>
  );

  const rotatingUpdates = crimeUpdates.length
  ? crimeUpdates.slice(currentUpdateIndex).concat(crimeUpdates.slice(0, currentUpdateIndex))
  : [];

  return (
    <><div style={{ background: '#f4f6fc', minHeight: '100vh', padding: '20px' }}>
    
    <section
  id="profile"
  className="p-4 mb-4 rounded-4 shadow-sm text-white"
  style={{
    background: 'linear-gradient(135deg,rgb(113, 202, 230) 0%,rgb(112, 121, 240) 100%)',
    color: '#fff',
  }}
>
  <h3 className="mb-4 d-flex align-items-center">
    <FaUserCircle className="me-2" size={30} /> Lawyer Profile
  </h3>

  <div className="d-flex align-items-center flex-wrap gap-4">
    <FaUserCircle size={100} className="text-white" />

    {lawyer ? (
      <div className="flex-grow-1">
        <h2 className="fw-bold">{lawyer.name}</h2>

        <div className="mt-3">
          <p className="mb-2 d-flex align-items-center">
            <FaEnvelope className="me-2" />
            <span className="badge bg-light text-dark">{lawyer.email}</span>
          </p>

          <p className="mb-2 d-flex align-items-center">
            <FaPhone className="me-2" />
            <span className="badge bg-light text-dark">
              {lawyer.contact_number || "Not Available"}
            </span>
          </p>

          <p className="mb-2 d-flex align-items-center">
            <FaIdCard className="me-2" />
            <span className="badge bg-light text-dark">
              {lawyer.license_number || "Not Available"}
            </span>
          </p>
        </div>
      </div>
    ) : (
      <div className="ms-4">
        <p className="text-light">Loading lawyer details...</p>
      </div>
    )}
  </div>
</section>

      <nav className="mb-4 d-flex flex-wrap gap-3">
      {['prioritizedCases', 'updates', 'documentManagement', 'billing'].map((section) => {
        const label = section
          .replace(/([A-Z])/g, ' $1')       // Add space before capital letters
          .replace(/^./, (char) => char.toUpperCase()); // Capitalize first letter

        return (
          <button
            key={section}
            onClick={() => setSelectedSection(section)}
            className="btn btn-outline-primary rounded-pill px-4 py-2 shadow-sm fw-semibold"
            style={{ transition: "all 0.3s ease" }}
          >
            {label}
          </button>
        );
      })}
      
    </nav>

    {selectedSection === 'documentManagement' && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="card shadow-lg border-0 rounded-4 p-4 mb-5"
    style={{ background: 'linear-gradient(to right, #e3f2fd, #bbdefb)' }}
  >
    <h4 className="text-primary fw-bold mb-3">📁 Document Management</h4>
    <p className="mb-4">Manage, upload, and access all your legal documents securely in one place.</p>
    <div className="d-flex flex-wrap gap-3">
  <button className="btn btn-outline-secondary rounded-pill px-4 py-2 shadow">📤 Upload Document</button>
  <button className="btn btn-outline-secondary rounded-pill px-4 py-2 shadow">📁 View Uploaded</button>
</div>
  </motion.div>
)}

{selectedSection === 'billing' && (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="card shadow-lg border-0 rounded-4 p-4 mb-5"
  >
    <h5 className="text-primary mb-4">🧾 Billing & Transactions</h5>

    {/* Transactions Table */}
    <div className="table-responsive mb-4">
      <table className="table table-striped table-bordered align-middle">
        <thead className="table-primary">
          <tr>
            <th>Invoice ID</th>
            <th>Client</th>
            <th>Amount (₹)</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice, index) => (
            <tr key={index}>
              <td>{invoice.invoiceID}</td>
              <td>{invoice.client}</td>
              <td>{invoice.amount.toLocaleString()}</td>
              <td>
                <span className={`badge 
                  ${invoice.status === 'Paid' ? 'bg-success' : 
                    invoice.status === 'Pending' ? 'bg-warning text-dark' : 
                    'bg-danger'}`}>
                  {invoice.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    {/* Billing Updates */}
    <div>
      <h6 className="fw-bold mb-3">Latest Updates</h6>
      <ul className="mb-0">
        <li>📬 New invoice generated for Client #542</li>
        <li>💳 Automatic payment scheduled for April 10</li>
        <li>📈 Monthly earnings increased by 12%</li>
      </ul>
    </div>
  </motion.div>
)}

{selectedSection === 'prioritizedCases' && (
  <motion.section
    id="prioritized"
    className="p-4 bg-white mb-4 shadow rounded"
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-primary mb-3">📌 Prioritized Cases</h3>
    <ul className="list-group">
      {prioritizedCases.map((caseData, index) => (
        <li key={index} className="list-group-item">
          <strong>{caseData.caseID}</strong> - {caseData.client} 
          <span className="ms-2 badge bg-info">{caseData.priority}</span> 
          <span className="ms-2 badge bg-secondary">{caseData.status}</span>
        </li>
      ))}
    </ul>
  </motion.section>
)}

      
  <section className="p-4 bg-white mb-4 shadow rounded">
        <div className="row">

        <div className="col-md-6">
          {/* Header */}
          <div
            className="d-flex justify-content-between align-items-center p-4 mb-4 rounded-4 shadow"
            style={{
              background: 'linear-gradient(135deg, #5b75c4, #7079f0)',
              color: '#fff',
            }}
          >
            <h4 className="fw-bold m-0">
              <i className="bi bi-folder2-open me-2"></i>Manage Cases
            </h4>
            <button
              className="btn btn-light fw-semibold shadow-sm"
              onClick={handleCreateCase}
            >
              <i className="bi bi-plus-circle me-2"></i>New Case
            </button>
          </div>

          {/* Case List */}
          <ul className="list-group">
              {cases.map((caseData) => (
                <li
                  key={caseData.case_id}
                  className="list-group-item d-flex justify-content-between align-items-center shadow-sm"
                >
                  <div>
                    <strong>{caseData.case_type}</strong>
                    <span className="badge bg-danger ms-2">Urgency: {caseData.case_urgency}</span>
                  </div>
                  <div>
                    <button
                      className="btn btn-sm btn-outline-warning me-2"
                      onClick={() => handleUpdateCase(caseData.case_id)}
                    >
                      <i className="bi bi-pencil"></i> Update
                    </button>
                    <button
      className="btn btn-light fw-semibold shadow-sm"
      onClick={handleCreateCase}
    >
      <i className="bi bi-plus-circle me-2"></i>New Case
    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>


          {/* Right Column: Case Timeline Viewer */}
        <div className="col-md-6">
          <div className="card p-4 shadow-sm">
            <h5 className="text-primary mb-3">Case Timeline</h5>

          {/* Timeline stages */}
          <div className="d-flex justify-content-between align-items-center position-relative">
            {['Filed', 'Investigation', 'Hearing', 'Trial', 'Closed'].map((stage, idx) => (
              <div key={stage} className="text-center flex-fill">
                <div
                  className={`rounded-circle mx-auto mb-2 ${idx <= currentStage ? 'bg-primary' : 'bg-light border'} `}
                  style={{ width: '22px', height: '22px' }}
                ></div>
                <small className={idx <= currentStage ? 'text-primary' : 'text-muted'}>
                  {stage}
                </small>
              </div>
            ))}
            {/* Connecting line (optional, for visual continuity) */}
            <div
              className="position-absolute top-50 start-0 w-100 translate-middle-y"
              style={{ height: '2px', background: '#ccc', zIndex: 0 }}
            ></div>
          </div>
        </div>
      </div>
      </div>
      </section>
     

        {/* Prioritized Cases Section */}
        

        {/* Updates Section */}
        <section id="updates" className="p-4 bg-white mb-4 shadow rounded">
          <h3 className="text-primary mb-3">📢 Latest Crime Updates</h3>
          <Carousel fade controls={false} indicators={false} interval={800}>
            {rotatingUpdates.map((update, index) => (
              <Carousel.Item key={index}>
          <div className="text-center p-4 animate__animated animate__fadeIn">
            <h5 className="text-dark fw-semibold">{update}</h5>
          </div>
        </Carousel.Item>
      ))}
    </Carousel>
    </section>
  
    <section id="analysis" className="p-3 bg-white mb-3 shadow rounded">
      <h3 className="text-primary">Real-Time Crime Analysis</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={crimeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="location" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="cases" fill="#8884d8" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </section>
    <Link to="/" className="btn btn-danger fw-semibold">Logout</Link>
    </div>
    
    </>
  );
}

export default LawFirmDashboard;

