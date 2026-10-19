const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('regalux_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errMessage = `Error ${response.status}: ${response.statusText}`;
    try {
      const errData = await response.json();
      errMessage = errData.detail || errData.message || errMessage;
    } catch (_) {}
    throw new Error(errMessage);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (email, password) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  }),
  register: (email, password, full_name, role) => request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, full_name, role })
  }),
  getMe: () => request('/auth/me'),

  // Products
  getProducts: () => request('/products'),
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (data) => request('/products', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Personas
  getPersonas: (segment) => request(`/personas${segment ? `?segment=${encodeURIComponent(segment)}` : ''}`),
  generatePersonas: (data) => request('/personas/generate', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getPersona: (id) => request(`/personas/${id}`),
  regeneratePersona: (id) => request(`/personas/${id}/regenerate`, {
    method: 'POST'
  }),
  deletePersona: (id) => request(`/personas/${id}`, {
    method: 'DELETE'
  }),
  clearPersonas: () => request('/personas', {
    method: 'DELETE'
  }),
  createCustomPersona: (data) => request('/personas', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  resetDefaultPersonas: () => request('/personas/reset-defaults', {
    method: 'POST'
  }),

  // Experiments
  getExperiments: () => request('/experiments'),
  getExperiment: (id) => request(`/experiments/${id}`),
  createExperiment: (data) => request('/experiments', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  runExperiment: (id) => request(`/experiments/${id}/run`, {
    method: 'POST'
  }),

  // Surveys
  getSurveyResults: (surveyId, params) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return request(`/surveys/${surveyId}/results${query}`);
  },
  getSurveyMatrix: (surveyId, params) => {
    const query = params ? `?${new URLSearchParams(params).toString()}` : '';
    return request(`/surveys/${surveyId}/results${query}`);
  },
  runCustomSurvey: (data) => request('/surveys/run-custom', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  createSurvey: (expId, data) => request(`/experiments/${expId}/surveys`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Interviews
  getInterviews: () => request('/interviews'),
  startInterview: (personaId, data) => request(`/personas/${personaId}/interviews`, {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  getInterview: (sessionId) => request(`/interviews/${sessionId}`),
  sendMessage: (sessionId, content) => request(`/interviews/${sessionId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content })
  }),

  // Insights
  getInsights: (expId) => request(`/experiments/${expId}/insights`),
  runInsights: (expId) => request(`/experiments/${expId}/insights/run`, {
    method: 'POST'
  }),

  // Adoption
  getAdoption: (expId) => request(`/experiments/${expId}/adoption`),
  runAdoption: (expId) => request(`/experiments/${expId}/adoption/run`, {
    method: 'POST'
  }),

  // Validation
  getValidation: (expId) => request(`/experiments/${expId}/validation`),
  runValidation: (expId) => request(`/experiments/${expId}/validate`, {
    method: 'POST'
  }),

  // Scenarios
  getScenarios: () => request('/scenarios'),
  instantiateScenario: (key) => request(`/scenarios/${key}/instantiate`, {
    method: 'POST'
  }),
  runCrossDomainTests: () => request('/scenarios/run-cross-domain-tests', {
    method: 'POST'
  }),

  // Reports
  getReports: (expId) => request(`/experiments/${expId}/reports`),
  generateReport: (expId) => request(`/experiments/${expId}/reports`, {
    method: 'POST'
  }),
  getDownloadUrl: (reportId) => `/api/reports/${reportId}/download`,

  // Settings
  getSettings: () => request('/settings'),
  updateSettings: (data) => request('/settings', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Health
  getHealth: () => request('/health')
};
