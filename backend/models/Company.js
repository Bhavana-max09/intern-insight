const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: String,
  industry: String,
  size: String,          // e.g. "1000-5000"
  headquarters: String,
  avgStipend: Number,    // monthly in INR
  culture: [String],     // ["remote-friendly", "fast-paced"]
  techStack: [String],
  rating: { type: Number, min: 0, max: 5 },
  description: String,
  website: String
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
