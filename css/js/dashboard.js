/**
 * CPRI Aeroponics Dashboard Controller
 * Professional dashboard with real-time data visualization
 */

class DashboardController {
    constructor() {
        this.dataManager = dataManager;
        this.currentUser = this.getCurrentUser();
        this.updateInterval = null;
        this.init();
    }

    /**
     * Initialize dashboard
     */
    init() {
        this.checkAuthentication();
        this.loadDashboardData();
        this.setupEventListeners();
        this.startRealTimeUpdates();
        this.renderCharts();
    }

    /**
     * Check if user is authenticated
     */
    checkAuthentication() {
        if (!this.currentUser) {
            window.location.href = 'index.html';
            return;
        }
    }

    /**
     * Get current user from session
     */
    getCurrentUser() {
        try {
            const session = localStorage.getItem('cprSession');
            return session ? JSON.parse(session) : null;
        } catch (error) {
            console.error('Error getting current user:', error);
            return null;
        }
    }

    /**
     * Load dashboard data
     */
    loadDashboardData() {
        const stats = this.dataManager.getStatistics();
        this.updateStatisticsCards(stats);
        this.updateUserInfo();
    }

    /**
     * Update statistics cards
     */
    updateStatisticsCards(stats) {
        // Temperature card
        const tempCard = document.querySelector('.card:nth-child(1)');
        if (tempCard) {
            tempCard.innerHTML = `
                <h3>🌡️ Temperature</h3>
                <div class="value">${stats.averageTemperature}<span class="unit">°C</span></div>
                <div class="trend">Average across all units</div>
            `;
        }

        // Humidity card
        const humidityCard = document.querySelector('.card:nth-child(2)');
        if (humidityCard) {
            humidityCard.innerHTML = `
                <h3>💧 Humidity</h3>
                <div class="value">${stats.averageHumidity}<span class="unit">%</span></div>
                <div class="trend">Average across all units</div>
            `;
        }

        // pH card
        const phCard = document.querySelector('.card:nth-child(3)');
        if (phCard) {
            phCard.innerHTML = `
                <h3>🧪 pH Level</h3>
                <div class="value">${stats.averagePH}<span class="unit"></span></div>
                <div class="trend">Average pH value</div>
            `;
        }

        // EC card
        const ecCard = document.querySelector('.card:nth-child(4)');
        if (ecCard) {
            ecCard.innerHTML = `
                <h3>⚡ EC Level</h3>
                <div class="value">${stats.averageEC}<span class="unit">mS/cm</span></div>
                <div class="trend">Average electrical conductivity</div>
            `;
        }

        // Add additional statistics cards if they don't exist
        this.addAdditionalStatsCards(stats);
    }

    /**
     * Add additional statistics cards
     */
    addAdditionalStatsCards(stats) {
        const mainContent = document.querySelector('.main');
        if (!mainContent) return;

        // Check if additional cards already exist
        if (document.querySelector('.stats-grid')) return;

        // Create stats grid
        const statsGrid = document.createElement('div');
        statsGrid.className = 'stats-grid';
        statsGrid.innerHTML = `
            <div class="card">
                <h3>📊 Total Entries</h3>
                <div class="value">${stats.totalEntries}</div>
                <div class="trend">Data records</div>
            </div>
            <div class="card">
                <h3>🥔 Total Minitubers</h3>
                <div class="value">${stats.totalMinitubers.toLocaleString()}</div>
                <div class="trend">Across all units</div>
            </div>
            <div class="card">
                <h3>⚖️ Total Weight</h3>
                <div class="value">${stats.totalWeight}<span class="unit">kg</span></div>
                <div class="trend">Total production weight</div>
            </div>
            <div class="card">
                <h3>🏭 Active Units</h3>
                <div class="value">${stats.units.length}</div>
                <div class="trend">${stats.units.join(', ')}</div>
            </div>
        `;

        // Insert after the existing cards
        const existingCards = mainContent.querySelectorAll('.card');
        if (existingCards.length > 0) {
            const lastCard = existingCards[existingCards.length - 1];
            lastCard.after(statsGrid);
        }
    }

