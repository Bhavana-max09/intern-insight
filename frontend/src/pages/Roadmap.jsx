import { useState } from 'react';
import api from '../api/axios';

export default function Roadmap() {
  const [form, setForm] = useState({ targetCompany: '', targetRole: '' });
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateRoadmap = async () => {
    if (!form.targetCompany || !form.targetRole) {
      setError('Please enter both company and role!');
      return;
    }
    setLoading(true);
    setError('');
    setRoadmap(null);
    try {
      const { data } = await api.post('/roadmap/generate', form);
      setRoadmap(data);
    } catch (err) {
      setError('Failed to generate roadmap. Try again!');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">
        🤖 AI Learning Roadmap
      </h1>
      <p className="text-gray-500 mb-6">
        Get a personalized week-by-week study plan to land your dream internship!
      </p>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Target Company
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. Google, Razorpay, Microsoft"
              value={form.targetCompany}
              onChange={e => setForm(f => ({ ...f, targetCompany: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600 mb-1 block">
              Target Role
            </label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              placeholder="e.g. Software Engineering Intern"
              value={form.targetRole}
              onChange={e => setForm(f => ({ ...f, targetRole: e.target.value }))}
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
          onClick={generateRoadmap}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? '🤖 AI is generating your roadmap...' : '✨ Generate My Learning Roadmap'}
        </button>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">🤖</div>
          <p className="text-gray-600 font-medium">
            AI is analyzing your skills and creating your personalized roadmap...
          </p>
          <p className="text-gray-400 text-sm mt-2">This takes about 10-15 seconds</p>
        </div>
      )}

      {roadmap && (
        <div className="space-y-6">
          <div className="bg-indigo-50 rounded-xl border border-indigo-200 p-5">
            <h2 className="font-bold text-indigo-800 text-lg mb-2">
              📋 Your Roadmap to {roadmap.targetCompany}
            </h2>
            <p className="text-indigo-700 text-sm">{roadmap.roadmap.summary}</p>
          </div>

          {roadmap.roadmap.skillGaps?.length > 0 && (
            <div className="bg-red-50 rounded-xl border border-red-200 p-5">
              <h2 className="font-bold text-red-700 mb-3">
                ⚠️ Skills You Need to Learn
              </h2>
              <div className="flex flex-wrap gap-2">
                {roadmap.roadmap.skillGaps.map((skill, i) => (
                  <span key={i} className="bg-red-100 text-red-700 text-sm px-3 py-1 rounded-full font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="font-bold text-gray-800 text-lg mb-4">
              📅 8-Week Learning Plan
            </h2>
            <div className="space-y-4">
              {roadmap.roadmap.weeks?.map((week, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-indigo-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                      Week {week.week}
                    </span>
                    <h3 className="font-semibold text-gray-800">{week.title}</h3>
                  </div>
                  <p className="text-sm text-indigo-600 font-medium mb-3">
                    Focus: {week.focus}
                  </p>
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 mb-2">Tasks:</p>
                    <ul className="space-y-1">
                      {week.tasks?.map((task, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="text-green-500 mt-0.5">✓</span>
                          {task}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {week.resources?.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-500 mb-2">Resources:</p>
                      <div className="flex flex-wrap gap-2">
                        {week.resources.map((resource, j) => (
                          <span key={j} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                            📚 {resource}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="bg-green-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-green-700">
                      🎯 Goal: {week.goal}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {roadmap.roadmap.tips?.length > 0 && (
            <div className="bg-yellow-50 rounded-xl border border-yellow-200 p-5">
              <h2 className="font-bold text-yellow-800 mb-3">💡 Pro Tips</h2>
              <ul className="space-y-2">
                {roadmap.roadmap.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-yellow-800">
                    <span>•</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}