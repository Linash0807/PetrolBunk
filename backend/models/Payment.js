import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  pumpEntryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PumpEntry',
    required: false,
    index: true
  },
  customerName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'UPI', 'Check', 'Other'],
    required: true
  },
  fuelType: {
    type: String,
    enum: ['Petrol', 'Diesel', 'LPG'],
    required: true
  },
  quantityLiters: {
    type: Number,
    required: true
  },
  transactionId: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['completed', 'pending', 'failed'],
    default: 'completed'
  },
  paymentDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  notes: {
    type: String,
    required: false
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
paymentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Payment', paymentSchema);
