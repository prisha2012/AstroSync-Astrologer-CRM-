const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  astrologer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, lowercase: true, trim: true, default: '' },
  phone: { type: String, trim: true, default: '' },
  dateOfBirth: { type: Date },
  timeOfBirth: { type: String, default: '' },
  placeOfBirth: { type: String, default: '' },
  gender: { type: String, enum: ['Male', 'Female', 'Other', ''], default: '' },
  address: { type: String, default: '' },
  zodiacSign: { type: String, default: '' },
  risingSign: { type: String, default: '' },
  moonSign: { type: String, default: '' },
  tags: [{ type: String }],
  notes: { type: String, default: '' },
  status: { type: String, enum: ['Active', 'Inactive', 'New'], default: 'New' },
  source: { type: String, enum: ['Referral', 'Website', 'Social Media', 'Walk-in', 'Other'], default: 'Other' },
  totalConsultations: { type: Number, default: 0 },
  lastConsultationDate: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

clientSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Client', clientSchema);
