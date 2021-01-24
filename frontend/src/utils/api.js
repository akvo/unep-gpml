import axios from 'axios'
import humps from 'humps'

export const config = {
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  },
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
    get: (url, params, config = {}) => axios({ url, ...getConfig(), ...config }),
    post: (url, data, config = {}) => axios({ url, method: 'POST', data, ...getConfig(), ...config }),
    patch: (url, data, config) => axios({ url, method: 'PATCH', data, ...getConfig(), ...config }),
    delete: (url) => axios({ url, method: 'DELETE', ...getConfig() }),
    setToken: (token) => {
      api.token = token
    }
  }
}

const api = API()

export default api