    /**
     * Update user information display
     */
    updateUserInfo() {
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';
        userInfo.style.cssText = 'margin-bottom: 20px; padding: 15px; background: #1E293B; border-radius: 10px;';
        
        let accessInfo = '';
        if (this.currentUser.role === 'Super Admin') {
            accessInfo = 'Access: All Units';
        } else {
            accessInfo = `Access: ${this.currentUser.unit} Only`;
        }
        
        userInfo.innerHTML = `
            <strong>Welcome, ${this.currentUser.username}</strong><br>
            <small>Role: ${this.currentUser.role} | Unit: ${this.currentUser.unit} | ${accessInfo}</small>
        `;

        const mainContent = document.querySelector('.main');
        if (mainContent && !document.querySelector('.user-info')) {
            const h1 = mainContent.querySelector('h1');
            if (h1) {
                h1.after(userInfo);
            }
        }
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        // Logout button
        const logoutBtn = document.querySelector('button');
        if (logoutBtn && logoutBtn.textContent.trim() === 'Logout') {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Add refresh button
        this.addRefreshButton();
    }

    /**
     * Add refresh button
     */
    addRefreshButton() {
        const mainContent = document.querySelector('.main');
        if (!mainContent || document.querySelector('.refresh-btn')) return;

        const refreshBtn = document.createElement('button');
        refreshBtn.className = 'refresh-btn secondary';
        refreshBtn.textContent = '🔄 Refresh Data';
        refreshBtn.style.marginTop = '10px';
        refreshBtn.addEventListener('click', () => {
            this.loadDashboardData();
            this.renderCharts();
        });

        const logoutBtn = document.querySelector('button');
        if (logoutBtn) {
            logoutBtn.before(refreshBtn);
        }
    }

    /**
     * Start real-time updates
     */
    startRealTimeUpdates() {
        // Update every 30 seconds
        this.updateInterval = setInterval(() => {
            this.loadDashboardData();
        }, 30000);
    }

    /**
     * Render charts
     */
    renderCharts() {
        this.renderTrendChart();
    }

    /**
     * Render trend chart
     */
    renderTrendChart() {
        const mainContent = document.querySelector('.main');
        if (!mainContent) return;

        // Check if chart already exists
        if (document.querySelector('.chart-container')) return;

        const chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        chartContainer.style.cssText = 'margin: 20px 0; padding: 20px; background: #1E293B; border-radius: 20px;';
        
        const ecData = this.dataManager.getChartData('ecSet');
        const phData = this.dataManager.getChartData('phSet');

        chartContainer.innerHTML = `
            <h3 style="color: #60A5FA; margin-bottom: 20px;">📈 Recent Trends (Last 7 Entries)</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <h4 style="color: #94A3B8; margin-bottom: 10px;">EC Levels</h4>
                    ${this.renderSimpleBarChart(ecData, '#3B82F6', 'mS/cm')}
                </div>
                <div>
                    <h4 style="color: #94A3B8; margin-bottom: 10px;">pH Levels</h4>
                    ${this.renderSimpleBarChart(phData, '#10B981', '')}
                </div>
            </div>
        `;

        const statsGrid = document.querySelector('.stats-grid');
        if (statsGrid) {
            statsGrid.after(chartContainer);
        }
    }

    /**
     * Render simple bar chart
     */
    renderSimpleBarChart(data, color, unit) {
        const maxValue = Math.max(...data.map(d => parseFloat(d.value)));
        
        return `
            <div style="display: flex; flex-direction: column; gap: 8px;">
                ${data.map(item => {
                    const height = (item.value / maxValue) * 100;
                    return `
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span style="font-size: 12px; color: #94A3B8; width: 80px;">${item.date}</span>
                            <div style="flex: 1; background: #0F172A; height: 30px; border-radius: 5px; overflow: hidden;">
                                <div style="width: ${height}%; height: 100%; background: ${color}; display: flex; align-items: center; justify-content: flex-end; padding-right: 10px; font-size: 12px; font-weight: bold;">
                                    ${item.value}${unit}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    /**
     * Logout function
     */
    logout() {
        localStorage.removeItem('cprSession');
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        window.location.href = 'index.html';
    }

    /**
     * Cleanup on page unload
     */
    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Only initialize if we're on the dashboard page
    if (window.location.pathname.includes('dashboard.html')) {
        window.dashboardController = new DashboardController();
    }
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
    if (window.dashboardController) {
        window.dashboardController.destroy();
    }
});