import axios from 'axios';

const API_URL = 'http://192.168.99.138:5000/api';

const API = axios.create({
  baseURL: API_URL,
  withCredentials: true, 
});

export default API;
