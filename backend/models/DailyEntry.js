import mongoose from 'mongoose';

const nozzleReadingSchema = new mongoose.Schema({
  nozzleId: { type: String, required: true },
  nozzleName: { type: String, required: true },
  omr: { type: Number, required: true, min: 0 },
  cmr: { type: Number, required: true, min: 0 },
  testing: { type: Number, default: 0, min: 0 },
  writtenNet: { type: Number, required: true, min: 0 }
}, { _id: false });

const dailyEntrySchema = new mongoose.Schema({
  date: { type: String, required: true, index: true, unique: true },
  speed: { type: Number, required: true, min: 0 },
  ms: { type: Number, required: true, min: 0 },
  hsd: { type: Number, required: true, min: 0 },
  cash: { type: Number, required: true, min: 0 },
  lubricant: { type: Number, default: 0, min: 0 },
  phonePe: { type: Number, required: true, min: 0 },
  fleetCard: { type: Number, required: true, min: 0 },
  expense: { type: Number, default: 0, min: 0 },
  nozzleReadings: { type: [nozzleReadingSchema], default: [] }
}, { timestamps: true });

export default mongoose.model('DailyEntry', dailyEntrySchema);
