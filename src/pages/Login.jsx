import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ArrowRight, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [portal, setPortal] = useState(localStorage.getItem('humacap_portal_preference') || 'pharmacy');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { supabase } = useAuth();
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin },
        });

    const dashboardPath =
      portal === 'instructor'
        ? '/instructor'
        : (portal === 'business' ? '/dashboard-business' : '/dashboard');
    localStorage.setItem('humacap_portal_preference', portal);

    if (result.error) {
      if (result.error.message === 'Invalid login credentials') {
        setError("Invalid email or password. Please check your spelling or use 'Sign Up' if you haven't created an account yet.");
      } else if (result.error.message.includes('Email not confirmed')) {
        setError('Email not confirmed. Please check your inbox (and spam) for the confirmation link.');
      } else {
        setError(result.error.message);
      }
      setLoading(false);
    } else {
      if (isLogin) {
        navigate(dashboardPath);
      } else {
        if (!result.data.session) {
          setError('Account created! Please click the confirmation link in your email before signing in.');
        } else {
          navigate(dashboardPath);
        }
        setLoading(false);
      }
    }
  };

  const switchMode = (toLogin) => {
    setIsLogin(toLogin);
    setError(null);
    setEmail('');
    setPassword('');
  };

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', fontFamily: "'DM Sans', system-ui, sans-serif", zIndex: 100 }}>

      {/* Left panel */}
      <div style={{ width: '44%', minWidth: 300, background: '#0C1B33', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 44px', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 220, height: 220, background: 'rgba(23,195,178,0.07)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -60, width: 280, height: 280, background: 'rgba(23,195,178,0.04)', borderRadius: '50%', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img src="/logo.jpg" alt="Humacap" style={{ height: 56, width: 'auto', objectFit: 'contain', borderRadius: 8, background: 'white', padding: 2 }} />
          </div>
        </div>

        {/* Hero copy */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: '#17C3B2', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: 16 }}>Student Learning Portal</p>
          <h2 style={{ color: '#fff', fontSize: 32, fontWeight: 800, lineHeight: 1.18, letterSpacing: '-0.025em', marginBottom: 32 }}>
            Prepare with<br /><span style={{ color: '#17C3B2' }}>confidence.</span><br />Pass with pride.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              { label: 'PEBC® Exam Prep', desc: 'Expert-crafted modules tailored to Canadian pharmacy licensure' },
              { label: 'Live Coaching', desc: 'Real-time sessions with experienced clinical educators' },
              { label: 'Sequential Learning', desc: 'Lessons unlock one at a time — complete each before moving on' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 6, height: 6, background: '#17C3B2', borderRadius: '50%', marginTop: 6, flexShrink: 0 }} />
                <div>
                  <div style={{ color: '#fff', fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{item.label}</div>
                  <div style={{ color: 'rgba(255,255,255,0.32)', fontSize: 12, lineHeight: 1.55 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 22 }}>
          <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: 11, fontStyle: 'italic', lineHeight: 1.6 }}>
            &ldquo;Empowering pharmacy professionals to achieve their Canadian licensure goals.&rdquo;
          </p>
        </div>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, background: '#F7F8FA', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', overflowY: 'auto', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.03, pointerEvents: 'none', backgroundImage: 'radial-gradient(circle, #0C1B33 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
        <div style={{ width: '100%', maxWidth: 360, position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <div style={{ marginBottom: 26 }}>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0C1B33', letterSpacing: '-0.025em', marginBottom: 5 }}>
                {isLogin ? 'Welcome back' : 'Create your account'}
              </h1>
              <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.5 }}>
                {isLogin ? 'Sign in to continue your exam prep journey.' : 'Join pharmacy students across Canada.'}
              </p>
            </div>

            {/* Tab switcher */}
            <div style={{ display: 'flex', background: '#eaecef', borderRadius: 11, padding: 3, gap: 3, marginBottom: 22 }}>
              {[{ label: 'Sign In', val: true }, { label: 'Sign Up', val: false }].map(({ label, val }) => (
                <button
                  key={label}
                  onClick={() => switchMode(val)}
                  style={{ flex: 1, height: 34, border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', background: isLogin === val ? '#ffffff' : 'transparent', color: isLogin === val ? '#0C1B33' : '#9ca3af', boxShadow: isLogin === val ? '0 1px 4px rgba(0,0,0,0.08)' : 'none' }}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Portal chooser */}
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#0C1B33', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 7px' }}>
                Choose Portal
              </p>
              <div style={{ display: 'flex', gap: 6, background: '#eef1f5', borderRadius: 10, padding: 4 }}>
                <button
                  type="button"
                  onClick={() => { setPortal('pharmacy'); localStorage.setItem('humacap_portal_preference', 'pharmacy'); }}
                  style={{ flex: 1, height: 34, border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', background: portal === 'pharmacy' ? '#ffffff' : 'transparent', color: portal === 'pharmacy' ? '#0C1B33' : '#7B879B' }}
                >
                  Pharmacy Path
                </button>
                <button
                  type="button"
                  onClick={() => { setPortal('business'); localStorage.setItem('humacap_portal_preference', 'business'); }}
                  style={{ flex: 1, height: 34, border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', background: portal === 'business' ? '#ffffff' : 'transparent', color: portal === 'business' ? '#0C1B33' : '#7B879B' }}
                >
                  Business Path
                </button>
                <button
                  type="button"
                  onClick={() => { setPortal('instructor'); localStorage.setItem('humacap_portal_preference', 'instructor'); }}
                  style={{ flex: 1, height: 34, border: 'none', borderRadius: 8, fontSize: 12.5, fontWeight: 700, cursor: 'pointer', background: portal === 'instructor' ? '#ffffff' : 'transparent', color: portal === 'instructor' ? '#0C1B33' : '#7B879B' }}
                >
                  Instructor
                </button>
              </div>
            </div>

            {/* Error banner */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div key="banner" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px', borderRadius: 10, marginBottom: 18, fontSize: 13, fontWeight: 500, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
                >
                  <span style={{ width: 18, height: 18, borderRadius: '50%', flexShrink: 0, background: '#dc2626', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>!</span>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={handleAuth}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#0C1B33', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Email address</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                    style={{ width: '100%', height: 44, padding: '0 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: '#0C1B33', background: '#ffffff', outline: 'none', boxSizing: 'border-box' }}
                    onFocus={e => { e.target.style.borderColor = '#17C3B2'; e.target.style.boxShadow = '0 0 0 3px rgba(23,195,178,0.1)'; }}
                    onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <label style={{ fontSize: 11, fontWeight: 700, color: '#0C1B33', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Password</label>
                    {isLogin && <button type="button" style={{ fontSize: 11, color: '#17C3B2', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Forgot password?</button>}
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                      style={{ width: '100%', height: 44, padding: '0 44px 0 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 14, color: '#0C1B33', background: '#ffffff', outline: 'none', boxSizing: 'border-box' }}
                      onFocus={e => { e.target.style.borderColor = '#17C3B2'; e.target.style.boxShadow = '0 0 0 3px rgba(23,195,178,0.1)'; }}
                      onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', display: 'flex', padding: 0 }}>
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button type="submit" disabled={loading}
                  style={{ width: '100%', height: 44, background: loading ? '#374151' : '#0C1B33', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 }}
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <>{isLogin ? 'Sign In' : 'Create Account'} <ArrowRight size={16} /></>}
                </button>
              </div>
            </form>

            {/* Trust badge */}
            <div style={{ marginTop: 26, paddingTop: 18, borderTop: '1px solid #ebebeb', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <ShieldCheck size={13} style={{ color: '#17C3B2' }} />
              <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>Secure, encrypted connection</span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
