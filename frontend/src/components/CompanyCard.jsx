import { useState } from 'react';
import api from '../api/axios';

export default function CompanyCard({ company, internships = [] }) {
  const [expanded, setExpanded] = useState(false);
  const [skillRecs, setSkillRecs] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSkillRecs = async () => {
    if (skillRecs) {
      setExpanded(!expanded);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.get(`/match/company/${company._id}`);
      setSkillRecs(data);
      setExpanded(true);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const modeColor = {
    remote: 'bg-green-100 text-green-700',
    hybrid: 'bg-yellow-100 text-yellow-700',
    onsite: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-bold text-gray-800 text-lg">{company.name}</h3>
            <p className="text-xs text-gray-500">{company.industry}</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-indigo-600">
              ₹{company.avgStipend?.toLocaleString()}
            </div>
            <div className="text-xs text-gray-400">per month</div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <span
              key={i}
              className={`text-sm ${
                i < Math.floor(company.rating)
                  ? 'text-yellow-400'
                  : 'text-gray-200'
              }`}
            >
              ★
            </span>
          ))}
          <span className="text-xs text-gray-500 ml-1">{company.rating}</span>
        </div>

        {/* Location & Size */}
        <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
          <span>📍 {company.headquarters}</span>
          <span>👥 {company.size}</span>
        </div>

        {/* Culture Tags */}
        <div className="flex flex-wrap gap-1 mb-3">
          {company.culture?.map(c => (
            <span
              key={c}
              className="bg-purple-50 text-purple-700 text-xs px-2 py-0.5 rounded-full"
            >
              {c}
            </span>
          ))}
        </div>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-1">
          {company.techStack?.map(tech => (
            <span
              key={tech}
              className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full font-medium"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Internships count */}
      <div className="px-4 py-2 bg-gray-50 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {internships.length} open role{internships.length !== 1 ? 's' : ''}
        </span>
        <button
          onClick={fetchSkillRecs}
          disabled={loading}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
        >
          {loading
            ? 'Loading...'
            : expanded
            ? 'Hide skill tips ▲'
            : 'What skills do I need? ▼'}
        </button>
      </div>

      {/* Internship Roles */}
      {internships.length > 0 && (
        <div className="px-4 py-2 space-y-2">
          {internships.map(intern => (
            <div
              key={intern._id}
              className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0"
            >
              <div>
                <p className="text-sm font-medium text-gray-700">{intern.role}</p>
                <p className="text-xs text-gray-400">
                  {intern.duration} · {intern.openings} openings
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    modeColor[intern.mode] || 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {intern.mode}
                </span>
                <p className="text-xs text-gray-400 mt-0.5">
                  Due {new Date(intern.deadline).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Skill Recommendations */}
      {expanded && skillRecs && (
        <div className="px-4 py-3 bg-orange-50 border-t border-orange-100">
          <p className="text-xs font-semibold text-orange-700 mb-2">
            🎯 Skills to learn for {company.name}
          </p>
          {skillRecs.skillsToLearn?.length === 0 ? (
            <p className="text-xs text-green-600 font-medium">
              ✅ You already have all required skills!
            </p>
          ) : (
            <div className="space-y-1">
              {skillRecs.skillsToLearn?.slice(0, 5).map(s => (
                <div key={s.skill} className="flex items-center justify-between">
                  <span className="text-xs text-gray-700 font-medium">
                    {s.skill}
                  </span>
                  <span className="text-xs text-orange-600">
                    Need: {s.level} · Wanted in {s.count} role
                    {s.count !== 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}