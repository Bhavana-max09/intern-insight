const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

require('./models/User');
require('./models/Company');
require('./models/Internship');
require('./models/Application');

try {
  const authRoutes = require('./routes/auth');
  console.log('✅ auth routes loaded');
  app.use('/api/auth', authRoutes);
} catch(e) {
  console.log('❌ auth routes failed:', e.message);
}

try {
  const internshipRoutes = require('./routes/internships');
  console.log('✅ internship routes loaded');
  app.use('/api/internships', internshipRoutes);
} catch(e) {
  console.log('❌ internship routes failed:', e.message);
}

try {
  const userRoutes = require('./routes/users');
  console.log('✅ user routes loaded');
  app.use('/api/users', userRoutes);
} catch(e) {
  console.log('❌ user routes failed:', e.message);
}

try {
  const matchRoutes = require('./routes/match');
  console.log('✅ match routes loaded');
  app.use('/api/match', matchRoutes);
} catch(e) {
  console.log('❌ match routes failed:', e.message);
}

try {
  const resumeRoutes = require('./routes/resume');
  console.log('✅ resume routes loaded');
  app.use('/api/resume', resumeRoutes);
} catch(e) {
  console.log('❌ resume routes failed:', e.message);
}

try {
  const roadmapRoutes = require('./routes/roadmap');
  console.log('✅ roadmap routes loaded');
  app.use('/api/roadmap', roadmapRoutes);
} catch(e) {
  console.log('❌ roadmap routes failed:', e.message);
}

app.get('/api/health', (req, res) => {
  const state = mongoose.connection.readyState;
  const stateMap = {
    0: '❌ Disconnected',
    1: '✅ Connected',
    2: '⏳ Connecting',
    3: '⏳ Disconnecting',
  };
  res.json({
    status: stateMap[state],
    database: mongoose.connection.name,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
  });
});

app.get('/api/test-email', async (req, res) => {
  try {
    const { checkDeadlines } = require('./utils/emailReminder');
    await checkDeadlines();
    res.json({ message: '✅ Email check triggered! Check your inbox.' });
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log('📦 Database:', mongoose.connection.name);
    app.listen(process.env.PORT || 5000, () => {
      console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
      const { startReminderCron } = require('./utils/emailReminder');
      startReminderCron();
    });
  })
  .catch(err => {
    console.log('❌ MongoDB connection FAILED:', err.message);
  });
