'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Camera, Package, Calendar, Droplets, Hash, ArrowLeft, ArrowRight, Check, X, Plus, Image as ImageIcon, DollarSign, Tag } from 'lucide-react';
import { TopNav } from '../../../components/TopNav';
import { useApp } from '../../../lib/context';
import { translations } from '../../../locales/translations';
import { generateBatchHash, generateQRCode, formatDate } from '../../../utils';
import { saveToLocalStorage } from '../../../utils/api';

interface UploadFormData {
  photos: string[];
  weight: number;
  moisture: number;
  harvestDate: string;
  grade: string;
  qualityType: string;
  price: number;
  description: string;
  tags: string[];
  location: string;
}

export default function EnhancedUploadWizard() {
  const router = useRouter();
  const { userRole, language, lowLiteracyMode, addNotification } = useApp();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<UploadFormData>({
    photos: [],
    weight: 0,
    moisture: 0,
    harvestDate: '',
    grade: 'Finger',
    qualityType: 'Fresh',
    price: 0,
    description: '',
    tags: [],
    location: 'Nizamabad'
  });
  const [isGeneratingQR, setIsGeneratingQR] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [batchHash, setBatchHash] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const t = translations[language];

  // Redirect if not farmer
  React.useEffect(() => {
    if (userRole !== 'farmer') {
      router.push('/');
    }
  }, [userRole, router]);

  const steps = [
    { id: 1, title: language === 'te' ? 'ఫోటోలు' : 'Photos', icon: Camera },
    { id: 2, title: language === 'te' ? 'వివరాలు' : 'Details', icon: Package },
    { id: 3, title: language === 'te' ? 'నాణ్యత' : 'Quality', icon: Hash },
    { id: 4, title: language === 'te' ? 'ధర & వివరణ' : 'Price & Description', icon: DollarSign },
    { id: 5, title: language === 'te' ? 'సమీక్ష' : 'Review', icon: Check }
  ];

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...newPhotos]
      }));
    }
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const handleInputChange = (field: keyof UploadFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !formData.tags.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag.trim()]
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateBatchData = async () => {
    setIsGeneratingQR(true);
    
    try {
      // Generate batch hash
      const hash = generateBatchHash({
        farmerId: 'farmer_01',
        weight: formData.weight,
        moisture: formData.moisture,
        harvestDate: formData.harvestDate,
        grade: formData.grade
      });
      
      // Generate QR code
      const qr = await generateQRCode({
        batchId: `batch_${Date.now()}`,
        farmerId: 'farmer_01',
        hash: hash,
        timestamp: new Date().toISOString()
      });
      
      setBatchHash(hash);
      setQrCode(qr);
      
      // Save to localStorage
      const batchData = {
        id: `batch_${Date.now()}`,
        farmerId: 'farmer_01',
        photos: formData.photos,
        weight_qtl: formData.weight,
        moisture_pct: formData.moisture,
        harvest_date: formData.harvestDate,
        grade: formData.grade,
        ai: {
          grade: 'A',
          curcumin_est: '2.5%',
          confidence: 0.78
        },
        status: 'listed',
        price_recommended: formData.price,
        batch_hash: hash,
        qr: qr,
        createdAt: new Date().toISOString(),
        description: formData.description,
        tags: formData.tags,
        location: formData.location
      };
      
      saveToLocalStorage('latestBatch', batchData);
      
      addNotification({
        id: `notification_${Date.now()}`,
        type: 'bid',
        title: language === 'te' ? 'బ్యాచ్ సృష్టించబడింది' : 'Batch Created',
        message: language === 'te' ? 'మీ టర్మరిక్ బ్యాచ్ విజయవంతంగా జాబితా చేయబడింది' : 'Your turmeric batch has been successfully listed',
        status: 'delivered',
        createdAt: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error generating batch data:', error);
    } finally {
      setIsGeneratingQR(false);
    }
  };

  const handleSubmit = async () => {
    setIsUploading(true);
    await generateBatchData();
    setIsUploading(false);
    router.push('/farmer/dashboard');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {language === 'te' ? 'టర్మరిక్ ఫోటోలు అప్‌లోడ్ చేయండి' : 'Upload Turmeric Photos'}
              </h3>
              <p className="text-gray-600">
                {language === 'te' ? 'మీ టర్మరిక్ నాణ్యతను చూపించే ఫోటోలు జోడించండి' : 'Add photos that showcase your turmeric quality'}
              </p>
            </div>

            {/* Photo Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-green-500 transition-colors">
              <div className="space-y-4">
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="h-5 w-5" />
                    <span>{language === 'te' ? 'ఫైల్‌లను ఎంచుకోండి' : 'Choose Files'}</span>
                  </button>
                  
                  <button
                    onClick={handleCameraCapture}
                    className="flex items-center space-x-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Camera className="h-5 w-5" />
                    <span>{language === 'te' ? 'కెమెరా' : 'Camera'}</span>
                  </button>
                </div>
                
                <p className="text-sm text-gray-500">
                  {language === 'te' ? 'JPG, PNG లేదా WEBP ఫైల్‌లు (గరిష్ట 10MB)' : 'JPG, PNG or WEBP files (max 10MB)'}
                </p>
              </div>
            </div>

            {/* Photo Preview Grid */}
            {formData.photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {formData.photos.map((photo, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={photo}
                      alt={`Turmeric ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {language === 'te' ? 'బ్యాచ్ వివరాలు' : 'Batch Details'}
              </h3>
              <p className="text-gray-600">
                {language === 'te' ? 'మీ టర్మరిక్ బ్యాచ్ గురించి వివరాలు నమోదు చేయండి' : 'Enter details about your turmeric batch'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'te' ? 'బరువు (క్వింటల్‌లలో)' : 'Weight (in Quintals)'} *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.weight}
                  onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder={language === 'te' ? 'ఉదా: 2.5' : 'e.g: 2.5'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'te' ? 'తేమ శాతం' : 'Moisture Percentage'} *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="20"
                  value={formData.moisture}
                  onChange={(e) => handleInputChange('moisture', parseFloat(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder={language === 'te' ? 'ఉదా: 8.5' : 'e.g: 8.5'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'te' ? 'పంట తేదీ' : 'Harvest Date'} *
                </label>
                <input
                  type="date"
                  value={formData.harvestDate}
                  onChange={(e) => handleInputChange('harvestDate', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'te' ? 'స్థానం' : 'Location'} *
                </label>
                <select
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="Nizamabad">{language === 'te' ? 'నిజామాబాద్' : 'Nizamabad'}</option>
                  <option value="Adilabad">{language === 'te' ? 'అదిలాబాద్' : 'Adilabad'}</option>
                  <option value="Karimnagar">{language === 'te' ? 'కరీంనగర్' : 'Karimnagar'}</option>
                  <option value="Warangal">{language === 'te' ? 'వరంగల్' : 'Warangal'}</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {language === 'te' ? 'నాణ్యత వివరాలు' : 'Quality Details'}
              </h3>
              <p className="text-gray-600">
                {language === 'te' ? 'మీ టర్మరిక్ నాణ్యత గురించి వివరాలు ఇవ్వండి' : 'Provide details about your turmeric quality'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'te' ? 'గ్రేడ్' : 'Grade'} *
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => handleInputChange('grade', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="Finger">{language === 'te' ? 'ఫింగర్' : 'Finger'}</option>
                  <option value="Bulb">{language === 'te' ? 'బల్బ్' : 'Bulb'}</option>
                  <option value="Mixed">{language === 'te' ? 'మిక్స్డ్' : 'Mixed'}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'te' ? 'నాణ్యత రకం' : 'Quality Type'} *
                </label>
                <select
                  value={formData.qualityType}
                  onChange={(e) => handleInputChange('qualityType', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="Fresh">{language === 'te' ? 'తాజా' : 'Fresh'}</option>
                  <option value="Dried">{language === 'te' ? 'ఎండిన' : 'Dried'}</option>
                  <option value="Powdered">{language === 'te' ? 'పొడి' : 'Powdered'}</option>
                </select>
              </div>
            </div>

            {/* Quality Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'te' ? 'నాణ్యత ట్యాగ్‌లు' : 'Quality Tags'}
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder={language === 'te' ? 'ట్యాగ్ జోడించండి' : 'Add tag'}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      addTag(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    addTag(input.value);
                    input.value = '';
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {language === 'te' ? 'ధర & వివరణ' : 'Price & Description'}
              </h3>
              <p className="text-gray-600">
                {language === 'te' ? 'మీ టర్మరిక్ కోసం ధర మరియు వివరణను నిర్ణయించండి' : 'Set price and description for your turmeric'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'te' ? 'క్వింటల్‌కు ధర (₹)' : 'Price per Quintal (₹)'} *
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder={language === 'te' ? 'ఉదా: 8500' : 'e.g: 8500'}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {language === 'te' ? 'ప్రస్తుత మార్కెట్ ధర: ₹8,000-10,000' : 'Current market price: ₹8,000-10,000'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'te' ? 'అంచనా మొత్తం విలువ' : 'Estimated Total Value'}
                </label>
                <div className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-700">
                  ₹{(formData.price * formData.weight).toLocaleString()}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'te' ? 'వివరణ' : 'Description'} *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={language === 'te' ? 'మీ టర్మరిక్ గురించి వివరించండి...' : 'Describe your turmeric...'}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {language === 'te' ? 'సమీక్ష & సమర్పణ' : 'Review & Submit'}
              </h3>
              <p className="text-gray-600">
                {language === 'te' ? 'మీ సమాచారాన్ని సమీక్షించి జాబితా చేయండి' : 'Review your information and list your batch'}
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-gray-900">{language === 'te' ? 'ఫోటోలు' : 'Photos'}</h4>
                  <p className="text-sm text-gray-600">{formData.photos.length} {language === 'te' ? 'ఫోటోలు' : 'photos'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{language === 'te' ? 'బరువు' : 'Weight'}</h4>
                  <p className="text-sm text-gray-600">{formData.weight} {language === 'te' ? 'క్వింటల్‌లు' : 'quintals'}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{language === 'te' ? 'తేమ' : 'Moisture'}</h4>
                  <p className="text-sm text-gray-600">{formData.moisture}%</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{language === 'te' ? 'గ్రేడ్' : 'Grade'}</h4>
                  <p className="text-sm text-gray-600">{formData.grade}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{language === 'te' ? 'ధర' : 'Price'}</h4>
                  <p className="text-sm text-gray-600">₹{formData.price.toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{language === 'te' ? 'మొత్తం విలువ' : 'Total Value'}</h4>
                  <p className="text-sm text-gray-600">₹{(formData.price * formData.weight).toLocaleString()}</p>
                </div>
              </div>
              
              {formData.description && (
                <div>
                  <h4 className="font-medium text-gray-900">{language === 'te' ? 'వివరణ' : 'Description'}</h4>
                  <p className="text-sm text-gray-600">{formData.description}</p>
                </div>
              )}
              
              {formData.tags.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900">{language === 'te' ? 'ట్యాగ్‌లు' : 'Tags'}</h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (userRole !== 'farmer') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/farmer/dashboard')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>{language === 'te' ? 'డాష్‌బోర్డ్‌కు తిరిగి వెళ్లండి' : 'Back to Dashboard'}</span>
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {language === 'te' ? 'టర్మరిక్ జాబితా చేయండి' : 'List Your Turmeric'}
          </h1>
          <p className="text-gray-600">
            {language === 'te' ? 'మీ టర్మరిక్ బ్యాచ్‌ను ఇకమెల్లా మార్కెట్‌ప్లేస్‌లో జాబితా చేయండి' : 'List your turmeric batch on the marketplace'}
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              
              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isActive ? 'border-green-500 bg-green-500 text-white' :
                    isCompleted ? 'border-green-500 bg-green-500 text-white' :
                    'border-gray-300 bg-white text-gray-500'
                  }`}>
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{language === 'te' ? 'మునుపటి' : 'Previous'}</span>
          </button>

          {currentStep < steps.length ? (
            <button
              onClick={nextStep}
              disabled={
                (currentStep === 1 && formData.photos.length === 0) ||
                (currentStep === 2 && (formData.weight === 0 || formData.moisture === 0 || !formData.harvestDate)) ||
                (currentStep === 4 && (formData.price === 0 || !formData.description.trim()))
              }
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>{language === 'te' ? 'తదుపరి' : 'Next'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isUploading || isGeneratingQR}
              className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading || isGeneratingQR ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>{language === 'te' ? 'అప్‌లోడ్ చేస్తోంది...' : 'Uploading...'}</span>
                </>
              ) : (
                <>
                  <span>{language === 'te' ? 'జాబితా చేయండి' : 'List Batch'}</span>
                  <Check className="h-4 w-4" />
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}