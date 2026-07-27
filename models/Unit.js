const mongoose = require('mongoose');

const UnitSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        enum: ['AB Tuber', 'Star Biotech', 'Nanak Biotech']
    },
    description: String,
    location: String,
    capacity: Number,
    active: {
        type: Boolean,
        default: true
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

module.exports = mongoose.model('Unit', UnitSchema);
