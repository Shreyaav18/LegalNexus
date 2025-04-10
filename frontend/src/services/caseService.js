
import api from './api.js';
import axios from 'axios';

const API_URL = 'http://localhost:8000/api/cases/';

// Fetch all cases
export const getCases = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching cases:', error);
  }
};

// Create a new case
export const createCase = async (data) => {
  try {
    const response = await axios.post(API_URL, data);
    return response.data;
  } catch (error) {
    console.error('Error creating case:', error);
  }
};

// Update a case
export const updateCase = async (id, data) => {
  try {
    const response = await axios.put(`${API_URL}${id}/`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating case:', error);
  }
};

// Delete a case
export const deleteCase = async (id) => {
  try {
    await axios.delete(`${API_URL}${id}/`);
    console.log('Case deleted successfully');
  } catch (error) {
    console.error('Error deleting case:', error);
  }
};

export const getLawyerDetails = async () => {
  try {
    const response = await axios.get('http://localhost:8000/api/lawyerdashboard/lawyer-details/', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching lawyer details:', error);
    throw error;
  }
};
