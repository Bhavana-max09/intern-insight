import { useEffect, useState } from 'react';
import api from '../api/axios';
import SkillBadge from '../components/SkillBadge';
import { useAuth } from '../context/AuthContext';

export default function SkillMatcher() {
  const { refetchUser } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [userSkills, setUserSkills] = useState([]);
  const [newSkill, setNewSkill] = useState({ name: '', level: 'beginner' });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('predictions');
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [predRes, profileRes] = await Promise.all([
        api.get('/match/predict'),
        api.get('/users/profile')
      ]);
      setPredictions(predRes.data);
      setUserSkills(profileRes.data.skills || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const addSkill = async () => {
    if (!newSkill.name.trim()) return;
    const updated = [...userSkills.filter(s => s.name !== newSkill.name), newSkill];
    await api.put('/users/skills', { skills: updated });
    setUserSkills(updated);
    setNewSkill({ name: '', level: 'beginner' });
    await Promise.all([loadData(), refetchUser()]);
  };

  const removeSkill = async (skillName) => {
    const updated = userSkills.filter(s => s.name !== skillName);
    await api.put('/users/skills', { skills: updated });
    setUserSkills(updated);
    await Promise.all([loadData(), refetchUser()]);
  };

  const uploadResume = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setUploadMessage('❌ Only PDF files allowed!');
      return;
    }

    setUploading(true);
    setUploadMessage('');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const { data } = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setUploadMessage(`✅ ${data.message} — ${data.newSkillsAdded} new skills added!`);
      await Promise.all([loadData(), refetchUser()]);
    } catch (err) {
      setUploadMessage('❌ Failed to parse resume. Try again!');
    }

    setUploading(false);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Skill Matcher</h1>
      <p className="text-gray-500 mb-6">
        Add skills manually or upload your resume to auto-detect skills
      </p>

      {/* Resume Upload */}
      <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-4 mb-6">
        <h2 className="font-semibold text-indigo-700 mb-2">
          📄 Upload Resume — Auto Extract Skills
        </h2>
        <p className="text-sm text-indigo-500 mb-3">
          Upload your PDF resume and we'll automatically find your skills!
        </p>
        <div className="flex items-center gap-3">
          <label className="cursor-pointer bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
            {uploading ? 'Analyzing...' : '📤 Upload PDF Resume'}
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={uploadResume}
              disabled={uploading}
            />
          </label>
          {uploadMessage && (
            <span className={`text-sm font-medium ${
              uploadMessage.startsWith('✅') ? 'text-green-600' : 'text-red-500'
            }`}>
              {uploadMessage}
            </span>
          )}
        </div>
      </div>

      {/* Manual Skills Input */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <h2 className="font-semibold text-gray-700 mb-3">
          ✏️ Add Skills Manually
        </h2>
        <div className="flex gap-2 mb-3">
          <input
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1"
            placeholder="e.g. React, Python, SQL..."
            value={newSkill.name}
            onChange={e => setNewSkill(s => ({ ...s, name: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && addSkill()}
          />
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={newSkill.level}
            onChange={e => setNewSkill(s => ({ ...s, level: e.target.value }))}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
          <button
            onClick={addSkill}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
          >
            Add
          </button>
        </div>

        {/* Skills List */}
        <div className="flex flex-wrap gap-2">
          {userSkills.length === 0 && (
            <p className="text-sm text-gray-400">
              No skills added yet. Add manually or upload resume!
            </p>
          )}
          {userSkills.map(s => (
            <SkillBadge
              key={s.name}
              skill={s.name}
              level={s.level}
              onRemove={() => removeSkill(s.name)}
            />
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-200">
        {['predictions', 'gaps'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 px-3 text-sm font-medium capitalize border-b-2 transition-colors ${
              tab === t
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t === 'predictions' ? '✅ Eligible Internships' : '📚 Skill Gaps'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">
          Analyzing your skills...
        </div>
      ) : (
        <>
          {tab === 'predictions' && (
            <div className="space-y-3">
              {predictions.filter(p => p.eligible).length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  Add more skills to see eligible internships!
                </div>
              )}
              {predictions.filter(p => p.eligible).map(p => (
                <div
                  key={p.internship._id}
                  className="bg-white rounded-xl border border-green-200 p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {p.internship.role}
                    </h3>
                    <p className="text-sm text-indigo-600">
                      {p.internship.company?.name} · ₹{p.internship.stipend?.toLocaleString()}/mo
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {p.internship.mode} · {p.internship.duration}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">
                      {p.matchPercent}%
                    </div>
                    <div className="text-xs text-gray-500">match</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'gaps' && (
            <div className="space-y-3">
              {predictions
                .filter(p => !p.eligible && p.gaps.length > 0)
                .slice(0, 15)
                .map(p => (
                  <div
                    key={p.internship._id}
                    className="bg-white rounded-xl border border-orange-200 p-4"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-800">
                          {p.internship.role}
                        </h3>
                        <p className="text-sm text-indigo-600">
                          {p.internship.company?.name}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-orange-500">
                        {p.matchPercent}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">
                      Skills you need:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {p.gaps.map(g => (
                        <span
                          key={g.skill}
                          className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded-full"
                        >
                          {g.skill} ({g.have} → {g.needed})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}