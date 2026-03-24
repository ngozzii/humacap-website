import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, BookOpen, Calendar, MessageSquare,
  Lock, DollarSign, Settings, TrendingUp, CheckCircle,
  AlertCircle, ArrowRight, Plus, Download, Bell,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { COURSES_DATA } from '../data/courses';

const STUDENTS = [
  { id: 1, name: 'Amara Osei', email: 'amara@email.com', initials: 'A', color: '#7C3AED', course: 'Pharmacist OSCE', progress: 72, lastActive: 'Today', status: 'active' },
  { id: 2, name: 'Kofi Mensah', email: 'kofi@email.com', initials: 'K', color: '#0EA5E9', course: 'Technician OSPE', progress: 45, lastActive: 'Yesterday', status: 'active' },
  { id: 3, name: 'Fatima Al-Rashid', email: 'fatima@email.com', initials: 'F', color: '#D97706', course: 'Pharmacist OSCE', progress: 18, lastActive: '5 days ago', status: 'risk' },
  { id: 4, name: 'Priya Nair', email: 'priya@email.com', initials: 'P', color: '#059669', course: 'Pharmacy Math', progress: 100, lastActive: '2 days ago', status: 'complete' },
  { id: 5, name: 'Samuel Boateng', email: 'samuel@email.com', initials: 'S', color: '#EC4899', course: 'Pharmacist OSCE', progress: 58, lastActive: 'Today', status: 'active' },
];

const TRANSACTIONS = [
  { name: 'Amara Osei', course: 'Pharmacist OSCE', amount: 1195, date: 'Mar 18', type: 'stripe' },
  { name: 'Samuel Boateng', course: 'Pharmacist OSCE', amount: 1195, date: 'Mar 14', type: 'stripe' },
  { name: 'Kofi Mensah', course: 'Technician OSPE', amount: 950, date: 'Mar 12', type: 'stripe' },
  { name: 'Priya Nair', course: 'Pharmacy Math', amount: 299, date: 'Mar 8', type: 'stripe' },
  { name: 'Fatima Al-Rashid', course: 'Pharmacist OSCE', amount: 1195, date: 'Mar 5', type: 'manual' },
];

const SESSIONS = [
  { mo: 'MAR', dy: 18, title: 'OSCE Mock Session', meta: '7:00 PM EST · Pharmacist OSCE · 14 students', status: 'upcoming' },
  { mo: 'MAR', dy: 21, title: 'Exam Math Drill', meta: '1:00 PM EST · Pharmacy Math · 8 students', status: 'upcoming' },
  { mo: 'MAR', dy: 25, title: 'Group Case Review', meta: '6:00 PM EST · All Courses · 22 students', status: 'upcoming' },
  { mo: 'MAR', dy: 11, title: 'OSCE Practice Round', meta: '7:00 PM EST · 18 attended', status: 'done', rating: '4.8 / 5' },
];

const MESSAGES = [
  { name: 'Amara Osei', initials: 'A', color: '#7C3AED', preview: 'Hi Uche, I had a question about the communication framework from Module 2...', time: '2h ago', unread: true },
  { name: 'Kofi Mensah', initials: 'K', color: '#0EA5E9', preview: 'Thank you for the feedback. Could we schedule a 1-on-1?', time: 'Yesterday', unread: true },
  { name: 'Fatima Al-Rashid', initials: 'F', color: '#D97706', preview: "I've been struggling with the case analysis section. Is there extra material?", time: '2 days ago', unread: true },
  { name: 'Priya Nair', initials: 'P', color: '#059669', preview: 'Just wanted to say thank you — I passed! Really grateful for your help.', time: '3 days ago', unread: false },
];

const INITIAL_CODES = [
  { code: 'HUMA-4821', course: 'Pharmacist OSCE', usedBy: 'Amara Osei · Mar 18', status: 'used' },
  { code: 'HUMA-3374', course: 'Technician OSPE', usedBy: 'Kofi Mensah · Mar 15', status: 'used' },
  { code: 'HUMA-9102', course: 'Pharmacy Math', usedBy: 'Priya Nair · Mar 10', status: 'used' },
  { code: 'HUMA-7756', course: 'Pharmacist OSCE', usedBy: 'Not used yet', status: 'unused' },
  { code: 'HUMA-1190', course: 'All Courses', usedBy: 'Expired Mar 1', status: 'expired' },
];

