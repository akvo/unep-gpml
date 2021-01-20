import axios from 'axios'
import humps from 'humps'

export const config = {
  baseURL: '/api',
  transformResponse: [
    ...axios.defaults.transformResponse,
    data => humps.camelizeKeys(data)
  ],
  transformRequest: [
    data => humps.decamelizeKeys(data),
    ...axios.defaults.transformRequest
  ]
}

const API = () => {
  const getConfig = () => {
    return api.token != null ? {...config, headers: {...config.headers, Authorization: `Bearer ${api.token}`}} : config
  }
  return {
    get: (url, params) => axios({ url, ...getConfig() }),
    post: (url, data) => axios({ url, method: 'POST', data: typeof data === 'object' ? data : data, ...getConfig() }),
    patch: (url, data) => axios({ url, method: 'PATCH', data, ...getConfig() }),
    delete: (url) => axios({ url, method: 'DELETE', ...getConfig() }),
    setToken: (token) => {
      api.token = token
    }
  }
}

const api = API()

export default api
