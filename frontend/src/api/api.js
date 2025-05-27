// frontend/src/api/api.js
const API_BASE_URL = 'http://localhost:5000'; // Ensure this matches your backend URL

/**
 * Helper function to make authenticated API requests.
 * @param {string} endpoint - The API endpoint (e.g., '/auth/login').
 * @param {string} method - HTTP method (e.g., 'POST', 'GET').
 * @param {object} [body=null] - Request body for POST/PUT.
 * @param {string} [token=null] - JWT token for authenticated requests.
 * @returns {Promise<object>} - The JSON response from the API.
 * @throws {Error} - Throws an error if the API request fails or returns an error message.
 */
async function apiRequest(endpoint, method, body = null, token = null) {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        method: method,
        headers: headers,
        body: body ? JSON.stringify(body) : null,
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();

        if (!response.ok) {
            // If response.ok is false (e.g., 4xx or 5xx status code)
            const errorMessage = data.message || `API Error: ${response.status} ${response.statusText}`;
            throw new Error(errorMessage);
        }
        return data;
    } catch (error) {
        console.error(`Error making ${method} request to ${endpoint}:`, error);
        throw error; // Re-throw the error to be handled by the calling component/context
    }
}

// --- Authentication API Calls ---
export const loginUser = async (email, password) => {
    return apiRequest('/auth/login', 'POST', { email, password });
};

export const signupUser = async (username, email, password) => {
    return apiRequest('/auth/signup', 'POST', { username, email, password, role: 'user' }); // Assuming default role 'user'
};

// --- User & Interaction API Calls ---
export const getUserProfile = async (userId, token) => {
    return apiRequest(`/users/${userId}`, 'GET', null, token);
};

export const recordInteraction = async (userId, itemId, interactionType, duration, token) => {
    return apiRequest(`/users/${userId}/interactions`, 'POST', { itemId, interactionType, duration }, token);
};

// --- Item API Calls ---
export const getAllItems = async (token) => {
    return apiRequest('/items', 'GET', null, token);
};

export const getItemById = async (itemId, token) => {
    return apiRequest(`/items/${itemId}`, 'GET', null, token);
};

export const createItem = async (itemData, token) => {
    return apiRequest('/items', 'POST', itemData, token);
};

// --- Recommendation API Calls ---
export const getRecommendationsForUser = async (userId, token) => {
    return apiRequest(`/recommendations/forUser/${userId}`, 'GET', null, token);
};