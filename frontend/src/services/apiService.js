const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    // Store token in memory instead of localStorage
    this.token = null;
  }

  /**
   * Set JWT token in memory
   */
  setToken(token) {
    this.token = token;
  }

  /**
   * Clear JWT token from memory
   */
  clearToken() {
    this.token = null;
  }

  /**
   * Get current token
   */
  getToken() {
    return this.token;
  }

  /**
   * Generic request handler with authentication
   */
  async request(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add JWT token to headers if available
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      // ✅ FIXED: Check response.ok FIRST, before handling 401/403
      if (!response.ok) {
        // For login endpoint, don't clear token (there is none yet)
        // Just throw the actual error from backend
        if (endpoint === '/auth/login') {
          throw new Error(data.error || 'Login failed');
        }

        // For authenticated endpoints, handle 401/403 as session expired
        if (response.status === 401 || response.status === 403) {
          this.clearToken();
          throw new Error(data.error || 'Session expired. Please login again.');
        }

        // Other errors
        throw new Error(data.error || 'Request failed');
      }

      return data;

    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * Authentication: Login user
   */
  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    if (response.success && response.token) {
      this.setToken(response.token);
      return response.user;
    }
    
    throw new Error('Login failed');
  }

  /**
   * Dashboard: Get metrics
   */
  async getDashboardMetrics(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await this.request(`/dashboard/metrics?${params}`);
    return response.data;
  }

  /**
   * Purchases: Get all purchases
   */
  async getPurchases() {
    const response = await this.request('/purchases');
    return response.data;
  }

  /**
   * Purchases: Create new purchase
   */
  async createPurchase(data) {
    return this.request('/purchases', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Transfers: Get all transfers
   */
  async getTransfers() {
    const response = await this.request('/transfers');
    return response.data;
  }

  /**
   * Transfers: Create new transfer
   */
  async createTransfer(data) {
    return this.request('/transfers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Assignments: Get all assignments
   */
  async getAssignments() {
    const response = await this.request('/assignments');
    return response.data;
  }

  /**
   * Assignments: Create new assignment
   */
  async createAssignment(data) {
    return this.request('/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Reference: Get all bases
   */
  async getBases() {
    const response = await this.request('/bases');
    return response.data;
  }

  /**
   * Reference: Get all equipment types
   */
  async getEquipmentTypes() {
    const response = await this.request('/equipment-types');
    return response.data;
  }

  /**
   * Admin: Get audit logs
   */
  async getAuditLogs() {
    const response = await this.request('/audit-logs');
    return response.data;
  }
}

// Export single instance
const apiService = new ApiService();
export default apiService;