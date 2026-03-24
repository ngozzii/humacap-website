import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

const ResourcesPage = () => {
  const navigate = useNavigate();
  return (
  <div className="page-container container">
    <div style={{ marginBottom: '2rem' }}>
      <button className="btn-back" onClick={() => navigate('/')}>
        <ArrowLeft size={16} /> Back to Home
      </button>
    </div>
    <div className="text-center max-w-2xl mx-auto mb-12">
      <span className="pill-badge">No Cost</span>
      <h2 className="text-3xl font-bold text-navy mt-4 mb-3">Free Resources</h2>
      <p className="text-lg text-gray-600">Downloadable guides, checklists, and videos to support your journey.</p>
    </div>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[
        { title: 'OSCE Study Guide 2026', type: 'PDF Guide', desc: 'Top 10 High-Yield Stations with structured frameworks for each scenario type.' },
        { title: 'Medication Safety Checklist', type: 'Checklist', desc: 'For Patients & Caregivers — PEBC® aligned review checklist.' },
        { title: 'Pharmacy Jurisprudence Quiz', type: 'Interactive', desc: 'Test your knowledge of Canadian pharmacy law and professional practice standards.' },
      ].map((res, i) => (
        <div key={i} className="glass-card hover-lift">
          <FileText size={32} className="text-teal mb-4" />
          <h3 className="font-bold text-navy mb-2">{res.title}</h3>
          <span className="text-xs font-bold bg-navy text-white px-2 py-1 rounded-full uppercase">{res.type}</span>
          <p className="text-sm mt-3 text-gray-600 leading-relaxed">{res.desc}</p>
          <button className="btn btn-text text-teal mt-4">Download &rarr;</button>
        </div>
      ))}
    </div>
  </div>
  );
};

export default ResourcesPage;
