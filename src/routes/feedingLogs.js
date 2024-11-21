import express from 'express';
const router = express.Router();
import Feeding from '../models/Feeding.js';

// GET feeding metrics for a specific dog
router.get('/:dogId', async (req, res) => {
  try {
    const metrics = await Feeding.find({ dogId: req.params.dogId });
    res.json(metrics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a new feeding metric
router.post('/', async (req, res) => {
  const metric = new Feeding(req.body);
  try {
    const newMetric = await metric.save();
    res.status(201).json(newMetric);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH update feeding metric by ID
router.patch('/:id', async (req, res) => {
  try {
    const updatedMetric = await Feeding.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedMetric);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE feeding metric by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedMetric = await Feeding.findByIdAndDelete(req.params.id);

    // Check if the metric was found and deleted
    if (!deletedMetric) {
      return res.status(404).json({ message: 'Feeding metric not found' });
    }

    res.json({ message: 'Feeding metric deleted successfully' });
  } catch (err) {
    console.error('Error deleting feeding metric:', err);
    res.status(500).json({ message: err.message });
  }
});

export default router;