const s = {
  shell: { display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh', fontFamily: "'DM Sans', system-ui, sans-serif" },
  sidebar: { background: '#0C1B33', display: 'flex', flexDirection: 'column' },
  sbLogo: { padding: '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' },
  sbLogoInner: { fontFamily: "'DM Serif Display', serif", fontSize: 17, color: '#fff', display: 'flex', alignItems: 'center', gap: 7 },
  sbLogoDot: { width: 7, height: 7, borderRadius: '50%', background: '#17C3B2' },
  sbRole: { fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 3, letterSpacing: '0.5px', textTransform: 'uppercase' },
  sbNav: { flex: 1, padding: '12px 10px' },
  sbSection: { fontSize: 9.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'rgba(255,255,255,0.25)', padding: '10px 8px 6px' },
  sbBottom: { padding: '14px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' },
  sbUser: { display: 'flex', alignItems: 'center', gap: 9 },
  sbAv: { width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg,#162340,#0FA899)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Serif Display', serif", fontSize: 13, color: '#fff', flexShrink: 0 },
  main: { display: 'flex', flexDirection: 'column', background: '#F4F6F9' },
  topbar: { background: '#fff', borderBottom: '1px solid rgba(12,27,51,0.08)', padding: '0 24px', height: 54, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  topbarTitle: { fontSize: 15, fontWeight: 700, color: '#0C1B33' },
  topbarRight: { display: 'flex', alignItems: 'center', gap: 8 },
  content: { flex: 1, padding: '20px 24px', overflowY: 'auto' },
};

const NavItem = ({ icon, label, badge, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: 9, padding: '9px 10px',
      borderRadius: 8, cursor: 'pointer', marginBottom: 2, border: 'none', width: '100%', textAlign: 'left',
      background: active ? 'rgba(23,195,178,0.12)' : 'transparent',
      transition: 'background 0.12s',
    }}
    onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
    onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
  >
    <span style={{ color: active ? '#17C3B2' : 'rgba(255,255,255,0.4)', display: 'flex', flexShrink: 0 }}>
      {React.cloneElement(icon, { size: 15, strokeWidth: 2 })}
    </span>
    <span style={{ fontSize: 12.5, fontWeight: active ? 600 : 500, color: active ? '#fff' : 'rgba(255,255,255,0.5)', flex: 1 }}>
      {label}
    </span>
    {badge && (
      <span style={{ fontSize: 10, fontWeight: 700, background: '#17C3B2', color: '#0C1B33', padding: '1px 7px', borderRadius: 10 }}>
        {badge}
      </span>
    )}
  </button>
);

const Btn = ({ label, icon, variant = 'outline', onClick, style: sx }) => {
  const base = { display: 'inline-flex', alignItems: 'center', gap: 5, border: 'none', fontFamily: "'DM Sans', sans-serif", fontSize: 12, fontWeight: 600, padding: '7px 14px', borderRadius: 7, cursor: 'pointer', ...sx };
  const vars = {
    outline: { background: 'none', border: '1px solid rgba(12,27,51,0.08)', color: '#6B7A96' },
    primary: { background: '#0C1B33', color: '#fff' },
    teal: { background: '#17C3B2', color: '#0C1B33', fontWeight: 700 },
    danger: { background: 'rgba(208,53,60,0.08)', color: '#D0353C', border: '1px solid rgba(208,53,60,0.2)' },
  };
  return <button onClick={onClick} style={{ ...base, ...vars[variant] }}>{icon && React.cloneElement(icon, { size: 13 })}{label}</button>;
};

const StatCard = ({ label, value, sub, up, onClick }) => (
  <div onClick={onClick} style={{ background: '#fff', borderRadius: 11, border: '1px solid rgba(12,27,51,0.08)', padding: 16, cursor: onClick ? 'pointer' : 'default' }}>
    <div style={{ fontSize: 11, color: '#6B7A96', fontWeight: 500, marginBottom: 6 }}>{label}</div>
    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 26, color: '#0C1B33', marginBottom: 3, lineHeight: 1.1 }}>{value}</div>
    <div style={{ fontSize: 11, color: up ? '#059669' : '#6B7A96' }}>{up ? '↑ ' : ''}{sub}</div>
  </div>
);

const ProgBar = ({ pct, color }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
    <div style={{ width: 80, height: 4, background: '#E9ECF0', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color || '#17C3B2', borderRadius: 2 }} />
    </div>
    <span style={{ fontSize: 11, fontWeight: 600, color: color || '#0C1B33' }}>{pct}%</span>
  </div>
);

const Toggle = ({ on, onChange }) => (
  <div
    onClick={() => onChange(!on)}
    style={{ width: 40, height: 22, borderRadius: 11, background: on ? '#17C3B2' : '#E9ECF0', position: 'relative', cursor: 'pointer', transition: 'background 0.2s', flexShrink: 0 }}
  >
    <div style={{ position: 'absolute', width: 16, height: 16, borderRadius: '50%', background: '#fff', top: 3, left: on ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }} />
  </div>
);

