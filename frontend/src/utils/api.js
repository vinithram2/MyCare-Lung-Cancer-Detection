import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
})

// Interceptor for request logging
api.interceptors.request.use(
  (config) => {
    return config
  },
  (error) => Promise.reject(error)
)

// Interceptor for response error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unknown error occurred'
    return Promise.reject(new Error(message))
  }
)

/**
 * Send an image file for lung cancer prediction.
 * @param {FormData} formData - FormData containing the image file
 * @returns {Promise<Object>} Prediction result object
 */
export async function predictImage(formData) {
  const response = await api.post('/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

/**
 * Fetch scan analysis history.
 * @returns {Promise<Array>} Array of history records
 */
export async function getHistory() {
  const response = await api.get('/history')
  return response.data
}

/**
 * Delete a specific history record.
 * @param {string|number} id - The record ID to delete
 * @returns {Promise<Object>} Deletion confirmation
 */
export async function deleteHistory(id) {
  const response = await api.delete(`/history/${id}`)
  return response.data
}

/**
 * Send a chat message to the multilingual AI assistant.
 * @param {string} message     - User query
 * @param {string} language    - 'en' | 'hi' | 'kn'
 * @param {string} [context]   - Optional scan result context string
 * @param {string} [pageContext] - Current page + activity summary from ActivityContext
 * @returns {Promise<Object>} Chat response object with reply and suggestions
 */
export async function sendChatMessage(message, language = 'en', context = null, pageContext = null) {
  const response = await api.post('/chat', {
    message,
    language,
    context,
    page_context: pageContext,
  })
  return response.data
}

export default api
