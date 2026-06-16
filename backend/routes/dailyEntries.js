import express from 'express';
import DailyEntry from '../models/DailyEntry.js';

const router = express.Router();

const toNumber = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return value;
  const normalized = value.replace(/,/g, '').trim();
  if (!normalized) return value;
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? value : parsed;
};

const normalizeNozzleReadings = (rawReadings) => {
  if (!Array.isArray(rawReadings)) return [];
  return rawReadings.map(reading => ({
    nozzleId: String(reading?.nozzleId || '').trim(),
    nozzleName: String(reading?.nozzleName || '').trim(),
    omr: toNumber(reading?.omr),
    cmr: toNumber(reading?.cmr),
    testing: toNumber(reading?.testing),
    writtenNet: toNumber(reading?.writtenNet),
  }));
};

const normalizeExpenseItems = (rawItems) => {
  if (!Array.isArray(rawItems)) return [];
  return rawItems
    .map((item) => ({
      name: String(item?.name || '').trim(),
      amount: toNumber(item?.amount),
    }))
    .filter((item) => item.name && typeof item.amount === 'number' && !Number.isNaN(item.amount));
};

router.post('/', async (req, res) => {
  try {
    const payload = {
      ...req.body,
      date: String(req.body?.date || '').trim(),
      speed: toNumber(req.body?.speed),
      ms: toNumber(req.body?.ms),
      hsd: toNumber(req.body?.hsd),
      cash: toNumber(req.body?.cash),
      lubricant: toNumber(req.body?.lubricant) || 0,
      phonePe: toNumber(req.body?.phonePe),
      fleetCard: toNumber(req.body?.fleetCard),
      expense: toNumber(req.body?.expense) || 0,
      expenseItems: normalizeExpenseItems(req.body?.expenseItems),
      nozzleReadings: normalizeNozzleReadings(req.body?.nozzleReadings),
    };

    const entry = await DailyEntry.create(payload);
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'A daily entry for this date already exists.' });
    }
    const validationErrors = error?.errors ? Object.values(error.errors).map(item => item.message) : [];
    res.status(400).json({ success: false, error: 'Failed to create daily entry', message: error.message, validationErrors });
  }
});

router.get('/', async (req, res) => {
  try {
    const entries = await DailyEntry.find().sort({ date: -1, createdAt: -1 });
    res.json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch daily entries', message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedEntry = await DailyEntry.findByIdAndDelete(req.params.id);
    if (!deletedEntry) return res.status(404).json({ success: false, error: 'Daily entry not found' });
    res.json({ success: true, message: 'Daily entry deleted', data: deletedEntry });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete daily entry', message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const payload = {
      ...req.body,
      date: String(req.body?.date || '').trim(),
      speed: toNumber(req.body?.speed),
      ms: toNumber(req.body?.ms),
      hsd: toNumber(req.body?.hsd),
      cash: toNumber(req.body?.cash),
      lubricant: toNumber(req.body?.lubricant) || 0,
      phonePe: toNumber(req.body?.phonePe),
      fleetCard: toNumber(req.body?.fleetCard),
      expense: toNumber(req.body?.expense) || 0,
      expenseItems: normalizeExpenseItems(req.body?.expenseItems),
      nozzleReadings: normalizeNozzleReadings(req.body?.nozzleReadings),
    };

    const updatedEntry = await DailyEntry.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!updatedEntry) return res.status(404).json({ success: false, error: 'Daily entry not found' });
    res.json({ success: true, data: updatedEntry });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'A daily entry for this date already exists.' });
    }
    const validationErrors = error?.errors ? Object.values(error.errors).map(item => item.message) : [];
    res.status(400).json({ success: false, error: 'Failed to update daily entry', message: error.message, validationErrors });
  }
});

export default router;