const Card = ({ title, action, onAction, children, style: sx }) => (
  <div style={{ background: '#fff', borderRadius: 11, border: '1px solid rgba(12,27,51,0.08)', overflow: 'hidden', marginBottom: 16, ...sx }}>
    {title && (
      <div style={{ padding: '13px 16px', borderBottom: '1px solid rgba(12,27,51,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#0C1B33' }}>{title}</span>
        {action && <button onClick={onAction} style={{ fontSize: 11.5, fontWeight: 600, color: '#0FA899', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>{action}</button>}
      </div>
    )}
    {children}
  </div>
);

function generateCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'HUMA-';
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export default function InstructorDashboard() {
  const { supabase } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState('overview');
  const [codes, setCodes] = useState(INITIAL_CODES);
  const [notifs, setNotifs] = useState({
    enrollment: true, message: true, risk: true, payment: true, weekly: false,
  });
  const [codeSettings, setCodeSettings] = useState({ expiry: '30', prefix: 'HUMA', autoGenerate: true });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleGenCode = () => {
    const newCode = { code: generateCode(), course: 'All Courses', usedBy: 'Just generated', status: 'unused', isNew: true };
    setCodes(prev => [newCode, ...prev]);
    setView('codes');
  };

  const navItems = [
    { id: 'overview', icon: <LayoutDashboard />, label: 'Overview', section: 'main' },
    { id: 'students', icon: <Users />, label: 'Students', badge: '47', section: 'main' },
    { id: 'courses', icon: <BookOpen />, label: 'Courses', section: 'main' },
    { id: 'sessions', icon: <Calendar />, label: 'Live Sessions', section: 'main' },
    { id: 'messages', icon: <MessageSquare />, label: 'Messages', badge: '3', section: 'main' },
    { id: 'codes', icon: <Lock />, label: 'Access Codes', section: 'management' },
    { id: 'revenue', icon: <DollarSign />, label: 'Revenue', section: 'management' },
    { id: 'settings', icon: <Settings />, label: 'Settings', section: 'management' },
  ];

  const titles = { overview: 'Overview', students: 'Students', courses: 'Courses', sessions: 'Live Sessions', messages: 'Messages', codes: 'Access Codes', revenue: 'Revenue', settings: 'Settings' };

  return (
    <div style={s.shell}>

      {/* ── SIDEBAR ── */}
      <div style={s.sidebar}>
        <div style={s.sbLogo}>
          <div style={s.sbLogoInner}><div style={s.sbLogoDot} />Humacap</div>
          <div style={s.sbRole}>Instructor Portal</div>
        </div>
        <div style={s.sbNav}>
          <div style={s.sbSection}>Main</div>
          {navItems.filter(n => n.section === 'main').map(n => (
            <NavItem key={n.id} icon={n.icon} label={n.label} badge={n.badge} active={view === n.id} onClick={() => setView(n.id)} />
          ))}
          <div style={s.sbSection}>Management</div>
          {navItems.filter(n => n.section === 'management').map(n => (
            <NavItem key={n.id} icon={n.icon} label={n.label} active={view === n.id} onClick={() => setView(n.id)} />
          ))}
        </div>
        <div style={s.sbBottom}>
          <div style={s.sbUser}>
            <div style={s.sbAv}>U</div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>Uche Isiuwe</div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>Lead Instructor</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={s.main}>
        <div style={s.topbar}>
          <div style={s.topbarTitle}>{titles[view]}</div>
          <div style={s.topbarRight}>
            {view === 'overview' && (
              <>
                <div style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(12,27,51,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
                  <Bell size={15} color="#6B7A96" />
                  <div style={{ position: 'absolute', top: 6, right: 7, width: 7, height: 7, borderRadius: '50%', background: '#D0353C', border: '2px solid #fff' }} />
                </div>
                <Btn label="Generate Code" icon={<Plus />} variant="teal" onClick={handleGenCode} />
              </>
            )}
            {view === 'students' && <Btn label="Export CSV" icon={<Download />} variant="primary" />}
            {view === 'sessions' && <Btn label="Schedule Session" icon={<Plus />} variant="teal" />}
            {view === 'messages' && <Btn label="Compose" variant="primary" />}
            {view === 'codes' && (
              <>
                <Btn label="Export" icon={<Download />} />
                <Btn label="Generate Code" icon={<Plus />} variant="teal" onClick={handleGenCode} />
              </>
            )}
            {view === 'revenue' && <Btn label="Export Report" icon={<Download />} variant="primary" />}
            {view === 'settings' && <Btn label="Save Changes" variant="teal" onClick={() => alert('Settings saved!')} />}
            <Btn label="Sign Out" onClick={handleLogout} />
          </div>
        </div>

        <div style={s.content}>
          <AnimatePresence mode="wait">
            <motion.div key={view} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

              {/* ── OVERVIEW ── */}
              {view === 'overview' && (
                <div>
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: 19, color: '#0C1B33', marginBottom: 2 }}>Good morning, Uche</div>
                    <div style={{ fontSize: 12, color: '#6B7A96' }}>Here's what's happening with your courses today.</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
                    <StatCard label="Total Students" value="47" sub="12 this month" up />
                    <StatCard label="Active Enrollments" value="38" sub="3 new this week" up />
                    <StatCard label="Avg. Completion" value="64%" sub="up from 58%" up />
                    <StatCard label="Revenue (MTD)" value="$14.2k" sub="vs $11.8k last mo." up onClick={() => setView('revenue')} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
                    <div>
                      <Card title="Enrollments — Last 8 Weeks">
                        <div style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 80 }}>
                            {[40, 55, 35, 65, 50, 72, 60, 80].map((h, i) => (
                              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                <div style={{ width: '100%', height: h, borderRadius: '4px 4px 0 0', background: i === 7 ? '#0C1B33' : '#17C3B2', opacity: i === 7 ? 1 : 0.7 }} />
                                <span style={{ fontSize: 9.5, color: i === 7 ? '#0C1B33' : '#6B7A96', fontWeight: i === 7 ? 700 : 500 }}>W{i + 1}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </Card>
                      <Card title="Recent Students" action="View all →" onAction={() => setView('students')}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>{['Student', 'Course', 'Progress', 'Status'].map(h => <th key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#6B7A96', padding: '6px 12px', textAlign: 'left', borderBottom: '1px solid rgba(12,27,51,0.08)' }}>{h}</th>)}</tr>
                          </thead>
                          <tbody>
                            {STUDENTS.slice(0, 4).map(st => (
                              <tr key={st.id} style={{ background: st.status === 'risk' ? 'rgba(208,53,60,0.02)' : 'transparent' }}>
                                <td style={{ padding: '10px 12px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: st.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{st.initials}</div>
                                    <div>
                                      <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0C1B33' }}>{st.name}</div>
                                      <div style={{ fontSize: 11, color: '#6B7A96' }}>{st.email}</div>
                                    </div>
                                  </div>
                                </td>
                                <td style={{ padding: '10px 12px', fontSize: 12, color: '#6B7A96' }}>{st.course}</td>
                                <td style={{ padding: '10px 12px' }}>
                                  <ProgBar pct={st.progress} color={st.status === 'risk' ? '#D97706' : st.status === 'complete' ? '#059669' : undefined} />
                                </td>
                                <td style={{ padding: '10px 12px' }}>
                                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase', letterSpacing: '0.4px', background: st.status === 'active' ? 'rgba(23,195,178,0.1)' : st.status === 'risk' ? 'rgba(196,154,42,0.1)' : 'rgba(5,150,105,0.1)', color: st.status === 'active' ? '#0FA899' : st.status === 'risk' ? '#C49A2A' : '#059669' }}>
                                    {st.status === 'risk' ? 'At Risk' : st.status === 'complete' ? 'Complete' : 'Active'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Card>
                    </div>
                    <div>
                      <Card title="Upcoming Sessions" action="Manage →" onAction={() => setView('sessions')}>
                        <div style={{ padding: '0 14px' }}>
                          {SESSIONS.filter(s => s.status === 'upcoming').map((sess, i) => (
                            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '9px 0', borderBottom: i < 2 ? '1px solid rgba(12,27,51,0.05)' : 'none' }}>
                              <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 30 }}>
                                <div style={{ fontSize: 9, fontWeight: 600, color: '#6B7A96', textTransform: 'uppercase' }}>{sess.mo}</div>
                                <div style={{ fontSize: 16, fontWeight: 800, color: '#0C1B33', lineHeight: 1.1 }}>{sess.dy}</div>
                              </div>
                              <div style={{ width: 1, background: 'rgba(12,27,51,0.08)', alignSelf: 'stretch', flexShrink: 0 }} />
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#0C1B33' }}>{sess.title}</div>
                                <div style={{ fontSize: 11, color: '#6B7A96', marginTop: 1 }}>{sess.meta}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                      <Card title="Recent Activity">
                        <div style={{ padding: '0 14px' }}>
                          {[
                            { type: 'enroll', color: 'rgba(23,195,178,0.1)', iconColor: '#0FA899', text: <><strong>Amara Osei</strong> enrolled in Pharmacist OSCE</>, time: '2 hours ago' },
                            { type: 'payment', color: 'rgba(196,154,42,0.1)', iconColor: '#C49A2A', text: <>Payment received — <strong>$1,195</strong> (OSCE)</>, time: '3 hours ago' },
                            { type: 'complete', color: 'rgba(5,150,105,0.1)', iconColor: '#059669', text: <><strong>Priya Nair</strong> completed Pharmacy Math</>, time: 'Yesterday' },
                            { type: 'message', color: 'rgba(12,27,51,0.06)', iconColor: '#6B7A96', text: <><strong>Kofi Mensah</strong> sent a message</>, time: 'Yesterday' },
                          ].map((act, i) => (
                            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '9px 0', borderBottom: i < 3 ? '1px solid rgba(12,27,51,0.05)' : 'none' }}>
                              <div style={{ width: 30, height: 30, borderRadius: 8, background: act.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                {act.type === 'enroll' && <Users size={14} color={act.iconColor} />}
                                {act.type === 'payment' && <DollarSign size={14} color={act.iconColor} />}
                                {act.type === 'complete' && <CheckCircle size={14} color={act.iconColor} />}
                                {act.type === 'message' && <MessageSquare size={14} color={act.iconColor} />}
                              </div>
                              <div>
                                <div style={{ fontSize: 12, fontWeight: 500, color: '#0C1B33', lineHeight: 1.35 }}>{act.text}</div>
                                <div style={{ fontSize: 10.5, color: '#6B7A96', marginTop: 2 }}>{act.time}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    </div>
                  </div>
                </div>
              )}

              {/* ── STUDENTS ── */}
              {view === 'students' && (
                <Card>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>{['Student', 'Course', 'Progress', 'Last Active', 'Status', 'Actions'].map(h => <th key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#6B7A96', padding: '7px 14px', textAlign: 'left', borderBottom: '1px solid rgba(12,27,51,0.08)' }}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {STUDENTS.map(st => (
                        <tr key={st.id} style={{ background: st.status === 'risk' ? 'rgba(208,53,60,0.02)' : 'transparent' }}
                          onMouseEnter={e => e.currentTarget.style.background = '#FAFBFC'}
                          onMouseLeave={e => e.currentTarget.style.background = st.status === 'risk' ? 'rgba(208,53,60,0.02)' : 'transparent'}>
                          <td style={{ padding: '11px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                              <div style={{ width: 30, height: 30, borderRadius: '50%', background: st.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{st.initials}</div>
                              <div>
                                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0C1B33' }}>{st.name}</div>
                                <div style={{ fontSize: 11, color: '#6B7A96' }}>{st.email}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '11px 14px', fontSize: 12, color: '#6B7A96' }}>{st.course}</td>
                          <td style={{ padding: '11px 14px' }}>
                            <ProgBar pct={st.progress} color={st.status === 'risk' ? '#D97706' : st.status === 'complete' ? '#059669' : undefined} />
                          </td>
                          <td style={{ padding: '11px 14px', fontSize: 11.5, color: st.status === 'risk' ? '#D97706' : '#6B7A96' }}>{st.lastActive}</td>
                          <td style={{ padding: '11px 14px' }}>
                            <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase', letterSpacing: '0.4px', background: st.status === 'active' ? 'rgba(23,195,178,0.1)' : st.status === 'risk' ? 'rgba(196,154,42,0.1)' : 'rgba(5,150,105,0.1)', color: st.status === 'active' ? '#0FA899' : st.status === 'risk' ? '#C49A2A' : '#059669' }}>
                              {st.status === 'risk' ? 'At Risk' : st.status === 'complete' ? 'Complete' : 'Active'}
                            </span>
                          </td>
                          <td style={{ padding: '11px 14px' }}>
                            <button onClick={() => setView('messages')} style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid rgba(12,27,51,0.08)', background: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                              <MessageSquare size={13} color="#6B7A96" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </Card>
              )}

              {/* ── COURSES ── */}
              {view === 'courses' && (
                <Card title="Your Courses">
                  <div style={{ padding: '0 16px' }}>
                    {[
                      { name: 'Pharmacist Qualifying Exam Part II (OSCE)', enrolled: 28, modules: 6, avgProgress: 61, price: 1195 },
                      { name: 'Pharmacy Technician Qualifying Exam (OSPE)', enrolled: 12, modules: 6, avgProgress: 48, price: 950 },
                      { name: 'Pharmacy Math Course', enrolled: 7, modules: 4, avgProgress: 74, price: 299 },
                    ].map((c, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', borderBottom: i < 2 ? '1px solid rgba(12,27,51,0.05)' : 'none' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 10, background: '#0C1B33', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <BookOpen size={22} color="#17C3B2" strokeWidth={1.5} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#0C1B33', marginBottom: 3 }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: '#6B7A96' }}>{c.enrolled} enrolled · {c.modules} modules · Avg. progress {c.avgProgress}% · ${c.price}</div>
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#059669', background: 'rgba(5,150,105,0.08)', padding: '3px 9px', borderRadius: 4 }}>Published</span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button onClick={() => setView('students')} style={{ background: 'rgba(23,195,178,0.08)', border: '1px solid rgba(23,195,178,0.2)', color: '#0FA899', fontFamily: "'DM Sans', sans-serif", fontSize: 11, padding: '5px 11px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>View Students</button>
                          <button style={{ background: 'none', border: '1px solid rgba(12,27,51,0.08)', color: '#6B7A96', fontFamily: "'DM Sans', sans-serif", fontSize: 11, padding: '5px 11px', borderRadius: 6, cursor: 'pointer' }}>Edit</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* ── SESSIONS ── */}
              {view === 'sessions' && (
                <Card title="Scheduled Sessions">
                  <div style={{ padding: '0 16px' }}>
                    {SESSIONS.map((sess, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '12px 0', borderBottom: i < SESSIONS.length - 1 ? '1px solid rgba(12,27,51,0.05)' : 'none', opacity: sess.status === 'done' ? 0.5 : 1 }}>
                        <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 32 }}>
                          <div style={{ fontSize: 9, fontWeight: 600, color: '#6B7A96', textTransform: 'uppercase' }}>{sess.mo}</div>
                          <div style={{ fontSize: 18, fontWeight: 800, color: '#0C1B33', lineHeight: 1.1 }}>{sess.dy}</div>
                        </div>
                        <div style={{ width: 1, background: 'rgba(12,27,51,0.08)', alignSelf: 'stretch', flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 600, color: '#0C1B33' }}>{sess.title}</div>
                          <div style={{ fontSize: 11, color: '#6B7A96', marginTop: 2 }}>{sess.meta}</div>
                          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 4, marginTop: 5, display: 'inline-block', background: sess.status === 'upcoming' ? 'rgba(23,195,178,0.08)' : 'rgba(12,27,51,0.06)', color: sess.status === 'upcoming' ? '#0FA899' : '#6B7A96' }}>
                            {sess.status === 'upcoming' ? 'Upcoming' : 'Completed'}
                          </span>
                        </div>
                        {sess.status === 'upcoming' ? (
                          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                            <button style={{ background: 'rgba(23,195,178,0.08)', border: '1px solid rgba(23,195,178,0.2)', color: '#0FA899', fontFamily: "'DM Sans', sans-serif", fontSize: 11, padding: '5px 11px', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>Start Session</button>
                            <button style={{ background: 'none', border: '1px solid rgba(12,27,51,0.08)', color: '#6B7A96', fontFamily: "'DM Sans', sans-serif", fontSize: 11, padding: '5px 11px', borderRadius: 6, cursor: 'pointer' }}>Edit</button>
                          </div>
                        ) : (
                          <div style={{ fontSize: 12, color: '#6B7A96', flexShrink: 0 }}>Rating: {sess.rating}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* ── MESSAGES ── */}
              {view === 'messages' && (
                <Card title="Student Messages" action="3 unread">
                  <div style={{ padding: '8px' }}>
                    {MESSAGES.map((msg, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: 10, borderRadius: 8, background: msg.unread ? 'rgba(23,195,178,0.04)' : 'transparent', cursor: 'pointer', marginBottom: 2 }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F4F6F9'}
                        onMouseLeave={e => e.currentTarget.style.background = msg.unread ? 'rgba(23,195,178,0.04)' : 'transparent'}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: msg.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{msg.initials}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#0C1B33' }}>{msg.name}</span>
                            <span style={{ fontSize: 10.5, color: '#6B7A96' }}>{msg.time}</span>
                          </div>
                          <div style={{ fontSize: 11.5, color: '#6B7A96', lineHeight: 1.4 }}>{msg.preview}</div>
                        </div>
                        {msg.unread && <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#17C3B2', flexShrink: 0, marginTop: 5 }} />}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* ── ACCESS CODES ── */}
              {view === 'codes' && (
                <>
                  <div style={{ background: 'rgba(23,195,178,0.07)', border: '1px solid rgba(23,195,178,0.2)', borderRadius: 10, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: '#0FA899' }}>
                    <AlertCircle size={15} color="#0FA899" style={{ flexShrink: 0 }} />
                    Codes are auto-generated via Stripe webhooks after payment. Use this page to manage or create manual codes for special cases.
                  </div>
                  <Card title="All Access Codes">
                    <div style={{ padding: '0 16px' }}>
                      {codes.map((c, i) => (
                        <motion.div key={c.code} initial={c.isNew ? { opacity: 0, y: -8 } : false} animate={{ opacity: 1, y: 0 }}
                          style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < codes.length - 1 ? '1px solid rgba(12,27,51,0.05)' : 'none', background: c.isNew ? 'rgba(23,195,178,0.03)' : 'transparent' }}>
                          <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, color: '#0C1B33', background: '#F4F6F9', padding: '3px 9px', borderRadius: 5, letterSpacing: 1, minWidth: 108 }}>{c.code}</div>
                          <div style={{ flex: 1, fontSize: 12, color: '#6B7A96' }}>{c.course}</div>
                          <div style={{ fontSize: 11.5, color: '#6B7A96', minWidth: 160 }}>{c.usedBy}</div>
                          <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: c.status === 'used' ? 'rgba(23,195,178,0.1)' : c.status === 'unused' ? 'rgba(196,154,42,0.1)' : 'rgba(12,27,51,0.06)', color: c.status === 'used' ? '#0FA899' : c.status === 'unused' ? '#C49A2A' : '#6B7A96' }}>
                            {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </Card>
                </>
              )}

              {/* ── REVENUE ── */}
              {view === 'revenue' && (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
                    <StatCard label="Total Revenue (MTD)" value="$14,235" sub="+20% vs last month" up />
                    <StatCard label="Total Revenue (YTD)" value="$68,420" sub="On track" up />
                    <StatCard label="Avg. Revenue / Student" value="$1,094" sub="up from $980" up />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16 }}>
                    <div>
                      <Card title="Monthly Revenue — 2025">
                        <div style={{ padding: '14px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 120 }}>
                            {[
                              { h: 55, label: 'Jan', cur: false },
                              { h: 70, label: 'Feb', cur: false },
                              { h: 100, label: 'Mar', cur: true },
                              { h: 25, label: 'Apr', proj: true },
                              { h: 25, label: 'May', proj: true },
                              { h: 25, label: 'Jun', proj: true },
                            ].map((b, i) => (
                              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                                <div style={{ width: '100%', height: b.h, borderRadius: '5px 5px 0 0', background: b.cur ? '#0C1B33' : '#17C3B2', opacity: b.proj ? 0.22 : b.cur ? 1 : 0.7 }} />
                                <span style={{ fontSize: 10, color: b.cur ? '#0C1B33' : '#6B7A96', fontWeight: b.cur ? 700 : 500 }}>{b.label}</span>
                              </div>
                            ))}
                          </div>
                          <div style={{ display: 'flex', gap: 14, marginTop: 12, fontSize: 11, color: '#6B7A96' }}>
                            {[['#17C3B2', 'Confirmed'], ['#0C1B33', 'Current month'], ['#E9ECF0', 'Projected']].map(([bg, lbl]) => (
                              <span key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: bg, display: 'inline-block' }} />{lbl}</span>
                            ))}
                          </div>
                        </div>
                      </Card>
                      <Card title="Recent Transactions">
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                          <thead>
                            <tr>{['Student', 'Course', 'Amount', 'Date', 'Source'].map(h => <th key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.6px', color: '#6B7A96', padding: '7px 14px', textAlign: 'left', borderBottom: '1px solid rgba(12,27,51,0.08)' }}>{h}</th>)}</tr>
                          </thead>
                          <tbody>
                            {TRANSACTIONS.map((t, i) => (
                              <tr key={i} onMouseEnter={e => e.currentTarget.style.background = '#FAFBFC'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                <td style={{ padding: '11px 14px', fontSize: 12.5, fontWeight: 500 }}>{t.name}</td>
                                <td style={{ padding: '11px 14px', fontSize: 12, color: '#6B7A96' }}>{t.course}</td>
                                <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 700, color: '#0C1B33' }}>${t.amount.toLocaleString()}</td>
                                <td style={{ padding: '11px 14px', fontSize: 12, color: '#6B7A96' }}>{t.date}</td>
                                <td style={{ padding: '11px 14px' }}>
                                  <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: t.type === 'stripe' ? 'rgba(99,91,255,0.08)' : 'rgba(196,154,42,0.08)', color: t.type === 'stripe' ? '#6358FF' : '#C49A2A' }}>
                                    {t.type === 'stripe' ? 'Stripe' : 'Manual'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </Card>
                    </div>
                    <Card title="Revenue by Course">
                      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                        {[
                          { name: 'Pharmacist OSCE', total: '$33,460', pct: 75, color: '#0C1B33', meta: '28 students · $1,195 each' },
                          { name: 'Technician OSPE', total: '$11,400', pct: 35, color: '#17C3B2', meta: '12 students · $950 each' },
                          { name: 'Pharmacy Math', total: '$2,093', pct: 12, color: '#C49A2A', meta: '7 students · $299 each' },
                        ].map((r, i) => (
                          <div key={i}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 5 }}>
                              <span style={{ fontWeight: 600, color: '#0C1B33' }}>{r.name}</span>
                              <span style={{ fontWeight: 700, color: '#0C1B33' }}>{r.total}</span>
                            </div>
                            <div style={{ height: 7, background: '#E9ECF0', borderRadius: 4, overflow: 'hidden', marginBottom: 4 }}>
                              <div style={{ width: `${r.pct}%`, height: '100%', background: r.color, borderRadius: 4 }} />
                            </div>
                            <div style={{ fontSize: 10.5, color: '#6B7A96' }}>{r.meta}</div>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                </>
              )}

              {/* ── SETTINGS ── */}
              {view === 'settings' && (
                <div style={{ maxWidth: 640 }}>
                  {[
                    {
                      title: 'Profile',
                      rows: [
                        { label: 'Full Name', control: <input defaultValue="Uche Isiuwe" style={{ padding: '7px 11px', border: '1.5px solid rgba(12,27,51,0.08)', borderRadius: 7, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#0C1B33', outline: 'none', width: 220 }} /> },
                        { label: 'Email Address', control: <input defaultValue="info@humacap.ca" style={{ padding: '7px 11px', border: '1.5px solid rgba(12,27,51,0.08)', borderRadius: 7, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#0C1B33', outline: 'none', width: 220 }} /> },
                        { label: 'Title', control: <input defaultValue="Lead Instructor & Founder" style={{ padding: '7px 11px', border: '1.5px solid rgba(12,27,51,0.08)', borderRadius: 7, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#0C1B33', outline: 'none', width: 220 }} /> },
                      ],
                    },
                    {
                      title: 'Notifications',
                      rows: [
                        { label: 'New enrollment alert', sub: 'Get notified when a student enrolls', control: <Toggle on={notifs.enrollment} onChange={v => setNotifs(p => ({ ...p, enrollment: v }))} /> },
                        { label: 'New message alert', sub: 'Get notified when a student sends a message', control: <Toggle on={notifs.message} onChange={v => setNotifs(p => ({ ...p, message: v }))} /> },
                        { label: 'Student at-risk alert', sub: "Alert when a student hasn't logged in for 5+ days", control: <Toggle on={notifs.risk} onChange={v => setNotifs(p => ({ ...p, risk: v }))} /> },
                        { label: 'Payment received', sub: 'Email confirmation when Stripe payment completes', control: <Toggle on={notifs.payment} onChange={v => setNotifs(p => ({ ...p, payment: v }))} /> },
                        { label: 'Weekly summary email', sub: 'Summary of enrollments and revenue every Monday', control: <Toggle on={notifs.weekly} onChange={v => setNotifs(p => ({ ...p, weekly: v }))} /> },
                      ],
                    },
                    {
                      title: 'Access Code Settings',
                      rows: [
                        { label: 'Auto-generate on payment', sub: 'Automatically create and email a code via Stripe webhook', control: <Toggle on={codeSettings.autoGenerate} onChange={v => setCodeSettings(p => ({ ...p, autoGenerate: v }))} /> },
                        { label: 'Code expiry (days)', sub: 'How long an unused code remains valid', control: <input value={codeSettings.expiry} onChange={e => setCodeSettings(p => ({ ...p, expiry: e.target.value }))} style={{ padding: '7px 11px', border: '1.5px solid rgba(12,27,51,0.08)', borderRadius: 7, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#0C1B33', outline: 'none', width: 100 }} /> },
                        { label: 'Code prefix', sub: 'Prefix used when generating codes', control: <input value={codeSettings.prefix} onChange={e => setCodeSettings(p => ({ ...p, prefix: e.target.value }))} style={{ padding: '7px 11px', border: '1.5px solid rgba(12,27,51,0.08)', borderRadius: 7, fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: '#0C1B33', outline: 'none', width: 120 }} /> },
                      ],
                    },
                  ].map(section => (
                    <Card key={section.title} title={section.title} style={{ marginBottom: 16 }}>
                      <div style={{ padding: '0 16px' }}>
                        {section.rows.map((row, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderBottom: i < section.rows.length - 1 ? '1px solid rgba(12,27,51,0.05)' : 'none' }}>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 500, color: '#0C1B33' }}>{row.label}</div>
                              {row.sub && <div style={{ fontSize: 11.5, color: '#6B7A96', marginTop: 2 }}>{row.sub}</div>}
                            </div>
                            {row.control}
                          </div>
                        ))}
                      </div>
                    </Card>
                  ))}
                  <Card title="Danger Zone">
                    <div style={{ padding: '0 16px' }}>
                      {[
                        { label: 'Reset all access codes', sub: 'Expire all unused codes immediately', btnLabel: 'Reset Codes', variant: 'danger' },
                        { label: 'Export all student data', sub: 'Download a full CSV of all student records', btnLabel: 'Export CSV', variant: 'outline' },
                      ].map((row, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 0', borderBottom: i === 0 ? '1px solid rgba(12,27,51,0.05)' : 'none' }}>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: '#0C1B33' }}>{row.label}</div>
                            <div style={{ fontSize: 11.5, color: '#6B7A96', marginTop: 2 }}>{row.sub}</div>
                          </div>
                          <Btn label={row.btnLabel} variant={row.variant} />
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
