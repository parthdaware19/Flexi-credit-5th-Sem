const API_BASE = import.meta.env.VITE_API_BASE || (typeof window !== 'undefined' && window.location.port === '5173' ? 'http://localhost:5000/api' : '/api');

export const tokenStorage = {
  get: () => localStorage.getItem('flexi_jwt_token'),
  set: (token) => localStorage.setItem('flexi_jwt_token', token),
  clear: () => localStorage.removeItem('flexi_jwt_token')
};

export async function apiRequest(endpoint, options = {}) {
  const token = tokenStorage.get();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const url = `${API_BASE}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 401) {
        tokenStorage.clear();
      }
      throw new Error(data.error || `HTTP error ${response.status}`);
    }

    return data;
  } catch (err) {
    console.error(`API request error on ${endpoint}:`, err);
    throw err;
  }
}

// Authentication API calls
export const authApi = {
  login: (email, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  register: (email, password, name) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name })
    }),

  getMe: () => apiRequest('/auth/me')
};

// Form and Automation API calls
export const formApi = {
  inspectUrl: (url) =>
    apiRequest('/forms/inspect-url', {
      method: 'POST',
      body: JSON.stringify({ url })
    }),

  parseHtml: (html) =>
    apiRequest('/forms/parse-html', {
      method: 'POST',
      body: JSON.stringify({ html })
    }),

  research: (query, entityName, missingFields) =>
    apiRequest('/forms/research', {
      method: 'POST',
      body: JSON.stringify({ query, entityName, missingFields })
    }),

  autofill: (fields, customInstructions, humanizerStyle, useTavilyResearch) =>
    apiRequest('/forms/autofill', {
      method: 'POST',
      body: JSON.stringify({
        fields,
        customInstructions,
        humanizerStyle,
        useTavilyResearch
      })
    }),

  browserFill: (url, fieldMappings, autoSubmit, useHumanDelay) =>
    apiRequest('/forms/browser-fill', {
      method: 'POST',
      body: JSON.stringify({
        url,
        fieldMappings,
        autoSubmit,
        useHumanDelay
      })
    }),

  getSessions: () => apiRequest('/forms/sessions')
};

// Profile and Settings API calls
export const profileApi = {
  getProfile: () => apiRequest('/profile/profile'),
  updateProfile: (profile) =>
    apiRequest('/profile/profile', {
      method: 'PUT',
      body: JSON.stringify(profile)
    }),

  uploadDocument: async (file, autoApply = false) => {
    const token = tokenStorage.get();
    const formData = new FormData();
    formData.append('document', file);
    formData.append('autoApply', autoApply);

    const response = await fetch(`${API_BASE}/profile/upload-doc`, {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to upload and parse document');
    }
    return data;
  },

  getSettings: () => apiRequest('/profile/settings'),
  updateSettings: (settings) =>
    apiRequest('/profile/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    })
};
