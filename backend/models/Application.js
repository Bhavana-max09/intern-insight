const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  internship: { type: mongoose.Schema.Types.ObjectId, ref: 'Internship', required: true },
  status: {
    type: String,
    enum: ['saved', 'applied', 'interview', 'offered', 'rejected'],
    default: 'saved'
  },
  appliedDate: Date,
  notes: String
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);