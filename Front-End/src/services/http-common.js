import axios from 'axios';
import { getAuthToken } from '../services/auth';


const API_URL = import.meta.env.VITE_API_URL;
const SERVER_URL = import.meta.env.VITE_SERVER_URL;



export const countriesApi = axios.create({
    baseURL: API_URL,
});

export const serverApi = axios.create({
    baseURL: SERVER_URL,
    withCredentials: true,
});



serverApi.interceptors.request.use(
    (config) => {
        const token = getAuthToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
