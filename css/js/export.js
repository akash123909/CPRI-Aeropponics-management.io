/**
 * Export System for CPRI Aeroponics Management
 * Professional data export to CSV and PDF formats
 */

class ExportManager {
    constructor() {
        this.dataManager = dataManager;
    }

    /**
     * Export data to CSV format
     */
    exportToCSV(filters = {}) {
        const entries = this.dataManager.getAllEntries(filters);
        
        if (entries.length === 0) {
            return {
                success: false,
                message: 'No data available to export'
            };
        }

        const headers = [
            'Date',
            'Unit',
            'EC Previous (mS/cm)',
            'EC Set (mS/cm)',
            'pH Previous',
            'pH Set',
            'Main Filter',
            'Nozzle Filter',
            'Variety',
            'Minitubers',
            'Weight (kg)',
            'Temperature (°C)',
            'Humidity (%)',
            'Created By'
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
            ].map(field => `"${field}"`).join(','))
        ].join('\n');

        // Add BOM for Excel UTF-8 compatibility
        const bom = '\uFEFF';
        const csvWithBom = bom + csvContent;

        return {
            success: true,
            data: csvWithBom,
            filename: `aeroponics_data_${new Date().toISOString().split('T')[0]}.csv`,
            mimeType: 'text/csv;charset=utf-8'
        };
    }

    /**
     * Download CSV file
     */
    downloadCSV(filters = {}) {
        const result = this.exportToCSV(filters);
        
        if (!result.success) {
            alert(result.message);
            return;
        }

        const blob = new Blob([result.data], { type: result.mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    /**
     * Export data to JSON format
     */
    exportToJSON(filters = {}) {
        const entries = this.dataManager.getAllEntries(filters);
        
        if (entries.length === 0) {
            return {
                success: false,
                message: 'No data available to export'
            };
        }

        const jsonContent = JSON.stringify(entries, null, 2);

        return {
            success: true,
            data: jsonContent,
            filename: `aeroponics_data_${new Date().toISOString().split('T')[0]}.json`,
            mimeType: 'application/json'
        };
    }

    /**
     * Download JSON file
     */
    downloadJSON(filters = {}) {
        const result = this.exportToJSON(filters);
        
        if (!result.success) {
            alert(result.message);
            return;
        }

        const blob = new Blob([result.data], { type: result.mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    /**
     * Generate printable report HTML
     */
    generatePrintReport(filters = {}) {
        const entries = this.dataManager.getAllEntries(filters);
        const stats = this.dataManager.getStatistics();

        const reportHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>CPRI Aeroponics Report</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; }
                    h1 { color: #333; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    th { background-color: #4CAF50; color: white; }
                    .summary { background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px; }
                    .summary-item { margin: 5px 0; }
                    @media print { .no-print { display: none; } }
                </style>
            </head>
            <body>
                <h1>CPRI Aeroponics Management Report</h1>
                <p>Generated on: ${new Date().toLocaleString()}</p>
                
                <div class="summary">
                    <h3>Summary</h3>
                    <div class="summary-item"><strong>Total Entries:</strong> ${stats.totalEntries}</div>
                    <div class="summary-item"><strong>Total Minitubers:</strong> ${stats.totalMinitubers.toLocaleString()}</div>
                    <div class="summary-item"><strong>Total Weight:</strong> ${stats.totalWeight} kg</div>
                    <div class="summary-item"><strong>Average EC:</strong> ${stats.averageEC} mS/cm</div>
                    <div class="summary-item"><strong>Average pH:</strong> ${stats.averagePH}</div>
                    <div class="summary-item"><strong>Average Temperature:</strong> ${stats.averageTemperature}°C</div>
                    <div class="summary-item"><strong>Average Humidity:</strong> ${stats.averageHumidity}%</div>
                </div>

                <h2>Data Entries</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Unit</th>
                            <th>EC (mS/cm)</th>
                            <th>pH</th>
                            <th>Temp (°C)</th>
                            <th>Humidity (%)</th>
                            <th>Variety</th>
                            <th>Minitubers</th>
                            <th>Weight (kg)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${entries.map(entry => `
                            <tr>
                                <td>${new Date(entry.date).toLocaleDateString()}</td>
                                <td>${entry.unit}</td>
                                <td>${entry.ecSet}</td>
                                <td>${entry.phSet}</td>
                                <td>${entry.temperature}</td>
                                <td>${entry.humidity}</td>
                                <td>${entry.variety}</td>
                                <td>${entry.minitubers}</td>
                                <td>${entry.weight}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="no-print">
                    <button onclick="window.print()" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; cursor pointer;">Print Report</button>
                </div>
            </body>
            </html>
        `;

        return {
            success: true,
            data: reportHTML
        };
    }

    /**
     * Open print report in new window
     */
    openPrintReport(filters = {}) {
        const result = this.generatePrintReport(filters);
        
        if (!result.success) {
            alert(result.message);
            return;
        }

        const printWindow = window.open('', '_blank');
        printWindow.document.write(result.data);
        printWindow.document.close();
    }

    /**
     * Export summary statistics
     */
    exportSummary(filters = {}) {
        const entries = this.dataManager.getAllEntries(filters);
        const stats = this.dataManager.getStatistics();

        const summary = {
            reportDate: new Date().toISOString(),
            filters: filters,
            summary: stats,
            dataPoints: entries.length,
            units: [...new Set(entries.map(e => e.unit))],
            varieties: [...new Set(entries.map(e => e.variety))],
            dateRange: {
                earliest: entries.length > 0 ? entries[entries.length - 1].date : null,
                latest: entries.length > 0 ? entries[0].date : null
            }
        };

        return {
            success: true,
            data: JSON.stringify(summary, null, 2),
            filename: `aeroponics_summary_${new Date().toISOString().split('T')[0]}.json`,
            mimeType: 'application/json'
        };
    }

    /**
     * Download summary report
     */
    downloadSummary(filters = {}) {
        const result = this.exportSummary(filters);
        
        if (!result.success) {
            alert(result.message);
            return;
        }

        const blob = new Blob([result.data], { type: result.mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = result.filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}

// Initialize export manager
const exportManager = new ExportManager();