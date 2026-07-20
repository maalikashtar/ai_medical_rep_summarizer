import api from './client'

export const uploadReport = (file, onUploadProgress) => {
  const formData = new FormData()
  formData.append('file', file)

  return api
    .post('/reports', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    })
    .then((r) => r.data)
}

export const listReports = ({ search = '', sort = 'newest' } = {}) =>
  api.get('/reports', { params: { search, sort } }).then((r) => r.data)

export const getReport = (id) => api.get(`/reports/${id}`).then((r) => r.data)

export const deleteReport = (id) => api.delete(`/reports/${id}`).then((r) => r.data)
