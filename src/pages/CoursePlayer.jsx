import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, CheckCircle, FileText, Volume2, Maximize2, Shield, Lock, BookOpen, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { COURSES_DATA } from '../data/courses';
import { useAuth } from '../context/AuthContext';

const MODULES = [
  {
    title: 'Module 1: Getting Started',
    lessons: [
      { title: 'Introduction to the Course', type: 'video', duration: '5:00' },
      { title: 'Exam Structure Overview', type: 'video', duration: '12:00' },
      { title: 'Study Checklist & Resources', type: 'document', duration: 'PDF' },
    ],
  },
  {
    title: 'Module 2: Core Clinical Skills',
    lessons: [
      { title: 'Communication Mastery', type: 'video', duration: '25:00' },
      { title: 'Professionalism & Ethics', type: 'video', duration: '18:00' },
      { title: 'Mock Case Analysis — Live Demo', type: 'video', duration: '30:00' },
    ],
  },
];

const allLessons = MODULES.flatMap(m => m.lessons.map(l => ({ ...l, mod: m.title })));

export default function CoursePlayer() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user, supabase } = useAuth();
  const [accessLoading, setAccessLoading] = useState(true);
  const [hasCourseAccess, setHasCourseAccess] = useState(false);
  const [shouldRedirectUnauthorized, setShouldRedirectUnauthorized] = useState(false);
  const [activeLesson, setActiveLesson] = useState(0);
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [showLockWarning, setShowLockWarning] = useState(false);
  const [forumThreads, setForumThreads] = useState([]);
  const [forumReplies, setForumReplies] = useState({});
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadBody, setNewThreadBody] = useState('');
  const [replyDrafts, setReplyDrafts] = useState({});
  const [forumLoading, setForumLoading] = useState(true);
  const [forumError, setForumError] = useState('');

  const course = COURSES_DATA.find(c => c.id === courseId);
  if (!course) return (
    <div style={{ padding: 40, fontFamily: "'DM Sans', sans-serif" }}>
      Course not found. <button onClick={() => navigate('/dashboard')}>Back to dashboard</button>
    </div>
  );

  useEffect(() => {
    let mounted = true;

    const loadAccess = async () => {
      if (!user?.id || !courseId) {
        if (mounted) {
          setHasCourseAccess(false);
          setShouldRedirectUnauthorized(true);
          setAccessLoading(false);
        }
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_course_access')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .maybeSingle();

        if (mounted) {
          const entitled = !error && !!data;
          setHasCourseAccess(entitled);
          setShouldRedirectUnauthorized(!entitled);
          setAccessLoading(false);
        }
      } catch (_err) {
        if (mounted) {
          setHasCourseAccess(false);
          setShouldRedirectUnauthorized(true);
          setAccessLoading(false);
        }
      }
    };

    loadAccess();
    return () => { mounted = false; };
  }, [courseId, supabase, user?.id]);

  useEffect(() => {
    if (!accessLoading && shouldRedirectUnauthorized) {
      navigate('/dashboard?error=unauthorized', { replace: true });
    }
  }, [accessLoading, shouldRedirectUnauthorized, navigate]);

  if (accessLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F6F9', fontFamily: "'DM Sans', sans-serif", color: '#6B7A96' }}>
        Checking course access...
      </div>
    );
  }

  if (!hasCourseAccess) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F4F6F9', fontFamily: "'DM Sans', sans-serif", color: '#6B7A96' }}>
        Redirecting...
      </div>
    );
  }

  const currentLesson = allLessons[activeLesson];
  const progress = Math.round((completedLessons.size / allLessons.length) * 100);
  const isDone = completedLessons.has(activeLesson);
  const allDone = completedLessons.size === allLessons.length;

  const isLocked = (idx) => {
    if (idx === 0) return false;
    if (completedLessons.has(idx)) return false;
    if (idx === activeLesson) return false;
    return !completedLessons.has(idx - 1);
  };

  const handleSelectLesson = (idx) => {
    if (isLocked(idx)) {
      setShowLockWarning(true);
      setTimeout(() => setShowLockWarning(false), 2500);
      return;
    }
    setActiveLesson(idx);
    setShowLockWarning(false);
  };

  const handleComplete = () => {
    const updated = new Set(completedLessons);
    updated.add(activeLesson);
    setCompletedLessons(updated);
    const next = activeLesson + 1;
    if (next < allLessons.length) setActiveLesson(next);
  };

  let lessonCounter = 0;
  const userDisplay = user?.email?.split('@')?.[0] || 'Student';

  const fallbackThreads = useMemo(() => ([
    {
      id: 'sample-1',
      title: 'How are stations scored in OSCE?',
      body: 'Can someone explain what examiners focus on most during patient interaction?',
      author_name: 'Student',
      created_at: new Date().toISOString(),
    },
  ]), []);

  const fallbackReplies = useMemo(() => ({
    'sample-1': [
      {
        id: 'sample-r1',
        body: 'Main focus is structure, safety checks, and communication clarity. Use a consistent framework.',
        author_name: 'Instructor',
        is_instructor: true,
        created_at: new Date().toISOString(),
      },
    ],
  }), []);

  useEffect(() => {
    let mounted = true;

    const loadForum = async () => {
      try {
        const { data: threadsData, error: threadsError } = await supabase
          .from('course_forum_threads')
          .select('id, title, body, author_name, created_at')
          .eq('course_id', courseId)
          .order('created_at', { ascending: false })
          .limit(20);

        if (threadsError || !threadsData) {
          if (mounted) {
            setForumThreads(fallbackThreads);
            setForumReplies(fallbackReplies);
            setForumLoading(false);
          }
          return;
        }

        if (!threadsData.length) {
          if (mounted) {
            setForumThreads([]);
            setForumReplies({});
            setForumLoading(false);
          }
          return;
        }

        const threadIds = threadsData.map(t => t.id);
        const { data: repliesData, error: repliesError } = await supabase
          .from('course_forum_replies')
          .select('id, thread_id, body, author_name, is_instructor, created_at')
          .in('thread_id', threadIds)
          .order('created_at', { ascending: true });

        const grouped = {};
        (repliesData || []).forEach((r) => {
          if (!grouped[r.thread_id]) grouped[r.thread_id] = [];
          grouped[r.thread_id].push(r);
        });

        if (mounted) {
          setForumThreads(threadsData);
          setForumReplies(repliesError ? {} : grouped);
          setForumLoading(false);
        }
      } catch (_err) {
        if (mounted) {
          setForumThreads(fallbackThreads);
          setForumReplies(fallbackReplies);
          setForumLoading(false);
        }
      }
    };

    loadForum();
    return () => { mounted = false; };
  }, [courseId, supabase, fallbackThreads, fallbackReplies]);

  const handleCreateThread = async () => {
    const title = newThreadTitle.trim();
    const body = newThreadBody.trim();
    if (!title || !body) return;

    setForumError('');
    const optimistic = {
      id: `local-${Date.now()}`,
      title,
      body,
      author_name: userDisplay,
      created_at: new Date().toISOString(),
    };
    setForumThreads(prev => [optimistic, ...prev]);
    setNewThreadTitle('');
    setNewThreadBody('');

    try {
      const { data, error } = await supabase
        .from('course_forum_threads')
        .insert({
          course_id: courseId,
          author_id: user?.id || null,
          author_name: userDisplay,
          title,
          body,
        })
        .select('id, title, body, author_name, created_at')
        .single();

      if (error || !data) throw error || new Error('Unable to create thread');
      setForumThreads(prev => prev.map(t => (t.id === optimistic.id ? data : t)));
    } catch (_err) {
      // Keep optimistic thread visible so forum still works without backend tables.
      setForumError('Forum is running in local mode until database tables are available.');
    }
  };

  const handleReply = async (threadId) => {
    const body = (replyDrafts[threadId] || '').trim();
    if (!body) return;

    const optimistic = {
      id: `local-r-${Date.now()}`,
      body,
      author_name: userDisplay,
      is_instructor: false,
      created_at: new Date().toISOString(),
    };
    setForumReplies(prev => ({
      ...prev,
      [threadId]: [...(prev[threadId] || []), optimistic],
    }));
    setReplyDrafts(prev => ({ ...prev, [threadId]: '' }));

    try {
      const { data, error } = await supabase
        .from('course_forum_replies')
        .insert({
          thread_id: threadId,
          author_id: user?.id || null,
          author_name: userDisplay,
          body,
          is_instructor: false,
        })
        .select('id, thread_id, body, author_name, is_instructor, created_at')
        .single();

      if (error || !data) throw error || new Error('Unable to post reply');
      setForumReplies(prev => ({
        ...prev,
        [threadId]: (prev[threadId] || []).map(r => (r.id === optimistic.id ? data : r)),
      }));
    } catch (_err) {
      setForumError('Forum replies are currently local until backend tables are created.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'DM Sans', system-ui, sans-serif", background: '#F4F6F9' }}>

      {/* Top nav */}
      <div style={{ background: '#0C1B33', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', flexShrink: 0 }}>
        <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 17, color: 'white', display: 'flex', alignItems: 'center', gap: 7 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#17C3B2' }} />
          Humacap
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3 }}>
            <span style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Progress</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 120, height: 4, background: 'rgba(255,255,255,0.12)', borderRadius: 2, overflow: 'hidden' }}>
                <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} style={{ height: '100%', background: '#17C3B2', borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: 'white' }}>{progress}%</span>
            </div>
          </div>
          <button onClick={() => navigate('/dashboard')} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.75)', fontFamily: "'DM Sans', sans-serif", fontSize: 11.5, fontWeight: 500, padding: '6px 12px', borderRadius: 6, cursor: 'pointer' }}>
            ← Exit Player
          </button>
        </div>
      </div>

      {/* Lock warning bar */}
      <AnimatePresence>
        {showLockWarning && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            style={{ background: '#FEF9EC', border: '1px solid #F4D072', color: '#92620A', padding: '10px 20px', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}
          >
            <Lock size={14} color="#C49A2A" />
            Complete the current lesson before unlocking the next one.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* MAIN CONTENT — left */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Breadcrumb bar */}
          <div style={{ background: 'white', borderBottom: '1px solid rgba(12,27,51,0.08)', padding: '10px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 12.5, color: '#6B7A96' }}>
              <span style={{ color: '#0C1B33', fontWeight: 600 }}>{currentLesson.mod}</span>
              {' — '}{currentLesson.title}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#6B7A96' }}>Lesson {activeLesson + 1} of {allLessons.length}</span>
            </div>
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px 48px' }}>
            <div style={{ maxWidth: 820, margin: '0 auto' }}>

              {/* VIDEO */}
              <div style={{ background: '#0C1B33', borderRadius: 14, overflow: 'hidden', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: 22 }}>
                <div style={{ position: 'absolute', fontFamily: "'DM Serif Display', serif", fontSize: 32, color: 'rgba(23,195,178,0.05)', letterSpacing: '6px', textTransform: 'uppercase', userSelect: 'none', pointerEvents: 'none' }}>
                  HUMACAP
                </div>

                {/* Protected badge */}
                <div style={{ position: 'absolute', top: 12, left: 14, background: 'rgba(0,0,0,0.4)', color: 'rgba(255,255,255,0.65)', fontSize: 10, fontWeight: 700, padding: '4px 10px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 5, zIndex: 2 }}>
                  <Shield size={10} color="#17C3B2" /> Protected
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={activeLesson} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {currentLesson.type === 'video' ? (
                      <motion.div whileHover={{ scale: 1.05 }} style={{ width: 60, height: 60, borderRadius: '50%', background: '#17C3B2', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 2, boxShadow: '0 0 0 16px rgba(23,195,178,0.10)' }}>
                        <Play size={24} fill="#0C1B33" color="#0C1B33" style={{ marginLeft: 3 }} />
                      </motion.div>
                    ) : (
                      <div style={{ position: 'absolute', inset: 0, background: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: 40 }}>
                        <FileText size={64} color="#E0E4EA" strokeWidth={1.2} style={{ marginBottom: 14 }} />
                        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#0C1B33', marginBottom: 7 }}>Learning Resource</h3>
                        <p style={{ fontSize: 13, color: '#9CA3AF', maxWidth: 300, lineHeight: 1.55 }}>
                          The document for "{currentLesson.title}" is available below.
                        </p>
                        <button style={{ height: 40, padding: '0 22px', background: '#0C1B33', color: 'white', border: 'none', borderRadius: 9, fontWeight: 700, fontSize: 13, cursor: 'pointer', marginTop: 20 }}>
                          Download PDF Guide
                        </button>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Video controls */}
                {currentLesson.type === 'video' && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 46, background: 'linear-gradient(transparent, rgba(0,0,0,0.6))', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', zIndex: 3 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'rgba(255,255,255,0.75)' }}>
                      <Play size={14} fill="currentColor" strokeWidth={0} style={{ cursor: 'pointer' }} />
                      <Volume2 size={14} style={{ cursor: 'pointer' }} />
                      <span style={{ fontSize: 10.5, fontWeight: 600, color: 'rgba(255,255,255,0.45)' }}>
                        00:00 / {currentLesson.duration}
                      </span>
                    </div>
                    <Maximize2 size={14} color="rgba(255,255,255,0.6)" style={{ cursor: 'pointer' }} />
                  </div>
                )}
              </div>

              {/* Lesson header + action */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, marginBottom: 18, paddingBottom: 18, borderBottom: '1px solid rgba(12,27,51,0.08)' }}>
                <div>
                  <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 22, color: '#0C1B33', marginBottom: 5, lineHeight: 1.25 }}>
                    {currentLesson.title}
                  </h2>
                  <p style={{ fontSize: 12.5, color: '#6B7A96' }}>{currentLesson.mod}</p>
                </div>
                <div style={{ flexShrink: 0 }}>
                  {allDone ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(23,195,178,0.10)', color: '#0FA899', border: '1px solid rgba(23,195,178,0.2)', fontSize: 12.5, fontWeight: 600, padding: '8px 16px', borderRadius: 8 }}>
                      🎉 Course Complete!
                    </div>
                  ) : isDone ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(23,195,178,0.10)', color: '#0FA899', border: '1px solid rgba(23,195,178,0.2)', fontSize: 12.5, fontWeight: 600, padding: '8px 16px', borderRadius: 8 }}>
                      <CheckCircle size={14} color="#0FA899" /> Completed
                    </div>
                  ) : (
                    <button
                      onClick={handleComplete}
                      style={{ background: '#17C3B2', color: '#0C1B33', border: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, padding: '9px 20px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
                    >
                      <CheckCircle size={15} />
                      Mark complete &amp; continue
                    </button>
                  )}
                </div>
              </div>

              {/* Key learning points */}
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid rgba(12,27,51,0.08)', padding: '16px 18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: '#6B7A96', marginBottom: 14 }}>
                  <Star size={12} color="#17C3B2" fill="#17C3B2" />
                  Key Learning Points
                </div>
                {[
                  'Standardising the Patient Approach — consistent structure for every station type',
                  'Time Management for Station Efficiency — the 8-minute station framework',
                  'Clinical Red Flags and Safety Frameworks — identifying high-risk scenarios',
                ].map((pt, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 11, marginBottom: 11 }}>
                    <div style={{ width: 22, height: 22, borderRadius: 6, background: 'rgba(23,195,178,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10.5, fontWeight: 700, color: '#17C3B2', flexShrink: 0, marginTop: 1 }}>
                      {i + 1}
                    </div>
                    <span style={{ fontSize: 13.5, fontWeight: 500, color: '#0C1B33', lineHeight: 1.5, paddingTop: 2 }}>{pt}</span>
                  </div>
                ))}
              </div>

              {/* Discussion forum */}
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid rgba(12,27,51,0.08)', padding: '16px 18px', marginTop: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.7px', color: '#6B7A96' }}>
                    <BookOpen size={12} color="#17C3B2" />
                    Course Discussion Forum
                  </div>
                  <span style={{ fontSize: 11, color: '#6B7A96' }}>{forumThreads.length} thread(s)</span>
                </div>

                <div style={{ border: '1px solid rgba(12,27,51,0.08)', borderRadius: 10, padding: 10, marginBottom: 12 }}>
                  <input
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    placeholder="Question title (e.g., How should I structure OSCE counseling?)"
                    style={{ width: '100%', border: '1px solid rgba(12,27,51,0.12)', borderRadius: 8, padding: '8px 10px', fontSize: 12, marginBottom: 8 }}
                  />
                  <textarea
                    value={newThreadBody}
                    onChange={(e) => setNewThreadBody(e.target.value)}
                    placeholder="Share your question here..."
                    rows={3}
                    style={{ width: '100%', border: '1px solid rgba(12,27,51,0.12)', borderRadius: 8, padding: '8px 10px', fontSize: 12, resize: 'vertical', marginBottom: 8 }}
                  />
                  <button
                    onClick={handleCreateThread}
                    style={{ background: '#0C1B33', color: 'white', border: 'none', borderRadius: 7, padding: '7px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                  >
                    Post question
                  </button>
                  {forumError && <p style={{ fontSize: 11, color: '#B45309', marginTop: 8 }}>{forumError}</p>}
                </div>

                {forumLoading ? (
                  <p style={{ fontSize: 12, color: '#6B7A96' }}>Loading discussion…</p>
                ) : forumThreads.length === 0 ? (
                  <p style={{ fontSize: 12, color: '#6B7A96' }}>No questions yet. Be the first to post.</p>
                ) : (
                  <div style={{ display: 'grid', gap: 10 }}>
                    {forumThreads.map((thread) => (
                      <div key={thread.id} style={{ border: '1px solid rgba(12,27,51,0.08)', borderRadius: 10, padding: 10 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#0C1B33', marginBottom: 4 }}>{thread.title}</div>
                        <p style={{ margin: 0, fontSize: 12, color: '#374151', lineHeight: 1.5 }}>{thread.body}</p>
                        <div style={{ fontSize: 10.5, color: '#6B7A96', marginTop: 6 }}>
                          by {thread.author_name || 'Student'} • {new Date(thread.created_at).toLocaleString()}
                        </div>

                        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px dashed rgba(12,27,51,0.12)', display: 'grid', gap: 8 }}>
                          {(forumReplies[thread.id] || []).map((r) => (
                            <div key={r.id} style={{ background: r.is_instructor ? 'rgba(23,195,178,0.08)' : '#F9FAFB', borderRadius: 8, padding: 8 }}>
                              <div style={{ fontSize: 11.5, color: '#0C1B33' }}>{r.body}</div>
                              <div style={{ fontSize: 10, color: '#6B7A96', marginTop: 4 }}>
                                {r.is_instructor ? 'Instructor' : (r.author_name || 'Student')} • {new Date(r.created_at).toLocaleString()}
                              </div>
                            </div>
                          ))}

                          <div style={{ display: 'flex', gap: 6 }}>
                            <input
                              value={replyDrafts[thread.id] || ''}
                              onChange={(e) => setReplyDrafts(prev => ({ ...prev, [thread.id]: e.target.value }))}
                              placeholder="Write a reply..."
                              style={{ flex: 1, border: '1px solid rgba(12,27,51,0.12)', borderRadius: 7, padding: '7px 9px', fontSize: 12 }}
                            />
                            <button
                              onClick={() => handleReply(thread.id)}
                              style={{ background: 'rgba(23,195,178,0.14)', color: '#0C1B33', border: 'none', borderRadius: 7, padding: '7px 10px', fontSize: 11.5, fontWeight: 700, cursor: 'pointer' }}
                            >
                              Reply
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </main>

        {/* RIGHT SIDEBAR — curriculum */}
        <div style={{ width: 264, background: 'white', borderLeft: '1px solid rgba(12,27,51,0.08)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

          {/* Course info + progress */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(12,27,51,0.08)' }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0C1B33', marginBottom: 8, lineHeight: 1.35 }}>
              {course.title}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flex: 1, height: 4, background: '#E9ECF0', borderRadius: 2, overflow: 'hidden' }}>
                <motion.div animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} style={{ height: '100%', background: '#17C3B2', borderRadius: 2 }} />
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#17C3B2', flexShrink: 0 }}>
                {completedLessons.size}/{allLessons.length}
              </span>
            </div>
          </div>

          {/* Lesson tree */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>
            {MODULES.map((mod, mi) => {
              const start = lessonCounter;
              lessonCounter += mod.lessons.length;
              return (
                <div key={mi} style={{ marginBottom: 4 }}>
                  {/* Module header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px' }}>
                    <div style={{ width: 18, height: 18, borderRadius: 4, background: '#F4F6F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, fontWeight: 700, color: '#6B7A96', flexShrink: 0 }}>
                      {mi + 1}
                    </div>
                    <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#6B7A96', flex: 1 }}>
                      {mod.title}
                    </span>
                  </div>

                  {/* Lessons */}
                  {mod.lessons.map((les, li) => {
                    const gIdx = start + li;
                    const isActive = activeLesson === gIdx;
                    const isDoneLesson = completedLessons.has(gIdx);
                    const locked = isLocked(gIdx);
                    return (
                      <button
                        key={li}
                        onClick={() => handleSelectLesson(gIdx)}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: 9,
                          padding: '8px 16px 8px 14px',
                          background: isActive ? 'rgba(23,195,178,0.07)' : 'transparent',
                          borderLeft: isActive ? '3px solid #17C3B2' : '3px solid transparent',
                          border: 'none', cursor: locked ? 'not-allowed' : 'pointer',
                          textAlign: 'left', opacity: locked ? 0.38 : 1,
                          transition: 'background 0.1s',
                        }}
                        onMouseEnter={e => { if (!isActive && !locked) e.currentTarget.style.background = '#F8FAFB'; }}
                        onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = isActive ? 'rgba(23,195,178,0.07)' : 'transparent'; }}
                      >
                        {/* Status dot */}
                        <div style={{
                          width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                          border: isDoneLesson ? 'none' : `2px solid ${isActive ? '#17C3B2' : '#D1D5DB'}`,
                          background: isDoneLesson ? '#17C3B2' : locked ? '#F3F4F6' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {isDoneLesson && <CheckCircle size={11} color="white" fill="white" strokeWidth={0} />}
                          {locked && !isDoneLesson && <Lock size={9} color="#9CA3AF" />}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 500, color: '#0C1B33', lineHeight: 1.35, marginBottom: 2 }}>
                            {les.title}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                            <span style={{ fontSize: 10.5, color: '#6B7A96' }}>{les.duration}</span>
                            <span style={{ fontSize: 9.5, fontWeight: 600, padding: '1px 6px', borderRadius: 3, background: 'rgba(23,195,178,0.10)', color: '#0FA899' }}>
                              {les.type === 'document' ? 'PDF' : 'Video'}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
