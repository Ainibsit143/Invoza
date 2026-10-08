const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const api = {
  get: async (endpoint, options = {}) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "GET",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    return response;
  },

  post: async (endpoint, data, options = {}) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      body: JSON.stringify(data),
    });

    return response;
  },

  put: async (endpoint, data, options = {}) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "PUT",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      body: JSON.stringify(data),
    });

    return response;
  },

  patch: async (endpoint, data, options = {}) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "PATCH",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      body: JSON.stringify(data),
    });

    return response;
  },

  delete: async (endpoint, options = {}) => {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "DELETE",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    return response;
  },
};