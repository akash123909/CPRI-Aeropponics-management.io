/**
 * CPRI Aeroponics Data Management System
 * Professional-grade data layer with localStorage persistence
 * Implements CRUD operations, validation, and data integrity
 */

class DataManager {
    constructor() {
        this.storageKey = 'cprAeroponicsData';
        this.data = this.loadData();
        this.initializeSampleData();
    }

    /**
     * Load data from localStorage with error handling
     */
    loadData() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading data:', error);
            return [];
        }
    }

    /**
     * Save data to localStorage with error handling
     */
    saveData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
            return true;
        } catch (error) {
            console.error('Error saving data:', error);
            return false;
        }
    }

    /**
     * Initialize sample data if none exists
     */
    initializeSampleData() {
        if (this.data.length === 0) {
            const sampleData = [
                {
                    id: this.generateId(),
                    date: new Date().toISOString(),
                    unit: 'AB Tuber',
                    ecPrev: 1.2,
                    ecSet: 1.5,
                    phPrev: 6.0,
                    phSet: 6.5,
                    mainFilter: 'Yes',
                    nozzleFilter: 'Yes',
                    variety: 'Kufri Jyoti',
                    minitubers: 150,
                    weight: 2.5,
                    temperature: 22,
                    humidity: 75,
                    createdBy: 'admin'
                },
                {
                    id: this.generateId(),
                    date: new Date(Date.now() - 86400000).toISOString(),
                    unit: 'Star Biotech',
                    ecPrev: 1.3,
                    ecSet: 1.6,
                    phPrev: 5.8,
                    phSet: 6.2,
                    mainFilter: 'No',
                    nozzleFilter: 'Yes',
                    variety: 'Kufri Chandramukhi',
                    minitubers: 200,
                    weight: 3.0,
                    temperature: 24,
                    humidity: 70,
                    createdBy: 'admin'
                }
            ];
            this.data = sampleData;
            this.saveData();
        }
    }

    /**
     * Generate unique ID for records
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * Validate entry data
     */
    validateEntry(entry) {
        const errors = [];

        if (!entry.unit || entry.unit === 'Select Unit') {
            errors.push('Unit is required');
        }

        if (entry.ecPrev === undefined || entry.ecPrev === '' || isNaN(entry.ecPrev)) {
            errors.push('EC Previous is required and must be a number');
        }

        if (entry.ecSet === undefined || entry.ecSet === '' || isNaN(entry.ecSet)) {
            errors.push('EC Set is required and must be a number');
        }

        if (entry.phPrev === undefined || entry.phPrev === '' || isNaN(entry.phPrev)) {
            errors.push('pH Previous is required and must be a number');
        }

        if (entry.phSet === undefined || entry.phSet === '' || isNaN(entry.phSet)) {
            errors.push('pH Set is required and must be a number');
        }

        if (entry.phPrev < 0 || entry.phPrev > 14) {
            errors.push('pH Previous must be between 0 and 14');
        }

        if (entry.phSet < 0 || entry.phSet > 14) {
            errors.push('pH Set must be between 0 and 14');
        }

        if (entry.ecPrev < 0 || entry.ecPrev > 5) {
            errors.push('EC Previous must be between 0 and 5 mS/cm');
        }

        if (entry.ecSet < 0 || entry.ecSet > 5) {
            errors.push('EC Set must be between 0 and 5 mS/cm');
        }

        if (!entry.variety || entry.variety.trim() === '') {
            errors.push('Variety is required');
        }

        if (entry.minitubers === undefined || entry.minitubers === '' || isNaN(entry.minitubers)) {
            errors.push('Minitubers count is required and must be a number');
        }

        if (entry.weight === undefined || entry.weight === '' || isNaN(entry.weight)) {
            errors.push('Weight is required and must be a number');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Create new entry
     */
    createEntry(entryData) {
        const validation = this.validateEntry(entryData);
        
        if (!validation.isValid) {
            return {
                success: false,
                errors: validation.errors
            };
        }

        const currentUser = this.getCurrentUser();
        
        const newEntry = {
            id: this.generateId(),
            date: new Date().toISOString(),
            ...entryData,
            photo: entryData.photo || null,
            temperature: entryData.temperature || this.generateRandomValue(20, 26),
            humidity: entryData.humidity || this.generateRandomValue(65, 80),
            createdBy: currentUser ? currentUser.username : 'system'
        };

        this.data.push(newEntry);
        const saved = this.saveData();

        return {
            success: saved,
            data: newEntry,
            errors: saved ? [] : ['Failed to save data']
        };
    }

    /**
     * Get all entries with optional filtering and role-based access control
     */
    getAllEntries(filters = {}) {
        let filteredData = [...this.data];
        
        // Apply role-based access control
        const currentUser = this.getCurrentUser();
        if (currentUser) {
            // Super Admin can see all data
            // Unit Admin and User can only see their unit's data
            if (currentUser.role !== 'Super Admin') {
                filteredData = filteredData.filter(entry => entry.unit === currentUser.unit);
            }
        }

        // Apply additional filters
        if (filters.unit && filters.unit !== 'All') {
            // Only apply unit filter if user has access to that unit
            if (currentUser && (currentUser.role === 'Super Admin' || currentUser.unit === filters.unit)) {
                filteredData = filteredData.filter(entry => entry.unit === filters.unit);
            }
        }

        if (filters.startDate) {
            filteredData = filteredData.filter(entry => 
                new Date(entry.date) >= new Date(filters.startDate)
            );
        }

        if (filters.endDate) {
            filteredData = filteredData.filter(entry => 
                new Date(entry.date) <= new Date(filters.endDate)
            );
        }

        if (filters.variety) {
            filteredData = filteredData.filter(entry => 
                entry.variety.toLowerCase().includes(filters.variety.toLowerCase())
            );
        }

        // Sort by date descending
        filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));

        return filteredData;
    }

    /**
     * Get entry by ID
     */
    getEntryById(id) {
        return this.data.find(entry => entry.id === id);
    }

    /**
     * Update entry
     */
    updateEntry(id, updateData) {
        const index = this.data.findIndex(entry => entry.id === id);
        
        if (index === -1) {
            return {
                success: false,
                errors: ['Entry not found']
            };
        }

        const validation = this.validateEntry(updateData);
        
        if (!validation.isValid) {
            return {
                success: false,
                errors: validation.errors
            };
        }

        this.data[index] = {
            ...this.data[index],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        const saved = this.saveData();

        return {
            success: saved,
            data: this.data[index],
            errors: saved ? [] : ['Failed to save data']
        };
    }

    /**
     * Delete entry
     */
    deleteEntry(id) {
        const index = this.data.findIndex(entry => entry.id === id);
        
        if (index === -1) {
            return {
                success: false,
                errors: ['Entry not found']
            };
        }

        this.data.splice(index, 1);
        const saved = this.saveData();

        return {
            success: saved,
            errors: saved ? [] : ['Failed to save data']
        };
    }

    /**
     * Get statistics for dashboard
     */
    getStatistics() {
        const entries = this.data;
        
        if (entries.length === 0) {
            return {
                totalEntries: 0,
                averageEC: 0,
                averagePH: 0,
                averageTemperature: 0,
                averageHumidity: 0,
                totalMinitubers: 0,
                totalWeight: 0,
                units: []
            };
        }

        const sumEC = entries.reduce((sum, e) => sum + parseFloat(e.ecSet || 0), 0);
        const sumPH = entries.reduce((sum, e) => sum + parseFloat(e.phSet || 0), 0);
        const sumTemp = entries.reduce((sum, e) => sum + parseFloat(e.temperature || 0), 0);
        const sumHumidity = entries.reduce((sum, e) => sum + parseFloat(e.humidity || 0), 0);
        const sumMinitubers = entries.reduce((sum, e) => sum + parseInt(e.minitubers || 0), 0);
        const sumWeight = entries.reduce((sum, e) => sum + parseFloat(e.weight || 0), 0);

        const units = [...new Set(entries.map(e => e.unit))];

        return {
            totalEntries: entries.length,
            averageEC: (sumEC / entries.length).toFixed(2),
            averagePH: (sumPH / entries.length).toFixed(2),
            averageTemperature: (sumTemp / entries.length).toFixed(1),
            averageHumidity: (sumHumidity / entries.length).toFixed(1),
            totalMinitubers: sumMinitubers,
            totalWeight: sumWeight.toFixed(2),
            units
        };
    }

    /**
     * Get data for charts
     */
    getChartData(type = 'ec') {
        const entries = this.getAllEntries();
        const last7Days = entries.slice(0, 7).reverse();

        return last7Days.map(entry => ({
            date: new Date(entry.date).toLocaleDateString(),
            value: entry[type] || 0,
            unit: entry.unit
        }));
    }

    /**
     * Generate random value for simulation
     */
    generateRandomValue(min, max) {
        return (Math.random() * (max - min) + min).toFixed(1);
    }

    /**
     * Get current user from auth system
     */
    getCurrentUser() {
        try {
            const session = localStorage.getItem('cprSession');
            return session ? JSON.parse(session) : null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Export data to CSV format
     */
    exportToCSV(filters = {}) {
        const entries = this.getAllEntries(filters);
        
        if (entries.length === 0) {
            return null;
        }

        const headers = [
            'Date', 'Unit', 'EC Prev', 'EC Set', 'pH Prev', 'pH Set',
            'Main Filter', 'Nozzle Filter', 'Variety', 'Minitubers',
            'Weight (kg)', 'Temperature (°C)', 'Humidity (%)', 'Created By'
        ];

        const csvContent = [
            headers.join(','),
            ...entries.map(entry => [
                new Date(entry.date).toLocaleDateString(),
                entry.unit,
                entry.ecPrev,
                entry.ecSet,
                entry.phPrev,
                entry.phSet,
                entry.mainFilter,
                entry.nozzleFilter,
                entry.variety,
                entry.minitubers,
                entry.weight,
                entry.temperature,
                entry.humidity,
                entry.createdBy
            ].join(','))
        ].join('\n');

        return csvContent;
    }

    /**
     * Clear all data (use with caution)
     */
    clearAllData() {
        this.data = [];
        return this.saveData();
    }
}

// Initialize global data manager instance
const dataManager = new DataManager();