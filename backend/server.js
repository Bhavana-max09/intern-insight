const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Use Google DNS (router DNS can't resolve MongoDB SRV records)

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors({
  origin: ['https://intern-insight.vercel.app', 'http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// Global request logger middleware
app.use((req, res, next) => {
  console.log(`📡 [API REQUEST] ${req.method} ${req.url}`);
  next();
});

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

app.get('/api/seed-database', async (req, res) => {
  try {
    const { seed } = require('./seed/seedData');
    await seed();
    res.json({ message: '✅ Database seeded with 31 companies and 62 internships!' });
  } catch(err) {
    console.error('Seed error:', err);
    res.status(500).json({ message: err.message });
  }
});

// Start server immediately regardless of DB status
app.listen(process.env.PORT || 5000, () => {
  console.log(`🚀 Server running on port ${process.env.PORT || 5000}`);
});

// Connect to MongoDB separately
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log('📦 Database:', mongoose.connection.name);
    const { startReminderCron } = require('./utils/emailReminder');
    startReminderCron();
  })
  .catch(err => {
    console.log('❌ MongoDB connection FAILED:', err.message);
    console.log('⚠️  Server is running but DB features are unavailable.');
    console.log('👉 Fix: Go to cloud.mongodb.com → Network Access → Add Current IP');
  });