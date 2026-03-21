const router = require('express').Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `resume_${Date.now()}.pdf`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const SKILL_KEYWORDS = [
  'python', 'javascript', 'typescript', 'java', 'c++', 'c#', 'ruby', 'go',
  'golang', 'rust', 'swift', 'kotlin', 'php', 'scala',
  'react', 'angular', 'vue', 'node.js', 'nodejs', 'express', 'django',
  'flask', 'spring', 'nextjs', 'next.js',
  'mongodb', 'mysql', 'postgresql', 'redis', 'sqlite',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes',
  'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras',
  'sql', 'html', 'css', 'git', 'linux', 'bash',
  'data structures', 'algorithms', 'system design', 'rest api',
  'graphql', 'kafka', 'spark', 'hadoop', 'pandas',
  'numpy', 'scikit-learn', 'react native', 'flutter', 'firebase',
];

const extractSkills = (text) => {
  const lowerText = text.toLowerCase();
  const foundSkills = [];

  SKILL_KEYWORDS.forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      const skillIndex = lowerText.indexOf(skill.toLowerCase());
      const context = lowerText.substring(
        Math.max(0, skillIndex - 50),
        skillIndex + 50
      );

      let level = 'beginner';
      if (
        context.includes('expert') ||
        context.includes('advanced') ||
        context.includes('senior')
      ) {
        level = 'advanced';
      } else if (
        context.includes('intermediate') ||
        context.includes('proficient') ||
        context.includes('experienced')
      ) {
        level = 'intermediate';
      }

      const formattedSkill =
        skill === 'nodejs' ? 'Node.js' :
        skill === 'nextjs' ? 'Next.js' :
        skill.charAt(0).toUpperCase() + skill.slice(1);

      foundSkills.push({ name: formattedSkill, level });
    }
  });

  return foundSkills.filter(
    (skill, index, self) =>
      index === self.findIndex(s =>
        s.name.toLowerCase() === skill.name.toLowerCase()
      )
  );
};

router.post('/upload', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    console.log('📄 Resume upload received');

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('📄 File saved at:', req.file.path);

    const dataBuffer = fs.readFileSync(req.file.path);
    console.log('📄 PDF buffer size:', dataBuffer.length);

    console.log('📄 Starting PDF parse...');

    // Require inside function to get fresh instance
    const pdfParse = require('pdf-parse');
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;

    console.log('📄 Extracted text length:', text.length);
    console.log('📄 First 200 chars:', text.substring(0, 200));

    const extractedSkills = extractSkills(text);
    console.log('📄 Found skills:', extractedSkills);

    fs.unlinkSync(req.file.path);

    if (extractedSkills.length === 0) {
      return res.json({
        message: 'No skills found in resume',
        skills: [],
        newSkillsAdded: 0,
      });
    }

    const user = await User.findById(req.user.id);
    const existingSkillNames = user.skills.map(s => s.name.toLowerCase());
    const newSkills = extractedSkills.filter(
      s => !existingSkillNames.includes(s.name.toLowerCase())
    );

    const updatedSkills = [...user.skills, ...newSkills];
    await User.findByIdAndUpdate(req.user.id, { skills: updatedSkills });

    res.json({
      message: `Found ${extractedSkills.length} skills in your resume!`,
      extractedSkills,
      newSkillsAdded: newSkills.length,
    });
  } catch (err) {
    console.error('❌ Resume parse error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;