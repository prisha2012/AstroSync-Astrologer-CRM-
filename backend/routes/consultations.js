const express = require('express');
const Consultation = require('../models/Consultation');
const Client = require('../models/Client');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all consultations
router.get('/', auth, async (req, res) => {
  try {
    const { client, status, page = 1, limit = 20, startDate, endDate } = req.query;
    const query = { astrologer: req.user.id };

    if (client) query.client = client;
    if (status) query.status = status;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const total = await Consultation.countDocuments(query);
    const consultations = await Consultation.find(query)
      .populate('client', 'name email phone zodiacSign')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ consultations, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get upcoming consultations
router.get('/upcoming', auth, async (req, res) => {
  try {
    const consultations = await Consultation.find({
      astrologer: req.user.id,
      date: { $gte: new Date() },
      status: 'Scheduled'
    })
      .populate('client', 'name email phone')
      .sort({ date: 1 })
      .limit(10);
    res.json(consultations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single consultation
router.get('/:id', auth, async (req, res) => {
  try {
    const consultation = await Consultation.findOne({ _id: req.params.id, astrologer: req.user.id })
      .populate('client');
    if (!consultation) return res.status(404).json({ message: 'Consultation not found' });
    res.json(consultation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create consultation
router.post('/', auth, async (req, res) => {
  try {
    const consultation = new Consultation({ ...req.body, astrologer: req.user.id });
    await consultation.save();

    // Update client stats
    await Client.findByIdAndUpdate(req.body.client, {
      $inc: { totalConsultations: 1 },
      lastConsultationDate: req.body.date,
      status: 'Active'
    });

    const populated = await consultation.populate('client', 'name email phone');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update consultation
router.put('/:id', auth, async (req, res) => {
  try {
    const consultation = await Consultation.findOneAndUpdate(
      { _id: req.params.id, astrologer: req.user.id },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    ).populate('client', 'name email phone');
    if (!consultation) return res.status(404).json({ message: 'Consultation not found' });
    res.json(consultation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete consultation
router.delete('/:id', auth, async (req, res) => {
  try {
    const consultation = await Consultation.findOneAndDelete({ _id: req.params.id, astrologer: req.user.id });
    if (!consultation) return res.status(404).json({ message: 'Consultation not found' });
    res.json({ message: 'Consultation deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
