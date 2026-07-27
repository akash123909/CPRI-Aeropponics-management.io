/**
 * API Client for Frontend
 * Handles all communication with backend
 */

const API_BASE_URL = localStorage.getItem('API_URL') || 'http://localhost:5000/api';

class APIClient {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || '{}');
    }

    /**
     * Generic request method
     */
    async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, {
                method: options.method || 'GET',
                headers,
                body: options.body ? JSON.stringify(options.body) : undefined
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'API Error');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ============ AUTH ============
    async login(username, password) {
        const response = await this.request('/auth/login', {
            method: 'POST',
            body: { username, password }
        });

        if (response.success) {
            this.token = response.token;
            this.user = response.user;
            localStorage.setItem('token', this.token);
            localStorage.setItem('user', JSON.stringify(this.user));
        }

        return response;
    }

    async logout() {
        this.token = null;
        this.user = {};
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    async verifyToken() {
        return await this.request('/auth/verify');
    }

    // ============ ENTRIES ============
    async createEntry(entryData) {
        return await this.request('/entries', {
            method: 'POST',
            body: entryData
        });
    }

    async getEntries(filters = {}) {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) params.append(key, filters[key]);
        });

        return await this.request(`/entries?${params.toString()}`);
    }

    async getEntry(id) {
        return await this.request(`/entries/${id}`);
    }

    async updateEntry(id, data) {
        return await this.request(`/entries/${id}`, {
            method: 'PUT',
            body: data
        });
    }

    async deleteEntry(id) {
        return await this.request(`/entries/${id}`, {
            method: 'DELETE'
        });
    }

    async getEntryStats(filters = {}) {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) params.append(key, filters[key]);
        });

        return await this.request(`/entries/stats/summary?${params.toString()}`);
    }

    // ============ UNITS ============
    async getUnits() {
        return await this.request('/units');
    }

    async getUnit(id) {
        return await this.request(`/units/${id}`);
    }

    // ============ USERS ============
    async getUsers(page = 1, limit = 50) {
        return await this.request(`/users?page=${page}&limit=${limit}`);
    }

    async getProfile() {
        return await this.request('/users/profile');
    }

    async updateUser(id, data) {
        return await this.request(`/users/${id}`, {
            method: 'PUT',
            body: data
        });
    }

    async deleteUser(id) {
        return await this.request(`/users/${id}`, {
            method: 'DELETE'
        });
    }

    // ============ HELPERS ============
    isAuthenticated() {
        return !!this.token;
    }

    isSuperAdmin() {
        return this.user.role === 'Super Admin';
    }

    getUnit() {
        return this.user.unit;
    }
}

// Export singleton
const api = new APIClient();
