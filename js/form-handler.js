/**
 * Data Form Handler
 * Manages all form submissions and validations
 */

class FormHandler {
    constructor() {
        this.formData = {};
        this.currentPage = 1;
        this.totalPages = 1;
    }

    /**
     * Initialize form with empty data structure
     */
    initializeForm() {
        this.formData = {
            unit: 'AB Tuber',
            growboxNumber: '',
            date: new Date().toISOString().split('T')[0],
            
            // Variety & Harvest
            variety: '',
            minitubers: '',
            weight: '',
            observation: '',
            
            // Check List
            dayOffTime: '',
            nightOffTime: '',
            mainFilterCheck: false,
            nozzleFilterCheck: false,
            plantProtectionSpray: '',
            coolingPadWaterChange: false,
            yellowTrapCheck: false,
            roWaterCheck: false,
            roofCleaning: false,
            floorCleaning: false,
            
            // Tank 1
            tank1Variety: '',
            tank1EcPrevious: '',
            tank1EcSet: '',
            tank1PhPrevious: '',
            tank1PhSet: '',
            tank1NutrientChange: false,
            tank1NutrientTemp: '',
            tank1GrowboxTemp: '',
            
            // Tank 2
            tank2Variety: '',
            tank2EcPrevious: '',
            tank2EcSet: '',
            tank2PhPrevious: '',
            tank2PhSet: '',
            tank2NutrientChange: false,
            tank2NutrientTemp: '',
            tank2GrowboxTemp: '',
            
            // Environmental
            greenHouseTemp: ''
        };
    }

    /**
     * Validate form data
     */
    validateForm() {
        const errors = [];

        if (!this.formData.growboxNumber) errors.push('Growbox number is required');
        if (!this.formData.variety) errors.push('Variety is required');
        if (!this.formData.tank1Variety) errors.push('Tank 1 variety is required');
        if (!this.formData.tank2Variety) errors.push('Tank 2 variety is required');

        return errors;
    }

    /**
     * Update form field
     */
    updateField(field, value) {
        this.formData[field] = value;
    }

    /**
     * Get form data structured for API
     */
    getFormattedData() {
        return {
            unit: this.formData.unit,
            growboxNumber: parseInt(this.formData.growboxNumber),
            date: new Date(this.formData.date),
            
            variety: this.formData.variety,
            minitubers: parseInt(this.formData.minitubers) || 0,
            weight: parseFloat(this.formData.weight) || 0,
            observation: this.formData.observation,
            
            dayOffTime: parseInt(this.formData.dayOffTime) || 0,
            nightOffTime: parseInt(this.formData.nightOffTime) || 0,
            mainFilterCheck: this.formData.mainFilterCheck,
            nozzleFilterCheck: this.formData.nozzleFilterCheck,
            plantProtectionSpray: this.formData.plantProtectionSpray,
            coolingPadWaterChange: this.formData.coolingPadWaterChange,
            yellowTrapCheck: this.formData.yellowTrapCheck,
            roWaterCheck: this.formData.roWaterCheck,
            roofCleaning: this.formData.roofCleaning,
            floorCleaning: this.formData.floorCleaning,
            
            tank1: {
                variety: this.formData.tank1Variety,
                ecPrevious: parseFloat(this.formData.tank1EcPrevious) || 0,
                ecSet: parseFloat(this.formData.tank1EcSet) || 0,
                phPrevious: parseFloat(this.formData.tank1PhPrevious) || 0,
                phSet: parseFloat(this.formData.tank1PhSet) || 0,
                nutrientSolutionChange: this.formData.tank1NutrientChange,
                nutrientSolutionTemp: parseFloat(this.formData.tank1NutrientTemp) || 0,
                growboxTemp: parseFloat(this.formData.tank1GrowboxTemp) || 0
            },
            
            tank2: {
                variety: this.formData.tank2Variety,
                ecPrevious: parseFloat(this.formData.tank2EcPrevious) || 0,
                ecSet: parseFloat(this.formData.tank2EcSet) || 0,
                phPrevious: parseFloat(this.formData.tank2PhPrevious) || 0,
                phSet: parseFloat(this.formData.tank2PhSet) || 0,
                nutrientSolutionChange: this.formData.tank2NutrientChange,
                nutrientSolutionTemp: parseFloat(this.formData.tank2NutrientTemp) || 0,
                growboxTemp: parseFloat(this.formData.tank2GrowboxTemp) || 0
            },
            
            greenHouseTemp: parseFloat(this.formData.greenHouseTemp) || 0
        };
    }

    /**
     * Reset form
     */
    reset() {
        this.initializeForm();
        this.currentPage = 1;
    }
}

// Export singleton
const formHandler = new FormHandler();
