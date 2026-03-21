const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Application = require('../models/Application');

router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/skills', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { skills: req.body.skills },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/internships-done', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { internshipsDone: req.body } },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/upskill', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const { skill, percentComplete, currentLevel } = req.body;
    const existing = user.upskillProgress.find(u => u.skill === skill);
    if (existing) {
      existing.percentComplete = percentComplete;
      existing.currentLevel = currentLevel;
      existing.lastUpdated = new Date();
    } else {
      user.upskillProgress.push({
        skill,
        percentComplete,
        currentLevel,
        targetLevel: req.body.targetLevel
      });
    }
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/applications', authMiddleware, async (req, res) => {
  try {
    const app = await Application.findOneAndUpdate(
      { user: req.user.id, internship: req.body.internshipId },
      { status: req.body.status, notes: req.body.notes, appliedDate: new Date() },
      { upsert: true, new: true }
    );
    res.json(app);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/applications', authMiddleware, async (req, res) => {
  try {
    const apps = await Application.find({ user: req.user.id })
      .populate({
        path: 'internship',
        populate: { path: 'company', select: 'name logo' }
      });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;