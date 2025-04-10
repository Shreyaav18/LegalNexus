import React, { useEffect, useState } from 'react';
import { getCases, updateCase, deleteCase, createCase } from '../services/caseService.js';
import { useNavigate } from 'react-router-dom';

function CaseList() {
  const [cases, setCases] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const response = await getCases();
      setCases(response.data);
    } catch (error) {
      console.error('Error fetching cases:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCase(id);
      fetchCases();
    } catch (error) {
      console.error('Error deleting case:', error);
    }
  };



  return (
    <div>
      <h1>Case List</h1>
      <button onClick={() => navigate('/add')}>Add New Case</button>
      <ul>
        {cases.map((c) => (
          <li key={c.case_id}>
            {c.case_type} - Urgency: {c.case_urgency}
            <button onClick={() => navigate(`/edit/${c.case_id}`)}>Edit</button>
            <button onClick={() => handleDelete(c.case_id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CaseList;
