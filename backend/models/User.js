const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  skills: [{ name: String, level: { type: String, enum: ['beginner','intermediate','advanced'] } }],
  goals: [{ company: String, role: String, targetDate: Date }],
  internshipsDone: [{
    company: String,
    role: String,
    startDate: Date,
    endDate: Date,
    skills: [String]
  }],
  upskillProgress: [{
    skill: String,
    targetLevel: String,
    currentLevel: String,
    percentComplete: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

