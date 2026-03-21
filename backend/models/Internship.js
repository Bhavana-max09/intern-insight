const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  role: { type: String, required: true },
  description: String,
  requiredSkills: [{ name: String, level: String }],
  niceToHaveSkills: [String],
  stipend: Number,
  duration: String,   // "2 months", "6 months"
  location: String,
  mode: { type: String, enum: ['remote', 'onsite', 'hybrid'] },
  deadline: Date,
  openings: Number,
  applyLink: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Internship', internshipSchema);
