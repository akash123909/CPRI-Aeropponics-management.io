/**
 * User Management System for CPRI Aeroponics
 * Professional CRUD operations for user accounts
 */

class UserManager {
    constructor() {
        this.storageKey = 'cprUsers';
        this.users = this.loadUsers();
        this.init();
    }

    loadUsers() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : this.getDefaultUsers();
        } catch (error) {
            console.error('Error loading users:', error);
            return this.getDefaultUsers();
        }
    }

    getDefaultUsers() {
        return [
            { id: 1, username: 'admin', password: 'admin123', role: 'Super Admin', unit: 'All' },
            { id: 2, username: 'abadmin', password: 'ab123', role: 'Unit Admin', unit: 'AB Tuber' },
            { id: 3, username: 'staradmin', password: 'star123', role: 'Unit Admin', unit: 'Star Biotech' },
            { id: 4, username: 'nanakadmin', password: 'nanak123', role: 'Unit Admin', unit: 'Nanak Biotech' },
            { id: 5, username: 'user1', password: 'user123', role: 'User', unit: 'AB Tuber' },
            { id: 6, username: 'user2', password: 'user123', role: 'User', unit: 'Star Biotech' }
        ];
    }

    saveUsers() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.users));
            return true;
        } catch (error) {
            console.error('Error saving users:', error);
            return false;
        }
    }

    validateUser(user) {
        const errors = [];

        if (!user.username || user.username.trim() === '') {
            errors.push('Username is required');
        }

        if (user.username && user.username.length < 3) {
            errors.push('Username must be at least 3 characters');
        }

        if (!user.password || user.password.trim() === '') {
            errors.push('Password is required');
        }

        if (user.password && user.password.length < 4) {
            errors.push('Password must be at least 4 characters');
        }

        if (!user.role) {
            errors.push('Role is required');
        }

        if (!user.unit) {
            errors.push('Unit is required');
        }

        if (user.role !== 'Super Admin' && user.unit === 'All') {
            errors.push('Only Super Admin can have access to All units');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    addUser(user) {
        const validation = this.validateUser(user);
        
        if (!validation.isValid) {
            return {
                success: false,
                errors: validation.errors
            };
        }

        // Check if username already exists
        if (this.users.some(u => u.username === user.username)) {
            return {
                success: false,
                errors: ['Username already exists']
            };
        }

        const newUser = {
            id: Date.now(),
            ...user,
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        const saved = this.saveUsers();

        return {
            success: saved,
            data: newUser,
            errors: saved ? [] : ['Failed to save user']
        };
    }

    updateUser(id, updateData) {
        const index = this.users.findIndex(u => u.id === id);
        
        if (index === -1) {
            return {
                success: false,
                errors: ['User not found']
            };
        }

        const validation = this.validateUser(updateData);
        
        if (!validation.isValid) {
            return {
                success: false,
                errors: validation.errors
            };
        }

        // Check if username already exists (excluding current user)
        if (updateData.username && this.users.some(u => u.username === updateData.username && u.id !== id)) {
            return {
                success: false,
                errors: ['Username already exists']
            };
        }

        this.users[index] = {
            ...this.users[index],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        const saved = this.saveUsers();

        return {
            success: saved,
            data: this.users[index],
            errors: saved ? [] : ['Failed to save user']
        };
    }

    deleteUser(id) {
        const index = this.users.findIndex(u => u.id === id);
        
        if (index === -1) {
            return {
                success: false,
                errors: ['User not found']
            };
        }

        // Check if current user can delete this user
        if (!canManageUser(id)) {
            return {
                success: false,
                errors: ['You do not have permission to delete this user']
            };
        }

        // Prevent deleting the main admin
        if (this.users[index].username === 'admin') {
            return {
                success: false,
                errors: ['Cannot delete the main admin account']
            };
        }

        this.users.splice(index, 1);
        const saved = this.saveUsers();

        return {
            success: saved,
            errors: saved ? [] : ['Failed to delete user']
        };
    }

    getAllUsers() {
        return this.users;
    }

    getUserById(id) {
        return this.users.find(u => u.id === id);
    }

    init() {
        this.setupEventListeners();
        this.loadUsersTable();
    }

    setupEventListeners() {
        const addUserForm = document.getElementById('addUserForm');
        if (addUserForm) {
            addUserForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                // Check if user can add users
                if (!canAddUser()) {
                    alert('You do not have permission to add users.');
                    return;
                }
                
                const userData = {
                    username: document.getElementById('username').value,
                    password: document.getElementById('password').value,
                    role: document.getElementById('role').value,
                    unit: document.getElementById('unit').value
                };

                const result = this.addUser(userData);

                if (result.success) {
                    alert('User added successfully!');
                    addUserForm.reset();
                    this.loadUsersTable();
                } else {
                    alert('Failed to add user: ' + result.errors.join(', '));
                }
            });
        }
    }

    loadUsersTable() {
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;

        // Get manageable users based on current user's role
        const manageableUsers = getManageableUsers();

        if (manageableUsers.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No users found</td></tr>';
            return;
        }

        const currentUser = getCurrentUser();

        tbody.innerHTML = manageableUsers.map(user => {
            const canDelete = canManageUser(user.id);
            const isProtected = user.username === 'admin' || 
                             (currentUser.role === 'Unit Admin' && (user.role === 'Super Admin' || user.role === 'Unit Admin'));
            
            return `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.username}</td>
                    <td>${user.role}</td>
                    <td>${user.unit}</td>
                    <td>
                        ${isProtected ? 
                            '<span style="color: #64748B;">Protected</span>' : 
                            canDelete ? 
                                `<button onclick="userManager.deleteUser(${user.id})" style="padding: 5px 10px; font-size: 12px; background: #EF4444;">🗑️</button>` :
                                '<span style="color: #64748B;">No Access</span>'
                        }
                    </td>
                </tr>
            `;
        }).join('');
    }
}

// Initialize user manager
const userManager = new UserManager();