const router = require('express').Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
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

// Initialize Gemini GenAI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: { responseMimeType: 'application/json' }
});

router.post('/upload', authMiddleware, upload.single('resume'), async (req, res) => {
  try {
    console.log('📄 Resume upload received');

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    console.log('📄 File saved at:', req.file.path);
    const dataBuffer = fs.readFileSync(req.file.path);
    console.log('📄 PDF buffer size:', dataBuffer.length);

    let text = "";
    let extractedSkills = [];

    // 1. Try parsing text locally first (Fastest)
    try {
      const pdfParse = require('pdf-parse');
      const pdfData = await pdfParse(dataBuffer);
      text = pdfData.text || "";
    } catch (parseErr) {
      console.warn("⚠️ Local pdf-parse failed, falling back to direct PDF upload...", parseErr);
    }

    // 2. Choose parsing strategy
    if (text.trim().length > 100) {
      console.log('📄 Text extracted successfully, analyzing with Gemini...');
      const prompt = `
Analyze the following resume text and extract all professional and technical skills.
For each skill, determine the student's proficiency level: "beginner", "intermediate", or "advanced" based on context, years of experience, projects, or certifications listed.

Resume Text:
${text}

Return a valid JSON object matching the following structure:
{
  "skills": [
    { "name": "Skill Name", "level": "beginner" | "intermediate" | "advanced" }
  ]
}
      `;
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const jsonRes = JSON.parse(response.text().trim());
      extractedSkills = jsonRes.skills || [];
    } else {
      console.log('📄 Scanned or complex PDF layout. Analyzing PDF binary with Gemini...');
      const prompt = `
Analyze the attached resume PDF document and extract all professional and technical skills.
For each skill, determine the student's proficiency level: "beginner", "intermediate", or "advanced" based on context, years of experience, projects, or certifications listed.

Return a valid JSON object matching the following structure:
{
  "skills": [
    { "name": "Skill Name", "level": "beginner" | "intermediate" | "advanced" }
  ]
}
      `;
      
      const result = await model.generateContent([
        {
          inlineData: {
            data: dataBuffer.toString("base64"),
            mimeType: "application/pdf"
          }
        },
        prompt
      ]);
      const response = await result.response;
      const jsonRes = JSON.parse(response.text().trim());
      extractedSkills = jsonRes.skills || [];
    }

    console.log('📄 Cleaned extracted skills from Gemini:', extractedSkills);

    // Delete temp file
    if (fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    if (extractedSkills.length === 0) {
      return res.json({
        message: 'No skills found in resume',
        skills: [],
        newSkillsAdded: 0,
      });
    }

    // Normalize format
    const formattedExtracted = extractedSkills.map(s => ({
      name: s.name.charAt(0).toUpperCase() + s.name.slice(1),
      level: s.level ? s.level.toLowerCase() : 'beginner'
    }));

    // Update user profile skills
    const user = await User.findById(req.user.id);
    const existingSkillNames = user.skills.map(s => s.name.toLowerCase());
    
    const newSkills = formattedExtracted.filter(
      s => !existingSkillNames.includes(s.name.toLowerCase())
    );

    const updatedSkills = [...user.skills, ...newSkills];
    await User.findByIdAndUpdate(req.user.id, { skills: updatedSkills });

    res.json({
      message: `Found ${formattedExtracted.length} skills in your resume!`,
      extractedSkills: formattedExtracted,
      newSkillsAdded: newSkills.length,
    });
  } catch (err) {
    console.error('❌ Resume parse error:', err);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;