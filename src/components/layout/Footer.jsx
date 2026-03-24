import React from 'react';
import { Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer = ({ navigate }) => (
  <footer className="footer">
    <div className="container footer-content">
      <div className="footer-col">
        <p>Empowering pharmacy professionals and growing businesses with expert-led training and strategic advisory.</p>
        <div className="flex flex-row gap-3 mt-5 justify-center">
          <a href="https://www.facebook.com/humacap.ca/" target="_blank" rel="noopener noreferrer" className="social-link" style={{ color: 'var(--color-teal)' }}>
            <Facebook size={18} />
          </a>
          <a href="https://www.instagram.com/humacap.ca" target="_blank" rel="noopener noreferrer" className="social-link" style={{ color: 'var(--color-teal)' }}>
            <Instagram size={18} />
          </a>
          <a href="https://www.linkedin.com/company/humacap-ca/" target="_blank" rel="noopener noreferrer" className="social-link" style={{ color: 'var(--color-teal)' }}>
            <Linkedin size={18} />
          </a>
        </div>
      </div>

      <div className="footer-col">
        <h4>Programs</h4>
        <div className="footer-links">
          <button className="footer-link" onClick={() => navigate('pharmacy')}>Pharmacy Path</button>
          <button className="footer-link" onClick={() => navigate('business-consulting')}>Business Advisory</button>
          <button className="footer-link" onClick={() => navigate('courses')}>All Courses</button>
        </div>
      </div>

      <div className="footer-col">
        <h4>Company</h4>
        <div className="footer-links">
          <button className="footer-link" onClick={() => navigate('about')}>About Us</button>
          <button className="footer-link" onClick={() => navigate('contact')}>Contact</button>
          <button className="footer-link" onClick={() => navigate('resources')}>Free Resources</button>
        </div>
      </div>
    </div>

    <div className="footer-bottom container">
      <div className="footer-disclaimer">
        <p><strong>Disclaimer:</strong> We are not affiliated with the Pharmacy Examining Board of Canada (PEBC&reg;). While we provide expert coaching, we cannot guarantee specific exam outcomes. Humacap is dedicated to providing high-quality educational frameworks for licensure success.</p>
      </div>
      <p className="footer-copyright">&copy; {new Date().getFullYear()} Humacap. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
