import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, MapPin, Send } from 'lucide-react';

const ContactPage = ({ navigate }) => {
  const nav = useNavigate();
  const location = useLocation();
  const backTarget = location.state?.from;
  return (
  <div className="corporate-landing">
    <section className="section bg-white" style={{ paddingTop: '8rem' }}>
      <div className="container">
        <div style={{ marginBottom: '2rem' }}>
          <button className="btn-back" onClick={() => (backTarget ? nav(backTarget) : nav(-1))}>
            <ArrowLeft size={16} /> {backTarget ? 'Back to Dashboard' : 'Back'}
          </button>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center max-w-3xl mx-auto">
          <span className="pill-badge">Contact Us</span>
          <h1 className="corporate-title">How Can We <span className="text-teal">Help You?</span></h1>
          <p className="text-xl text-gray-600 mt-6">
            Whether you have questions about our PEBC&reg; coaching or need strategic advisory for your business, we are ready to help.
          </p>
        </motion.div>
      </div>
    </section>

    <section className="section bg-gray-50 border-t border-gray-100">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <div className="glass-card mb-8">
              <h2 className="text-2xl font-bold text-navy mb-6">Connect With Us</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="text-teal mt-1"><Mail size={22} /></div>
                  <div>
                    <h4 className="font-bold text-navy">Email Us</h4>
                    <a href="mailto:info@humacap.ca" className="text-lg text-gray-600 hover:text-teal transition-colors">info@humacap.ca</a>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="text-teal mt-1"><MapPin size={22} /></div>
                  <div>
                    <h4 className="font-bold text-navy">Ottawa, Ontario</h4>
                    <p className="text-gray-600">Serving candidates and businesses across Canada via online delivery.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="glass-card">
              <h3 className="font-bold text-navy mb-4">Response Times</h3>
              <p className="text-gray-600 leading-relaxed">
                Our team monitors inquiries Monday through Friday. You can expect a response within 24–48 business hours.
              </p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="glass-card shadow-xl border-t-4 border-teal">
            <form action="https://formsubmit.co/info@humacap.ca" method="POST" className="space-y-6">
              <div className="input-group">
                <label className="block text-sm font-bold text-navy mb-2">Your Name</label>
                <input type="text" name="name" className="form-input w-full" placeholder="John Doe" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
              </div>
              <div className="input-group">
                <label className="block text-sm font-bold text-navy mb-2">Email Address</label>
                <input type="email" name="email" className="form-input w-full" placeholder="john@example.com" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0' }} />
              </div>
              <div className="input-group">
                <label className="block text-sm font-bold text-navy mb-2">Subject</label>
                <select name="subject" className="form-input w-full" required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', background: 'white' }}>
                  <option value="PEBC Pharmacist Coaching">PEBC&reg; Pharmacist Coaching</option>
                  <option value="PEBC Technician Coaching">PEBC&reg; Technician Coaching</option>
                  <option value="Business Advisory">Business Advisory</option>
                  <option value="General Inquiry">General Inquiry</option>
                </select>
              </div>
              <div className="input-group">
                <label className="block text-sm font-bold text-navy mb-2">Message</label>
                <textarea name="message" className="form-input w-full" rows="5" placeholder="Tell us how we can help..." required style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #E2E8F0', resize: 'vertical' }}></textarea>
              </div>
              <input type="hidden" name="_next" value={typeof window !== 'undefined' ? window.location.origin + '/?success=contact' : ''} />
              <button type="submit" className="btn btn-primary full-width large">
                Send Message <Send size={16} className="ml-2" />
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  </div>
  );
};

export default ContactPage;
