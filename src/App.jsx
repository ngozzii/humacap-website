import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { loadStripe } from '@stripe/stripe-js';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

import HomePage from './pages/HomePage';
import PharmacyPath from './pages/PharmacyPath';
import BusinessConsultingPath from './pages/BusinessConsultingPath';
import BusinessConsultingSubPage from './pages/BusinessConsultingSubPage';
import CourseDetailPage from './pages/CourseDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import ResourcesPage from './pages/ResourcesPage';
import DownloadSuccess from './pages/DownloadSuccess';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import BusinessDashboard from './pages/BusinessDashboard';
import BusinessCoursePlaceholder from './pages/BusinessCoursePlaceholder';
import CoursePlayer from './pages/CoursePlayer';
import ProfilePage from './pages/ProfilePage';
import InstructorDashboard from './pages/InstructorDashboard';

import './App.css';

const BARE_ROUTES = ['/login', '/dashboard', '/player', '/profile', '/instructor'];
let stripePromise;

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#17C3B2', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

const AppContent = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, supabase } = useAuth();

  const hideChromeRoute = BARE_ROUTES.some(r => location.pathname.startsWith(r));

  const handleNavigate = (path) => {
    if (path === 'home') {
      navigate('/');
      return;
    }
    if (path === 'dashboard') {
      const portal = localStorage.getItem('humacap_portal_preference');
      if (portal === 'instructor') {
        navigate('/instructor');
        return;
      }
      navigate(portal === 'business' ? '/dashboard-business' : '/dashboard');
      return;
    }
    navigate(`/${path}`);
  };

  const goToCheckout = async (course) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      if (!accessToken) {
        navigate('/login');
        return;
      }

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ courseId: course.id }),
      });
      const payload = await response.json();
      if (!payload.ok || !payload.sessionId || !payload.publishableKey) {
        if (response.status === 401) {
          navigate('/login');
          return;
        }
        throw new Error(payload.error || 'Unable to start checkout.');
      }

      stripePromise = stripePromise || loadStripe(payload.publishableKey);
      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to initialize.');

      const { error } = await stripe.redirectToCheckout({ sessionId: payload.sessionId });
      if (error) throw error;
    } catch (_err) {
      setSelectedCourse(course);
      navigate('/checkout');
    }
  };

  const viewCourse = (course) => {
    setSelectedCourse(course);
    navigate('/course-detail');
  };

  return (
    <div className="App">
      {!hideChromeRoute && (
        <Navbar navigate={handleNavigate} />
      )}

      <main style={{ minHeight: hideChromeRoute ? '100vh' : '80vh' }}>
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<HomePage navigate={handleNavigate} />} />
            <Route path="/pharmacy" element={<PharmacyPath viewCourse={viewCourse} navigate={handleNavigate} />} />
            <Route path="/courses" element={<PharmacyPath viewCourse={viewCourse} navigate={handleNavigate} />} />
            <Route path="/business-consulting" element={<BusinessConsultingPath navigate={(path) => navigate(`/${path}`)} />} />
            <Route path="/business-consulting/:section" element={<BusinessConsultingSubPage />} />
            <Route path="/course-detail" element={<CourseDetailPage course={selectedCourse} navigate={handleNavigate} goToCheckout={goToCheckout} />} />
            <Route path="/checkout" element={<CheckoutPage course={selectedCourse} navigate={handleNavigate} />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage navigate={handleNavigate} />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="/download-success" element={<DownloadSuccess />} />
            <Route path="/login" element={<LoginPage />} />

            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/dashboard-business" element={<ProtectedRoute><BusinessDashboard /></ProtectedRoute>} />
            <Route path="/dashboard-business/course/:courseId" element={<ProtectedRoute><BusinessCoursePlaceholder /></ProtectedRoute>} />
            <Route path="/player/:courseId" element={<ProtectedRoute><CoursePlayer /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/instructor" element={<ProtectedRoute><InstructorDashboard /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      {!hideChromeRoute && <Footer navigate={handleNavigate} />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
