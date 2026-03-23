import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Activity, MapPin, BookOpen, Award, DollarSign, HelpCircle, Mail, CheckCircle } from 'lucide-react';

const BusinessConsultingPath = ({ navigate }) => {
  const goTo = (section) => navigate(`business-consulting/${section}`);

  const sectionCards = [
    {
      key: 'overview',
      icon: <BookOpen size={17} />,
      title: 'Overview',
      desc: 'What this advisory is and who it is designed for.',
    },
    {
      key: 'challenge',
      icon: <TrendingUp size={17} />,
      title: 'The Challenge',
      desc: 'Common pain points we address and what clients gain.',
    },
    {
      key: 'framework',
      icon: <Activity size={17} />,
      title: 'Our Framework',
      desc: 'The three-phase advisory approach we use with every client.',
    },
    {
      key: 'pricing',
      icon: <DollarSign size={17} />,
      title: 'Programs & Pricing',
      desc: 'Three advisory packages — from intensive to ongoing partnership.',
    },
    {
      key: 'why',
      icon: <CheckCircle size={17} />,
      title: 'Why Different',
      desc: 'What sets this advisory apart from generic business coaching.',
    },
    {
      key: 'founder',
      icon: <Award size={17} />,
      title: 'Meet the Founder',
      desc: 'Uche Isiuwe — 25+ years of executive and operational experience.',
    },
    {
      key: 'faq',
      icon: <HelpCircle size={17} />,
      title: 'FAQ',
      desc: 'Answers to common questions about the advisory program.',
    },
    {
      key: 'contact',
      icon: <Mail size={17} />,
      title: 'Book a Call',
      desc: 'Ready to start? Book your executive discovery call today.',
      cta: true,
    },
  ];

  return (
    <div className="corporate-landing">

      {/* HERO */}
      <section style={{ background: '#0C1B33', padding: '88px 0 56px' }}>
        <div className="container">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <span className="pill-badge gold-badge" style={{ display: 'inline-block', marginTop: '2px' }}>Boutique Executive Consultancy</span>
              <h1 className="text-4xl font-bold mt-3 mb-5" style={{ color: 'white', lineHeight: 1.12, letterSpacing: '-0.4px', fontFamily: "'DM Serif Display', serif" }}>
                Executive Business Strategy &amp; Growth Advisory for{' '}
                <em style={{ color: '#F0C96A', fontStyle: 'italic' }}>SMEs &amp; NGOs</em>
              </h1>
              <p style={{ color: 'rgba(255,255,255,0.52)', fontSize: '14px', lineHeight: 1.65, marginBottom: '6px' }}>
                Boutique executive coaching and strategic consulting that helps ambitious businesses scale intelligently, improve operations, and achieve sustainable growth.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: '12px', fontStyle: 'italic', marginBottom: '22px' }}>
                Practical execution. Executive-level insight. Measurable results.
              </p>
              <div className="flex gap-3 flex-wrap">
                <button className="btn btn-gold" onClick={() => navigate('/contact')}>
                  Book Executive Consultation
                </button>
                <button className="btn btn-ghost-white" onClick={() => goTo('pricing')}>
                  Explore Programs
                </button>
                <button className="btn btn-ghost-white" onClick={() => goTo('faq')}>
                  FAQ
                </button>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
              <div className="biz-hero-card">
                <h3 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '14px', color: 'white', marginBottom: '14px' }}>
                  We provide
                </h3>
                {[
                  'Strategic business planning &amp; roadmapping',
                  'Operational optimization &amp; systems design',
                  'Growth execution frameworks',
                  'Executive decision coaching',
                  'Financial clarity &amp; performance tracking',
                ].map((item, i) => (
                  <div key={i} className="biz-hero-item">
                    <div className="biz-hero-dot" />
                    <span dangerouslySetInnerHTML={{ __html: item }} />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION NAVIGATION CARDS */}
      <section className="section bg-white">
        <div className="container">
          <div className="text-center mb-10">
            <span className="pill-badge gold-badge">Explore the Advisory</span>
            <h2 className="text-3xl font-bold text-navy mb-3" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Everything You Need to Know
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
              Click any section to dive deeper — each opens its own dedicated page with full detail.
            </p>
          </div>

          <div className="section-nav-grid">
            {sectionCards.map((card, i) => (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className={`snav-card ${card.cta ? 'snav-card-cta' : ''}`}
                onClick={() => card.key === 'contact' ? navigate('/contact') : goTo(card.key)}
              >
                <div className="snav-icon gold-icon">{card.icon}</div>
                <h3 className="font-bold text-navy mt-3 mb-1" style={{ fontSize: '13.5px' }}>{card.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-3">{card.desc}</p>
                <div className="snav-arrow">{card.cta ? 'Get started →' : 'Read more →'}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* QUICK FACTS */}
      <section className="section bg-gray-50">
        <div className="container">
          <div className="text-center mb-8">
            <span className="pill-badge gold-badge">At a Glance</span>
            <h2 className="text-2xl font-bold text-navy" style={{ fontFamily: "'DM Serif Display', serif" }}>
              Why Clients Choose This Advisory
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { num: '25+', label: 'Years Executive Experience' },
              { num: 'MBA', label: 'Strategic Management' },
              { num: '3', label: 'Structured Advisory Packages' },
            ].map((f, i) => (
              <div key={i} className="glass-card text-center">
                <div style={{ fontFamily: "'DM Serif Display', serif", fontSize: '36px', color: '#C49A2A', marginBottom: '6px' }}>
                  {f.num}
                </div>
                <div style={{ fontSize: '11px', color: '#6B7A96', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {f.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: '#0C1B33', padding: '52px 0' }}>
        <div className="container">
          <div className="flex items-center justify-between gap-8 flex-wrap">
            <div>
              <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '26px', color: 'white', marginBottom: '6px' }}>
                Ready to Scale with <em style={{ color: '#F0C96A' }}>Clarity?</em>
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontStyle: 'italic' }}>
                Stop guessing. Start building a business that works for you.
              </p>
            </div>
            <div className="flex gap-3">
              <button className="btn btn-gold" onClick={() => navigate('/contact')}>
                Book Discovery Call
              </button>
              <button className="btn btn-ghost-white" onClick={() => goTo('pricing')}>
                See Pricing
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default BusinessConsultingPath;
