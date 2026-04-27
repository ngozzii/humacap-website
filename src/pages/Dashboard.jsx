import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Play, Clock, Award, Calendar, ArrowRight, TrendingUp, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user, supabase } = useAuth();
  const navigate = useNavigate();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [liveSessions, setLiveSessions] = useState([]);
  const [accessError, setAccessError] = useState('');

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
    let mounted = true;

    const loadEnrolledCourses = async () => {
      if (!user?.id) {
        if (mounted) {
          setEnrolledCourses([]);
          setCoursesLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_course_access')
          .select(`
            course_id,
            courses (*)
          `)
          .eq('user_id', user.id);

        if (error) {
          if (mounted) {
            setEnrolledCourses([]);
            setCoursesLoading(false);
          }
          return;
        }

        const normalizedCourses = (data || [])
          .filter((row) => !!row?.course_id && !!row?.courses)
          .map((row) => ({
            course_id: row.course_id,
            ...row.courses,
          }));

        if (mounted) {
          setEnrolledCourses(normalizedCourses);
          setCoursesLoading(false);
        }
      } catch (_err) {
        if (mounted) {
          setEnrolledCourses([]);
          setCoursesLoading(false);
        }
      }
    };

    loadEnrolledCourses();
    return () => { mounted = false; };
  }, [supabase, user?.id]);

  const openCourse = (course) => {
    if (course?.course_id) {
      setAccessError('');
      navigate(`/player/${course.course_id}`);
      return;
    }

    setAccessError('Course access record is invalid. Please contact support.');
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
        {accessError && (
          <div style={{ marginBottom: 12, background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C', borderRadius: 8, padding: '10px 12px', fontSize: 12.5, fontWeight: 500 }}>
            {accessError}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 270px', gap: 20 }}>

          {/* COURSES */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#0C1B33', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              <Play size={13} fill="#17C3B2" color="#17C3B2" />
              My Learning
            </div>

            {coursesLoading ? (
              <div style={{ background: 'white', border: '1px solid rgba(12,27,51,0.08)', borderRadius: 12, padding: 16, fontSize: 13, color: '#6B7A96' }}>
                Loading your courses...
              </div>
            ) : enrolledCourses.length === 0 ? (
              <div style={{ background: 'white', border: '1px solid rgba(12,27,51,0.08)', borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#0C1B33', marginBottom: 6 }}>No enrolled courses yet</div>
                <div style={{ fontSize: 12.5, color: '#6B7A96', lineHeight: 1.6, marginBottom: 10 }}>
                  Your dashboard will show courses here once access has been granted.
                </div>
                <button
                  onClick={() => navigate('/pharmacy')}
                  style={{ background: '#0C1B33', color: 'white', border: 'none', borderRadius: 7, padding: '8px 12px', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                >
                  Browse Courses
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                {enrolledCourses.map((course, i) => {
                const progress = i === 0 ? 33 : 0;
                const C = 24, R = 2 * Math.PI * C;
                const offset = R - (progress / 100) * R;
                return (
                  <motion.div
                    key={course.course_id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    style={{ background: 'white', borderRadius: 12, border: '1px solid rgba(12,27,51,0.08)', overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.15s, transform 0.15s', position: 'relative' }}
                    whileHover={{ boxShadow: '0 4px 20px rgba(12,27,51,0.10)', y: -2 }}
                    onClick={() => openCourse(course)}
                  >
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
                        {course.category || 'Course'}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#0C1B33', marginBottom: 8, lineHeight: 1.35 }}>
                        {course.title}
                      </div>
                      {course.description && (
                        <div style={{ fontSize: 11, color: '#6B7A96', marginBottom: 8, lineHeight: 1.45 }}>
                          {course.description}
                        </div>
                      )}
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
                            {`${progress}%`}
                          </div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 10.5, color: '#6B7A96', fontWeight: 500, marginBottom: 3 }}>
                            {i === 0 ? '2 of 6 modules done' : 'Not started'}
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
                        onClick={e => { e.stopPropagation(); openCourse(course); }}
                        style={{ width: '100%', background: '#0C1B33', color: 'white', border: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, padding: '9px', borderRadius: 7, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      >
                        <Play size={12} fill="white" color="white" />
                        {i === 0 ? 'Continue learning' : 'Start course'}
                      </button>
                    </div>
                  </motion.div>
                );
                })}
              </div>
            )}
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
                  <div key={c.course_id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '8px 0', borderBottom: i < enrolledCourses.length - 1 ? '1px dashed rgba(12,27,51,0.08)' : 'none' }}>
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
    </div>
  );
};

export default Dashboard;
