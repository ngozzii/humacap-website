import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp } from 'lucide-react';

const HomePage = ({ navigate }) => (
  <div className="corporate-landing">
    {/* Hero */}
    <section className="corporate-hero section">
      <div className="container text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <div className="hero-badge" role="note" aria-label="Humacap Training Solutions">
            <span className="hero-badge-icon">
              <BookOpen size={14} />
            </span>
            <span>Humacap Training Solutions</span>
          </div>
          <h1 className="corporate-title">
            Expert Training for{' '}
            <span className="text-teal">Pharmacy Professionals</span> &amp; Growing Businesses
          </h1>
          <div className="max-w-4xl mx-auto mt-6 mb-10">
            <p className="text-lg text-gray-700 leading-relaxed mb-4">
              Expert-led coaching that helps candidates pass the PEBC&reg; exam and businesses scale with structure and confidence.
            </p>
          </div>
          <div className="flex gap-4 justify-center mt-6">
            <button className="btn btn-primary large" onClick={() => navigate('pharmacy')}>
              Explore PEBC&reg; Coaching
            </button>
            <button className="btn btn-outline large" onClick={() => navigate('business-consulting')}>
              Business Advisory
            </button>
          </div>
        </motion.div>
      </div>
    </section>

    {/* Two Paths */}
    <section className="section bg-white border-t border-gray-100">
      <div className="container">
        <div className="section-header">
          <span className="pill-badge">What We Offer</span>
          <h2>Two Paths to Success</h2>
          <p>Structured programs for pharmacy professionals and growing businesses — grounded in real-world expertise.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <motion.div className="pillar-card glass-card flex flex-col" whileHover={{ y: -8 }}>
            <div className="icon-box teal mb-6"><BookOpen size={32} /></div>
            <h3 className="text-xl font-bold text-navy mb-4">PEBC&reg; Exam Coaching</h3>
            <p className="text-gray-600 mb-6 flex-1">
              Structured OSCE coaching for pharmacists and technicians. 180+ cases, weekly live sessions, and real-time feedback from experienced instructors.
            </p>
            <button className="btn btn-text text-teal mt-auto" onClick={() => navigate('pharmacy')}>
              Explore Pharmacy Path &rarr;
            </button>
          </motion.div>

          <motion.div className="pillar-card glass-card flex flex-col" whileHover={{ y: -8 }}>
            <div className="icon-box teal mb-6"><TrendingUp size={32} /></div>
            <h3 className="text-xl font-bold text-navy mb-4">Business Advisory</h3>
            <p className="text-gray-600 mb-6 flex-1">
              MBA-level strategic coaching for SMEs and NGOs — operational clarity, scalable systems, and executive partnership for sustainable growth.
            </p>
            <button className="btn btn-text text-teal mt-auto" onClick={() => navigate('business-consulting')}>
              Explore Business Advisory &rarr;
            </button>
          </motion.div>
        </div>
      </div>
    </section>

    {/* Founder — avatar left, text right (same layout on desktop); original Home teal colors */}
    <section className="section bg-gray-50 border-t border-gray-100">
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
            <p className="founder-bio">
              As Program Lead Instructor she specializes in PEBC&reg; OSCE coaching using structured frameworks and real-world case simulations — combined with deep expertise in business strategy through her MBA and MPH.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default HomePage;
