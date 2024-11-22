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

    const dailyCounts = {
      pee: new Array(7).fill(0),
      poop: new Array(7).fill(0)
    };

    const times = {
      pee: [],
      poop: []
    };

    const consistencyCounts = {
      normal: 0,
      soft: 0,
      hard: 0
    };

    const labels = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
    }

    logs.forEach(log => {
      const dayIndex = 6 - Math.floor((new Date() - log.date) / (1000 * 60 * 60 * 24));
      if (dayIndex >= 0 && dayIndex < 7) {
        if (log.type === 'pee' || log.type === 'both') {
          dailyCounts.pee[dayIndex]++;
          times.pee.push(log.date);
        }
        if (log.type === 'poop' || log.type === 'both') {
          dailyCounts.poop[dayIndex]++;
          times.poop.push(log.date);
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
          labels,
          times: times.pee
        },
        poop: {
          data: dailyCounts.poop,
          labels,
          times: times.poop
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

// GET all bathroom logs for a specific dog
router.get('/:id', validateObjectId, async (req, res) => {
  try {
    const {
      startDate,
      endDate,
      type,
      limit = 10,
      page = 1,
      sort = '-date'
    } = req.query;

    // query parameter dogId refers to the id of the dog
    const query = { dogId: req.params.id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (type) query.type = type;

    const skip = (Number(page) - 1) * Number(limit);
    const total = await BathroomLog.countDocuments(query);
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

    if (!dogId || !type) {
      return res.status(400).json({
        success: false,
        message: 'Dog ID and type are required fields'
      });
    }

    const log = new BathroomLog({
      dogId,
      type,
      date: date || new Date(),
      notes,
      consistency,
      color
    });

    const newLog = await log.save();
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

// PATCH update bathroom log
router.patch('/:id', validateObjectId, async (req, res) => {
  try {
    const updates = req.body;
    const options = { new: true, runValidators: true };

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

// DELETE bathroom log
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
