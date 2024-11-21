import express from 'express';
import Feeding from '../models/Feeding.js';

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

// GET feeding metrics for a specific dog with filtering and pagination
router.get('/:dogId', validateObjectId, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      foodType,
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

    // Add food type filter if provided
    if (foodType) query.foodType = foodType;

    const skip = (Number(page) - 1) * Number(limit);

    // Get total count for pagination
    const total = await Feeding.countDocuments(query);

    // Execute query with pagination and sorting
    const metrics = await Feeding.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .populate('dogId', 'name breed');

    // Calculate total calories and amount for the period
    const stats = await Feeding.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalCalories: { $sum: '$calories' },
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);

    res.json({
      success: true,
      count: metrics.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      stats: stats[0] || { totalCalories: 0, totalAmount: 0 },
      data: metrics
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching feeding metrics',
      error: err.message
    });
  }
});

// POST create a new feeding metric
router.post('/', async (req, res) => {
  try {
    const { dogId, foodType, amount, calories, date, notes } = req.body;

    // Validate required fields
    if (!dogId || !foodType || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Dog ID, food type, and amount are required fields'
      });
    }

    // Create new feeding metric
    const metric = new Feeding({
      dogId,
      foodType,
      amount,
      calories,
      date: date || new Date(),
      notes
    });

    const newMetric = await metric.save();

    // Populate dog information
    await newMetric.populate('dogId', 'name breed');

    res.status(201).json({
      success: true,
      data: newMetric
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Error creating feeding metric',
      error: err.message
    });
  }
});

// PATCH update feeding metric by ID
router.patch('/:id', validateObjectId, async (req, res) => {
  try {
    const updates = req.body;
    const options = {
      new: true,
      runValidators: true
    };

    const updatedMetric = await Feeding.findByIdAndUpdate(
      req.params.id,
      { ...updates, updatedAt: new Date() },
      options
    ).populate('dogId', 'name breed');

    if (!updatedMetric) {
      return res.status(404).json({
        success: false,
        message: 'Feeding metric not found'
      });
    }

    res.json({
      success: true,
      data: updatedMetric
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Error updating feeding metric',
      error: err.message
    });
  }
});

// DELETE feeding metric by ID
router.delete('/:id', validateObjectId, async (req, res) => {
  try {
    const deletedMetric = await Feeding.findByIdAndDelete(req.params.id);

    if (!deletedMetric) {
      return res.status(404).json({
        success: false,
        message: 'Feeding metric not found'
      });
    }

    res.json({
      success: true,
      message: 'Feeding metric deleted successfully',
      data: deletedMetric
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error deleting feeding metric',
      error: err.message
    });
  }
});

export default router;
