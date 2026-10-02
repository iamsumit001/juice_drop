import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV ? "http://localhost:5000/api" : undefined
);

if (!apiUrl) {
  throw new Error("VITE_API_URL must be configured for production builds.");
}

const api = axios.create({
  baseURL: apiUrl,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("juicedrop_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("juicedrop_token");
      localStorage.removeItem("juicedrop_user");
    }
    return Promise.reject(error);
  }
);

export default api;
