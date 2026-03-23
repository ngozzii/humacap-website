import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Clock, Award, Layers } from 'lucide-react';

const COURSE_MAP = {
  'biz-audit': { title: 'The Growth Trap Audit', units: 5 },
  'biz-roadmap': { title: 'Strategic Alignment Roadmap', units: 8 },
  'biz-partnership': { title: 'Fractional Executive Partnership', units: 10 },
};

export default function BusinessCoursePlaceholder() {
  const navigate = useNavigate();
  const { courseId } = useParams();
  const course = COURSE_MAP[courseId] || { title: 'Business Course', units: 6 };

  return (
    <div style={{ minHeight: '100vh', background: '#F6F7FB', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ background: '#0C1B33', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px' }}>
        <button onClick={() => navigate('/dashboard-business')} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
          <ArrowLeft size={14} />
          Back to Business Dashboard
        </button>
        <img src="/logo.jpg" alt="Humacap" style={{ height: 28, width: 'auto', objectFit: 'contain', borderRadius: 6, background: 'white', padding: 1 }} />
      </div>
      <div style={{ maxWidth: 980, margin: '0 auto', padding: 24 }}>
        <h1 style={{ marginTop: 0, marginBottom: 8, color: '#0C1B33', fontFamily: "'DM Serif Display', serif", fontSize: 30 }}>
          {course.title}
        </h1>
        <p style={{ marginTop: 0, color: '#6B7A96', fontSize: 13 }}>
          Company asynchronous track placeholder. This is where the full business learning player will be available.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 14 }}>
          <div style={{ background: 'white', border: '1px solid rgba(12,27,51,0.08)', borderRadius: 10, padding: 12 }}>
            <Layers size={15} color="#C49A2A" />
            <div style={{ marginTop: 6, fontSize: 20, fontWeight: 800, color: '#0C1B33' }}>{course.units}</div>
            <div style={{ fontSize: 11.5, color: '#6B7A96' }}>Learning units</div>
          </div>
          <div style={{ background: 'white', border: '1px solid rgba(12,27,51,0.08)', borderRadius: 10, padding: 12 }}>
            <Clock size={15} color="#C49A2A" />
            <div style={{ marginTop: 6, fontSize: 20, fontWeight: 800, color: '#0C1B33' }}>Async</div>
            <div style={{ fontSize: 11.5, color: '#6B7A96' }}>Self-paced format</div>
          </div>
          <div style={{ background: 'white', border: '1px solid rgba(12,27,51,0.08)', borderRadius: 10, padding: 12 }}>
            <Award size={15} color="#C49A2A" />
            <div style={{ marginTop: 6, fontSize: 20, fontWeight: 800, color: '#0C1B33' }}>Track</div>
            <div style={{ fontSize: 11.5, color: '#6B7A96' }}>Company-ready pathway</div>
          </div>
        </div>

        <div style={{ marginTop: 14, background: 'white', border: '1px solid rgba(12,27,51,0.08)', borderRadius: 10, padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#C49A2A', marginBottom: 8 }}>
            Placeholder Modules
          </div>
          {Array.from({ length: course.units }).map((_, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: i < course.units - 1 ? '1px dashed rgba(12,27,51,0.12)' : 'none' }}>
              <BookOpen size={14} color="#C49A2A" />
              <span style={{ fontSize: 12.5, color: '#0C1B33' }}>Unit {i + 1}: Placeholder business content</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
