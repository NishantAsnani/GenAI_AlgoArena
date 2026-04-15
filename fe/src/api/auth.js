import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
})

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('aa_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const authApi = {
  login:        (data) => api.post('/user/login', data),
  signup:       (data) => api.post('/user/signup', data),
  getGoogleUrl: ()     => api.get('/user/generateUrl'),
}

export default api