import axios from "axios";
import humps from "humps";
import * as Sentry from "@sentry/react";

export const config = {
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  transformResponse: [
    ...axios.defaults.transformResponse,
    (data) => humps.camelizeKeys(data),
  ],
  transformRequest: [
    (data) => humps.decamelizeKeys(data),
    ...axios.defaults.transformRequest,
  ],
};

// Add a response interceptor to post Sentry messages for request failures
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Any status codes that falls outside the range of 2xx cause this
    // function to trigger. We capture the exception to Sentry.
    // NOTE: The request data is visible in Sentry as `config`.
    Sentry.captureException(new Error(error.message), { extra: error });

    // Do something with response error
    return Promise.reject(error);
  }
);

const API = () => {
  const getConfig = () => {
    return api.token != null
      ? {
          ...config,
          headers: { ...config.headers, Authorization: `Bearer ${api.token}` },
        }
      : config;
  };
  return {
    get: (url, params, config = {}) =>
      axios({ url, ...getConfig(), ...config }),
    getRaw: (url, params, config = {}) =>
      axios({ url, ...getConfig(), ...config, transformResponse: [] }),
    post: (url, data, config = {}) =>
      axios({ url, method: "POST", data, ...getConfig(), ...config }),
    put: (url, data, config) =>
      axios({ url, method: "PUT", data, ...getConfig(), ...config }),
    patch: (url, data, config) =>
      axios({ url, method: "PATCH", data, ...getConfig(), ...config }),
    delete: (url) => axios({ url, method: "DELETE", ...getConfig() }),
    setToken: (token) => {
      api.token = token;
    },
  };
};

const api = API();

export default api;
