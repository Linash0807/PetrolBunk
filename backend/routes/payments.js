import express from 'express';
import Payment from '../models/Payment.js';

const router = express.Router();

// Create a new payment record
router.post('/', async (req, res) => {
  try {
    const { customerName, amount, paymentMethod, fuelType, quantityLiters, transactionId, notes, pumpEntryId } = req.body;

    // Validate required fields
    if (!customerName || amount === undefined || !paymentMethod || !fuelType || quantityLiters === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newPayment = new Payment({
      customerName,
      amount,
      paymentMethod,
      fuelType,
      quantityLiters,
      transactionId,
      notes,
      pumpEntryId
    });

    const savedPayment = await newPayment.save();
    res.status(201).json({ success: true, data: savedPayment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create payment', message: error.message });
  }
});

// Get all payments
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('pumpEntryId')
      .sort({ paymentDate: -1 });
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments', message: error.message });
  }
});

// Get single payment by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const payment = await Payment.findById(id).populate('pumpEntryId');
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payment', message: error.message });
  }
});

// Get payments by customer name
router.get('/customer/:customerName', async (req, res) => {
  try {
    const { customerName } = req.params;
    const payments = await Payment.find({ customerName }).sort({ paymentDate: -1 });
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch payments', message: error.message });
  }
});

// Update payment
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, transactionId, notes } = req.body;

    const updatedPayment = await Payment.findByIdAndUpdate(
      id,
      { status, transactionId, notes },
      { new: true, runValidators: true }
    ).populate('pumpEntryId');

    if (!updatedPayment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ success: true, data: updatedPayment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update payment', message: error.message });
  }
});

// Delete payment
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedPayment = await Payment.findByIdAndDelete(id);
    
    if (!deletedPayment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({ success: true, message: 'Payment deleted', data: deletedPayment });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete payment', message: error.message });
  }
});

// Get payment statistics for a date range
router.get('/stats/date-range/:startDate/:endDate', async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    
    const payments = await Payment.find({
      paymentDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    });

    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalQuantity = payments.reduce((sum, payment) => sum + payment.quantityLiters, 0);
    const totalTransactions = payments.length;

    res.json({ 
      success: true, 
      data: {
        totalAmount,
        totalQuantity,
        totalTransactions,
        payments
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch statistics', message: error.message });
  }
});

export default router;
