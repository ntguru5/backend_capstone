import express from 'express';
import Dog from '../models/Dog.js';

const router = express.Router();

// Middleware to validate dog ID
const validateDogId = async (req, res, next) => {
  if (!req.params.id?.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: 'Invalid dog ID format' });
  }
  next();
};

// GET all dogs with optional query parameters
router.get('/', async (req, res) => {
  try {
    const { breed, age, limit = 10, sort = 'name' } = req.query;
    const query = {};

    if (breed) query.breed = new RegExp(breed, 'i');
    if (age) query.age = age;

    const dogs = await Dog.find(query)
      .sort(sort)
      .limit(Number(limit));

    res.json({
      success: true,
      count: dogs.length,
      data: dogs
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dogs',
      error: err.message
    });
  }
});

// GET single dog by ID
router.get('/:id', validateDogId, async (req, res) => {
  try {
    const dog = await Dog.findById(req.params.id);
    if (!dog) {
      return res.status(404).json({
        success: false,
        message: 'Dog not found'
      });
    }
    res.json({
      success: true,
      data: dog
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error fetching dog',
      error: err.message
    });
  }
});

// POST create a new dog
router.post('/', async (req, res) => {
  try {
    const { name, breed, age, weight, gender, ownerName } = req.body;

    // Validate required fields
    if (!name || !breed) {
      return res.status(400).json({
        success: false,
        message: 'Name and breed are required fields'
      });
    }

    const dog = new Dog({
      name,
      breed,
      age,
      weight,
      gender,
      ownerName,
      createdAt: new Date()
    });

    const newDog = await dog.save();
    res.status(201).json({
      success: true,
      data: newDog
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Error creating dog',
      error: err.message
    });
  }
});

// PATCH update dog by ID
router.patch('/:id', validateDogId, async (req, res) => {
  try {
    const updates = req.body;
    const options = { new: true, runValidators: true };

    const updatedDog = await Dog.findByIdAndUpdate(
      req.params.id,
      { ...updates, updatedAt: new Date() },
      options
    );

    if (!updatedDog) {
      return res.status(404).json({
        success: false,
        message: 'Dog not found'
      });
    }

    res.json({
      success: true,
      data: updatedDog
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: 'Error updating dog',
      error: err.message
    });
  }
});

// DELETE dog by ID
router.delete('/:id', validateDogId, async (req, res) => {
  try {
    const deletedDog = await Dog.findByIdAndDelete(req.params.id);

    if (!deletedDog) {
      return res.status(404).json({
        success: false,
        message: 'Dog not found'
      });
    }

    res.json({
      success: true,
      message: 'Dog deleted successfully',
      data: deletedDog
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Error deleting dog',
      error: err.message
    });
  }
});

export default router;
