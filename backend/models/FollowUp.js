const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema({
  astrologer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  consultation: { type: mongoose.Schema.Types.ObjectId, ref: 'Consultation' },
  dueDate: { type: Date, required: true },
  type: { type: String, enum: ['Call', 'Message', 'Email', 'Meeting'], default: 'Call' },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Completed', 'Overdue', 'Cancelled'], default: 'Pending' },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FollowUp', followUpSchema);
