import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Dashboard() {
  const [internships, setInternships] = useState([]);
  const [filter, setFilter] = useState({ search: '', mode: '', minStipend: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInternships();
  }, []);

  const fetchInternships = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.search) params.set('search', filter.search);
      if (filter.mode) params.set('mode', filter.mode);
      if (filter.minStipend) params.set('minStipend', filter.minStipend);
      const { data } = await api.get(`/internships?${params}`);
      setInternships(data);
    } catch (err) {
      console.error('Failed to load internships:', err);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        All Internships ({internships.length})
      </h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6 bg-white p-4 rounded-xl border border-gray-200">
        <input
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-48"
          placeholder="Search roles..."
          value={filter.search}
          onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
        />
        <select
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
          value={filter.mode}
          onChange={e => setFilter(f => ({ ...f, mode: e.target.value }))}
        >
          <option value="">All modes</option>
          <option value="remote">Remote</option>
          <option value="hybrid">Hybrid</option>
          <option value="onsite">Onsite</option>
        </select>
        <input
          type="number"
          placeholder="Min stipend (₹)"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-40"
          value={filter.minStipend}
          onChange={e => setFilter(f => ({ ...f, minStipend: e.target.value }))}
        />
        <button
          onClick={fetchInternships}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
        >
          Search
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-20 text-gray-500">
          Loading internships...
        </div>
      )}

      {/* Empty State */}
      {!loading && internships.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          No internships found.
        </div>
      )}

      {/* Internship Cards */}
      {!loading && internships.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {internships.map(intern => (
            <div
              key={intern._id}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800">{intern.role}</h3>
                  <p className="text-sm text-indigo-600 font-medium">
                    {intern.company?.name}
                  </p>
                  <p className="text-xs text-gray-400">{intern.company?.industry}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    intern.mode === 'remote'
                      ? 'bg-green-100 text-green-700'
                      : intern.mode === 'hybrid'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {intern.mode}
                </span>
              </div>

              {/* Stipend & Duration */}
              <div className="text-sm text-gray-600 mb-3">
                <span className="font-bold text-gray-800 text-base">
                  ₹{intern.stipend?.toLocaleString()}
                </span>
                /mo · {intern.duration} · {intern.location}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-3">
                <span className="text-yellow-400 text-sm">★</span>
                <span className="text-xs text-gray-500">
                  {intern.company?.rating}
                </span>
                <span className="text-xs text-gray-400 ml-2">
                  {intern.openings} openings
                </span>
              </div>

              {/* Required Skills */}
              <div className="flex flex-wrap gap-1 mb-3">
                {intern.requiredSkills?.slice(0, 3).map(s => (
                  <span
                    key={s._id}
                    className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full"
                  >
                    {s.name}
                  </span>
                ))}
              </div>

              {/* Deadline */}
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>
                  Deadline: {new Date(intern.deadline).toLocaleDateString()}
                </span>
                <span
                  className={`font-medium ${
                    new Date(intern.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                      ? 'text-red-500'
                      : 'text-green-600'
                  }`}
                >
                  {new Date(intern.deadline) < new Date()
                    ? 'Expired'
                    : new Date(intern.deadline) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    ? 'Closing soon!'
                    : 'Open'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}