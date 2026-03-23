import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Play, Clock, Award, Calendar, ArrowRight, TrendingUp, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { COURSES_DATA } from '../data/courses';

const COURSE_ACCESS_CODES = {
  'pharm-osce': 'PHARM2026',
  'tech-osce': 'TECH2026',
  'pharm-math': 'MATH2026',
};

const Dashboard = () => {
  const { user, supabase } = useAuth();
  const navigate = useNavigate();
  const enrolledCourses = COURSES_DATA.filter(c => c.price > 0 && !c.category?.includes('Consulting'));
  const freeCourses = COURSES_DATA.filter(c => c.isFree || c.price === 0);
  const learningCards = [...enrolledCourses, ...freeCourses];
  const [liveSessions, setLiveSessions] = useState([]);
  const [unlockedCourseIds, setUnlockedCourseIds] = useState(new Set());
  const [accessModalCourse, setAccessModalCourse] = useState(null);
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [accessCodeError, setAccessCodeError] = useState('');

  useEffect(() => {
    const portal = localStorage.getItem('humacap_portal_preference');
    if (portal === 'business') {
      navigate('/dashboard-business', { replace: true });
    }
  }, [navigate]);

  const fallbackSessions = useMemo(() => ([
    { id: 'fallback-1', title: 'OSCE Mock Session', starts_at: '2026-03-18T19:00:00-05:00', timezone: 'EST', join_url: '' },
    { id: 'fallback-2', title: 'Exam Math Drill', starts_at: '2026-03-21T13:00:00-05:00', timezone: 'EST', join_url: '' },
    { id: 'fallback-3', title: 'Group Case Review', starts_at: '2026-03-25T18:00:00-05:00', timezone: 'EST', join_url: '' },
  ]), []);

  useEffect(() => {
    let mounted = true;

    const loadLiveSessions = async () => {
      try {
        const { data, error } = await supabase
          .from('live_sessions')
          .select('id, title, starts_at, timezone, join_url, is_active')
          .order('starts_at', { ascending: true })
          .limit(5);

        if (error || !data || data.length === 0) {
          if (mounted) setLiveSessions(fallbackSessions);
          return;
        }

        if (mounted) {
          setLiveSessions(data.filter(s => !s.is_active || s.is_active).slice(0, 3));
        }
      } catch (_err) {
        if (mounted) setLiveSessions(fallbackSessions);
      }
    };

    loadLiveSessions();
    return () => {
      mounted = false;
    };
  }, [supabase, fallbackSessions]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const streakDays = [true, true, true, true, true, false, false];
  const formatSessionDate = (iso) => {
    const dt = new Date(iso);
    return {
      mo: dt.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
      dy: dt.getDate(),
      time: dt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    };
  };

  useEffect(() => {
    const key = `humacap_unlocked_${user?.id || 'anon'}`;
    const raw = localStorage.getItem(key);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) setUnlockedCourseIds(new Set(parsed));
    } catch (_err) {
      // Ignore bad local storage payloads.
    }
  }, [user?.id]);

  const persistUnlocked = (nextSet) => {
    const key = `humacap_unlocked_${user?.id || 'anon'}`;
    localStorage.setItem(key, JSON.stringify(Array.from(nextSet)));
  };

  const openCourse = (course, isFree) => {
    if (isFree) {
      navigate(`/player/${course.id}`);
      return;
    }

    if (unlockedCourseIds.has(course.id)) {
      navigate(`/player/${course.id}`);
      return;
    }

    setAccessModalCourse(course);
    setAccessCodeInput('');
    setAccessCodeError('');
  };

  const submitAccessCode = () => {
    if (!accessModalCourse) return;
    const expected = COURSE_ACCESS_CODES[accessModalCourse.id];
    const entered = accessCodeInput.trim().toUpperCase();
    if (!expected || entered !== expected) {
      setAccessCodeError('Incorrect access code. Please check and try again.');
      return;
    }

    const nextSet = new Set(unlockedCourseIds);
    nextSet.add(accessModalCourse.id);
    setUnlockedCourseIds(nextSet);
    persistUnlocked(nextSet);
    navigate(`/player/${accessModalCourse.id}`);
    setAccessModalCourse(null);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F4F6F9', fontFamily: "'DM Sans', system-ui, sans-serif" }}>

      {/* Top nav */}
      <div style={{ background: '#0C1B33', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <button
          onClick={() => navigate('/')}
          aria-label="Go to homepage"
          style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <img src="/logo.jpg" alt="Humacap" style={{ height: 30, width: 'auto', objectFit: 'contain', borderRadius: 6, background: 'white', padding: 1 }} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={() => navigate('/pharmacy')} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)', fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500, padding: '6px 14px', borderRadius: 6, cursor: 'pointer' }}>
            Browse Courses
          </button>
          <button onClick={handleLogout} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)', fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 500, padding: '6px 14px', borderRadius: 6, cursor: 'pointer' }}>
            Sign Out
          </button>
          <button
            onClick={() => navigate('/profile')}
            title="Open profile"
            style={{ width: 30, height: 30, borderRadius: '50%', background: '#17C3B2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#0C1B33', cursor: 'pointer', border: 'none' }}
          >
            {user?.email?.[0]?.toUpperCase() || 'S'}
          </button>
        </div>
      </div>

      <div style={{ padding: 24 }}>

        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 22 }}>
          <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#0C1B33', marginBottom: 3 }}>
            Good morning, Student
          </h1>
          <p style={{ fontSize: 13, color: '#6B7A96' }}>
            Logged in as <strong style={{ color: '#0C1B33' }}>{user?.email}</strong> — keep going, you're doing great.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 270px', gap: 20 }}>

          {/* COURSES */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#0C1B33', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              <Play size={13} fill="#17C3B2" color="#17C3B2" />
              My Learning
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {learningCards.map((course, i) => {
                const isFree = !!(course.isFree || course.price === 0);
                const isUnlocked = isFree || unlockedCourseIds.has(course.id);
                const progress = !isFree && i === 0 && isUnlocked ? 33 : 0;
                const C = 24, R = 2 * Math.PI * C;
                const offset = R - (progress / 100) * R;
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    style={{ background: 'white', borderRadius: 12, border: '1px solid rgba(12,27,51,0.08)', overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.15s', position: 'relative' }}
                    whileHover={{ boxShadow: '0 4px 20px rgba(12,27,51,0.10)', y: -2 }}
                    onClick={() => openCourse(course, isFree)}
                  >
                    {!isUnlocked && (
                      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 2, background: 'rgba(12,27,51,0.88)', color: 'white', borderRadius: 99, padding: '4px 8px', fontSize: 10.5, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Lock size={10} />
                        Locked
                      </div>
                    )}
                    {/* Thumbnail */}
                    <div style={{ height: 110, background: '#0C1B33', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
                      <div style={{ position: 'absolute', fontFamily: "'DM Serif Display', serif", fontSize: 28, color: 'rgba(23,195,178,0.07)', letterSpacing: 4, textTransform: 'uppercase', userSelect: 'none' }}>HUMACAP</div>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(23,195,178,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
                        <BookOpen size={24} color="#17C3B2" strokeWidth={1.5} />
                      </div>
                    </div>

                    {/* Body */}
                    <div style={{ padding: 14 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#17C3B2', marginBottom: 5 }}>
                        {isFree ? 'Free Courses' : 'PEBC® Coaching'}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0C1B33', marginBottom: 8, lineHeight: 1.35 }}>
                        {course.title}
                      </div>
                      <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#6B7A96', marginBottom: 10 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Clock size={11} color="#17C3B2" /> 6 modules
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                          <Award size={11} color="#17C3B2" /> Certificate
                        </span>
                      </div>

                      {/* Progress ring + bar */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <div style={{ flexShrink: 0, position: 'relative', width: 36, height: 36 }}>
                          <svg width="36" height="36" viewBox="0 0 60 60" style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx="30" cy="30" r={C} fill="none" stroke="#E5E7EB" strokeWidth="4" strokeDasharray={R} strokeDashoffset="0" />
                            <circle cx="30" cy="30" r={C} fill="none" stroke="#17C3B2" strokeWidth="4" strokeLinecap="round" strokeDasharray={R} strokeDashoffset={offset} />
                          </svg>
                          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 700, color: '#0C1B33' }}>
                            {!isUnlocked ? '🔒' : `${progress}%`}
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10.5, color: '#6B7A96', fontWeight: 500, marginBottom: 3 }}>
                            {isFree ? 'Free access' : !isUnlocked ? 'Enter access code to unlock' : i === 0 ? '2 of 6 modules done' : 'Not started'}
                          </div>
                          <div style={{ height: 4, background: '#E9ECF0', borderRadius: 2, overflow: 'hidden' }}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.8, delay: i * 0.1 + 0.3 }}
                              style={{ height: '100%', background: '#17C3B2', borderRadius: 2 }}
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={e => { e.stopPropagation(); openCourse(course, isFree); }}
                        style={{ width: '100%', background: '#0C1B33', color: 'white', border: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, padding: '9px', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      >
                        <Play size={12} fill="white" color="white" />
                        {isFree ? 'Start free' : !isUnlocked ? 'Enter access code' : i === 0 ? 'Continue learning' : 'Start course'}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* SIDEBAR */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Upcoming sessions */}
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid rgba(12,27,51,0.08)', overflow: 'hidden' }}>
              <div style={{ background: '#0C1B33', padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 7 }}>
                <Calendar size={13} color="#17C3B2" />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'white' }}>Upcoming Sessions</span>
              </div>
              <div style={{ padding: '12px 14px' }}>
                {liveSessions.map((ev, i) => {
                  const { mo, dy, time } = formatSessionDate(ev.starts_at);
                  return (
                    <div key={ev.id || i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '8px 0', borderBottom: i < liveSessions.length - 1 ? '1px dashed rgba(12,27,51,0.08)' : 'none' }}>
                      <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 28 }}>
                        <div style={{ fontSize: 9, fontWeight: 600, color: '#6B7A96', textTransform: 'uppercase' }}>{mo}</div>
                        <div style={{ fontSize: 17, fontWeight: 800, color: '#0C1B33', lineHeight: 1.1 }}>{dy}</div>
                      </div>
                      <div style={{ width: 1, background: 'rgba(12,27,51,0.08)', alignSelf: 'stretch', flexShrink: 0 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#0C1B33' }}>{ev.title}</div>
                        <div style={{ fontSize: 11, color: '#17C3B2', fontWeight: 600, marginTop: 2 }}>
                          {time} {ev.timezone || ''} · Live
                        </div>
                        {ev.join_url ? (
                          <a
                            href={ev.join_url}
                            target="_blank"
                            rel="noreferrer"
                            style={{ marginTop: 6, display: 'inline-flex', fontSize: 10.5, fontWeight: 700, color: '#0C1B33', textDecoration: 'none', background: 'rgba(23,195,178,0.15)', borderRadius: 6, padding: '4px 8px' }}
                          >
                            Join live
                          </a>
                        ) : (
                          <span style={{ marginTop: 6, display: 'inline-flex', fontSize: 10.5, fontWeight: 600, color: '#6B7A96' }}>
                            Link will appear before session
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Study streak */}
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid rgba(12,27,51,0.08)', overflow: 'hidden' }}>
              <div style={{ background: '#0C1B33', padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 7 }}>
                <TrendingUp size={13} color="#17C3B2" />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'white' }}>Study Streak — Week 12</span>
              </div>
              <div style={{ padding: '12px 14px' }}>
                <p style={{ fontSize: 11.5, color: '#6B7A96', marginBottom: 8 }}>Days studied this week</p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <div style={{ height: 18, borderRadius: 3, background: i === 4 ? '#0C1B33' : i < 4 ? '#17C3B2' : '#E9ECF0', marginBottom: 3 }} />
                      <div style={{ fontSize: 9, color: '#6B7A96', fontWeight: 600 }}>{d}</div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 11.5, color: '#17C3B2', fontWeight: 600, marginTop: 8 }}>4-day streak — keep it up!</p>
              </div>
            </div>

            {/* Progress to certificate */}
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid rgba(12,27,51,0.08)', overflow: 'hidden' }}>
              <div style={{ background: '#0C1B33', padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 7 }}>
                <Award size={13} color="#17C3B2" />
                <span style={{ fontSize: 12.5, fontWeight: 600, color: 'white' }}>Progress to Certificate</span>
              </div>
              <div style={{ padding: '12px 14px' }}>
                {enrolledCourses.map((c, i) => (
                  <div key={c.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderBottom: i < enrolledCourses.length - 1 ? '1px dashed rgba(12,27,51,0.08)' : 'none' }}>
                    <div style={{ width: 32, height: 32, borderRadius: 7, background: 'rgba(23,195,178,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BookOpen size={15} color="#17C3B2" strokeWidth={1.5} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#0C1B33', lineHeight: 1.3, marginBottom: 1 }}>{c.title}</div>
                      <div style={{ fontSize: 11, color: '#6B7A96' }}>{i === 0 ? '2 of 6 modules done' : 'Not started'}</div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#17C3B2', flexShrink: 0 }}>{i === 0 ? '33%' : '0%'}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Support */}
            <div style={{ border: '1px dashed rgba(12,27,51,0.09)', borderRadius: 10, padding: 14, background: '#FAFBFC' }}>
              <h4 style={{ fontSize: 12.5, fontWeight: 700, color: '#0C1B33', marginBottom: 4 }}>Need help?</h4>
              <p style={{ fontSize: 11.5, color: '#6B7A96', lineHeight: 1.55, marginBottom: 9 }}>
                Our educators are available Mon–Fri for 1-on-1 support.
              </p>
              <button onClick={() => navigate('/contact', { state: { from: '/dashboard' } })} style={{ background: 'none', border: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, color: '#17C3B2', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                Contact educator <ArrowRight size={12} />
              </button>
            </div>

          </div>
        </div>
      </div>

      {accessModalCourse && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(3,10,22,0.58)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ width: '100%', maxWidth: 460, background: 'white', borderRadius: 12, border: '1px solid rgba(12,27,51,0.1)', padding: 18 }}>
            <h3 style={{ marginTop: 0, marginBottom: 6, color: '#0C1B33', fontFamily: "'DM Serif Display', serif", fontSize: 22 }}>Enter Course Access Code</h3>
            <p style={{ marginTop: 0, color: '#6B7A96', fontSize: 12.5, lineHeight: 1.6 }}>
              <strong style={{ color: '#0C1B33' }}>{accessModalCourse.title}</strong> is locked. Enter your code to unlock this course.
            </p>
            <input
              autoFocus
              value={accessCodeInput}
              onChange={(e) => setAccessCodeInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitAccessCode(); }}
              placeholder="e.g. PHARM2026"
              style={{ width: '100%', marginTop: 4, border: '1px solid rgba(12,27,51,0.15)', borderRadius: 8, padding: '10px 12px', fontSize: 13 }}
            />
            {accessCodeError && <div style={{ color: '#B91C1C', fontSize: 11.5, marginTop: 8 }}>{accessCodeError}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 14 }}>
              <button
                onClick={() => setAccessModalCourse(null)}
                style={{ background: 'white', border: '1px solid rgba(12,27,51,0.16)', color: '#0C1B33', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={submitAccessCode}
                style={{ background: '#0C1B33', border: 'none', color: 'white', borderRadius: 8, padding: '8px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
              >
                Unlock course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
