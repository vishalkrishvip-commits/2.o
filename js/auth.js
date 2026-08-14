/**
 * Authentication Utility Module
 * Handles token management and user state
 */

const AUTH = {
  API_BASE_URL: "http://localhost:3000",
  TOKEN_KEY: "authToken",
  USER_KEY: "user",

  /**
   * Get stored authentication token
   */
  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  /**
   * Get current user data
   */
  getUser() {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken();
  },

  /**
   * Check if user has admin role
   */
  isAdmin() {
    const user = this.getUser();
    return user && user.role === "admin";
  },

  /**
   * Check if user has customer role
   */
  isCustomer() {
    const user = this.getUser();
    return user && user.role === "customer";
  },

  /**
   * Logout user and clear storage
   */
  logout() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    window.location.href = "login1.html";
  },

  /**
   * Make authenticated API request
   */
  async fetch(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${this.API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 401 (token expired or invalid)
    if (response.status === 401) {
      this.logout();
      throw new Error("Session expired. Please login again.");
    }

    return response;
  },

  /**
   * Protect route - redirect to login if not authenticated
   */
  protectRoute(requiredRole = null) {
    if (!this.isAuthenticated()) {
      window.location.href = "login1.html";
      return false;
    }

    if (
      requiredRole &&
      !this[
        `is${requiredRole.charAt(0).toUpperCase() + requiredRole.slice(1)}`
      ]()
    ) {
      alert("You do not have permission to access this page.");
      window.location.href = "home.html";
      return false;
    }

    return true;
  },

  /**
   * Update user data after profile changes
   */
  updateUser(userData) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(userData));
  },

  /**
   * Verify token validity with server
   */
  async verifyToken() {
    try {
      const response = await this.fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        this.updateUser(data.user);
        return true;
      } else {
        this.logout();
        return false;
      }
    } catch (error) {
      console.error("Token verification failed:", error);
      return false;
    }
  },
};

// Verify token on page load
document.addEventListener("DOMContentLoaded", () => {
  if (AUTH.isAuthenticated()) {
    AUTH.verifyToken();
  }
});
