/**
 * Centralized API Client for Construction Intelligence Platform
 * Uses native Fetch API
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.location.port === '5173'
    ? '/api'
    : 'http://localhost:8000/api');

/**
 * Generic request helper with robust error handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultHeaders = {};
  if (!(options.body instanceof FormData)) {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      let errorMessage = `Server error (${response.status}): `;
      if (typeof data === 'object' && data !== null) {
        errorMessage += data.detail || data.message || data.error || JSON.stringify(data);
      } else {
        errorMessage += data || response.statusText;
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.status) {
      throw err;
    }
    throw new Error(`Unable to connect to AI backend at ${url}. Ensure the FastAPI server is running on port 8000.`);
  }
}

// -------------------------------------------------------------
// 1. Safety Monitor API
// -------------------------------------------------------------
export async function analyzeSafety(imageFile, metadata = {}) {
  const formData = new FormData();
  if (imageFile) {
    formData.append('file', imageFile);
    formData.append('image', imageFile);
  }
  if (metadata.zone) {
    formData.append('zone', metadata.zone);
    formData.append('site_name', metadata.zone);
  }
  if (metadata.notes) formData.append('notes', metadata.notes);

  return request('/safety/analyze', {
    method: 'POST',
    body: formData,
  });
}

// -------------------------------------------------------------
// 2. Crack Detection API
// -------------------------------------------------------------
export async function detectCracks(imageFile, metadata = {}) {
  const formData = new FormData();
  if (imageFile) {
    formData.append('file', imageFile);
    formData.append('image', imageFile);
  }
  if (metadata.surfaceType) formData.append('surface_type', metadata.surfaceType);
  if (metadata.location) {
    formData.append('location', metadata.location);
    formData.append('location_context', metadata.location);
  }
  if (metadata.notes) formData.append('notes', metadata.notes);

  return request('/crack/analyze', {
    method: 'POST',
    body: formData,
  });
}

// -------------------------------------------------------------
// 3. Real Estate Valuation API
// -------------------------------------------------------------
export async function estimateValuation(propertyData) {
  return request('/valuation/estimate', {
    method: 'POST',
    body: JSON.stringify(propertyData),
  });
}

// -------------------------------------------------------------
// 4. Project Planning API
// -------------------------------------------------------------
export async function generateProjectPlan(planData) {
  return request('/planning/generate', {
    method: 'POST',
    body: JSON.stringify(planData),
  });
}

// -------------------------------------------------------------
// 5. Daily Assistant API
// -------------------------------------------------------------
export async function sendDailyAssistantMessage(message, history = []) {
  return request('/assistant/chat', {
    method: 'POST',
    body: JSON.stringify({
      message,
      query: message,
      history,
    }),
  });
}

// -------------------------------------------------------------
// 6. Weather Advisory API
// -------------------------------------------------------------
export async function getWeatherAdvisory(weatherRequest) {
  return request('/weather/advisory', {
    method: 'POST',
    body: JSON.stringify(weatherRequest),
  });
}

// -------------------------------------------------------------
// 7. Knowledge Assistant API
// -------------------------------------------------------------
export async function queryKnowledgeBase(queryData) {
  return request('/knowledge/query', {
    method: 'POST',
    body: JSON.stringify(queryData),
  });
}

// -------------------------------------------------------------
// Health Check API
// -------------------------------------------------------------
export async function checkBackendHealth() {
  return request('/health', {
    method: 'GET',
  });
}

export default {
  analyzeSafety,
  detectCracks,
  estimateValuation,
  generateProjectPlan,
  sendDailyAssistantMessage,
  getWeatherAdvisory,
  queryKnowledgeBase,
  checkBackendHealth,
};
