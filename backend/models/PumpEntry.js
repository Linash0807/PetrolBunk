import mongoose from 'mongoose';

const pumpEntrySchema = new mongoose.Schema({
  nozzleNumber: {
    type: Number,
    required: true,
    index: true
  },
  openingReading: {
    type: Number,
    required: true
  },
  closingReading: {
    type: Number,
    required: false
  },
  fuelType: {
    type: String,
    enum: ['Petrol', 'Diesel', 'LPG'],
    required: true
  },
  quantitySold: {
    type: Number,
    required: false
  },
  pricePerLiter: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'verified'],
    default: 'open'
  },
  entryDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
pumpEntrySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('PumpEntry', pumpEntrySchema);
