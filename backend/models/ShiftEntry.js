import mongoose from 'mongoose';

const nozzleReadingSchema = new mongoose.Schema(
  {
    nozzleId: {
      type: String,
      required: true,
      trim: true,
    },
    nozzleName: {
      type: String,
      required: true,
      trim: true,
    },
    omr: {
      type: Number,
      required: true,
      min: 0,
    },
    cmr: {
      type: Number,
      required: true,
      min: 0,
    },
    testing: {
      type: Number,
      required: true,
      min: 0,
    },
    writtenNet: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

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
      enum: ['A', 'B', 'C', 'Day End'],
    },
    pump: {
      type: String,
      required: true,
      enum: ['1', '2', '3', '4', '5', '6'],
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
    expense: {
      type: Number,
      default: 0,
      min: 0,
    },
    nozzleReadings: {
      type: [nozzleReadingSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('ShiftEntry', shiftEntrySchema);
