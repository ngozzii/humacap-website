import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Calendar, BookOpen, Award, TrendingUp, Clock, LogOut } from 'lucide-react';
import { COURSES_DATA } from '../data/courses';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, supabase } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  const learningCourses = COURSES_DATA.filter(c => c.price > 0 && !c.category?.includes('Consulting'));
  const completedCourses = 0;
  const inProgressCourses = Math.min(1, learningCourses.length);
  const totalHours = learningCourses.length * 6;
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'N/A';

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 768px)');
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);
    updateIsMobile();
    mediaQuery.addEventListener('change', updateIsMobile);
    return () => mediaQuery.removeEventListener('change', updateIsMobile);
  }, []);

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

      <div style={{
        maxWidth: 1080,
        margin: '0 auto',
        padding: isMobile ? 16 : 24,
        width: '100%',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '340px 1fr',
        gap: isMobile ? 20 : 20,
        boxSizing: 'border-box',
      }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{
          background: 'white',
          borderRadius: isMobile ? 16 : 14,
          border: '1px solid rgba(12,27,51,0.08)',
          padding: isMobile ? 20 : 20,
          boxShadow: isMobile ? '0 8px 24px rgba(12,27,51,0.08)' : 'none',
          textAlign: isMobile ? 'center' : 'left',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'center' : 'center',
            gap: isMobile ? 12 : 14,
            marginBottom: isMobile ? 20 : 14,
          }}>
            <div style={{
              width: isMobile ? 108 : 64,
              height: isMobile ? 108 : 64,
              borderRadius: '50%',
              background: '#17C3B2',
              color: '#0C1B33',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: isMobile ? 36 : 24,
              marginBottom: isMobile ? 4 : 0,
              flexShrink: 0,
            }}>
              {user?.email?.[0]?.toUpperCase() || 'S'}
            </div>
            <div style={{ width: isMobile ? '100%' : 'auto' }}>
              <h2 style={{
                margin: 0,
                color: '#0C1B33',
                fontFamily: "'DM Serif Display', serif",
                fontSize: isMobile ? 22 : 24,
                whiteSpace: 'normal',
                wordBreak: 'keep-all',
                lineHeight: 1.2,
              }}>
                Student Profile
              </h2>
              <p style={{ margin: '10px 0 0', color: '#52627A', fontSize: 12.5, lineHeight: 1.7 }}>Humacap Learning Portal</p>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid rgba(12,27,51,0.08)',
            paddingTop: isMobile ? 16 : 12,
            display: 'grid',
            gap: isMobile ? 12 : 10,
            justifyItems: isMobile ? 'center' : 'stretch',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0C1B33', fontSize: 13, justifyContent: isMobile ? 'center' : 'flex-start' }}>
              <Mail size={14} color="#17C3B2" />
              {user?.email || 'No email'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#0C1B33', fontSize: 13, justifyContent: isMobile ? 'center' : 'flex-start' }}>
              <Calendar size={14} color="#17C3B2" />
              Member since {memberSince}
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }} style={{ display: 'grid', gap: isMobile ? 20 : 16 }}>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: isMobile ? 14 : 12,
            justifyContent: isMobile ? 'center' : 'flex-start',
            alignItems: 'stretch',
            marginBottom: isMobile ? 4 : 0,
          }}>
            {[
              { label: 'Enrolled Courses', value: learningCourses.length, icon: <BookOpen size={15} color="#17C3B2" /> },
              { label: 'In Progress', value: inProgressCourses, icon: <Clock size={15} color="#17C3B2" /> },
              { label: 'Completed', value: completedCourses, icon: <Award size={15} color="#17C3B2" /> },
              { label: 'Study Hours', value: `${totalHours}h`, icon: <TrendingUp size={15} color="#17C3B2" /> },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'white',
                borderRadius: 12,
                border: '1px solid rgba(12,27,51,0.08)',
                padding: 14,
                width: isMobile ? 'calc(50% - 6px)' : 'calc(25% - 9px)',
                minWidth: isMobile ? 140 : 0,
                textAlign: isMobile ? 'center' : 'left',
                boxSizing: 'border-box',
                boxShadow: isMobile ? '0 4px 14px rgba(12,27,51,0.05)' : 'none',
              }}>
                <div style={{ marginBottom: 6 }}>{item.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#0C1B33' }}>{item.value}</div>
                <div style={{ fontSize: 11.5, color: '#52627A', lineHeight: isMobile ? 1.6 : 1.4 }}>{item.label}</div>
              </div>
            ))}
          </div>

          <div style={{
            background: 'white',
            borderRadius: 12,
            border: '1px solid rgba(12,27,51,0.08)',
            padding: isMobile ? 18 : 16,
            width: '100%',
            maxWidth: isMobile ? 500 : 'none',
            margin: isMobile ? '0 auto' : 0,
          }}>
            <h3 style={{ marginTop: 0, marginBottom: isMobile ? 16 : 10, color: '#0C1B33', fontSize: 14, fontWeight: 700, textAlign: isMobile ? 'center' : 'left' }}>
              My Courses
            </h3>
            {learningCourses.map((course, i) => (
              <div
                key={course.id}
                style={{
                  display: 'flex',
                  alignItems: isMobile ? 'stretch' : 'center',
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  gap: 10,
                  padding: isMobile ? '14px 0' : '10px 0',
                  borderBottom: i < learningCourses.length - 1 ? '1px dashed rgba(12,27,51,0.1)' : 'none',
                }}
              >
                <div style={{ width: '100%', textAlign: isMobile ? 'center' : 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#0C1B33', lineHeight: isMobile ? 1.7 : 1.35 }}>{course.title}</div>
                  <div style={{ fontSize: 11, color: '#52627A', lineHeight: isMobile ? 1.8 : 1.4 }}>{i === 0 ? 'In progress' : 'Not started'}</div>
                </div>
                <button
                  onClick={() => navigate(`/player/${course.id}`)}
                  style={{
                    background: '#0C1B33',
                    color: 'white',
                    border: 'none',
                    fontSize: 11.5,
                    fontWeight: 600,
                    padding: isMobile ? '10px 14px' : '7px 10px',
                    borderRadius: 7,
                    cursor: 'pointer',
                    width: isMobile ? '100%' : 'auto',
                    maxWidth: isMobile ? 220 : 'none',
                    margin: isMobile ? '0 auto' : 0,
                  }}
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
