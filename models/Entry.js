const mongoose = require('mongoose');

const EntrySchema = new mongoose.Schema({
    unit: {
        type: String,
        required: true,
        enum: ['AB Tuber', 'Star Biotech', 'Nanak Biotech']
    },
    role: {
        type: String,
        enum: ['Super Admin', 'Unit Admin', 'User']
    },
    // Water Quality Parameters
    ecPrev: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    ecSet: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    phPrev: {
        type: Number,
        required: true,
        min: 0,
        max: 14
    },
    phSet: {
        type: Number,
        required: true,
        min: 0,
        max: 14
    },
    // Filter Status
    mainFilter: {
        type: String,
        enum: ['Yes', 'No'],
        required: true
    },
    nozzleFilter: {
        type: String,
        enum: ['Yes', 'No'],
        required: true
    },
    // Production Details
    variety: {
        type: String,
        required: true
    },
    minitubers: {
        type: Number,
        required: true,
        min: 0
    },
    weight: {
        type: Number,
        required: true,
        min: 0
    },
    // Environmental Data
    temperature: {
        type: Number,
        min: -50,
        max: 50
    },
    humidity: {
        type: Number,
        min: 0,
        max: 100
    },
    // Photo (Base64 encoded)
    photo: {
        type: String,
        default: null
    },
    // Metadata
    createdBy: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Index for faster queries
EntrySchema.index({ unit: 1, createdAt: -1 });
EntrySchema.index({ createdBy: 1 });

module.exports = mongoose.model('Entry', EntrySchema);
