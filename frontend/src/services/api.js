import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/tokens';

export const fetchTokens = async () => {
  const response = await axios.get(API_BASE_URL);
  return response.data;
};

export const generateToken = async () => {
  const response = await axios.post(API_BASE_URL);
  return response.data;
};

export const callNextToken = async () => {
  const response = await axios.put(`${API_BASE_URL}/call-next`);
  return response.data;
};

export const markTokenComplete = async (id) => {
  const response = await axios.put(`${API_BASE_URL}/complete/${id}`);
  return response.data;
};

export const resetQueue = async () => {
  const response = await axios.delete(`${API_BASE_URL}/reset`);
  return response.data;
};
