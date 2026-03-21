const router = require('express').Router();
const Groq = require('groq-sdk');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Internship = require('../models/Internship');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { targetCompany, targetRole } = req.body;
    const user = await User.findById(req.user.id);

    const userSkills = user.skills
      .map(s => `${s.name} (${s.level})`)
      .join(', ');

    const internships = await Internship.find({ isActive: true })
      .populate('company', 'name techStack');

    const targetInternships = internships.filter(i =>
      i.company?.name?.toLowerCase().includes(targetCompany.toLowerCase())
    );

    const requiredSkills = targetInternships.flatMap(i =>
      i.requiredSkills.map(s => `${s.name} (${s.level})`)
    );

    const uniqueRequired = [...new Set(requiredSkills)].join(', ');

    const prompt = `
You are a career advisor helping a student get an internship.

Student's current skills: ${userSkills || 'None mentioned'}
Target company: ${targetCompany}
Target role: ${targetRole}
Required skills for this role: ${uniqueRequired || 'General software engineering skills'}

Create a personalized 8-week learning roadmap to help this student get the internship.

Return ONLY a valid JSON object like this with no extra text or markdown:
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

    console.log('🤖 Generating roadmap with Groq...');

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 2000,
    });

    const responseText = completion.choices[0]?.message?.content || '';
    console.log('🤖 Groq response received');

    const cleanJson = responseText
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();

    const roadmap = JSON.parse(cleanJson);

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
