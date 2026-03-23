import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Calendar, BookOpen, Award, TrendingUp, Clock, LogOut } from 'lucide-react';
import { COURSES_DATA } from '../data/courses';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, supabase } = useAuth();

  const learningCourses = COURSES_DATA.filter(c => c.price > 0 && !c.category?.includes('Consulting'));
  const completedCourses = 0;
  const inProgressCourses = Math.min(1, learningCourses.length);
  const totalHours = learningCourses.length * 6;
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'N/A';

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6F9', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ background: '#0C1B33', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.78)', fontSize: 12.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
        >
          <ArrowLeft size={15} />
          Back to dashboard
        </button>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 18, color: 'white', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#17C3B2' }} />
          Humacap Profile
        </div>
        <button
          onClick={handleLogout}
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)', fontSize: 12, fontWeight: 500, padding: '6px 12px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <LogOut size={13} />
          Sign Out
        </button>
      </div>

      <div style={{ maxWidth: 1080, margin: '0 auto', padding: 24, display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'white', borderRadius: 14, border: '1px solid rgba(12,27,51,0.08)', padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: '#17C3B2', color: '#0C1B33', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 24 }}>
              {user?.email?.[0]?.toUpperCase() || 'S'}
            </div>
            <div>
              <h2 style={{ margin: 0, color: '#0C1B33', fontFamily: "'DM Serif Display', serif", fontSize: 24 }}>Student Profile</h2>
              <p style={{ margin: '4px 0 0', color: '#6B7A96', fontSize: 12.5 }}>Humacap Learning Portal</p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(12,27,51,0.08)', paddingTop: 12, display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0C1B33', fontSize: 13 }}>
              <Mail size={14} color="#17C3B2" />
              {user?.email || 'No email'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0C1B33', fontSize: 13 }}>
              <Calendar size={14} color="#17C3B2" />
              Member since {memberSince}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} style={{ display: 'grid', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12 }}>
            {[
              { label: 'Enrolled Courses', value: learningCourses.length, icon: <BookOpen size={15} color="#17C3B2" /> },
              { label: 'In Progress', value: inProgressCourses, icon: <Clock size={15} color="#17C3B2" /> },
              { label: 'Completed', value: completedCourses, icon: <Award size={15} color="#17C3B2" /> },
              { label: 'Study Hours', value: `${totalHours}h`, icon: <TrendingUp size={15} color="#17C3B2" /> },
            ].map((item, i) => (
              <div key={i} style={{ background: 'white', borderRadius: 12, border: '1px solid rgba(12,27,51,0.08)', padding: 14 }}>
                <div style={{ marginBottom: 6 }}>{item.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0C1B33' }}>{item.value}</div>
                <div style={{ fontSize: 11.5, color: '#6B7A96' }}>{item.label}</div>
              </div>
            ))}
          </div>

          <div style={{ background: 'white', borderRadius: 12, border: '1px solid rgba(12,27,51,0.08)', padding: 16 }}>
            <h3 style={{ marginTop: 0, marginBottom: 10, color: '#0C1B33', fontSize: 14, fontWeight: 700 }}>My Courses</h3>
            {learningCourses.map((course, i) => (
              <div
                key={course.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: '10px 0',
                  borderBottom: i < learningCourses.length - 1 ? '1px dashed rgba(12,27,51,0.1)' : 'none',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0C1B33' }}>{course.title}</div>
                  <div style={{ fontSize: 11, color: '#6B7A96' }}>{i === 0 ? 'In progress' : 'Not started'}</div>
                </div>
                <button
                  onClick={() => navigate(`/player/${course.id}`)}
                  style={{ background: '#0C1B33', color: 'white', border: 'none', fontSize: 11.5, fontWeight: 600, padding: '7px 10px', borderRadius: 7, cursor: 'pointer' }}
                >
                  Open
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
