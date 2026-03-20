import mongoose from 'mongoose';

const shiftEntrySchema = new mongoose.Schema(
  {
    bunk: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    shift: {
      type: String,
      required: true,
      enum: ['A', 'B', 'C'],
    },
    employee: {
      type: String,
      required: true,
      trim: true,
    },
    speed: {
      type: Number,
      required: true,
      min: 0,
    },
    ms: {
      type: Number,
      required: true,
      min: 0,
    },
    hsd: {
      type: Number,
      required: true,
      min: 0,
    },
    cash: {
      type: Number,
      required: true,
      min: 0,
    },
    phonePe: {
      type: Number,
      required: true,
      min: 0,
    },
    fleetCard: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('ShiftEntry', shiftEntrySchema);
