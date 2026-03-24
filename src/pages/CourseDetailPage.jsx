import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, Globe, Users, Target, ArrowLeft } from 'lucide-react';

const CourseDetailPage = ({ course, navigate, goToCheckout }) => {
  if (!course) return (
    <div className="section container text-center py-20">
      <h2 className="text-2xl font-bold text-navy mb-4">Course not found</h2>
      <button className="btn btn-primary" onClick={() => navigate('pharmacy')}>Back to Courses</button>
    </div>
  );

  const isPharm = course.id?.includes('pharm-osce');
  const isTech = course.id?.includes('tech-osce');

  const whoAreYou = isPharm
    ? 'Internationally Educated Pharmacists (IEPs) seeking licensure in Canada, and recent Canadian pharmacy graduates transitioning to professional practice.'
    : isTech
      ? 'Aspiring licensed pharmacy technicians in Canada, including recent graduates from Canadian technician programs.'
      : 'Internationally Educated Pharmacists and pharmacy candidates needing to strengthen pharmaceutical math foundations.';

  return (
    <div className="corporate-landing">
      {/* Back button */}
      <div className="container" style={{ paddingTop: '2rem', marginBottom: '2rem' }}>
        <button className="btn-back" onClick={() => navigate('pharmacy')}>
          <ArrowLeft size={16} /> Back to Courses
        </button>
      </div>

      {/* Hero */}
      <section style={{ background: '#0C1B33', padding: '40px 0' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="pill-badge teal-badge">{course.category || 'Professional Coaching'}</span>
            <h1 className="text-3xl font-bold text-white mb-4 mt-3" style={{ maxWidth: '600px', letterSpacing: '-0.3px' }}>
              {course.title}
            </h1>
            <p className="mb-6" style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', maxWidth: '560px', lineHeight: 1.65 }}>
              {isPharm
                ? 'Are you feeling overwhelmed by the daunting prospect of the PEBC® OSCE? Our comprehensive coaching course is tailored to empower you with the knowledge, skills, and confidence needed to excel.'
                : isTech
                  ? 'Tailored to empower pharmacy technician candidates with the confidence needed to excel in the PEBC® OSCE / OSPE examination.'
                  : 'Master the fundamental calculations required for the PEBC® exams with our structured prep course.'}
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <button
                className="btn btn-teal large"
                onClick={() => goToCheckout(course)}
              >
                Enroll Now — ${course.price}
              </button>
              <div className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px' }}>
                <Globe size={16} style={{ color: '#17C3B2' }} /> Live Online Delivery
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Course Details */}
      <section className="section bg-white">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-10 mb-12">
            {/* Left column */}
            <div>
              {/* Quick Info */}
              <div className="glass-card mb-6">
                <h3 className="font-bold text-navy text-lg mb-4 pb-3 border-b border-gray-100">Course Quick Info</h3>
                <div className="space-y-3">
                  <div className="flex gap-3 items-start">
                    <Globe className="text-teal flex-shrink-0 mt-0.5" size={16} />
                    <div>
                      <strong className="block text-sm text-navy">Format</strong>
                      <span className="text-sm text-gray-600">Weekly Synchronous Online Classes</span>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <Target className="text-teal flex-shrink-0 mt-0.5" size={16} />
                    <div>
                      <strong className="block text-sm text-navy">Content</strong>
                      <span className="text-sm text-gray-600">Over 180 Cases + Group Practice</span>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <Users className="text-teal flex-shrink-0 mt-0.5" size={16} />
                    <div>
                      <strong className="block text-sm text-navy">Guidance</strong>
                      <span className="text-sm text-gray-600">Led by Uche Isiuwe (25+ Yrs Exp)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Who */}
              <div className="glass-card mb-6">
                <h3 className="font-bold text-navy text-lg mb-3 pb-3 border-b border-gray-100">Who is this for?</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{whoAreYou}</p>
              </div>

              {/* What you'll learn */}
              <div className="glass-card">
                <h3 className="font-bold text-navy text-lg mb-4 pb-3 border-b border-gray-100">What You Will Learn</h3>
                <ul className="space-y-3 no-bullets">
                  {[
                    'Communication Skills: Verbal and non-verbal mastery',
                    'Clinical Knowledge Application: Real-world scenarios',
                    'Case Analysis & Problem-Solving: Systematic approach',
                    'Professionalism & Ethics: Ethical decision-making',
                    'Performance Feedback: Real-time improvements',
                    'Confidence Building: Managing exam pressure',
                  ].map((item, i) => (
                    <li key={i} className="flex gap-3 items-start">
                      <CheckCircle className="text-teal mt-0.5 flex-shrink-0" size={16} />
                      <span className="text-gray-700 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right column */}
            <div>
              {/* Price box */}
              <div className="border-2 border-teal rounded-xl p-6 bg-white text-center mb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">Enrollment</p>
                <p className="text-5xl font-bold text-navy mb-1" style={{ fontFamily: "'DM Serif Display', serif" }}>
                  ${course.price}
                </p>
                <p className="text-sm text-gray-400 mb-5">CAD + applicable tax</p>
                <button className="btn btn-primary full-width large mb-2" onClick={() => goToCheckout(course)}>
                  Enroll Now — ${course.price}
                </button>
                <p className="text-xs text-gray-400">
                  Access code emailed automatically after payment via Stripe.
                </p>
              </div>

              {/* Why choose us */}
              <div className="glass-card mb-5">
                <h3 className="font-bold text-navy text-lg mb-3 pb-3 border-b border-gray-100">Why Choose Us?</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  We provide comprehensive training that mirrors the format and rigor of the PEBC&reg; OSCE exam. You'll participate in mock sessions and role-playing to ensure you are ready for the real thing.
                </p>
                <div className="p-4 bg-teal bg-opacity-5 rounded-lg border border-teal border-opacity-20">
                  <h4 className="font-bold text-teal text-sm mb-1">Interactive Learning</h4>
                  <p className="text-xs text-gray-600">Every student gets a chance to practice weekly using our repeatable frameworks.</p>
                </div>
              </div>

              {/* Delivery */}
              <div className="glass-card">
                <h3 className="font-bold text-navy text-lg mb-3 pb-3 border-b border-gray-100">Method of Delivery</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Online delivery consisting of asynchronous self-paced learning, group practice sessions, and weekly live online classes.
                </p>
              </div>
            </div>
          </div>

          {/* CTA at bottom */}
          <div className="text-center py-8 border-t border-gray-100">
            <h3 className="text-2xl font-bold text-navy mb-6" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Ready to start your journey?
            </h3>
            <button className="btn btn-primary large mr-4" onClick={() => goToCheckout(course)}>
              Enroll in {course.title} — ${course.price}
            </button>
            <button className="btn btn-outline large" onClick={() => navigate('contact')}>
              Have questions? Contact us
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseDetailPage;
