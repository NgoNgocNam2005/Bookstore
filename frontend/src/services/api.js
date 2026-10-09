const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

export class ApiError extends Error {
  constructor(message, status, code, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function apiRequest(path, options = {}) {
  const {
    body,
    token = localStorage.getItem('manage-book-store.access-token'),
    ...fetchOptions
  } = options;

  const headers = new Headers(fetchOptions.headers);
  headers.set('Accept', 'application/json');

  if (body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...fetchOptions,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  } catch (error) {
    throw new ApiError(
      `Cannot connect to backend at ${API_URL}`,
      0,
      'NETWORK_ERROR',
      error
    );
  }

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new ApiError(
      payload?.error?.message || 'Request failed',
      response.status,
      payload?.error?.code,
      payload?.error?.details
    );
  }

  const data = payload?.data ?? payload;

  if (payload?.meta !== undefined && data && typeof data === 'object' && !Array.isArray(data)) {
    return { ...data, meta: payload.meta };
  }

  return data;
}
