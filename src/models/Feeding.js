import { Schema, model } from "mongoose";

const feedingSchema = new Schema({
  dogId: {
    type: Schema.Types.ObjectId,
    ref: 'Dog',
    required: [true, 'Dog ID is required'],
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
  calories: {
    type: Number,
    min: [0, 'Calories cannot be negative'],
    validate: {
      validator: Number.isFinite,
      message: 'Calories must be a valid number'
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

// Instance method to get daily total calories
feedingSchema.methods.getDailyCalories = async function() {
  const startOfDay = new Date(this.date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(this.date);
  endOfDay.setHours(23, 59, 59, 999);

  const dailyMetrics = await this.model('Feeding').aggregate([
    {
      $match: {
        dogId: this.dogId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      }
    },
    {
      $group: {
        _id: null,
        totalCalories: { $sum: '$calories' },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  return dailyMetrics[0] || { totalCalories: 0, totalAmount: 0 };
};

const Feeding = model('Feeding', feedingSchema);

export default Feeding;
