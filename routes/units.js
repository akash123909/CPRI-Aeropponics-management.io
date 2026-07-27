const express = require('express');
const router = express.Router();
const Unit = require('../models/Unit');

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
 * GET /api/units
 * Get all units
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const units = await Unit.find({ active: true }).sort({ name: 1 });

        res.json({
            success: true,
            data: units
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching units',
            error: error.message
        });
    }
});

/**
 * GET /api/units/:id
 * Get single unit
 */
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const unit = await Unit.findById(req.params.id);
        
        if (!unit) {
            return res.status(404).json({
                success: false,
                message: 'Unit not found'
            });
        }

        res.json({
            success: true,
            data: unit
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching unit',
            error: error.message
        });
    }
});

module.exports = router;
