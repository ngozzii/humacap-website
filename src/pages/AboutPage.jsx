import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

const AboutPage = () => {
  const navigate = useNavigate();
  return (
  <div className="corporate-landing">
    <section className="section bg-white text-center" style={{ paddingTop: '8.5rem' }}>
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <button className="btn-back" onClick={() => navigate('/')}>
            <ArrowLeft size={16} /> Back to Home
          </button>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <span className="pill-badge">About Humacap</span>
          <h1 className="corporate-title">Expert-Led Training &amp; Strategic Advisory</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-6 leading-relaxed">
            Humacap is a Canadian training and advisory firm helping pharmacy professionals achieve licensure and helping businesses grow with clarity and structure.
          </p>
        </motion.div>
      </div>
    </section>

    {/* Video placeholder — author can replace with embed or link */}
    <section className="section bg-gray-50 border-t border-gray-100">
      <div className="container">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-navy mb-4">Watch Our Story</h2>
          <p className="text-gray-600 mb-6">Add your video here — replace this placeholder with your embed code or video link.</p>
          <div
            className="rounded-xl overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-500"
            style={{ aspectRatio: '16/9', minHeight: 200 }}
          >
            <div className="text-center p-6">
              <div className="text-4xl mb-2 opacity-50">▶</div>
              <p className="text-sm font-medium">Video placeholder</p>
              <p className="text-xs mt-1">Replace with your video embed (e.g. YouTube, Vimeo) or link</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Founder — avatar left, text right; original Home teal colors */}
    <section className="section bg-white border-t border-gray-100">
      <div className="container">
        <div className="max-w-4xl mx-auto founder-row">
          <div className="founder-left text-center">
            <div className="founder-avatar mx-auto">U</div>
            <div className="founder-credentials">
              <div className="founder-credentials-row">
                <span className="credential-pill">BPharm</span>
                <span className="credential-pill">MPH</span>
                <span className="credential-pill">MBA</span>
              </div>
              <div className="founder-credentials-row single">
                <span className="credential-pill">RPh</span>
              </div>
            </div>
          </div>
          <div className="founder-right">
            <span className="pill-badge">Meet the Founder</span>
            <h2 className="founder-name mt-3">Uche Isiuwe</h2>
            <p className="founder-bio mb-3">
              A licensed Ontario pharmacist, senior pharmacy leader, and educator with over 25 years of experience in clinical practice, healthcare management, and professional training.
            </p>
            <p className="founder-bio mb-4">
              As a Pharmacy Manager and Program Lead Instructor, she specializes in PEBC&reg; OSCE coaching and exam preparation for pharmacists and pharmacy technicians in Canada, using structured frameworks and advanced real-world case simulations to develop clinical judgment, communication mastery, and high-performance exam strategies.
            </p>
            <p className="founder-bio">
              With an MBA and MPH, Uche also brings deep expertise in business strategy, allowing Humacap to serve both individual professionals and growing organizations.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section className="section bg-white border-t border-gray-100">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-20 h-1 bg-teal mx-auto mb-8"></div>
          <h2 className="text-3xl font-bold text-navy mb-6">Our Mission</h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            To empower pharmacy professionals and growing businesses with the clarity, confidence, and structured frameworks they need to achieve meaningful, lasting success.
          </p>
        </div>
      </div>
    </section>
  </div>
  );
};

export default AboutPage;
