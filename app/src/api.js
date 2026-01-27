import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const formatValidationErrors = (detail) => {
  if (Array.isArray(detail)) {
    return detail.map(err => {
      const field = err.loc ? err.loc[err.loc.length - 1] : 'field';
      return `${field}: ${err.msg}`;
    }).join(', ');
  } else if (typeof detail === 'string') {
    return detail;
  } else if (detail && typeof detail === 'object') {
    return Object.entries(detail)
      .map(([field, message]) => `${field}: ${message}`)
      .join(', ');
  }
  return 'Validation error';
};

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (!error.response) {
      const networkError = new Error('Network error. Please check your connection.');
      networkError.isNetworkError = true;
      return Promise.reject(networkError);
    }
    
    const { status, data } = error.response;
    
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }
        
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refresh_token: refreshToken
        });
        
        const { access_token, refresh_token } = response.data;
        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', refresh_token);
        
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(new Error('Session expired. Please login again.'));
      }
    }
    
    if (status === 422) {
      const errorMessage = formatValidationErrors(data?.detail);
      const validationError = new Error(errorMessage);
      validationError.isValidationError = true;
      validationError.validationDetails = data?.detail;
      return Promise.reject(validationError);
    }
    
    if (status === 400) {
      const errorMessage = data?.detail || 'Bad request';
      const badRequestError = new Error(errorMessage);
      badRequestError.isBadRequest = true;
      return Promise.reject(badRequestError);
    }
    
    if (status === 403) {
      const errorMessage = data?.detail || 'Access forbidden';
      const forbiddenError = new Error(errorMessage);
      forbiddenError.isForbidden = true;
      return Promise.reject(forbiddenError);
    }
    
    if (status === 404) {
      const errorMessage = data?.detail || 'Resource not found';
      const notFoundError = new Error(errorMessage);
      notFoundError.isNotFound = true;
      return Promise.reject(notFoundError);
    }
    
    if (status === 409) {
      const errorMessage = data?.detail || 'Conflict occurred';
      const conflictError = new Error(errorMessage);
      conflictError.isConflict = true;
      return Promise.reject(conflictError);
    }
    
    if (status >= 500) {
      const errorMessage = data?.detail || 'Internal server error';
      const serverError = new Error(errorMessage);
      serverError.isServerError = true;
      return Promise.reject(serverError);
    }
    
    const errorMessage = data?.detail || `Request failed with status ${status}`;
    const genericError = new Error(errorMessage);
    genericError.status = status;
    return Promise.reject(genericError);
  }
);

const createAPIMethod = (method) => {
  return async (...args) => {
    try {
      const response = await method(...args);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        errorType: error,
        isValidationError: error.isValidationError,
        isNetworkError: error.isNetworkError,
        isBadRequest: error.isBadRequest,
        isForbidden: error.isForbidden,
        isNotFound: error.isNotFound,
        isConflict: error.isConflict,
        isServerError: error.isServerError
      };
    }
  };
};

export const authAPI = {
  register: createAPIMethod(api.post.bind(api, '/auth/register')),
  login: createAPIMethod(api.post.bind(api, '/auth/login')),
  logout: createAPIMethod(api.post.bind(api, '/auth/logout')),
  refresh: (refreshToken) => createAPIMethod(api.post.bind(api, '/auth/refresh'))({ refresh_token: refreshToken }),
};

export const listsAPI = {
  getLists: createAPIMethod(api.get.bind(api, '/lists')),
  getList: (id) => createAPIMethod(api.get.bind(api, `/lists/${id}`))(),
  createList: (data) => createAPIMethod(api.post.bind(api, '/lists'))(data),
  updateList: (id, data) => createAPIMethod(api.put.bind(api, `/lists/${id}`))(data),
  deleteList: (id) => createAPIMethod(api.delete.bind(api, `/lists/${id}`))(),
  getFullList: (id) => createAPIMethod(api.get.bind(api, `/lists/${id}/full`))(),
};

export const categoriesAPI = {
  getCategories: (listId) => createAPIMethod(api.get.bind(api, `/lists/${listId}/categories`))(),
  getCategory: (id) => createAPIMethod(api.get.bind(api, `/categories/${id}`))(),
  createCategory: (listId, data) => createAPIMethod(api.post.bind(api, `/lists/${listId}/categories`))(data),
  updateCategory: (id, data) => createAPIMethod(api.put.bind(api, `/categories/${id}`))(data),
  deleteCategory: (id) => createAPIMethod(api.delete.bind(api, `/categories/${id}`))(),
};

export const itemsAPI = {
  getItems: (listId) => createAPIMethod(api.get.bind(api, `/lists/${listId}/items`))(),
  getItem: (id) => createAPIMethod(api.get.bind(api, `/items/${id}`))(),
  createItem: (listId, data) => createAPIMethod(api.post.bind(api, `/lists/${listId}/items`))(data),
  updateItem: (id, data) => createAPIMethod(api.put.bind(api, `/items/${id}`))(data),
  deleteItem: (id) => createAPIMethod(api.delete.bind(api, `/items/${id}`))(),
};

export const rawApi = api;

export default api;