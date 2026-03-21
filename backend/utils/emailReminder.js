const nodemailer = require('nodemailer');
const cron = require('node-cron');
const Internship = require('../models/Internship');
const User = require('../models/User');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendReminderEmail = async (userEmail, userName, internships) => {
  const internshipList = internships
    .map(i => `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd;">${i.role}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">${i.company?.name}</td>
        <td style="padding: 8px; border: 1px solid #ddd;">₹${i.stipend?.toLocaleString()}/mo</td>
        <td style="padding: 8px; border: 1px solid #ddd; color: red; font-weight: bold;">
          ${new Date(i.deadline).toLocaleDateString()}
        </td>
      </tr>
    `)
    .join('');

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: '⚠️ InternInsight — Internship Deadlines in 3 Days!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #6366f1; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎯 InternInsight</h1>
          <p style="color: #e0e0ff; margin: 5px 0;">Deadline Reminder</p>
        </div>
        <div style="padding: 20px;">
          <h2>Hi ${userName}! 👋</h2>
          <p>These internships are closing in <strong style="color: red;">3 days or less!</strong></p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background: #f3f4f6;">
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Role</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Company</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Stipend</th>
                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Deadline</th>
              </tr>
            </thead>
            <tbody>
              ${internshipList}
            </tbody>
          </table>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000" 
               style="background: #6366f1; color: white; padding: 12px 24px; 
                      text-decoration: none; border-radius: 8px; font-weight: bold;">
              View & Apply Now →
            </a>
          </div>
          <p style="color: #666; font-size: 12px;">
            You're receiving this because you have an InternInsight account.
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ Reminder email sent to ${userEmail}`);
};

const checkDeadlines = async () => {
  try {
    console.log('🔍 Checking deadlines...');
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    const today = new Date();

    const urgentInternships = await Internship.find({
      isActive: true,
      deadline: {
        $gte: today,
        $lte: threeDaysFromNow,
      },
    }).populate('company', 'name');

    if (urgentInternships.length === 0) {
      console.log('No urgent deadlines found');
      return;
    }

    console.log(`Found ${urgentInternships.length} urgent internships`);
    const users = await User.find({});

    for (const user of users) {
      try {
        await sendReminderEmail(user.email, user.name, urgentInternships);
      } catch (err) {
        console.error(`❌ Failed to send to ${user.email}:`, err.message);
      }
    }
  } catch (err) {
    console.error('❌ Deadline check failed:', err.message);
  }
};

const startReminderCron = () => {
  cron.schedule('0 9 * * *', () => {
    console.log('⏰ Running daily deadline reminder...');
    checkDeadlines();
  });
  console.log('✅ Email reminder cron job started — runs daily at 9 AM');
};

module.exports = { startReminderCron, checkDeadlines };