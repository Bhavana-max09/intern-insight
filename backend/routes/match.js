const router = require('express').Router();
const authMiddleware = require('../middleware/auth');
const Internship = require('../models/Internship');
const User = require('../models/User');

router.get('/predict', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const userSkillMap = {};
    const levelScore = { beginner: 1, intermediate: 2, advanced: 3 };
    user.skills.forEach(s => {
      userSkillMap[s.name.toLowerCase()] = levelScore[s.level] || 1;
    });
    const internships = await Internship.find({ isActive: true }).populate('company', 'name logo avgStipend');
    const results = internships.map(intern => {
      const required = intern.requiredSkills;
      let matched = 0;
      let total = required.length;
      const gaps = [];
      required.forEach(req => {
        const userLevel = userSkillMap[req.name.toLowerCase()] || 0;
        const reqLevel = levelScore[req.level] || 1;
        if (userLevel >= reqLevel) {
          matched++;
        } else {
          gaps.push({
            skill: req.name,
            needed: req.level,
            have: userLevel === 0 ? 'none' : Object.keys(levelScore)[userLevel - 1]
          });
        }
      });
      const matchPercent = total > 0 ? Math.round((matched / total) * 100) : 100;
      return { internship: intern, matchPercent, gaps, eligible: matchPercent >= 70 };
    });
    results.sort((a, b) => b.matchPercent - a.matchPercent);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/company/:companyId', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const userSkillMap = {};
    const levelScore = { beginner: 1, intermediate: 2, advanced: 3 };
    user.skills.forEach(s => {
      userSkillMap[s.name.toLowerCase()] = levelScore[s.level] || 1;
    });
    const internships = await Internship.find({ company: req.params.companyId, isActive: true });
    const skillFreq = {};
    internships.forEach(intern => {
      intern.requiredSkills.forEach(req => {
        const key = req.name.toLowerCase();
        if (!skillFreq[key]) {
          skillFreq[key] = { skill: req.name, count: 0, level: req.level };
        }
        skillFreq[key].count++;
      });
    });
    const recommendations = Object.values(skillFreq)
      .map(s => ({
        ...s,
        userHas: userSkillMap[s.skill.toLowerCase()] || 0,
        gap: (levelScore[s.level] || 1) - (userSkillMap[s.skill.toLowerCase()] || 0)
      }))
      .filter(s => s.gap > 0)
      .sort((a, b) => b.count - a.count);
    res.json({ internships: internships.length, skillsToLearn: recommendations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;