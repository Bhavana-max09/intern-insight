const router = require('express').Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Internship = require('../models/Internship');

// Initialize Gemini GenAI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: { responseMimeType: 'application/json' }
});

router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { targetCompany, targetRole } = req.body;
    if (!targetCompany || !targetRole) {
      return res.status(400).json({ message: 'Target company and role are required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userSkills = (user.skills || [])
      .map(s => `${s.name} (${s.level})`)
      .join(', ');

    const internships = await Internship.find({ isActive: true })
      .populate('company', 'name techStack');

    const targetInternships = internships.filter(i =>
      i.company && i.company.name && i.company.name.toLowerCase().includes(targetCompany.toLowerCase())
    );

    const requiredSkills = targetInternships.flatMap(i =>
      (i.requiredSkills || []).map(s => `${s.name || s} (${s.level || 'intermediate'})`)
    );

    const uniqueRequired = [...new Set(requiredSkills)].join(', ');

    const prompt = `
You are a career advisor helping a student get an internship.

Student's current skills: ${userSkills || 'None mentioned'}
Target company: ${targetCompany}
Target role: ${targetRole}
Required skills for this role: ${uniqueRequired || 'General software engineering skills'}

Create a personalized 8-week learning roadmap to help this student get the internship.

Return a valid JSON object matching the following structure:
{
  "summary": "2-3 sentence overview of the plan",
  "skillGaps": ["skill1", "skill2", "skill3"],
  "weeks": [
    {
      "week": 1,
      "title": "Week title",
      "focus": "Main focus area",
      "tasks": ["task1", "task2", "task3"],
      "resources": ["resource1", "resource2"],
      "goal": "What student should achieve by end of week"
    }
  ],
  "tips": ["tip1", "tip2", "tip3"]
}
    `;

    console.log('🤖 Generating roadmap with Gemini...');

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text();

    console.log('🤖 Gemini response received');

    // Clean JSON response (handles potential markdown wrapping)
    let cleanJson = responseText.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.substring(7);
    }
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.substring(3);
    }
    if (cleanJson.endsWith('```')) {
      cleanJson = cleanJson.substring(0, cleanJson.length - 3);
    }
    cleanJson = cleanJson.trim();

    let roadmap;
    try {
      roadmap = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.error('❌ Failed to parse roadmap JSON:', parseErr);
      return res.status(500).json({
        success: false,
        message: 'Failed to parse roadmap JSON',
        rawResponse: cleanJson,
      });
    }

    res.json({
      success: true,
      targetCompany,
      targetRole,
      roadmap,
    });
  } catch (err) {
    console.error('❌ Roadmap generation error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
