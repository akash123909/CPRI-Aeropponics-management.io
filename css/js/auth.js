// Authentication System for CPRI Aeroponics Management
// Role-Based Access Control Implementation

// Default users database
const defaultUsers = [
    { id: 1, username: 'admin', password: 'admin123', role: 'Super Admin', unit: 'All' },
    { id: 2, username: 'abadmin', password: 'ab123', role: 'Unit Admin', unit: 'AB Tuber' },
    { id: 3, username: 'staradmin', password: 'star123', role: 'Unit Admin', unit: 'Star Biotech' },
    { id: 4, username: 'nanakadmin', password: 'nanak123', role: 'Unit Admin', unit: 'Nanak Biotech' },
    { id: 5, username: 'user1', password: 'user123', role: 'User', unit: 'AB Tuber' },
    { id: 6, username: 'user2', password: 'user123', role: 'User', unit: 'Star Biotech' }
];

// Initialize users from localStorage or use defaults
function getUsers() {
    const storedUsers = localStorage.getItem('cprUsers');
    if (storedUsers) {
        return JSON.parse(storedUsers);
    }
    localStorage.setItem('cprUsers', JSON.stringify(defaultUsers));
    return defaultUsers;
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem('cprUsers', JSON.stringify(users));
}

// Login function
function login(username, password, unit, role) {
    const users = getUsers();
    const user = users.find(u => 
        u.username === username && 
        u.password === password &&
        u.role === role &&
        (u.unit === unit || u.unit === 'All')
    );
    
    if (user) {
        // Store current user session
        const session = {
            id: user.id,
            username: user.username,
            role: user.role,
            unit: user.unit,
            loginTime: new Date().toISOString()
        };
        localStorage.setItem('cprSession', JSON.stringify(session));
        return { success: true, user: session };
    }
    
    return { success: false, message: 'Invalid credentials' };
}

// Logout function
function logout() {
    localStorage.removeItem('cprSession');
    window.location.href = 'index.html';
}

// Check if user is logged in
function isLoggedIn() {
    const session = localStorage.getItem('cprSession');
    return session !== null;
}

// Get current user session
function getCurrentUser() {
    const session = localStorage.getItem('cprSession');
    if (session) {
        return JSON.parse(session);
    }
    return null;
}

// Protect pages - redirect to login if not authenticated
function protectPage() {
    if (!isLoggedIn()) {
        window.location.href = 'index.html';
    }
}

// Check user role for access control
function hasRole(requiredRole) {
    const user = getCurrentUser();
    if (!user) return false;
    
    const roleHierarchy = {
        'Super Admin': 3,
        'Unit Admin': 2,
        'User': 1
    };
    
    return roleHierarchy[user.role] >= roleHierarchy[requiredRole];
}

// Check if user can access specific unit data
function canAccessUnit(unitName) {
    const user = getCurrentUser();
    if (!user) return false;
    
    // Super Admin can access all units
    if (user.role === 'Super Admin') return true;
    
    // Unit Admin and User can only access their own unit
    return user.unit === unitName;
}

// Get accessible units for current user
function getAccessibleUnits() {
    const user = getCurrentUser();
    if (!user) return [];
    
    // Super Admin can access all units
    if (user.role === 'Super Admin') {
        return ['AB Tuber', 'Star Biotech', 'Nanak Biotech'];
    }
    
    // Unit Admin and User can only access their unit
    return [user.unit];
}

// Check if user can manage units (Super Admin only)
function canManageUnits() {
    const user = getCurrentUser();
    return user && user.role === 'Super Admin';
}

// Check if user can manage users
function canManageUsers() {
    const user = getCurrentUser();
    if (!user) return false;
    
    // Super Admin can manage all users
    if (user.role === 'Super Admin') return true;
    
    // Unit Admin can manage users in their unit only
    if (user.role === 'Unit Admin') return true;
    
    // Users cannot manage other users
    return false;
}

// Get users that current user can manage
function getManageableUsers() {
    const user = getCurrentUser();
    if (!user) return [];
    
    const allUsers = getUsers();
    
    // Super Admin can manage all users
    if (user.role === 'Super Admin') {
        return allUsers;
    }
    
    // Unit Admin can manage users in their unit only
    if (user.role === 'Unit Admin') {
        return allUsers.filter(u => u.unit === user.unit);
    }
    
    // Users cannot manage anyone
    return [];
}

