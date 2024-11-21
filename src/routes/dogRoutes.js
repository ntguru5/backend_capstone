import express from 'express';
const router = express.Router();
import Dog from '../models/Dog.js';

// GET all dogs
router.get('/', async (req, res) => {
  try {
    console.log("fetching dogs...");
    const dogs = await Dog.find();
    console.log("dogs fetched: ", dogs);
    res.json(dogs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a new dog
router.post('/', async (req, res) => {
  const dog = new Dog(req.body);
  try {
    const newDog = await dog.save();
    res.status(201).json(newDog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PATCH update dog by ID
router.patch('/:id', async (req, res) => {
  try {
    const updatedDog = await Dog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedDog);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE dog by ID
router.delete('/:id', async (req, res) => {
  try {
    await Dog.findByIdAndDelete(req.params.id);
    res.json({ message: 'Dog deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
