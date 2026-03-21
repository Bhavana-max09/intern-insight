const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Company = require('../models/Company');
const Internship = require('../models/Internship');

console.log('Connecting to:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI);

const companies = [
  { name: 'Google', industry: 'Tech', size: '100000+', headquarters: 'Mountain View, CA', avgStipend: 120000, techStack: ['Python', 'Go', 'Kubernetes', 'BigQuery'], rating: 4.8, culture: ['innovative', 'remote-friendly'] },
  { name: 'Microsoft', industry: 'Tech', size: '100000+', headquarters: 'Redmond, WA', avgStipend: 110000, techStack: ['C#', 'Azure', 'TypeScript', 'Python'], rating: 4.6, culture: ['inclusive', 'hybrid'] },
  { name: 'Amazon', industry: 'E-commerce/Cloud', size: '100000+', headquarters: 'Seattle, WA', avgStipend: 100000, techStack: ['Java', 'AWS', 'Python', 'React'], rating: 4.2, culture: ['fast-paced', 'customer-obsessed'] },
  { name: 'Meta', industry: 'Social Media', size: '50000+', headquarters: 'Menlo Park, CA', avgStipend: 115000, techStack: ['React', 'Python', 'Hack', 'GraphQL'], rating: 4.3, culture: ['move-fast', 'data-driven'] },
  { name: 'Flipkart', industry: 'E-commerce', size: '30000+', headquarters: 'Bengaluru', avgStipend: 60000, techStack: ['Java', 'Scala', 'Kafka', 'React'], rating: 4.1, culture: ['startup-like', 'hybrid'] },
  { name: 'Zomato', industry: 'Foodtech', size: '5000+', headquarters: 'Gurugram', avgStipend: 40000, techStack: ['Python', 'Go', 'React Native', 'Redis'], rating: 3.8, culture: ['fast-paced', 'young'] },
  { name: 'Razorpay', industry: 'Fintech', size: '3000+', headquarters: 'Bengaluru', avgStipend: 50000, techStack: ['Node.js', 'React', 'Java', 'MySQL'], rating: 4.5, culture: ['engineering-first', 'remote-friendly'] },
  { name: 'CRED', industry: 'Fintech', size: '1000+', headquarters: 'Bengaluru', avgStipend: 55000, techStack: ['Kotlin', 'React', 'Python', 'Spark'], rating: 4.4, culture: ['design-focused', 'premium'] },
  { name: 'Swiggy', industry: 'Foodtech', size: '5000+', headquarters: 'Bengaluru', avgStipend: 45000, techStack: ['Go', 'React', 'Node.js', 'Kafka'], rating: 4.0, culture: ['hyper-growth', 'hybrid'] },
  { name: 'Paytm', industry: 'Fintech', size: '10000+', headquarters: 'Noida', avgStipend: 35000, techStack: ['Java', 'React', 'Python', 'MySQL'], rating: 3.6, culture: ['hustle', 'onsite'] },
  { name: 'Ola', industry: 'Mobility', size: '5000+', headquarters: 'Bengaluru', avgStipend: 40000, techStack: ['Python', 'Java', 'React Native', 'AWS'], rating: 3.7, culture: ['fast-paced', 'hybrid'] },
  { name: 'Meesho', industry: 'E-commerce', size: '3000+', headquarters: 'Bengaluru', avgStipend: 45000, techStack: ['Python', 'React', 'Go', 'GCP'], rating: 4.2, culture: ['mission-driven', 'flexible'] },
  { name: 'PhonePe', industry: 'Fintech', size: '3000+', headquarters: 'Bengaluru', avgStipend: 50000, techStack: ['Kotlin', 'Java', 'React', 'Kafka'], rating: 4.3, culture: ['product-led', 'hybrid'] },
  { name: 'Dream11', industry: 'Gaming/Sports', size: '1500+', headquarters: 'Mumbai', avgStipend: 50000, techStack: ['Python', 'React', 'Golang', 'Cassandra'], rating: 4.2, culture: ['sports-loving', 'fast-paced'] },
  { name: 'Zepto', industry: 'Quick Commerce', size: '2000+', headquarters: 'Mumbai', avgStipend: 45000, techStack: ['Node.js', 'React', 'Python', 'Redis'], rating: 3.9, culture: ['ultra-fast', 'startup'] },
  { name: 'Postman', industry: 'Developer Tools', size: '1000+', headquarters: 'San Francisco / Bengaluru', avgStipend: 70000, techStack: ['Node.js', 'React', 'Go', 'MongoDB'], rating: 4.6, culture: ['developer-first', 'remote-friendly'] },
  { name: 'Freshworks', industry: 'SaaS', size: '5000+', headquarters: 'Chennai', avgStipend: 40000, techStack: ['Ruby on Rails', 'React', 'MySQL', 'Redis'], rating: 4.2, culture: ['inclusive', 'hybrid'] },
  { name: 'Zoho', industry: 'SaaS', size: '10000+', headquarters: 'Chennai', avgStipend: 25000, techStack: ['Java', 'JavaScript', 'C++', 'MySQL'], rating: 4.0, culture: ['learn-everything', 'onsite'] },
  { name: 'Nvidia', industry: 'Semiconductors/AI', size: '30000+', headquarters: 'Santa Clara', avgStipend: 130000, techStack: ['CUDA', 'C++', 'Python', 'PyTorch'], rating: 4.7, culture: ['deep-tech', 'high-performance'] },
  { name: 'Adobe', industry: 'Software/Design', size: '25000+', headquarters: 'San Jose', avgStipend: 105000, techStack: ['Java', 'React', 'Python', 'ML'], rating: 4.5, culture: ['creative', 'hybrid'] },
  { name: 'Salesforce', industry: 'CRM/Cloud', size: '75000+', headquarters: 'San Francisco', avgStipend: 100000, techStack: ['Apex', 'JavaScript', 'Java', 'Python'], rating: 4.4, culture: ['ohana', 'remote-friendly'] },
  { name: 'JPMorgan', industry: 'Banking/Finance', size: '100000+', headquarters: 'New York', avgStipend: 95000, techStack: ['Java', 'Python', 'React', 'SQL'], rating: 4.1, culture: ['structured', 'prestige'] },
  { name: 'Goldman Sachs', industry: 'Investment Banking', size: '40000+', headquarters: 'New York', avgStipend: 100000, techStack: ['Python', 'Java', 'Slang', 'React'], rating: 4.2, culture: ['high-performance', 'prestige'] },
  { name: 'Samsung R&D', industry: 'Electronics/AI', size: '10000+', headquarters: 'Bengaluru', avgStipend: 40000, techStack: ['C++', 'Python', 'TensorFlow', 'Tizen'], rating: 4.0, culture: ['research', 'onsite'] },
  { name: 'Qualcomm', industry: 'Semiconductors', size: '40000+', headquarters: 'San Diego / Hyderabad', avgStipend: 55000, techStack: ['C', 'C++', 'Python', 'ARM'], rating: 4.3, culture: ['deep-tech', 'structured'] },
  { name: 'Atlassian', industry: 'Developer Tools', size: '10000+', headquarters: 'Sydney / Bengaluru', avgStipend: 85000, techStack: ['Java', 'React', 'Python', 'AWS'], rating: 4.5, culture: ['remote-first', 'team-anywhere'] },
  { name: 'Slack', industry: 'SaaS/Messaging', size: '2500+', headquarters: 'San Francisco', avgStipend: 100000, techStack: ['Node.js', 'React', 'Java', 'Hadoop'], rating: 4.5, culture: ['collaborative', 'remote-friendly'] },
  { name: 'Stripe', industry: 'Fintech', size: '8000+', headquarters: 'San Francisco / Dublin', avgStipend: 110000, techStack: ['Ruby', 'React', 'Go', 'Scala'], rating: 4.7, culture: ['api-first', 'documentation-driven'] },
  { name: 'Coinbase', industry: 'Crypto/Fintech', size: '5000+', headquarters: 'Remote-first', avgStipend: 105000, techStack: ['React', 'Go', 'Ruby', 'Solidity'], rating: 4.1, culture: ['remote-first', 'mission-driven'] },
  { name: 'Uber', industry: 'Mobility/Tech', size: '30000+', headquarters: 'San Francisco', avgStipend: 105000, techStack: ['Go', 'Python', 'React', 'Kafka'], rating: 4.2, culture: ['scale', 'global-ops'] },
  { name: 'Springworks', industry: 'HR Tech', size: '500+', headquarters: 'Bengaluru', avgStipend: 30000, techStack: ['React', 'Node.js', 'Python', 'MongoDB'], rating: 4.3, culture: ['startup', 'remote-friendly'] }
];

async function seed() {
  await Company.deleteMany();
  await Internship.deleteMany();

  const inserted = await Company.insertMany(companies);
  console.log(`✅ Seeded ${inserted.length} companies`);

  const internships = inserted.flatMap(company => [
    {
      company: company._id,
      role: 'Software Engineering Intern',
      description: `Build and ship features at ${company.name}`,
      requiredSkills: [
        { name: company.techStack[0], level: 'intermediate' },
        { name: 'Data Structures', level: 'intermediate' },
        { name: 'System Design', level: 'beginner' }
      ],
      niceToHaveSkills: [company.techStack[1] || 'Git'],
      stipend: company.avgStipend,
      duration: '2 months',
      location: company.headquarters,
      mode: company.culture.includes('remote-friendly') || company.culture.includes('remote-first') ? 'remote' : 'hybrid',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      openings: Math.floor(Math.random() * 10) + 2,
      isActive: true
    },
    {
      company: company._id,
      role: 'Data Science / ML Intern',
      description: `Work on ML models and analytics at ${company.name}`,
      requiredSkills: [
        { name: 'Python', level: 'intermediate' },
        { name: 'Machine Learning', level: 'beginner' },
        { name: 'SQL', level: 'beginner' }
      ],
      niceToHaveSkills: ['TensorFlow', 'Pandas', 'Spark'],
      stipend: Math.round(company.avgStipend * 0.9),
      duration: '3 months',
      location: company.headquarters,
      mode: 'hybrid',
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      openings: Math.floor(Math.random() * 5) + 1,
      isActive: true
    }
  ]);

  await Internship.insertMany(internships);
  console.log(`✅ Seeded ${internships.length} internships`);
  mongoose.disconnect();
  console.log('🎉 Database seeding complete!');
}
if (require.main === module) {
  seed().catch(console.error);
}

module.exports = { seed };