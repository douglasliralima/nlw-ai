import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3333',
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add any custom request interceptors here
    return config;
  },
  (error) => {
    // Handle request errors here
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Add any custom response interceptors here
    return response;
  },
  (error) => {
    // Handle response errors here
    return Promise.reject(error);
  }
);

export default api;