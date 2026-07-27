const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * Middleware to verify JWT token
 */
const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }
        
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

/**
 * Middleware to check Super Admin
 */
const superAdminOnly = (req, res, next) => {
    if (req.user.role !== 'Super Admin') {
        return res.status(403).json({
            success: false,
            message: 'Only Super Admin can perform this action'
        });
    }
    next();
};

/**
 * GET /api/users
 * Get all users (Super Admin only)
 */
router.get('/', authMiddleware, superAdminOnly, async (req, res) => {
    try {
        const { page = 1, limit = 50 } = req.query;
        const skip = (page - 1) * limit;

        const users = await User.find({}, '-password')
            .skip(skip)
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await User.countDocuments();

        res.json({
            success: true,
            data: users,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
            error: error.message
        });
    }
});

/**
 * GET /api/users/profile
 * Get current user profile
 */
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id, '-password');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching profile',
            error: error.message
        });
    }
});

/**
 * PUT /api/users/:id
 * Update user (Super Admin only)
 */
router.put('/:id', authMiddleware, superAdminOnly, async (req, res) => {
    try {
        const { role, unit, active } = req.body;

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { role, unit, active, updatedAt: new Date() },
            { new: true }
        ).select('-password');

        res.json({
            success: true,
            message: 'User updated successfully',
            data: updatedUser
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating user',
            error: error.message
        });
    }
});

/**
 * DELETE /api/users/:id
 * Delete user (Super Admin only)
 */
router.delete('/:id', authMiddleware, superAdminOnly, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting user',
            error: error.message
        });
    }
});

module.exports = router;
