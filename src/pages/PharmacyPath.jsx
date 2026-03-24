import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Wrench, Percent, AlertCircle, CheckCircle } from 'lucide-react';
import { COURSES_DATA } from '../data/courses';

const PharmacyPath = ({ viewCourse, navigate }) => {
  const courses = {
    pharm: COURSES_DATA.find(c => c.id === 'pharm-osce'),
    tech: COURSES_DATA.find(c => c.id === 'tech-osce'),
    math: COURSES_DATA.find(c => c.id === 'pharm-math'),
  };

  return (
    <div className="corporate-landing">
      {/* Hero */}
      <section className="section bg-navy text-center" style={{ paddingTop: '6rem', paddingBottom: '3rem', background: '#0C1B33' }}>
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="pill-badge teal-badge">PEBC&reg; Exam Prep</span>
            <h1 className="text-4xl font-bold mb-4 text-white">
              Pass the PEBC&reg; Exam with <span style={{ color: '#17C3B2', fontStyle: 'italic' }}>Confidence</span>
            </h1>
            <p className="text-xl mb-8 max-w-3xl mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Expert-led, interactive coaching for pharmacists, technicians, and international graduates.
              The PEBC&reg; exam is not just about knowledge — it's about how you perform under pressure.
            </p>
            <button
              className="btn btn-primary large"
              onClick={() => document.getElementById('courses').scrollIntoView({ behavior: 'smooth' })}
              style={{ background: '#17C3B2', color: '#0C1B33' }}
            >
              Choose Your Course &rarr;
            </button>
          </motion.div>
        </div>
      </section>

      {/* Why candidates struggle */}
      <section className="section bg-white border-b border-gray-100">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl font-bold text-navy mb-4">Why Candidates Struggle with the PEBC&reg; Exam</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Passing the PEBC&reg; exam isn't just about knowledge — it's about how you perform under pressure. Even capable candidates often struggle with:
              </p>
              <ul className="space-y-3 no-bullets">
                {[
                  'Organising thoughts under strict time limits',
                  'Communicating clearly and professionally',
                  'Applying consistent clinical frameworks',
                  'Delivering safe, confident recommendations',
                ].map((item, i) => (
                  <li key={i} className="flex gap-3 items-start">
                    <AlertCircle className="text-red-500 mt-1 flex-shrink-0" size={18} />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card border-l-4 border-teal">
              <h3 className="text-xl font-bold text-navy mb-4">Our coaching bridges that gap</h3>
              <p className="text-gray-600 mb-5">
                At Humacap, we offer specialised coaching to help candidates master performance through intensive practice and structured feedback.
              </p>
              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-navy mb-2 flex items-center gap-2">
                    <CheckCircle className="text-teal" size={18} /> What You Will Learn
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-2 pl-7 list-disc">
                    <li><strong>Communication Skills:</strong> Master verbal and non-verbal skills to interact confidently with patients and healthcare teams.</li>
                    <li><strong>Knowledge Application:</strong> Learn to apply pharmaceutical principles to real-world scenarios for optimal patient care.</li>
                    <li><strong>Case Analysis &amp; Problem-Solving:</strong> Develop a systematic approach to analyse complex cases under exam pressure.</li>
                    <li><strong>Professionalism &amp; Ethics:</strong> Bridge the gap between international experience and Canadian practice standards.</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-navy mb-2 flex items-center gap-2">
                    <CheckCircle className="text-teal" size={18} /> Why Choose Humacap?
                  </h4>
                  <p className="text-sm text-gray-600 pl-7">
                    Expert guidance, a meticulously designed structured curriculum, and an interactive learning environment that mirrors the rigour of the actual PEBC&reg; OSCE exam.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Delivery method */}
      <section className="section bg-gray-50 border-b border-gray-100">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-navy mb-6 text-center">Our Method of Delivery</h2>
            <div className="glass-card p-8 bg-white">
              <p className="text-lg text-gray-600 leading-relaxed text-center">
                Our online delivery consists of a combination of <strong>asynchronous self-paced learning</strong>, group practice sessions, and <strong>weekly synchronous online live classes</strong>.
              </p>
              <div className="mt-8 grid md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl bg-teal bg-opacity-5 border border-teal border-opacity-20 text-center">
                  <h4 className="font-bold text-teal mb-2">180+ Cases</h4>
                  <p className="text-sm text-gray-600">We meticulously go through over 180 actual scenarios.</p>
                </div>
                <div className="p-4 rounded-xl bg-navy bg-opacity-5 border border-navy border-opacity-20 text-center">
                  <h4 className="font-bold text-navy mb-2">Weekly Practice</h4>
                  <p className="text-sm text-gray-600">Every student gets the chance to practice using our frameworks.</p>
                </div>
              </div>
              <p className="mt-6 text-center text-gray-500 italic text-sm">
                Real-time feedback is provided to help identify areas of improvement and build &ldquo;mental memory&rdquo; for the real exam.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Course Cards */}
      <section className="section" id="courses">
        <div className="container">
          <div className="section-header">
            <h2>Pick the Course That Fits Your Goal</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card hover-lift flex flex-col">
              <div className="mb-4 text-teal"><Briefcase size={32} /></div>
              <h3 className="font-bold text-xl text-navy mb-2">Pharmacist OSCE Course</h3>
              <p className="text-sm text-gray-600 mb-4 flex-1">
                Targeted preparation for internationally educated pharmacists and recent Canadian graduates.
              </p>
              <button className="btn btn-primary full-width" onClick={() => viewCourse(courses.pharm)}>
                View Full Details &rarr;
              </button>
            </div>
            <div className="glass-card hover-lift flex flex-col">
              <div className="mb-4 text-teal"><Wrench size={32} /></div>
              <h3 className="font-bold text-xl text-navy mb-2">Technician OSPE Course</h3>
              <p className="text-sm text-gray-600 mb-4 flex-1">
                Empowering aspiring technicians with the communication skills and knowledge to excel in the OSPE.
              </p>
              <button className="btn btn-primary full-width" onClick={() => viewCourse(courses.tech)}>
                View Full Details &rarr;
              </button>
            </div>
            <div className="glass-card hover-lift flex flex-col">
              <div className="mb-4 text-teal"><Percent size={32} /></div>
              <h3 className="font-bold text-xl text-navy mb-2">PEBC&reg; Math Prep</h3>
              <p className="text-sm text-gray-600 mb-4 flex-1">
                Accurate, timed practice and proven strategies to master exam calculations with confidence.
              </p>
              <button className="btn btn-primary full-width" onClick={() => viewCourse(courses.math)}>
                View Full Details &rarr;
              </button>
            </div>
          </div>
          <p className="text-center mt-8 text-gray-500 italic text-sm">
            Each course is live, interactive, and led by Uche Isiuwe with 25+ years of experience.
          </p>
        </div>
      </section>
    </div>
  );
};

export default PharmacyPath;
