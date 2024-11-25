import express from 'express';
import BathroomLog from '../models/BathroomLog.js';

const router = express.Router();

// Middleware to validate MongoDB ObjectId
const validateObjectId = async (req, res, next) => {
  const id = req.params.id;
  if (!id?.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  next();
};

// GET bathroom stats for dashboard
router.get('/stats', async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const logs = await BathroomLog.find({
      date: { $gte: sevenDaysAgo }
    }).sort('date');

    // Initialize data structure
    const dailyCounts = {
      pee: new Array(7).fill(0),
      poop: new Array(7).fill(0)
    };

    const consistencyCounts = {
      normal: 0,
      soft: 0,
      hard: 0
    };

    // Generate labels for the last 7 days
    const labels = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });

    // Process logs
    logs.forEach(log => {
      const dayIndex = 6 - Math.floor((new Date() - log.date) / (1000 * 60 * 60 * 24));
      if (dayIndex >= 0 && dayIndex < 7) {
        if (log.type === 'pee' || log.type === 'both') {
          dailyCounts.pee[dayIndex]++;
        }
        if (log.type === 'poop' || log.type === 'both') {
          dailyCounts.poop[dayIndex]++;
          if (log.consistency) {
            consistencyCounts[log.consistency]++;
          }
        }
      }
    });

    res.json({
      success: true,
      data: {
        pee: {
          data: dailyCounts.pee,
          labels
        },
        poop: {
          data: dailyCounts.poop,
          labels
        },
        consistency: {
          data: [
            consistencyCounts.normal,
            consistencyCounts.soft,
            consistencyCounts.hard
          ],
          labels: ['Normal', 'Soft', 'Hard']
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching bathroom stats',
      error: err.message
    });
  }
});

// GET all bathroom logs
router.get('/', async (req, res) => {
  try {
    const logs = await BathroomLog.find().sort('-date');
    res.json({
      success: true,
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
    const { type, date, notes, consistency, color } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Type is required'
      });
    }

    const log = new BathroomLog({
      type,
      date: date || new Date(),
      notes,
      consistency,
      color
    });

    const newLog = await log.save();

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

// PATCH update bathroom log
router.patch('/:id', async (req, res) => {
  try {
    const updates = req.body;
    const options = { new: true, runValidators: true };

    const updatedLog = await BathroomLog.findByIdAndUpdate(
      req.params.id,
      { ...updates, updatedAt: new Date() },
      options
    );

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

// DELETE bathroom log
router.delete('/:id', async (req, res) => {
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
