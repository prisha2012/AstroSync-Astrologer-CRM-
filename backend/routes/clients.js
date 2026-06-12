const express = require('express');
const Client = require('../models/Client');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all clients
router.get('/', auth, async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query;
    const query = { astrologer: req.user.id };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;

    const total = await Client.countDocuments(query);
    const clients = await Client.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ clients, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single client
router.get('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, astrologer: req.user.id });
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create client
router.post('/', auth, async (req, res) => {
  try {
    const client = new Client({ ...req.body, astrologer: req.user.id });
    await client.save();
    res.status(201).json(client);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update client
router.put('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, astrologer: req.user.id },
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json(client);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete client
router.delete('/:id', auth, async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({ _id: req.params.id, astrologer: req.user.id });
    if (!client) return res.status(404).json({ message: 'Client not found' });
    res.json({ message: 'Client deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
