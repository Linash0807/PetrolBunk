import express from 'express';
import ShiftEntry from '../models/ShiftEntry.js';

const router = express.Router();

const normalizeShift = (rawShift) => {
  const value = String(rawShift || '').trim();
  if (!value) return value;

  if (value === 'A' || /^shift\s*a/i.test(value)) return 'A';
  if (value === 'B' || /^shift\s*b/i.test(value)) return 'B';
  if (value === 'C' || /^shift\s*c/i.test(value)) return 'C';
  if (/day\s*end/i.test(value)) return 'Day End';

  return value;
};

const toNumber = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return value;
  const normalized = value.replace(/,/g, '').trim();
  if (!normalized) return value;
  const parsed = Number(normalized);
  return Number.isNaN(parsed) ? value : parsed;
};

router.post('/', async (req, res) => {
  try {
    const payload = {
      ...req.body,
      bunk: String(req.body?.bunk || '').trim(),
      date: String(req.body?.date || '').trim(),
      shift: normalizeShift(req.body?.shift),
      employee: String(req.body?.employee || '').trim(),
      speed: toNumber(req.body?.speed),
      ms: toNumber(req.body?.ms),
      hsd: toNumber(req.body?.hsd),
      cash: toNumber(req.body?.cash),
      phonePe: toNumber(req.body?.phonePe),
      fleetCard: toNumber(req.body?.fleetCard),
    };

    const entry = await ShiftEntry.create(payload);
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    const validationErrors = error?.errors
      ? Object.values(error.errors).map((item) => item.message)
      : [];

    res.status(400).json({
      success: false,
      error: 'Failed to create shift entry',
      message: error.message,
      validationErrors,
    });
  }
});

router.get('/', async (req, res) => {
  try {
    const entries = await ShiftEntry.find().sort({ date: -1, createdAt: -1 });
    res.json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch shift entries', message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedEntry = await ShiftEntry.findByIdAndDelete(req.params.id);
    if (!deletedEntry) {
      return res.status(404).json({ success: false, error: 'Shift entry not found' });
    }

    res.json({ success: true, message: 'Shift entry deleted', data: deletedEntry });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete shift entry', message: error.message });
  }
});

export default router;
