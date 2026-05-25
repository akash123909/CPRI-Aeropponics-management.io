/**
 * Unit Management System for CPRI Aeroponics
 * Professional CRUD operations for production units
 */

class UnitManager {
    constructor() {
        this.storageKey = 'cprUnits';
        this.units = this.loadUnits();
        this.init();
    }

    loadUnits() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : this.getDefaultUnits();
        } catch (error) {
            console.error('Error loading units:', error);
            return this.getDefaultUnits();
        }
    }

    getDefaultUnits() {
        return [
            { id: 1, name: 'AB Tuber', location: 'Shimla, HP', capacity: 5000, status: 'Active', createdAt: new Date().toISOString() },
            { id: 2, name: 'Star Biotech', location: 'Kullu, HP', capacity: 3000, status: 'Active', createdAt: new Date().toISOString() },
            { id: 3, name: 'Nanak Biotech', location: 'Solan, HP', capacity: 4000, status: 'Active', createdAt: new Date().toISOString() }
        ];
    }

    saveUnits() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.units));
            return true;
        } catch (error) {
            console.error('Error saving units:', error);
            return false;
        }
    }

    validateUnit(unit) {
        const errors = [];

        if (!unit.name || unit.name.trim() === '') {
            errors.push('Unit name is required');
        }

        if (!unit.location || unit.location.trim() === '') {
            errors.push('Location is required');
        }

        if (!unit.capacity || unit.capacity <= 0) {
            errors.push('Capacity must be greater than 0');
        }

        if (!unit.status) {
            errors.push('Status is required');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    addUnit(unit) {
        const validation = this.validateUnit(unit);
        
        if (!validation.isValid) {
            return {
                success: false,
                errors: validation.errors
            };
        }

        // Check if unit name already exists
        if (this.units.some(u => u.name.toLowerCase() === unit.name.toLowerCase())) {
            return {
                success: false,
                errors: ['Unit name already exists']
            };
        }

        const newUnit = {
            id: Date.now(),
            ...unit,
            createdAt: new Date().toISOString()
        };

        this.units.push(newUnit);
        const saved = this.saveUnits();

        return {
            success: saved,
            data: newUnit,
            errors: saved ? [] : ['Failed to save unit']
        };
    }

    updateUnit(id, updateData) {
        const index = this.units.findIndex(u => u.id === id);
        
        if (index === -1) {
            return {
                success: false,
                errors: ['Unit not found']
            };
        }

        const validation = this.validateUnit(updateData);
        
        if (!validation.isValid) {
            return {
                success: false,
                errors: validation.errors
            };
        }

        // Check if unit name already exists (excluding current unit)
        if (updateData.name && this.units.some(u => u.name.toLowerCase() === updateData.name.toLowerCase() && u.id !== id)) {
            return {
                success: false,
                errors: ['Unit name already exists']
            };
        }

        this.units[index] = {
            ...this.units[index],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        const saved = this.saveUnits();

        return {
            success: saved,
            data: this.units[index],
            errors: saved ? [] : ['Failed to save unit']
        };
    }

    deleteUnit(id) {
        const index = this.units.findIndex(u => u.id === id);
        
        if (index === -1) {
            return {
                success: false,
                errors: ['Unit not found']
            };
        }

        // Check if unit has existing data entries
        const unitName = this.units[index].name;
        const hasData = dataManager.getAllEntries({ unit: unitName }).length > 0;
        
        if (hasData) {
            return {
                success: false,
                errors: ['Cannot delete unit with existing data entries. Please delete or reassign data first.']
            };
        }

        this.units.splice(index, 1);
        const saved = this.saveUnits();

        return {
            success: saved,
            errors: saved ? [] : ['Failed to delete unit']
        };
    }

    getAllUnits() {
        return this.units;
    }

    getUnitById(id) {
        return this.units.find(u => u.id === id);
    }

    getUnitByName(name) {
        return this.units.find(u => u.name === name);
    }

    getUnitEntryCount(unitName) {
        return dataManager.getAllEntries({ unit: unitName }).length;
    }

    init() {
        this.setupEventListeners();
        this.loadUnitsTable();
    }

    setupEventListeners() {
        const addUnitForm = document.getElementById('addUnitForm');
        if (addUnitForm) {
            addUnitForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const unitData = {
                    name: document.getElementById('unitName').value,
                    location: document.getElementById('unitLocation').value,
                    capacity: parseInt(document.getElementById('unitCapacity').value),
                    status: document.getElementById('unitStatus').value
                };

                const result = this.addUnit(unitData);

                if (result.success) {
                    alert('Unit added successfully!');
                    addUnitForm.reset();
                    this.loadUnitsTable();
                } else {
                    alert('Failed to add unit: ' + result.errors.join(', '));
                }
            });
        }
    }

    loadUnitsTable() {
        const tbody = document.getElementById('unitsTableBody');
        if (!tbody) return;

        const units = this.getAllUnits();

        if (units.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No units found</td></tr>';
            return;
        }

        tbody.innerHTML = units.map(unit => {
            const entryCount = this.getUnitEntryCount(unit.name);
            const statusIcon = unit.status === 'Active' ? '✅' : unit.status === 'Inactive' ? '❌' : '🔧';
            
            return `
                <tr>
                    <td>${unit.id}</td>
                    <td>${unit.name}</td>
                    <td>${unit.location}</td>
                    <td>${unit.capacity.toLocaleString()}</td>
                    <td>${statusIcon} ${unit.status}</td>
                    <td>${entryCount}</td>
                    <td>
                        ${entryCount === 0 ? `
                            <button onclick="unitManager.deleteUnit(${unit.id})" style="padding: 5px 10px; font-size: 12px; background: #EF4444;">🗑️</button>
                        ` : '<span style="color: #64748B;">Has Data</span>'}
                    </td>
                </tr>
            `;
        }).join('');
    }
}

// Initialize unit manager
const unitManager = new UnitManager();