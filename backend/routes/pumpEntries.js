import express from 'express';
import PumpEntry from '../models/PumpEntry.js';

const router = express.Router();

// Create a new pump entry
router.post('/', async (req, res) => {
  try {
    const { nozzleNumber, openingReading, fuelType, pricePerLiter } = req.body;

    // Validate required fields
    if (!nozzleNumber || openingReading === undefined || !fuelType || pricePerLiter === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newEntry = new PumpEntry({
      nozzleNumber,
      openingReading,
      fuelType,
      pricePerLiter
    });

    const savedEntry = await newEntry.save();
    res.status(201).json({ success: true, data: savedEntry });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create pump entry', message: error.message });
  }
});

// Get all pump entries
router.get('/', async (req, res) => {
  try {
    const entries = await PumpEntry.find().sort({ entryDate: -1 });
    res.json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch entries', message: error.message });
  }
});

// Get pump entries by nozzle number
router.get('/nozzle/:nozzleNumber', async (req, res) => {
  try {
    const { nozzleNumber } = req.params;
    const entries = await PumpEntry.find({ nozzleNumber }).sort({ entryDate: -1 });
    res.json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch entries', message: error.message });
  }
});

// Get single pump entry by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const entry = await PumpEntry.findById(id);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json({ success: true, data: entry });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch entry', message: error.message });
  }
});

// Update pump entry
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { closingReading, quantitySold, status } = req.body;

    const updatedEntry = await PumpEntry.findByIdAndUpdate(
      id,
      { closingReading, quantitySold, status },
      { new: true, runValidators: true }
    );

    if (!updatedEntry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json({ success: true, data: updatedEntry });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update entry', message: error.message });
  }
});

// Delete pump entry
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedEntry = await PumpEntry.findByIdAndDelete(id);
    
    if (!deletedEntry) {
      return res.status(404).json({ error: 'Entry not found' });
    }

    res.json({ success: true, message: 'Entry deleted', data: deletedEntry });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete entry', message: error.message });
  }
});

// Get pump entries for a date range
router.get('/date-range/:startDate/:endDate', async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const entries = await PumpEntry.find({
      entryDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    }).sort({ entryDate: -1 });
    
    res.json({ success: true, data: entries });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch entries', message: error.message });
  }
});

export default router;
