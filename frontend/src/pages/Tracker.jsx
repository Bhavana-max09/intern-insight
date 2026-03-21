import { useEffect, useState } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts';
import api from '../api/axios';
import ProgressBar from '../components/ProgressBar';
import SkillBadge from '../components/SkillBadge';

export default function Tracker() {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [newInternship, setNewInternship] = useState({
    company: '',
    role: '',
    skills: '',
  });
  const [progressSkill, setProgressSkill] = useState({
    skill: '',
    percentComplete: 50,
    currentLevel: 'beginner',
    targetLevel: 'intermediate',
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [p, a] = await Promise.all([
        api.get('/users/profile'),
        api.get('/users/applications'),
      ]);
      setProfile(p.data);
      setApplications(a.data);
    } catch (err) {
      console.error(err);
    }
  };

  const addInternshipDone = async () => {
    if (!newInternship.company || !newInternship.role) return;
    await api.post('/users/internships-done', {
      ...newInternship,
      skills: newInternship.skills.split(',').map(s => s.trim()),
      startDate: new Date(),
      endDate: new Date(),
    });
    setNewInternship({ company: '', role: '', skills: '' });
    loadAll();
  };

  const updateProgress = async () => {
    if (!progressSkill.skill) return;
    await api.put('/users/upskill', progressSkill);
    loadAll();
  };

  const radarData =
    profile?.skills?.map(s => ({
      skill: s.name,
      level:
        s.level === 'advanced' ? 3 : s.level === 'intermediate' ? 2 : 1,
    })) || [];

  const statusColors = {
    saved: 'bg-gray-100 text-gray-700',
    applied: 'bg-blue-100 text-blue-700',
    interview: 'bg-yellow-100 text-yellow-700',
    offered: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-bold text-gray-800">
        My Progress Tracker
      </h1>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-indigo-50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-indigo-600">
            {profile?.internshipsDone?.length || 0}
          </div>
          <div className="text-sm text-gray-600 mt-1">Internships Done</div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-600">
            {profile?.skills?.length || 0}
          </div>
          <div className="text-sm text-gray-600 mt-1">Skills Tracked</div>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-orange-600">
            {applications.filter(
              a => a.status === 'applied' || a.status === 'interview'
            ).length}
          </div>
          <div className="text-sm text-gray-600 mt-1">Active Applications</div>
        </div>
      </div>

      {/* Skill Radar Chart */}
      {radarData.length > 2 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="font-semibold text-gray-700 mb-4">Skill Radar</h2>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 11 }} />
              <Radar
                dataKey="level"
                stroke="#6366f1"
                fill="#6366f1"
                fillOpacity={0.3}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Upskill Progress */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-700 mb-4">Upskill Progress</h2>
        <div className="space-y-4 mb-6">
          {profile?.upskillProgress?.length === 0 && (
            <p className="text-sm text-gray-400">
              No skills tracked yet. Add one below!
            </p>
          )}
          {profile?.upskillProgress?.map(u => (
            <ProgressBar
              key={u.skill}
              label={u.skill}
              percent={u.percentComplete}
              currentLevel={u.currentLevel}
              targetLevel={u.targetLevel}
              lastUpdated={u.lastUpdated}
              color="auto"
            />
          ))}
        </div>

        {/* Add Progress */}
        <div className="border-t border-gray-100 pt-4 space-y-2">
          <p className="text-sm font-medium text-gray-600">
            Update skill progress
          </p>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="Skill name (e.g. React)"
            value={progressSkill.skill}
            onChange={e =>
              setProgressSkill(s => ({ ...s, skill: e.target.value }))
            }
          />
          <div className="flex gap-2">
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1"
              value={progressSkill.currentLevel}
              onChange={e =>
                setProgressSkill(s => ({
                  ...s,
                  currentLevel: e.target.value,
                }))
              }
            >
              <option value="beginner">Current: Beginner</option>
              <option value="intermediate">Current: Intermediate</option>
              <option value="advanced">Current: Advanced</option>
            </select>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1"
              value={progressSkill.targetLevel}
              onChange={e =>
                setProgressSkill(s => ({
                  ...s,
                  targetLevel: e.target.value,
                }))
              }
            >
              <option value="beginner">Goal: Beginner</option>
              <option value="intermediate">Goal: Intermediate</option>
              <option value="advanced">Goal: Advanced</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="0"
              max="100"
              value={progressSkill.percentComplete}
              onChange={e =>
                setProgressSkill(s => ({
                  ...s,
                  percentComplete: Number(e.target.value),
                }))
              }
              className="flex-1"
            />
            <span className="text-sm font-medium text-indigo-600 w-12">
              {progressSkill.percentComplete}%
            </span>
          </div>
          <button
            onClick={updateProgress}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg text-sm hover:bg-indigo-700"
          >
            Save Progress
          </button>
        </div>
      </div>

      {/* Log Internship Done */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-700 mb-4">
          Log Completed Internship
        </h2>
        <div className="space-y-2">
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="Company name"
            value={newInternship.company}
            onChange={e =>
              setNewInternship(s => ({ ...s, company: e.target.value }))
            }
          />
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="Role / Position"
            value={newInternship.role}
            onChange={e =>
              setNewInternship(s => ({ ...s, role: e.target.value }))
            }
          />
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            placeholder="Skills gained (comma separated: React, Node.js, SQL)"
            value={newInternship.skills}
            onChange={e =>
              setNewInternship(s => ({ ...s, skills: e.target.value }))
            }
          />
          <button
            onClick={addInternshipDone}
            className="w-full bg-green-600 text-white py-2 rounded-lg text-sm hover:bg-green-700"
          >
            + Log Internship
          </button>
        </div>

        {/* Past Internships */}
        {profile?.internshipsDone?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-600 mb-2">
              Completed Internships
            </p>
            <div className="space-y-2">
              {profile.internshipsDone.map((intern, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{intern.role}</p>
                    <p className="text-xs text-gray-500">{intern.company}</p>
                  </div>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {intern.skills?.map(s => (
                      <SkillBadge
                        key={s}
                        skill={s}
                        level="beginner"
                        showLevel={false}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Applications Pipeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="font-semibold text-gray-700 mb-4">
          Application Pipeline
        </h2>
        {applications.length === 0 ? (
          <p className="text-sm text-gray-400">No applications yet.</p>
        ) : (
          <div className="space-y-2">
            {applications.map(app => (
              <div
                key={app._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-sm">
                    {app.internship?.role}
                  </p>
                  <p className="text-xs text-gray-500">
                    {app.internship?.company?.name}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    statusColors[app.status]
                  }`}
                >
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}