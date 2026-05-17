const router = require('express').Router();
const Internship = require('../models/Internship');

router.get('/', async (req, res) => {
  try {
    const { company, mode, minStipend, maxStipend, search } = req.query;
    const filter = { isActive: true };
    if (company) filter.company = company;
    if (mode) filter.mode = mode;
    if (minStipend || maxStipend) {
      filter.stipend = {};
      if (minStipend) filter.stipend.$gte = Number(minStipend);
      if (maxStipend) filter.stipend.$lte = Number(maxStipend);
    }
    if (search) filter.role = { $regex: search, $options: 'i' };
    const internships = await Internship.find(filter)
      .populate('company', 'name logo industry avgStipend rating headquarters techStack')
      .sort({ deadline: 1 });
    res.json(internships);
  } catch (err) {
    console.error('Internships error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id).populate('company');
    res.json(internship);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;