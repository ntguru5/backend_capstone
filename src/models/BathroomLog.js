import { Schema, model } from "mongoose";

const bathroomLogSchema = new Schema({
  dogId: {
    type: String,
    ref: 'Dog',
    // required: [true, 'Dog ID is required'],
    index: true
  },
  type: {
    type: String,
    required: [true, 'Type is required'],
    enum: ['pee', 'poop', 'both'],
    index: true
  },
  date: {
    type: Date,
    default: Date.now,
    required: [true, 'Date is required'],
    index: true
  },
  consistency: {
    type: String,
    enum: ['normal', 'soft', 'hard', 'watery'],
    required: function() {
      return this.type === 'poop' || this.type === 'both';
    }
  },
  color: {
    type: String,
    enum: ['brown', 'dark brown', 'black', 'red', 'yellow', 'green'],
    required: function() {
      return this.type === 'poop' || this.type === 'both';
    }
  },
  notes: {
    type: String,
    trim: true,
    maxLength: [500, 'Notes cannot be longer than 500 characters']
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

// Indexes
bathroomLogSchema.index({ dogId: 1, date: -1 });

// Virtual populate for dog information
bathroomLogSchema.virtual('dog', {
  ref: 'Dog',
  localField: 'dogId',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware
bathroomLogSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Instance method to get logs for the past 24 hours
bathroomLogSchema.methods.getRecentLogs = function() {
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  return this.model('BathroomLog').find({
    dogId: this.dogId,
    date: { $gte: oneDayAgo }
  }).sort('-date');
};

const BathroomLog = model('BathroomLog', bathroomLogSchema);

export default BathroomLog;
