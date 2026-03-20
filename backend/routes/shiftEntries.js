import express from 'express';
import ShiftEntry from '../models/ShiftEntry.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const entry = await ShiftEntry.create(req.body);
    res.status(201).json({ success: true, data: entry });
  } catch (error) {
    res.status(400).json({ success: false, error: 'Failed to create shift entry', message: error.message });
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
