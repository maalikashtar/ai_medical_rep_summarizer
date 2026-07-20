import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true, // send/receive HTTP-only auth cookie
})

// Normalize error messages coming from the backend's standardized envelope
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.message ||
      'Something went wrong. Please try again.'
    return Promise.reject(new Error(message))
  },
)

export default api
