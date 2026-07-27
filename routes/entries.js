const express = require('express');
const router = express.Router();
const Entry = require('../models/Entry');

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
 * POST /api/entries
 * Create new entry
 */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const entryData = {
            ...req.body,
            createdBy: req.user.username
        };

        const newEntry = new Entry(entryData);
        await newEntry.save();

        res.status(201).json({
            success: true,
            message: 'Entry created successfully',
            data: newEntry
        });
    } catch (error) {
        console.error('Entry creation error:', error);
        res.status(400).json({
            success: false,
            message: 'Error creating entry',
            error: error.message
        });
    }
});

/**
 * GET /api/entries
 * Get all entries (with filters)
 */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { unit, startDate, endDate, page = 1, limit = 50 } = req.query;
        
        let query = {};

        // Filter by unit (if not Super Admin, show only their unit)
        if (req.user.role !== 'Super Admin' && req.user.unit !== 'All') {
            query.unit = req.user.unit;
        } else if (unit) {
            query.unit = unit;
        }

        // Filter by date range
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const skip = (page - 1) * limit;
        
        const entries = await Entry.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Entry.countDocuments(query);

        res.json({
            success: true,
            data: entries,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get entries error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching entries',
            error: error.message
        });
    }
});

/**
 * GET /api/entries/:id
 * Get single entry
 */
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const entry = await Entry.findById(req.params.id);
        
        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Entry not found'
            });
        }

        // Check access permission
        if (req.user.role !== 'Super Admin' && req.user.unit !== 'All' && entry.unit !== req.user.unit) {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        res.json({
            success: true,
            data: entry
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching entry',
            error: error.message
        });
    }
});

/**
 * PUT /api/entries/:id
 * Update entry
 */
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const entry = await Entry.findById(req.params.id);
        
        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Entry not found'
            });
        }

        // Check permission
        if (req.user.role !== 'Super Admin' && entry.createdBy !== req.user.username) {
            return res.status(403).json({
                success: false,
                message: 'You can only edit your own entries'
            });
        }

        const updatedEntry = await Entry.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true }
        );

        res.json({
            success: true,
            message: 'Entry updated successfully',
            data: updatedEntry
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating entry',
            error: error.message
        });
    }
});

/**
 * DELETE /api/entries/:id
 * Delete entry
 */
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const entry = await Entry.findById(req.params.id);
        
        if (!entry) {
            return res.status(404).json({
                success: false,
                message: 'Entry not found'
            });
        }

        // Check permission (only Super Admin or creator)
        if (req.user.role !== 'Super Admin' && entry.createdBy !== req.user.username) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own entries'
            });
        }

        await Entry.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Entry deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting entry',
            error: error.message
        });
    }
});

/**
 * GET /api/entries/stats/summary
 * Get statistics
 */
router.get('/stats/summary', authMiddleware, async (req, res) => {
    try {
        const { unit, startDate, endDate } = req.query;
        
        let query = {};
        if (unit) query.unit = unit;
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const totalEntries = await Entry.countDocuments(query);
        const entries = await Entry.find(query);

        const stats = {
            totalEntries,
            byUnit: {},
            averageMinitubers: 0,
            averageWeight: 0
        };

        entries.forEach(entry => {
            if (!stats.byUnit[entry.unit]) {
                stats.byUnit[entry.unit] = 0;
            }
            stats.byUnit[entry.unit]++;
        });

        if (entries.length > 0) {
            const totalMinitubers = entries.reduce((sum, e) => sum + (e.minitubers || 0), 0);
            const totalWeight = entries.reduce((sum, e) => sum + (e.weight || 0), 0);
            stats.averageMinitubers = (totalMinitubers / entries.length).toFixed(2);
            stats.averageWeight = (totalWeight / entries.length).toFixed(2);
        }

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching stats',
            error: error.message
        });
    }
});

module.exports = router;
