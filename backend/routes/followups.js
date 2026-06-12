const express = require('express');
const FollowUp = require('../models/FollowUp');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all follow-ups
router.get('/', auth, async (req, res) => {
  try {
    const { status, priority } = req.query;
    const query = { astrologer: req.user.id };
    if (status) query.status = status;
    if (priority) query.priority = priority;

    // Auto-mark overdue
    await FollowUp.updateMany(
      { astrologer: req.user.id, dueDate: { $lt: new Date() }, status: 'Pending' },
      { status: 'Overdue' }
    );

    const followUps = await FollowUp.find(query)
      .populate('client', 'name email phone')
      .populate('consultation', 'type date')
      .sort({ dueDate: 1 });

    res.json(followUps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create follow-up
router.post('/', auth, async (req, res) => {
  try {
    const followUp = new FollowUp({ ...req.body, astrologer: req.user.id });
    await followUp.save();
    const populated = await followUp.populate('client', 'name email phone');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update follow-up
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.body.status === 'Completed') req.body.completedAt = new Date();
    const followUp = await FollowUp.findOneAndUpdate(
      { _id: req.params.id, astrologer: req.user.id },
      req.body,
      { new: true }
    ).populate('client', 'name email phone');
    if (!followUp) return res.status(404).json({ message: 'Follow-up not found' });
    res.json(followUp);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete follow-up
router.delete('/:id', auth, async (req, res) => {
  try {
    await FollowUp.findOneAndDelete({ _id: req.params.id, astrologer: req.user.id });
    res.json({ message: 'Follow-up deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
