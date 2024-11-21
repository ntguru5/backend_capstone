import { Schema, model } from "mongoose";

const dogSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minLength: [2, 'Name must be at least 2 characters long'],
    maxLength: [30, 'Name must be less than 30 characters long'],
    index: true
  },
  breed: {
    type: String,
    required: [true, 'Breed is required'],
    trim: true,
    index: true
  },
  age: {
    type: Number,
    min: [0, 'Age cannot be negative'],
    max: [30, 'Age seems unrealistic'],
    validate: {
      validator: Number.isInteger,
      message: 'Age must be a whole number'
    }
  },
  weight: {
    type: Number,
    min: [0.1, 'Weight must be greater than 0'],
    max: [200, 'Weight seems unrealistic'],
    required: [true, 'Weight is required']
  },
  ownerName: {
    type: String,
    required: [true, 'Owner Name is required'],
    index: true
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: [true, 'Gender is required']
  },
  isVaccinated: {
    type: Boolean,
    default: false
  },
  medicalHistory: [{
    date: Date,
    description: String,
    veterinarian: String
  }],
  photos: [{
    url: String,
    isDefault: Boolean
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for common queries
dogSchema.index({ breed: 1, age: 1 });
dogSchema.index({ 'medicalHistory.date': 1 });

// Virtual for dog's age in human years
dogSchema.virtual('humanAge').get(function() {
  return this.age * 7;
});

// Pre-save middleware to update timestamps
dogSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance method to check if dog needs vaccination
dogSchema.methods.needsVaccination = function() {
  if (!this.isVaccinated) return true;

  const lastVaccination = this.medicalHistory
    .filter(record => record.description.includes('vaccination'))
    .sort((a, b) => b.date - a.date)[0];

  if (!lastVaccination) return true;

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  return lastVaccination.date < oneYearAgo;
};

// Static method to find dogs by breed
dogSchema.statics.findByBreed = function(breed) {
  return this.find({ breed: new RegExp(breed, 'i') });
};

const Dog = model("Dog", dogSchema);

// Create indexes
Dog.createIndexes();

export default Dog;
