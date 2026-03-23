import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, TrendingUp, AlertCircle, CheckCircle,
  Activity, MapPin, BookOpen, Shield, Award, DollarSign, HelpCircle,
} from 'lucide-react';

const SECTIONS = {
  overview: {
    label: 'Overview',
    title: 'MBA-Level Strategic Coaching for SMEs',
    content: ({ navigate }) => (
      <div>
        <div className="max-w-3xl mb-10">
          <p className="text-gray-600 leading-relaxed mb-4" style={{ fontSize: '14px', lineHeight: 1.8 }}>
            Most small and medium businesses don't fail from lack of effort — they stall because of{' '}
            <strong className="text-navy">unclear strategy, inefficient systems, and fragmented decision-making.</strong>
          </p>
          <p className="text-gray-600 leading-relaxed" style={{ fontSize: '14px', lineHeight: 1.8 }}>
            This executive business training program delivers MBA-level strategic coaching and SME consulting,
            helping leaders build strong foundations, optimize performance, and scale with confidence.
          </p>
        </div>

        <h3 className="text-xl font-bold text-navy mb-6">This Advisory Is Designed For</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: <BookOpen size={16} />, text: 'Small and medium business and NGO owners seeking operational clarity' },
            { icon: <TrendingUp size={16} />, text: 'Entrepreneurs transitioning from startup to scale' },
            { icon: <Activity size={16} />, text: 'Leaders building systems for sustainable growth' },
            { icon: <MapPin size={16} />, text: 'Businesses improving efficiency and profitability' },
            { icon: <Award size={16} />, text: 'Executives seeking structured strategic guidance' },
          ].map((item, i) => (
            <div key={i} className="who-card glass-card">
              <div className="who-icon gold-icon">{item.icon}</div>
              <p className="text-sm text-gray-600 mt-3 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    ),
    cta: { label: 'Ready to get started?', sub: 'Book your executive discovery call today.', next: { label: 'See Our Framework →', key: 'framework' } },
  },

  challenge: {
    label: 'The Challenge',
    title: 'Strategic Challenges We Address',
    sub: 'Growing businesses commonly face these bottlenecks — we replace uncertainty with clear strategy, structured systems, and disciplined execution.',
    content: () => (
      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass-card border-l-4" style={{ borderLeftColor: '#D0353C' }}>
          <h3 className="font-bold text-lg mb-5" style={{ color: '#A32D2D' }}>Common Pain Points</h3>
          <ul className="space-y-3 no-bullets">
            {[
              'Scaling without operational structure',
              'Inefficient workflows and unclear priorities',
              'Revenue growth without profitability optimization',
              'Leadership overload and decision fatigue',
              'Weak strategic planning frameworks',
              'Fragmented execution across teams',
            ].map((item, i) => (
              <li key={i} className="flex gap-3 items-start">
                <AlertCircle size={15} className="flex-shrink-0 mt-0.5" style={{ color: '#D0353C' }} />
                <span className="text-gray-700 text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="glass-card border-l-4 border-teal">
          <h3 className="font-bold text-lg mb-5 text-teal">What Clients Gain</h3>
          <ul className="space-y-3 no-bullets">
            {[
              'A defined strategic roadmap for growth',
              'Optimized operational systems',
              'Improved executive decision frameworks',
              'Stronger leadership alignment',
              'Financial and performance clarity',
              'Practical tools implemented immediately',
            ].map((item, i) => (
              <li key={i} className="flex gap-3 items-start">
                <CheckCircle size={15} className="text-teal flex-shrink-0 mt-0.5" />
                <span className="text-gray-700 text-sm">{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-5 pt-4 border-t border-teal border-opacity-20 text-sm text-teal italic">
            We replace uncertainty with clear strategy, structured systems, and disciplined execution.
          </p>
        </div>
      </div>
    ),
    cta: { label: 'We can solve these challenges.', sub: "Let's build a business that works for you.", next: { label: 'See Our Framework →', key: 'framework' } },
  },

  framework: {
    label: 'Our Framework',
    title: 'Three-Phase Advisory Approach',
    sub: 'A structured methodology from diagnosis through to implementation.',
    content: () => (
      <div className="grid md:grid-cols-3 gap-6">
        {[
          {
            num: '01', title: 'Executive Business Assessment',
            desc: 'A comprehensive evaluation of your current business position.',
            items: ['Business strategy & market positioning', 'Operational efficiency & systems audit', 'Financial structure & performance drivers', 'Growth opportunities & risk areas'],
          },
          {
            num: '02', title: 'Strategic Planning & Architecture',
            desc: 'Building the strategic blueprint for your next stage.',
            items: ['Clear executive priorities', 'Growth roadmap & milestones', 'Operational improvement plans', 'Execution frameworks'],
          },
          {
            num: '03', title: 'Implementation Advisory',
            desc: 'Ongoing executive coaching through execution.',
            items: ['Execute strategic initiatives', 'Resolve operational bottlenecks', 'Track measurable performance', 'Optimize business systems'],
          },
        ].map((phase, i) => (
          <div key={i} className="phase-card glass-card">
            <div className="phase-num">{phase.num}</div>
            <h3 className="font-bold text-navy text-lg mb-2">{phase.title}</h3>
            <p className="text-sm text-gray-500 mb-4 italic">{phase.desc}</p>
            <ul className="space-y-2 no-bullets">
              {phase.items.map((item, j) => (
                <li key={j} className="flex gap-2 items-start text-sm text-gray-600">
                  <CheckCircle size={14} className="flex-shrink-0 mt-0.5" style={{ color: '#C49A2A' }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    ),
    cta: { label: 'Ready to start Phase 1?', sub: 'Book your executive business assessment today.', next: { label: 'See Pricing →', key: 'pricing' } },
  },

  pricing: {
    label: 'Programs & Pricing',
    title: 'Choose Your Advisory Package',
    sub: 'Structured programs designed for clarity and measurable results at every stage of growth.',
    content: ({ navigate }) => (
      <div>
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            {
              title: 'Executive Strategy Intensive',
              tagline: 'For leaders seeking rapid clarity and direction.',
              price: '$750', cad: 'CAD — One-time investment',
              features: ['90-minute executive strategy session', 'Deep business assessment', 'Customized written action roadmap'],
              btn: 'Book Strategy Intensive', style: 'outline',
            },
            {
              title: 'Growth Accelerator Program',
              tagline: 'For SMEs ready to scale operations and revenue.',
              price: '$3,000', cad: 'CAD — Full program investment',
              features: ['Six executive coaching sessions', 'Strategic planning & implementation support', 'Performance tracking systems'],
              btn: 'Apply for Growth Accelerator', popular: true, style: 'gold',
            },
            {
              title: 'Executive Advisory Partnership',
              tagline: 'Ongoing high-level strategic partnership.',
              price: 'Custom', cad: 'Tailored engagement',
              features: ['Monthly executive advisory sessions', 'Continuous optimization support', 'Priority consulting access'],
              btn: 'Request Advisory Partnership', style: 'outline',
            },
          ].map((pkg, i) => (
            <div key={i} className={`glass-card flex flex-col hover-lift ${pkg.popular ? 'border-gold border-2' : ''}`}>
              {pkg.popular && <span className="pill-badge gold-badge w-fit mb-3">Most Popular</span>}
              <h3 className="font-bold text-xl text-navy mb-2" style={{ fontFamily: "'DM Serif Display', serif" }}>{pkg.title}</h3>
              <p className="text-sm text-gray-500 mb-5 flex-1 italic">{pkg.tagline}</p>
              <div className="mb-1">
                <span className="text-3xl font-bold text-navy" style={{ fontFamily: "'DM Serif Display', serif" }}>{pkg.price}</span>
              </div>
              <p className="text-xs text-gray-400 mb-5">{pkg.cad}</p>
              <ul className="space-y-2 mb-6 no-bullets">
                {pkg.features.map((f, j) => (
                  <li key={j} className="flex gap-2 text-sm text-gray-600">
                    <CheckCircle size={14} style={{ color: '#C49A2A', flexShrink: 0, marginTop: 2 }} /> {f}
                  </li>
                ))}
              </ul>
              <button
                className={`btn full-width ${pkg.style === 'gold' ? 'btn-gold' : 'btn-primary'}`}
                onClick={() => navigate('/contact')}
              >
                {pkg.btn}
              </button>
            </div>
          ))}
        </div>
        <div className="text-center pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Not sure which package is right for you?{' '}
            <button
              onClick={() => navigate('/business-consulting/faq')}
              style={{ background: 'none', border: 'none', color: '#C49A2A', fontFamily: 'inherit', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
            >
              Read our FAQ →
            </button>
          </p>
        </div>
      </div>
    ),
    cta: { label: 'Questions about pricing?', sub: "We're happy to talk through which package fits your situation.", next: { label: 'Read FAQ →', key: 'faq' } },
  },

  why: {
    label: "Why Different",
    title: 'This Advisory Is Different',
    dark: true,
    content: () => (
      <div>
        <p className="mb-8 max-w-2xl" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: 1.65 }}>
          Led by an MBA-trained executive strategist and healthcare leader with 25+ years of leadership and operational experience.
          Unlike generic business coaching, this advisory combines:
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { title: 'Executive-Level Strategic Frameworks', desc: 'MBA-grade methodology applied to your specific business context and goals.' },
            { title: 'Evidence-Based Management Principles', desc: 'Strategies grounded in research and proven operational leadership.' },
            { title: 'Real Operational Leadership Experience', desc: '25+ years of lived executive experience — not theoretical coaching.' },
            { title: 'Practical, Implementation-Focused Coaching', desc: "We don't just give advice — we build and execute alongside you." },
          ].map((item, i) => (
            <div key={i} className="why-card">
              <div className="why-icon gold-icon"><Shield size={16} /></div>
              <div>
                <h4 className="font-bold mb-1" style={{ color: 'rgba(255,255,255,0.85)', fontSize: '13px' }}>{item.title}</h4>
                <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '12px', lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
    cta: { label: 'Experience the difference.', sub: 'Book your first session and see for yourself.', next: { label: 'Meet the Founder →', key: 'founder' } },
  },

  founder: {
    label: 'Meet the Founder',
    title: 'Led by Real Executive Experience',
    content: () => (
      <div className="max-w-3xl mx-auto flex flex-col md:flex-row gap-10 items-center">
        <div className="flex-shrink-0 text-center">
          <div className="founder-avatar gold-avatar mx-auto">U</div>
          <div className="flex gap-2 flex-wrap justify-center mt-3">
            {['BPharm', 'MPH', 'MBA', 'RPh'].map(c => (
              <span key={c} className="credential-pill gold-pill">{c}</span>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold text-navy mb-4" style={{ fontFamily: "'DM Serif Display', serif" }}>Uche Isiuwe</h3>
          <p className="text-gray-600 leading-relaxed mb-3" style={{ fontSize: '13.5px' }}>
            An MBA-trained executive strategist and healthcare leader with over 25 years of experience in clinical
            practice, healthcare management, and strategic business leadership.
          </p>
          <p className="text-gray-600 leading-relaxed mb-4" style={{ fontSize: '13.5px' }}>
            With an MBA in Strategic Management and an MPH, Uche brings executive-level frameworks to business owners
            and leaders — combining real operational experience with structured, evidence-based strategic coaching.
          </p>
          <blockquote className="border-l-4 pl-4 italic text-gray-500" style={{ borderLeftColor: '#C49A2A', fontSize: '13.5px' }}>
            "I've sat in the manager's chair. I know the pressure of operations, compliance, and performance.
            My consulting isn't academic — it's built on decades of operational reality."
          </blockquote>
        </div>
      </div>
    ),
    cta: { label: 'Work directly with Uche.', sub: 'Book your executive discovery call today.', next: { label: 'See Pricing →', key: 'pricing' } },
  },

  faq: {
    label: 'FAQ',
    title: 'Common Questions',
    sub: 'Everything you need to know before booking.',
    content: ({ navigate }) => (
      <div>
        <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto mb-8">
          {[
            { q: 'Is this industry-specific?', a: 'No. The frameworks are adaptable across industries and customized to your specific business context and goals.' },
            { q: 'How soon will we see impact?', a: 'Many clients experience strategic clarity and operational improvements within the first sessions.' },
            { q: 'Is this suitable for early-stage businesses?', a: 'Yes. Structured strategy benefits both startups and scaling SMEs — we meet you where you are.' },
            { q: 'Are sessions virtual?', a: 'Yes. Coaching is delivered online to serve clients globally, with flexible scheduling to suit your timezone.' },
            { q: 'How long does each program take?', a: 'The Intensive is a single 90-minute session. The Accelerator runs 8 weeks. The Partnership is ongoing month-to-month.' },
            { q: 'What industries do you serve?', a: 'Pharmacy owners, healthcare executives, NGO leaders, and service-based SMEs across Canada and globally.' },
          ].map((item, i) => (
            <div key={i} className="glass-card">
              <h4 className="font-bold text-navy mb-2 flex gap-2 items-start">
                <span className="faq-q-badge">Q</span>
                {item.q}
              </h4>
              <p className="text-sm text-gray-600 leading-relaxed pl-7">{item.a}</p>
            </div>
          ))}
        </div>
        <div className="text-center pt-6 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-4">Still have questions?</p>
          <button className="btn btn-gold" onClick={() => navigate('/contact')}>Contact Us Directly</button>
        </div>
      </div>
    ),
    cta: { label: 'Ready to take the next step?', sub: 'Clarity drives decisions. Decisions drive growth.', next: { label: 'See Pricing →', key: 'pricing' } },
  },
};

export default function BusinessConsultingSubPage() {
  const { section } = useParams();
  const navigate = useNavigate();

  const config = SECTIONS[section];

  if (!config) {
    navigate('/business-consulting', { replace: true });
    return null;
  }

  const isDark = !!config.dark;
  const goTo = (key) => navigate(`/business-consulting/${key}`);
  const goBack = () => navigate('/business-consulting');

  return (
    <div className="corporate-landing">

      {/* MAIN SECTION */}
      <section className={`section ${isDark ? 'bg-navy' : 'bg-white'}`} style={{ paddingTop: '5rem' }}>
        <div className="container">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6" style={{ fontSize: '12px', color: isDark ? 'rgba(255,255,255,0.4)' : '#6B7A96' }}>
            <button
              onClick={goBack}
              style={{ background: 'none', border: 'none', fontFamily: 'inherit', fontSize: '12px', fontWeight: 500, color: '#C49A2A', cursor: 'pointer', padding: 0 }}
            >
              Business Advisory
            </button>
            <span>/</span>
            <span>{config.label}</span>
          </div>

          {/* Back button */}
          <button className="btn-back" onClick={goBack} style={{ marginBottom: '1.5rem' }}>
            <ArrowLeft size={15} /> Back to Business Advisory
          </button>

          {/* Badge + Heading */}
          <span className="pill-badge gold-badge">{config.label}</span>
          <h1
            className={`text-3xl font-bold mb-4 mt-2 ${isDark ? 'text-white' : 'text-navy'}`}
            style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: '-0.3px' }}
          >
            {config.title}
          </h1>
          {config.sub && (
            <p className={`mb-8 max-w-xl leading-relaxed`} style={{ fontSize: '14px', color: isDark ? 'rgba(255,255,255,0.5)' : '#6B7A96' }}>
              {config.sub}
            </p>
          )}

          {/* Content */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            {config.content({ navigate, goTo })}
          </motion.div>

        </div>
      </section>

      {/* CONTEXTUAL CTA BAR */}
      {config.cta && (
        <section style={{ background: '#0C1B33', padding: '40px 0' }}>
          <div className="container flex items-center justify-between gap-8 flex-wrap">
            <div>
              <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '22px', color: 'white', marginBottom: '5px' }}>
                {config.cta.label}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontStyle: 'italic' }}>
                {config.cta.sub}
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <button className="btn btn-gold" onClick={() => navigate('/contact')}>
                Book Executive Consultation
              </button>
              {config.cta.next && (
                <button className="btn btn-ghost-white" onClick={() => goTo(config.cta.next.key)}>
                  {config.cta.next.label}
                </button>
              )}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
