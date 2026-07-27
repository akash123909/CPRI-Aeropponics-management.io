const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    id: Number,
    username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        sparse: true
    },
    role: {
        type: String,
        enum: ['Super Admin', 'Unit Admin', 'User'],
        default: 'User'
    },
    unit: {
        type: String,
        enum: ['All', 'AB Tuber', 'Star Biotech', 'Nanak Biotech'],
        default: 'AB Tuber'
    },
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

// Hash password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Default users data
const defaultUsers = [
    { id: 1, username: 'admin', password: 'admin123', role: 'Super Admin', unit: 'All' },
    { id: 2, username: 'abadmin', password: 'ab123', role: 'Unit Admin', unit: 'AB Tuber' },
    { id: 3, username: 'staradmin', password: 'star123', role: 'Unit Admin', unit: 'Star Biotech' },
    { id: 4, username: 'nanakadmin', password: 'nanak123', role: 'Unit Admin', unit: 'Nanak Biotech' },
    { id: 5, username: 'user1', password: 'user123', role: 'User', unit: 'AB Tuber' },
    { id: 6, username: 'user2', password: 'user123', role: 'User', unit: 'Star Biotech' }
];

module.exports = mongoose.model('User', UserSchema);
module.exports.defaultUsers = defaultUsers;