// Check if user can add/delete specific user
function canManageUser(targetUserId) {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    // Super Admin can manage all users except themselves
    if (currentUser.role === 'Super Admin') {
        return currentUser.id !== targetUserId;
    }
    
    // Unit Admin can manage users in their unit only
    if (currentUser.role === 'Unit Admin') {
        const targetUser = getUsers().find(u => u.id === targetUserId);
        if (!targetUser) return false;
        
        // Cannot manage Super Admins or other Unit Admins
        if (targetUser.role === 'Super Admin' || targetUser.role === 'Unit Admin') {
            return false;
        }
        
        // Can only manage users in their unit
        return targetUser.unit === currentUser.unit;
    }
    
    return false;
}

// Check if user can add new user
function canAddUser() {
    const user = getCurrentUser();
    if (!user) return false;
    
    // Super Admin can add any user
    if (user.role === 'Super Admin') return true;
    
    // Unit Admin can add users to their unit only
    if (user.role === 'Unit Admin') return true;
    
    // Users cannot add new users
    return false;
}

// Check what roles current user can assign
function getAssignableRoles() {
    const user = getCurrentUser();
    if (!user) return [];
    
    // Super Admin can assign any role
    if (user.role === 'Super Admin') {
        return ['Super Admin', 'Unit Admin', 'User'];
    }
    
    // Unit Admin can only assign User role to their unit
    if (user.role === 'Unit Admin') {
        return ['User'];
    }
    
    return [];
}

// Check what units current user can assign
function getAssignableUnits() {
    const user = getCurrentUser();
    if (!user) return [];
    
    // Super Admin can assign any unit
    if (user.role === 'Super Admin') {
        return ['AB Tuber', 'Star Biotech', 'Nanak Biotech'];
    }
    
    // Unit Admin can only assign their unit
    if (user.role === 'Unit Admin') {
        return [user.unit];
    }
    
    return [];
}

// Hide/show elements based on user permissions
function applyPermissions() {
    const user = getCurrentUser();
    if (!user) return;
    
    // Hide manage-units link for non-Super Admins
    const manageUnitsLink = document.querySelector('a[href="manage-unit.html"]');
    if (manageUnitsLink && !canManageUnits()) {
        manageUnitsLink.style.display = 'none';
    }
    
    // Hide manage-users link for Users
    const manageUsersLink = document.querySelector('a[href="manage-users.html"]');
    if (manageUsersLink && !canManageUsers()) {
        manageUsersLink.style.display = 'none';
    }
    
    // Hide analytics link for Users
    const analyticsLink = document.querySelector('a[href="analytics.html"]');
    if (analyticsLink && user.role === 'User') {
        analyticsLink.style.display = 'none';
    }
}

// Initialize login form handler
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('.login-card');
    if (loginForm) {
        const loginBtn = loginForm.querySelector('button');
        if (loginBtn) {
            loginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                const unitSelect = loginForm.querySelector('select:first-of-type');
                const roleSelect = loginForm.querySelector('select:last-of-type');
                const usernameInput = loginForm.querySelector('input[type="text"]');
                const passwordInput = loginForm.querySelector('input[type="password"]');
                
                const unit = unitSelect ? unitSelect.value : '';
                const role = roleSelect ? roleSelect.value : '';
                const username = usernameInput ? usernameInput.value : '';
                const password = passwordInput ? passwordInput.value : '';
                
                if (!unit || unit === 'Select Unit') {
                    alert('Please select a unit');
                    return;
                }
                
                if (!username || !password) {
                    alert('Please enter username and password');
                    return;
                }
                
                const result = login(username, password, unit, role);
                
                if (result.success) {
                    window.location.href = 'dashboard.html';
                } else {
                    alert('Login failed: ' + result.message);
                }
            });
        }
    }
    
    // Add logout functionality to logout buttons
    const logoutBtns = document.querySelectorAll('button');
    logoutBtns.forEach(btn => {
        if (btn.textContent.trim() === 'Logout' || btn.textContent.trim() === '🚪 Logout') {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                logout();
            });
        }
    });
    
    // Apply permissions on page load
    applyPermissions();
});