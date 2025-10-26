'use client';

import React, { useState } from 'react';
import { X, Phone, User, PhoneCall, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { translations } from '../locales/translations';
import { useApp } from '../lib/context';

interface CallAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  farmerPhone?: string;
  buyerPhone?: string;
  batchId?: string;
}

interface CallRequest {
  name: string;
  phone: string;
  farmerPhone: string;
  farmerNumber: string;
  buyerPhone: string;
  batchId: string;
  language: 'te' | 'en';
  timestamp: string;
}

export function CallAgentModal({ 
  isOpen, 
  onClose, 
  farmerPhone = '+919876543210',
  buyerPhone = '+919876543211',
  batchId = 'batch_001'
}: CallAgentModalProps) {
  const { language } = useApp();
  const t = translations[language];
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    farmerNumber: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<{name?: string; phone?: string; farmerNumber?: string}>({});

  const validateForm = (): boolean => {
    const newErrors: {name?: string; phone?: string; farmerNumber?: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = language === 'te' ? 'పేరు అవసరం' : 'Name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = language === 'te' ? 'ఫోన్ నంబర్ అవసరం' : 'Phone number is required';
    } else if (!/^[+]?[\d\s-()]{10,}$/.test(formData.phone)) {
      newErrors.phone = language === 'te' ? 'వెధుపై ఫోన్ నంబర్ నమోదు చేయండి' : 'Please enter a valid phone number';
    }
    
    if (!formData.farmerNumber.trim()) {
      newErrors.farmerNumber = language === 'te' ? 'రైతు ఫోన్ నంబర్ అవసరం' : 'Farmer phone number is required';
    } else if (!/^[+]?[\d\s-()]{10,}$/.test(formData.farmerNumber)) {
      newErrors.farmerNumber = language === 'te' ? 'వెధుపై రైతు ఫోన్ నంబర్ నమోదు చేయండి' : 'Please enter a valid farmer phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');
    
    try {
      const callRequest: CallRequest = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        farmerPhone,
        farmerNumber: formData.farmerNumber.trim(),
        buyerPhone,
        batchId,
        language,
        timestamp: new Date().toISOString()
      };
      
      const response = await fetch('/api/webhooks/call-agent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(callRequest)
      });
      
      if (response.ok) {
        setSubmitStatus('success');
        // Auto-close after 3 seconds
        setTimeout(() => {
          onClose();
          resetForm();
        }, 3000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting call request:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', phone: '', farmerNumber: '' });
    setErrors({});
    setSubmitStatus('idle');
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
      resetForm();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Phone className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {language === 'te' ? 'కాల్ ఏజెంట్' : 'Call Agent'}
              </h2>
              <p className="text-sm text-gray-600">
                {language === 'te' ? 'టర్మరిక్ స్పెషలిస్ట్‌తో మాట్లాడండి' : 'Speak with Turmeric Specialist'}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitStatus === 'success' ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {language === 'te' ? 'కాల్ అభ్యర్థన సమర్పించబడింది!' : 'Call Request Submitted!'}
                </h3>
                <p className="text-gray-600">
                  {language === 'te' 
                    ? 'మా స్పెషలిస్ట్ త్వరలో మిమ్మల్ని కాల్ చేస్తారు. కాల్ సారాంశం SMS ద్వారా పంపబడుతుంది.'
                    : 'Our specialist will call you shortly. Call summary will be sent via SMS.'
                  }
                </p>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-blue-800">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {language === 'te' ? 'సగటు ప్రతిస్పందన సమయం: 2-5 నిమిషాలు' : 'Average response time: 2-5 minutes'}
                  </span>
                </div>
              </div>
            </div>
          ) : submitStatus === 'error' ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {language === 'te' ? 'లోపం సంభవించింది' : 'An Error Occurred'}
                </h3>
                <p className="text-gray-600">
                  {language === 'te' 
                    ? 'కాల్ అభ్యర్థనను సమర్పించలేకపోయాము. మళ్లీ ప్రయత్నించండి.'
                    : 'Unable to submit call request. Please try again.'
                  }
                </p>
              </div>
              <button
                onClick={() => setSubmitStatus('idle')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                {language === 'te' ? 'మళ్లీ ప్రయత్నించండి' : 'Try Again'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Agent Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {language === 'te' ? 'రాజేష్ కుమార్' : 'Rajesh Kumar'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {language === 'te' ? 'టర్మరిక్ స్పెషలిస్ట్' : 'Turmeric Specialist'}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">{language === 'te' ? 'అనుభవం:' : 'Experience:'}</span>
                    <span className="font-medium ml-2">5+ Years</span>
                  </div>
                  <div>
                    <span className="text-gray-600">{language === 'te' ? 'రేటింగ్:' : 'Rating:'}</span>
                    <span className="font-medium ml-2">4.8/5 ⭐</span>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                {/* Twilio Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-yellow-600 text-xs font-bold">!</span>
                    </div>
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800 mb-1">
                        {language === 'te' ? 'Twilio ఖాతా గమనిక' : 'Twilio Account Notice'}
                      </p>
                      <p className="text-yellow-700 mb-2">
                        {language === 'te' 
                          ? 'ఇది ఉచిత Twilio ఖాతా, కాబట్టి ధృవీకరించబడిన నంబర్లకు మాత్రమే కాల్‌లు వస్తాయి.'
                          : 'This is a free Twilio account, so only verified numbers get calls.'
                        }
                      </p>
                      <div className="bg-yellow-100 rounded p-2">
                        <p className="text-yellow-800 font-medium mb-1">
                          {language === 'te' ? 'ధృవీకరణ కోసం కాల్ చేయండి:' : 'To get verified, call:'}
                        </p>
                        <a 
                          href="tel:9100982321"
                          className="text-yellow-900 font-mono text-lg hover:text-yellow-800 underline"
                        >
                          9100982321
                        </a>
                      </div>
                      <p className="text-yellow-700 mt-2 text-xs">
                        {language === 'te' 
                          ? 'ఇది బహుభాషా కాల్ ఏజెంట్, మీరు మానవ వంటి వాయిస్‌ను అనుభవించాలి.'
                          : 'This is a Multi-language call agent, you must experience the human-like voice.'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'te' ? 'మీ పేరు' : 'Your Name'} *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={language === 'te' ? 'మీ పేరు నమోదు చేయండి' : 'Enter your name'}
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'te' ? 'ఫోన్ నంబర్' : 'Phone Number'} *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.phone ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={language === 'te' ? '+91 98765 43210' : '+91 98765 43210'}
                    disabled={isSubmitting}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {language === 'te' ? 'రైతు ఫోన్ నంబర్' : 'Farmer Phone Number'} *
                  </label>
                  <input
                    type="tel"
                    value={formData.farmerNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, farmerNumber: e.target.value }))}
                    className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.farmerNumber ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder={language === 'te' ? '+91 98765 43210' : '+91 98765 43210'}
                    disabled={isSubmitting}
                  />
                  {errors.farmerNumber && (
                    <p className="mt-1 text-sm text-red-600">{errors.farmerNumber}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    {language === 'te' 
                      ? 'కాల్ సారాంశం SMS ద్వారా పంపబడుతుంది'
                      : 'Call summary will be sent via SMS'
                    }
                  </p>
                </div>
              </div>

              {/* Call Features */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="font-medium text-gray-900">
                    {language === 'te' ? '24/7 అందుబాటులో' : '24/7 Available'}
                  </div>
                  <div className="text-gray-600">
                    {language === 'te' ? 'అన్ని సమయాల్లో' : 'All Hours'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="font-medium text-gray-900">
                    {language === 'te' ? 'వెంటనే సమాధానం' : 'Instant Response'}
                  </div>
                  <div className="text-gray-600">
                    {language === 'te' ? '< 5 నిమిషాలు' : '< 5 minutes'}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{language === 'te' ? 'సమర్పిస్తోంది...' : 'Submitting...'}</span>
                  </>
                ) : (
                  <>
                    <PhoneCall className="h-4 w-4" />
                    <span>{language === 'te' ? 'కాల్ అభ్యర్థనను సమర్పించండి' : 'Submit Call Request'}</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
