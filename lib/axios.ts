import axios from 'axios';

const API_URL = 'https://bc91-129-45-31-237.ngrok-free.app/api'; 

const API = axios.create({
  baseURL: API_URL,
  withCredentials: true, 
});

export default API;
