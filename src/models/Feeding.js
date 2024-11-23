import { Schema, model } from "mongoose";

const feedingSchema = new Schema({
  dogId: {
    type: String,
    ref: 'Dog',
    // required: [true, 'Dog ID is required'],
    index: true
  },
  foodType: {
    type: String,
    required: [true, 'Food type is required'],
    enum: ['dry', 'wet', 'treats', 'supplements'],
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
    validate: {
      validator: Number.isFinite,
      message: 'Amount must be a valid number'
    }
  },
  date: {
    type: Date,
    default: Date.now,
    required: [true, 'Date is required'],
    index: true
  },
  mealTime: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: [true, 'Meal time is required']
  },
  notes: {
    type: String,
    trim: true,
    maxLength: [500, 'Notes cannot be longer than 500 characters']
  },
  brand: {
    type: String,
    trim: true,
    maxLength: [100, 'Brand name cannot be longer than 100 characters']
  },
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
feedingSchema.index({ dogId: 1, date: -1 });
feedingSchema.index({ foodType: 1, date: -1 });

// Virtual populate for dog information
feedingSchema.virtual('dog', {
  ref: 'Dog',
  localField: 'dogId',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware
feedingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Feeding = model('Feeding', feedingSchema);

export default Feeding;
