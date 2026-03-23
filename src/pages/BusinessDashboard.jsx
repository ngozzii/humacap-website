import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Briefcase, TrendingUp, Calendar, ArrowRight, LogOut, Shield, BookOpen, Award, Clock, MessageCircle, Send } from 'lucide-react';
import { COURSES_DATA } from '../data/courses';

export default function BusinessDashboard() {
  const { user, supabase } = useAuth();
  const navigate = useNavigate();
  const businessCourses = COURSES_DATA.filter(c => c.category?.includes('Consulting'));
  const [forumThreads, setForumThreads] = useState([]);
  const [forumLoading, setForumLoading] = useState(true);
  const [forumInput, setForumInput] = useState('');

  const fallbackThreads = useMemo(() => ([
    {
      id: 'biz-fallback-1',
      title: 'What KPI should we prioritize first for operational clarity?',
      author_name: 'Business Learner',
      created_at: new Date().toISOString(),
    },
  ]), []);

  useEffect(() => {
    const portal = localStorage.getItem('humacap_portal_preference');
    if (portal && portal !== 'business') {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    let mounted = true;
    const loadForum = async () => {
      try {
        const { data, error } = await supabase
          .from('course_forum_threads')
          .select('id, title, author_name, created_at')
          .eq('course_id', 'business-general')
          .order('created_at', { ascending: false })
          .limit(6);

        if (error || !data) {
          if (mounted) setForumThreads(fallbackThreads);
        } else if (mounted) {
          setForumThreads(data.length ? data : []);
        }
      } catch (_err) {
        if (mounted) setForumThreads(fallbackThreads);
      } finally {
        if (mounted) setForumLoading(false);
      }
    };
    loadForum();
    return () => { mounted = false; };
  }, [supabase, fallbackThreads]);

  const postForumQuestion = async () => {
    const title = forumInput.trim();
    if (!title) return;
    const optimistic = {
      id: `biz-local-${Date.now()}`,
      title,
      author_name: user?.email?.split('@')?.[0] || 'Business Learner',
      created_at: new Date().toISOString(),
    };
    setForumThreads(prev => [optimistic, ...prev].slice(0, 6));
    setForumInput('');
    try {
      const { data } = await supabase
        .from('course_forum_threads')
        .insert({
          course_id: 'business-general',
          author_id: user?.id || null,
          author_name: optimistic.author_name,
          title,
          body: title,
        })
        .select('id, title, author_name, created_at')
        .single();

      if (data) {
        setForumThreads(prev => prev.map(t => (t.id === optimistic.id ? data : t)));
      }
    } catch (_err) {
      // Keep optimistic item so user still sees their post.
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F6F7FB', fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <div style={{ background: '#0C1B33', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <img src="/logo.jpg" alt="Humacap" style={{ height: 30, width: 'auto', objectFit: 'contain', borderRadius: 6, background: 'white', padding: 1 }} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => navigate('/business-consulting')} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.82)', fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}>
            Business Path
          </button>
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.82)', fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <LogOut size={13} />
            Sign Out
          </button>
        </div>
      </div>

      <div style={{ padding: 24 }}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 18 }}>
          <span style={{ display: 'inline-block', fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: '#C49A2A', background: 'rgba(196,154,42,0.12)', border: '1px solid rgba(196,154,42,0.24)', padding: '4px 10px', borderRadius: 999 }}>
            Business Learning Workspace
          </span>
          <h1 style={{ margin: '10px 0 4px', fontFamily: "'DM Serif Display', serif", fontSize: 28, color: '#0C1B33' }}>
            Welcome, {user?.email?.split('@')?.[0] || 'Leader'}
          </h1>
          <p style={{ margin: 0, fontSize: 13, color: '#6B7A96' }}>
            Async business learning for teams and executives. Same strategy framework, fully self-paced.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 270px', gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#0C1B33', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              <Briefcase size={13} color="#C49A2A" />
              Company Learning
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {businessCourses.map((course, i) => {
                const progress = i === 0 ? 20 : 0;
                const C = 24, R = 2 * Math.PI * C;
                const offset = R - (progress / 100) * R;
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    style={{ background: 'white', borderRadius: 12, border: '1px solid rgba(12,27,51,0.08)', overflow: 'hidden', cursor: 'pointer' }}
                    onClick={() => navigate(`/dashboard-business/course/${course.id}`)}
                  >
                    <div style={{ height: 110, background: '#0C1B33', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <div style={{ position: 'absolute', fontFamily: "'DM Serif Display', serif", fontSize: 28, color: 'rgba(196,154,42,0.08)', letterSpacing: 4, textTransform: 'uppercase', userSelect: 'none' }}>HUMACAP</div>
                      <div style={{ width: 50, height: 50, borderRadius: 12, background: 'rgba(196,154,42,0.16)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1 }}>
                        <Shield size={24} color="#C49A2A" />
                      </div>
                    </div>
                    <div style={{ padding: 14 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: '#C49A2A', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: 5 }}>
                        Executive Advisory
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: '#0C1B33', marginBottom: 8 }}>{course.title}</div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#6B7A96', marginBottom: 10 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Clock size={11} color="#C49A2A" /> 8 lessons</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Award size={11} color="#C49A2A" /> Async Track</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ flexShrink: 0, position: 'relative', width: 36, height: 36 }}>
                          <svg width="36" height="36" viewBox="0 0 60 60" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="30" cy="30" r={C} fill="none" stroke="#E5E7EB" strokeWidth="4" strokeDasharray={R} strokeDashoffset="0" />
                            <circle cx="30" cy="30" r={C} fill="none" stroke="#C49A2A" strokeWidth="4" strokeLinecap="round" strokeDasharray={R} strokeDashoffset={offset} />
                          </svg>
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#0C1B33' }}>{progress}%</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10.5, color: '#6B7A96', fontWeight: 500, marginBottom: 3 }}>
                            {i === 0 ? '1 of 5 units published' : 'Not started'}
                          </div>
                          <div style={{ height: 4, background: '#E9ECF0', borderRadius: 2, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${progress}%`, background: '#C49A2A', borderRadius: 2 }} />
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); navigate(`/dashboard-business/course/${course.id}`); }}
                        style={{ width: '100%', background: '#0C1B33', color: 'white', border: 'none', borderRadius: 7, padding: '9px', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      >
                        Open track <ArrowRight size={12} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid rgba(12,27,51,0.08)', overflow: 'hidden' }}>
              <div style={{ background: '#0C1B33', padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 7 }}>
                <Calendar size={13} color="#C49A2A" />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'white' }}>Upcoming Cohorts</span>
              </div>
              <div style={{ padding: '12px 14px' }}>
                {[
                  { mo: 'APR', dy: 2, title: 'Leadership Operations Sprint', time: '11:00 AM EST' },
                  { mo: 'APR', dy: 9, title: 'KPI & Metrics Deep Dive', time: '1:00 PM EST' },
                  { mo: 'APR', dy: 16, title: 'Execution Strategy Workshop', time: '3:00 PM EST' },
                ].map((ev, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: i < 2 ? '1px dashed rgba(12,27,51,0.08)' : 'none' }}>
                    <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 28 }}>
                      <div style={{ fontSize: 9, fontWeight: 600, color: '#6B7A96', textTransform: 'uppercase' }}>{ev.mo}</div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: '#0C1B33', lineHeight: 1.1 }}>{ev.dy}</div>
                    </div>
                    <div style={{ width: 1, background: 'rgba(12,27,51,0.08)', alignSelf: 'stretch', flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#0C1B33' }}>{ev.title}</div>
                      <div style={{ fontSize: 11, color: '#C49A2A', fontWeight: 600, marginTop: 2 }}>{ev.time} · Live</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 12, border: '1px solid rgba(12,27,51,0.08)', overflow: 'hidden' }}>
              <div style={{ background: '#0C1B33', padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 7 }}>
                <TrendingUp size={13} color="#C49A2A" />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'white' }}>Business Track Progress</span>
              </div>
              <div style={{ padding: '12px 14px' }}>
                {businessCourses.map((c, i) => (
                  <div key={c.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderBottom: i < businessCourses.length - 1 ? '1px dashed rgba(12,27,51,0.08)' : 'none' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(196,154,42,0.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BookOpen size={15} color="#C49A2A" strokeWidth={1.5} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#0C1B33', lineHeight: 1.3, marginBottom: 1 }}>{c.title}</div>
                      <div style={{ fontSize: 11, color: '#6B7A96' }}>{i === 0 ? '1 of 5 units published' : 'Not started'}</div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#C49A2A', flexShrink: 0 }}>{i === 0 ? '20%' : '0%'}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ border: '1px dashed rgba(12,27,51,0.12)', borderRadius: 10, padding: 14, background: '#FFFCF5' }}>
              <h4 style={{ fontSize: 12.5, fontWeight: 700, color: '#0C1B33', marginBottom: 4 }}>Need 1-on-1 support?</h4>
              <p style={{ fontSize: 11.5, color: '#6B7A96', lineHeight: 1.55, marginBottom: 9 }}>
                Book an executive strategy session for your organization.
              </p>
              <button
                onClick={() => navigate('/contact', { state: { from: '/dashboard-business' } })}
                style={{ background: 'none', border: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 700, color: '#C49A2A', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
              >
                Contact us for 1-on-1 <ArrowRight size={12} />
              </button>
            </div>

            <div style={{ background: 'white', borderRadius: 12, border: '1px solid rgba(12,27,51,0.08)', overflow: 'hidden' }}>
              <div style={{ background: '#0C1B33', padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 7 }}>
                <MessageCircle size={13} color="#C49A2A" />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'white' }}>Business Discussion</span>
              </div>
              <div style={{ padding: '12px 14px' }}>
                <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
                  <input
                    value={forumInput}
                    onChange={(e) => setForumInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') postForumQuestion(); }}
                    placeholder="Ask a business question..."
                    style={{ flex: 1, border: '1px solid rgba(12,27,51,0.14)', borderRadius: 7, padding: '7px 9px', fontSize: 11.5 }}
                  />
                  <button
                    onClick={postForumQuestion}
                    style={{ border: 'none', borderRadius: 7, padding: '0 10px', background: 'rgba(196,154,42,0.14)', color: '#0C1B33', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Send size={12} />
                    Post
                  </button>
                </div>

                {forumLoading ? (
                  <p style={{ margin: 0, fontSize: 11, color: '#6B7A96' }}>Loading discussion…</p>
                ) : forumThreads.length === 0 ? (
                  <p style={{ margin: 0, fontSize: 11, color: '#6B7A96' }}>No questions yet.</p>
                ) : (
                  forumThreads.map((t, i) => (
                    <div key={t.id} style={{ padding: '7px 0', borderBottom: i < forumThreads.length - 1 ? '1px dashed rgba(12,27,51,0.1)' : 'none' }}>
                      <div style={{ fontSize: 11.5, fontWeight: 600, color: '#0C1B33', lineHeight: 1.4 }}>{t.title}</div>
                      <div style={{ fontSize: 10, color: '#6B7A96', marginTop: 2 }}>
                        {t.author_name || 'Business Learner'} • {new Date(t.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
