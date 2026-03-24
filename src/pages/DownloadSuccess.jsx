import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Download, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DownloadSuccess = () => {
  const navigate = useNavigate();
  return (
    <div className="page-container" style={{ textAlign: 'center' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card max-w-2xl mx-auto p-12">
        <CheckCircle size={64} className="text-teal mb-6 mx-auto" />
        <h1 className="text-3xl font-bold text-navy mb-4">Checklist Ready!</h1>
        <p className="text-lg text-gray-600 mb-8">
          Clicking the button below will start downloading your <em>&ldquo;Step-by-Step Guide to PEBC&reg; Exam Prep&rdquo;</em> PDF.
        </p>
        <div className="flex flex-col gap-4 items-center">
          <button className="btn btn-primary large flex items-center gap-2">
            <Download size={20} /> Download Your Guide
          </button>
          <button className="btn btn-text text-teal flex items-center gap-2 mt-4" onClick={() => navigate('/pharmacy')}>
            Back to Pharmacy Courses <ArrowRight size={16} />
          </button>
          <button className="btn btn-text text-gray-600 flex items-center gap-2 mt-2" onClick={() => navigate('/')}>
            Back to Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default DownloadSuccess;
