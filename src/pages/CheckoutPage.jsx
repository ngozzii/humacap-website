import React, { useState } from 'react';
import { CreditCard, Lock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const CheckoutPage = ({ course, navigate }) => {
  const [selectedPayment, setSelectedPayment] = useState('credit');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!course) return (
    <div className="container text-center" style={{ paddingTop: '4rem' }}>
      <p>No course selected.</p>
      <button className="btn btn-primary" onClick={() => navigate('courses')}>Browse Courses</button>
    </div>
  );

  if (isSuccess) {
    return (
      <div className="page-container container text-center" style={{ padding: '6rem 2rem' }}>
        <div className="glass-card max-w-2xl mx-auto py-12">
          <div className="w-20 h-20 bg-teal text-white rounded-full flex items-center justify-center text-4xl mx-auto mb-8">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-3xl font-bold text-navy mb-4">Payment Successful!</h2>
          <p className="text-xl text-gray-600 mb-8">
            Thank you for your payment. Your unique access code will be emailed to you shortly. Use it to unlock your course in the Student Portal.
          </p>
          <div className="flex gap-4 justify-center">
            <button className="btn btn-primary" onClick={() => navigate('home')}>Return Home</button>
            <button className="btn btn-outline" onClick={() => navigate('login')}>Go to Student Portal</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-container container">
      <div className="checkout-header">
        <div style={{ marginBottom: '1.5rem' }}>
          <button className="btn-back" onClick={() => navigate('courses')}>&larr; Back to Courses</button>
        </div>
        <h2>Secure Enrollment</h2>
      </div>
      <div className="checkout-grid">
        <div className="checkout-form glass-card">
          <h3>Billing Details</h3>
          <div className="input-group">
            <label>Full Name</label>
            <input type="text" placeholder="John Doe" className="form-input" />
          </div>
          <div className="input-group">
            <label>Email Address</label>
            <input type="email" placeholder="you@example.com" className="form-input" />
          </div>
          <div className="input-group">
            <label>Payment Method</label>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {['credit', 'debit', 'interac'].map(method => (
                <label key={method} className={`flex flex-col items-center gap-2 cursor-pointer p-3 border rounded-lg transition-all ${selectedPayment === method ? 'border-teal bg-teal/5 text-teal' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input type="radio" name="payment" className="hidden" onChange={() => setSelectedPayment(method)} checked={selectedPayment === method} />
                  {method === 'interac' ? <div className="font-bold text-xs">Interac</div> : <CreditCard size={20} />}
                  <span className="text-xs font-bold capitalize">{method === 'interac' ? 'e-Transfer' : method}</span>
                </label>
              ))}
            </div>

            {(selectedPayment === 'credit' || selectedPayment === 'debit') && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <label>Card Information</label>
                <div className="card-input-wrapper mb-3">
                  <CreditCard className="card-icon" size={20} />
                  <input type="text" placeholder="0000 0000 0000 0000" className="form-input with-icon" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" placeholder="MM/YY" className="form-input" />
                  <input type="text" placeholder="CVC" className="form-input" />
                </div>
              </motion.div>
            )}

            {selectedPayment === 'interac' && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 mb-2 font-medium">Instructions:</p>
                <p className="text-xs text-gray-600 leading-relaxed mb-1">
                  Please send <strong>${(course.price * 1.13).toFixed(2)} CAD</strong> via Interac e-Transfer to:
                </p>
                <p className="text-sm font-bold text-navy select-all mb-2">payments@humacap.com</p>
              </motion.div>
            )}
          </div>
          <button className="btn btn-primary full-width large mt-6" onClick={() => setIsSuccess(true)}>Pay &amp; Enroll Now</button>
          <p className="secure-badge mt-4 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
            <Lock size={12} /> 256-bit SSL Encrypted Payment
          </p>
        </div>

        <div className="order-summary glass-card h-fit">
          <h3 className="font-bold text-navy text-lg mb-4">Order Summary</h3>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">{course.title}</span>
            <span className="font-bold text-navy">${course.price}.00</span>
          </div>
          <div className="flex justify-between mb-4">
            <span className="text-gray-600">Tax (Estimated 13%)</span>
            <span className="font-bold text-navy">${(course.price * 0.13).toFixed(2)}</span>
          </div>
          <hr className="border-gray-100 mb-4" />
          <div className="flex justify-between mb-6">
            <span className="text-xl font-bold text-navy">Total</span>
            <span className="text-xl font-bold text-teal">${(course.price * 1.13).toFixed(2)}</span>
          </div>
          <div className="bg-teal bg-opacity-5 border border-teal border-opacity-20 rounded-lg p-4">
            <p className="text-sm text-teal font-medium">✓ Access code emailed automatically after payment</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
