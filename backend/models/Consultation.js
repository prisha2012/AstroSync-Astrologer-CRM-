const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  astrologer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  date: { type: Date, required: true },
  duration: { type: Number, default: 60 }, // in minutes
  type: {
    type: String,
    enum: ['Birth Chart Reading', 'Compatibility', 'Career', 'Health', 'Finance', 'Relationship', 'Annual Forecast', 'General', 'Vastu', 'Numerology', 'Tarot'],
    default: 'General'
  },
  mode: { type: String, enum: ['In-Person', 'Video Call', 'Phone', 'Chat'], default: 'In-Person' },
  status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled', 'No-Show'], default: 'Scheduled' },
  fee: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Refunded'], default: 'Pending' },
  notes: { type: String, default: '' },
  remedies: [{ type: String }],
  predictions: { type: String, default: '' },
  followUpRequired: { type: Boolean, default: false },
  followUpDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

consultationSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Consultation', consultationSchema);
