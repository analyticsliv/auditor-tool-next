import React, { useState, useEffect } from 'react';

const ContactModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    website: '',
    contact: '',
    queries: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [phoneError, setPhoneError] = useState('');
  const [focusedField, setFocusedField] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle modal animation
  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (error) setError(null);
    if (name === 'contact' && phoneError) setPhoneError('');
  };

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName);
  };

  const handleBlur = () => {
    setFocusedField(null);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s+/g, ''));
  };

  const validateWebsite = (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.firstName.trim() || !formData.email.trim() || !formData.website.trim() || !formData.contact.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    // Validate phone number
    if (!validatePhone(formData.contact)) {
      setPhoneError('Please enter a valid phone number');
      return;
    }

    // Validate website URL
    if (!validateWebsite(formData.website)) {
      setError('Please enter a valid website URL (e.g., https://example.com)');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setShowSuccess(true);
        // Reset form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          website: '',
          contact: '',
          queries: ''
        });
      } else {
        // Handle different error types
        if (data.details && Array.isArray(data.details)) {
          setError(data.details.join(', '));
        } else {
          setError(data.error || 'Something went wrong. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setShowSuccess(false);
      setError(null);
      setPhoneError('');
      onClose();
    }, 200);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      website: '',
      contact: '',
      queries: ''
    });
    handleClose();
  };

  // Handle click outside modal
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);

  const getInputClassName = (fieldName, hasError = false) => {
    const baseClasses = "w-full px-3 py-2 sm:py-2.5 border rounded-lg transition-all duration-300 bg-white focus:outline-none transform text-sm";
    const focusClasses = focusedField === fieldName 
      ? "border-blue-500 ring-2 ring-blue-100 scale-[1.01] shadow-md" 
      : "border-gray-300 hover:border-gray-400";
    const errorClasses = hasError ? "border-red-500 bg-red-50" : "";
    
    return `${baseClasses} ${focusClasses} ${errorClasses}`;
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black transition-opacity duration-300 flex items-center justify-center z-50 p-2 sm:p-4 ${
        isAnimating ? 'bg-opacity-60' : 'bg-opacity-0'
      }`}
      onClick={handleBackdropClick}
    >
      <div className={`bg-white rounded-xl sm:rounded-2xl w-full max-w-md h-[98vh] sm:h-[95vh] flex flex-col relative shadow-2xl transform transition-all duration-300 ${
        isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        
        {/* Gradient header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 sm:p-4 rounded-t-xl sm:rounded-t-2xl relative flex-shrink-0">
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 sm:top-3 sm:right-3 text-white hover:text-gray-200 text-xl sm:text-2xl font-bold z-10 w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-200"
          >
            ×
          </button>
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center">
            Get In Touch
          </h2>
          <p className="text-blue-100 text-center mt-1 text-xs sm:text-sm">
            We'd love to hear from you
          </p>
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-95 flex flex-col items-center justify-center z-20 rounded-2xl">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
              <div className="absolute inset-0 rounded-full h-12 w-12 border-4 border-transparent border-r-purple-400 animate-pulse"></div>
            </div>
            <div className="mt-4 text-gray-700 font-medium animate-pulse">Submitting your message...</div>
            <div className="mt-2 text-sm text-gray-500">Please wait</div>
          </div>
        )}

        {/* Success message */}
        {showSuccess && (
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50 flex flex-col items-center justify-center text-center p-8 z-20 rounded-2xl">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-green-600 mb-4">Thank You!</h2>
            <p className="text-gray-600 mb-6 text-sm md:text-base leading-relaxed">
              Your message has been successfully submitted.<br />
              We'll get back to you within 24 hours.
            </p>
            <button
              onClick={handleSuccessClose}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 py-3 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:scale-105 shadow-lg font-medium"
            >
              Close
            </button>
          </div>
        )}

        {/* Form */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
          {/* Error message */}
          {error && (
            <div className="mb-3 p-3 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-r-lg animate-pulse">
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                </svg>
                <span className="text-xs sm:text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* Name row */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
            <div className="space-y-1">
              <label htmlFor="firstName" className="block text-xs sm:text-sm font-semibold text-gray-700">
                First Name*
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                onFocus={() => handleFocus('firstName')}
                onBlur={handleBlur}
                required
                placeholder="First name"
                className={getInputClassName('firstName')}
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="lastName" className="block text-xs sm:text-sm font-semibold text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                onFocus={() => handleFocus('lastName')}
                onBlur={handleBlur}
                placeholder="Last name"
                className={getInputClassName('lastName')}
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-3 space-y-1">
            <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-700">
              Email*
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onFocus={() => handleFocus('email')}
                onBlur={handleBlur}
                required
                placeholder="your@email.com"
                className={`${getInputClassName('email')} pl-9`}
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
          </div>

          {/* Website */}
          <div className="mb-3 space-y-1">
            <label htmlFor="website" className="block text-xs sm:text-sm font-semibold text-gray-700">
              Website*
            </label>
            <div className="relative">
              <input
                type="url"
                id="website"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                onFocus={() => handleFocus('website')}
                onBlur={handleBlur}
                required
                placeholder="https://yoursite.com"
                className={`${getInputClassName('website')} pl-9`}
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c-5 0-9-4-9-9s4-9 9-9" />
              </svg>
            </div>
          </div>

          {/* Contact */}
          <div className="mb-3 space-y-1">
            <label htmlFor="contact" className="block text-xs sm:text-sm font-semibold text-gray-700">
              Phone*
            </label>
            <div className="relative">
              <input
                type="tel"
                id="contact"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                onFocus={() => handleFocus('contact')}
                onBlur={handleBlur}
                required
                placeholder="+1 (555) 123-4567"
                className={`${getInputClassName('contact', !!phoneError)} pl-9`}
              />
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            {phoneError && (
              <div className="text-red-600 text-xs mt-1 flex items-center animate-pulse">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                </svg>
                {phoneError}
              </div>
            )}
          </div>

          {/* Queries */}
          <div className="mb-4 space-y-1">
            <label htmlFor="queries" className="block text-xs sm:text-sm font-semibold text-gray-700">
              Message
            </label>
            <textarea
              id="queries"
              name="queries"
              value={formData.queries}
              onChange={handleInputChange}
              onFocus={() => handleFocus('queries')}
              onBlur={handleBlur}
              rows="2"
              placeholder="Your message..."
              className={`${getInputClassName('queries')} resize-none`}
            />
          </div>

          {/* Submit button */}
          <div className="mb-3">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] font-semibold text-sm sm:text-base"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Sending...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <span className="mr-2">Send Message</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
              )}
            </button>
          </div>

          {/* Support email */}
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xs sm:text-sm text-gray-600">
              <span className="block sm:inline">Need help? </span>
              <a
                href="mailto:support@analyticsliv.com"
                className="text-blue-600 hover:text-blue-800 underline font-medium transition-colors duration-200"
              >
                support@analyticsliv.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactModal;