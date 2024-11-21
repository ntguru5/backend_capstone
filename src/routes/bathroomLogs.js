import express from 'express';
import BathroomLog from '../models/BathroomLog.js';

const router = express.Router();

// Middleware to validate MongoDB ObjectId
const validateObjectId = async (req, res, next) => {
  const id = req.params.id || req.params.dogId;
  if (!id?.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  next();
};

// GET all bathroom logs for a specific dog with filtering and pagination
router.get('/:dogId', validateObjectId, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      type,
      limit = 10,
      page = 1,
      sort = '-date'
    } = req.query;

    const query = { dogId: req.params.dogId };

    // Add date range filter if provided
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Add type filter if provided
    if (type) query.type = type;

    const skip = (Number(page) - 1) * Number(limit);

    // Get total count for pagination
    const total = await BathroomLog.countDocuments(query);

    // Execute query with pagination and sorting
    const logs = await BathroomLog.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('dogId', 'name breed');

    res.json({
      success: true,
      count: logs.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: logs
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bathroom logs',
      error: err.message
    });
  }
});

// POST create a new bathroom log
router.post('/', async (req, res) => {
  try {
    const { dogId, type, date, notes, consistency, color } = req.body;

    // Validate required fields
    if (!dogId || !type) {
      return res.status(400).json({
        success: false,
        message: 'Dog ID and type are required fields'
      });
    }

    // Create new log
    const log = new BathroomLog({
      dogId,
      type,
      date: date || new Date(),
      notes,
      consistency,
      color
    });

    const newLog = await log.save();

    // Populate dog information
    await newLog.populate('dogId', 'name breed');

    res.status(201).json({
      success: true,
      data: newLog
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Error creating bathroom log',
      error: err.message
    });
  }
});

// PATCH update bathroom log by ID
router.patch('/:id', validateObjectId, async (req, res) => {
  try {
    const updates = req.body;
    const options = {
      new: true,
      runValidators: true
    };

    const updatedLog = await BathroomLog.findByIdAndUpdate(
      req.params.id,
      { ...updates, updatedAt: new Date() },
      options
    ).populate('dogId', 'name breed');

    if (!updatedLog) {
      return res.status(404).json({
        success: false,
        message: 'Bathroom log not found'
      });
    }

    res.json({
      success: true,
      data: updatedLog
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Error updating bathroom log',
      error: err.message
    });
  }
});

// DELETE a bathroom log by ID
router.delete('/:id', validateObjectId, async (req, res) => {
  try {
    const deletedLog = await BathroomLog.findByIdAndDelete(req.params.id);

    if (!deletedLog) {
      return res.status(404).json({
        success: false,
        message: 'Bathroom log not found'
      });
    }

    res.json({
      success: true,
      message: 'Bathroom log deleted successfully',
      data: deletedLog
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error deleting bathroom log',
      error: err.message
    });
  }
});

export default router;
