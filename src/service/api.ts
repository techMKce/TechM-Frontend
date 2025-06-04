import axios from 'axios';

// Create an axios instance with common configuration
const api = axios.create({

  baseURL:'http://172.16.73.149:8080/api/v1/',

  headers: {
    'Content-Type': 'application/json',
  },
});


// Add a request interceptor to include auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    console.log(token)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response.status === 401) {
      const refreshToken = localStorage.getItem('refresh_token');

      try {
        const res = await axios.post('/auth/refresh', { refreshToken });
        const newToken = res.data.token;
        localStorage.setItem('auth_token', newToken);

        // Retry original request
        error.config.headers.Authorization = `Bearer ${newToken}`;
        return api.request(error.config);
      } catch (err) {
        // Redirect to login
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);


export default api;