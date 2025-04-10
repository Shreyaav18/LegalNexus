import React, { useEffect, useState } from 'react';
import { fetchPrioritizedCases } from '../api';

const PrioritizedCases = () => {
  const [cases, setCases] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getCases = async () => {
      try {
        const data = await fetchPrioritizedCases();
        setCases(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch data');
      }
    };
    getCases();
  }, []);

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h1>Prioritized Cases</h1>
      {cases.length === 0 ? (
        <p>No cases available.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Case ID</th>
              <th>Case Type</th>
              <th>Case Urgency</th>
              <th>Evidence Count</th>
              <th>Case Date</th>
              <th>Priority Score</th>
            </tr>
          </thead>
          <tbody>
            {cases.map((item) => (
              <tr key={item.case_id}>
                <td>{item.case_id}</td>
                <td>{item.case_type}</td>
                <td>{item.case_urgency}</td>
                <td>{item.evidence_count}</td>
                <td>{item.case_date}</td>
                <td>{item.priority_score.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PrioritizedCases;
