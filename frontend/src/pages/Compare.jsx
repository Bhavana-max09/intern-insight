import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Compare() {
  const [companies, setCompanies] = useState([]);
  const [selected, setSelected] = useState([]);
  const [details, setDetails] = useState([]);

  useEffect(() => {
    api.get('/internships').then(({ data }) => {
      const unique = [...new Map(data.map(d => [d.company._id, d.company])).values()];
      setCompanies(unique);
    });
  }, []);

  const toggleCompany = (company) => {
    const exists = selected.find(s => s._id === company._id);
    if (exists) {
      setSelected(s => s.filter(c => c._id !== company._id));
      setDetails(d => d.filter(c => c._id !== company._id));
    } else if (selected.length < 4) {
      setSelected(s => [...s, company]);
      // Fetch skill recommendations for this company
      api.get(`/match/company/${company._id}`).then(({ data }) => {
        setDetails(d => [...d, { _id: company._id, ...data }]);
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Compare Companies</h1>
      <p className="text-gray-500 mb-6">Select up to 4 companies to compare side by side</p>

      {/* Company Selector */}
      <div className="flex flex-wrap gap-2 mb-8">
        {companies.map(c => (
          <button key={c._id} onClick={() => toggleCompany(c)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
              selected.find(s => s._id === c._id)
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'}`}>
            {c.name}
          </button>
        ))}
      </div>

      {selected.length >= 2 && (
        <div className={`grid gap-4 grid-cols-${selected.length}`} style={{ gridTemplateColumns: `repeat(${selected.length}, minmax(0,1fr))` }}>
          {selected.map(company => {
            const detail = details.find(d => d._id === company._id);
            return (
              <div key={company._id} className="bg-white rounded-xl border border-gray-200 p-4">
                <h2 className="font-bold text-lg text-indigo-600 mb-1">{company.name}</h2>
                <p className="text-xs text-gray-500 mb-3">{company.industry}</p>

                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between"><span className="text-gray-500">Avg stipend</span><span className="font-medium">₹{company.avgStipend?.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Rating</span><span className="font-medium">⭐ {company.rating}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Location</span><span className="font-medium text-right text-xs">{company.headquarters}</span></div>
                </div>

                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Tech Stack</p>
                  <div className="flex flex-wrap gap-1">
                    {company.techStack?.map(t => (
                      <span key={t} className="bg-indigo-50 text-indigo-700 text-xs px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>

                {detail && detail.skillsToLearn?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">🎯 Top skills to learn</p>
                    <div className="space-y-1">
                      {detail.skillsToLearn.slice(0, 5).map(s => (
                        <div key={s.skill} className="flex justify-between text-xs">
                          <span className="text-red-600">{s.skill}</span>
                          <span className="text-gray-400">{s.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {selected.length === 0 && (
        <div className="text-center py-16 text-gray-400">Select at least 2 companies to compare</div>
      )}
    </div>
  );
}