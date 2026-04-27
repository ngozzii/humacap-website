import React, { useEffect, useRef, useState } from 'react';
import { User, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ navigate, currentPage }) => {
  const { user } = useAuth();
  const [openDD, setOpenDD] = useState(null);
  const navRef = useRef(null);

  const toggleDD = (name) => {
    setOpenDD(prev => prev === name ? null : name);
  };

  const handleNav = (path) => {
    navigate(path);
    setOpenDD(null);
  };

  useEffect(() => {
    const handleOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenDD(null);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setOpenDD(null);
      }
    };

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('touchstart', handleOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('touchstart', handleOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  return (
    <nav className="navbar" ref={navRef}>
      <div className="container nav-content">
        <div className="logo cursor-pointer" onClick={() => handleNav('home')}>
          <img src="/logo.jpg" alt="Humacap Logo" className="header-logo-img" />
        </div>

        <div className="nav-links">
          <button onClick={() => handleNav('home')} className={currentPage === '/' ? 'active' : ''}>Home</button>

          {/* Programs dropdown */}
          <div className="nav-dropdown">
            <button type="button" className="nav-dropdown-trigger flex items-center gap-1" onClick={() => toggleDD('programs')}>
              Programs <ChevronDown size={14} style={{ transform: openDD === 'programs' ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            </button>
            {openDD === 'programs' && (
              <div className="nav-dropdown-content">
                <button type="button" onClick={() => handleNav('pharmacy')} className="nav-dropdown-item">Pharmacy Path</button>
                <button type="button" onClick={() => handleNav('business-consulting')} className="nav-dropdown-item">Business Advisory</button>
                <button type="button" onClick={() => handleNav('resources')} className="nav-dropdown-item">Free Resources</button>
              </div>
            )}
          </div>

          {/* Company dropdown */}
          <div className="nav-dropdown">
            <button type="button" className="nav-dropdown-trigger flex items-center gap-1" onClick={() => toggleDD('company')}>
              Company <ChevronDown size={14} style={{ transform: openDD === 'company' ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }} />
            </button>
            {openDD === 'company' && (
              <div className="nav-dropdown-content">
                <button type="button" onClick={() => handleNav('about')} className="nav-dropdown-item">About Us</button>
                <button type="button" onClick={() => handleNav('contact')} className="nav-dropdown-item">Contact Us</button>
              </div>
            )}
          </div>

          {user ? (
            <>
              <button onClick={() => handleNav('dashboard')} className="btn btn-primary flex items-center gap-2">
                <User size={16} /> Dashboard
              </button>
              {user?.role === 'instructor' && (
                <button onClick={() => handleNav('instructor')} className="btn btn-primary flex items-center gap-2">
                  Instructor Portal
                </button>
              )}
            </>
          ) : (
            <button onClick={() => handleNav('login')} className="btn btn-outline flex items-center gap-2">
              <User size={16} /> Sign In
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
