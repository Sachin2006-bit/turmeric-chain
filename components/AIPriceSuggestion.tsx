'use client';

import React, { useState } from 'react';
import { TrendingUp, Upload, Camera, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { translations } from '../locales/translations';
import { useApp } from '../lib/context';
import { geminiAnalyzer, TurmericAnalysis } from '../utils/gemini';

interface PriceSuggestionProps {
  className?: string;
}

interface PriceFactors {
  quality: 'A' | 'B' | 'C' | 'D';
  moisture: number;
  color: 'Golden' | 'Yellow' | 'Light Yellow' | 'Pale';
  size: 'Large' | 'Medium' | 'Small';
  origin: string;
  harvestDate: string;
  storageCondition: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}

interface AISuggestion {
  grade: string;
  recommendedPrice: number;
  confidence: number;
  factors: string[];
  analysis: string;
  geminiAnalysis?: TurmericAnalysis;
  livePriceData?: any;
  basePrice?: number;
  qualityAdjustment?: number;
  marketPrice?: number;
  priceRange?: { min: number; max: number };
}

export function AIPriceSuggestion({ className = '' }: PriceSuggestionProps) {
  const { language } = useApp();
  const t = translations[language];
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [priceFactors, setPriceFactors] = useState<PriceFactors>({
    quality: 'A',
    moisture: 8,
    color: 'Golden',
    size: 'Medium',
    origin: '',
    harvestDate: '',
    storageCondition: 'Good'
  });
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'questions' | 'result'>('upload');
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    setIsAnalyzing(true);

    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error(language === 'te' ? 'దయచేసి చెల్లుబాటు అయ్యే చిత్ర ఫైల్‌ను అప్‌లోడ్ చేయండి' : 'Please upload a valid image file');
      }

      // Convert to base64 for display
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
        setUploadedFile(file);
      };
      reader.readAsDataURL(file);

      // Analyze image with Gemini AI
      const base64 = await geminiAnalyzer.convertImageToBase64(file);
      const analysis = await geminiAnalyzer.analyzeTurmericImage(base64);

      // Check if image is actually turmeric
      if (!analysis.isTurmeric) {
        setError(language === 'te' 
          ? `ఈ చిత్రం టర్మరిక్ కాదు. AI విశ్లేషణ: ${analysis.analysis}. దయచేసి సరైన టర్మరిక్ చిత్రాన్ని అప్‌లోడ్ చేయండి.`
          : `This image is not turmeric. AI Analysis: ${analysis.analysis}. Please upload a proper turmeric image.`
        );
        setUploadedImage(null);
        setUploadedFile(null);
        return;
      }

      // Update form with Gemini analysis
      setPriceFactors(prev => ({
        ...prev,
        quality: analysis.quality,
        color: analysis.color,
        size: analysis.size,
        moisture: analysis.moisture
      }));

      setCurrentStep('questions');

    } catch (error) {
      console.error('Error analyzing image:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze image');
      setUploadedImage(null);
      setUploadedFile(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFactorChange = (key: keyof PriceFactors, value: any) => {
    setPriceFactors(prev => ({ ...prev, [key]: value }));
  };

  const analyzePrice = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      if (!uploadedFile) {
        throw new Error(language === 'te' ? 'దయచేసి చిత్రాన్ని అప్‌లోడ్ చేయండి' : 'Please upload an image first');
      }

      // Get Gemini analysis
      const base64 = await geminiAnalyzer.convertImageToBase64(uploadedFile);
      const geminiAnalysis = await geminiAnalyzer.analyzeTurmericImage(base64);

      // Fetch live price data
      const livePriceData = await geminiAnalyzer.fetchLivePriceData();

      // Calculate recommended price
      const priceCalculation = geminiAnalyzer.calculateRecommendedPrice(geminiAnalysis, livePriceData);

      // Create comprehensive suggestion
      const mockSuggestion: AISuggestion = {
        grade: geminiAnalysis.quality,
        recommendedPrice: priceCalculation.recommendedPrice,
        confidence: priceCalculation.confidence,
        factors: generateFactorsFromAnalysis(geminiAnalysis),
        analysis: geminiAnalysis.analysis,
        geminiAnalysis: geminiAnalysis,
        livePriceData: livePriceData,
        basePrice: priceCalculation.basePrice,
        qualityAdjustment: priceCalculation.qualityAdjustment,
        marketPrice: priceCalculation.marketPrice,
        priceRange: priceCalculation.priceRange
      };
      
      setSuggestion(mockSuggestion);
      setCurrentStep('result');
      
    } catch (error) {
      console.error('Error analyzing price:', error);
      setError(error instanceof Error ? error.message : 'Failed to analyze price');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateFactorsFromAnalysis = (analysis: TurmericAnalysis): string[] => {
    const factors = [];
    
    if (analysis.quality === 'A') factors.push('Premium quality grade');
    if (analysis.color === 'Golden') factors.push('Excellent golden color');
    if (analysis.size === 'Large') factors.push('Large, premium size');
    if (analysis.moisture < 8) factors.push('Low moisture content');
    if (analysis.defects.length === 0) factors.push('No visible defects');
    if (analysis.qualityScore > 80) factors.push('High quality score');
    
    return factors;
  };

  const calculateMockPrice = (factors: PriceFactors): number => {
    let basePrice = 8000;
    
    // Quality multiplier
    const qualityMultiplier = { 'A': 1.2, 'B': 1.0, 'C': 0.8, 'D': 0.6 };
    basePrice *= qualityMultiplier[factors.quality];
    
    // Moisture adjustment
    if (factors.moisture < 8) basePrice *= 1.1;
    else if (factors.moisture > 12) basePrice *= 0.9;
    
    // Color premium
    if (factors.color === 'Golden') basePrice *= 1.15;
    else if (factors.color === 'Yellow') basePrice *= 1.05;
    
    // Size adjustment
    if (factors.size === 'Large') basePrice *= 1.1;
    else if (factors.size === 'Small') basePrice *= 0.95;
    
    // Storage condition
    const storageMultiplier = { 'Excellent': 1.1, 'Good': 1.0, 'Fair': 0.9, 'Poor': 0.8 };
    basePrice *= storageMultiplier[factors.storageCondition];
    
    return Math.round(basePrice);
  };

  const calculateConfidence = (factors: PriceFactors): number => {
    let confidence = 60;
    
    if (factors.origin) confidence += 10;
    if (factors.harvestDate) confidence += 10;
    if (factors.moisture >= 6 && factors.moisture <= 12) confidence += 10;
    if (factors.storageCondition === 'Excellent' || factors.storageCondition === 'Good') confidence += 10;
    
    return Math.min(confidence, 95);
  };

  const generateFactors = (factors: PriceFactors): string[] => {
    const factorList = [];
    
    if (factors.quality === 'A') factorList.push('Premium quality grade');
    if (factors.moisture < 8) factorList.push('Low moisture content');
    if (factors.color === 'Golden') factorList.push('Excellent color');
    if (factors.storageCondition === 'Excellent') factorList.push('Optimal storage');
    
    return factorList;
  };

  const generateAnalysis = (factors: PriceFactors, lang: 'te' | 'en'): string => {
    if (lang === 'te') {
      return `ఈ టర్మరిక్ ${factors.quality} గ్రేడ్‌లో ఉంది మరియు ${factors.moisture}% తేమ కలిగి ఉంది. ${factors.color} రంగు మరియు ${factors.size} పరిమాణం కారణంగా మంచి ధరను ఆశించవచ్చు.`;
    }
    return `This turmeric is Grade ${factors.quality} with ${factors.moisture}% moisture content. The ${factors.color} color and ${factors.size} size indicate good pricing potential.`;
  };

  const formatPrice = (price: number, lang: 'te' | 'en'): string => {
    return lang === 'te' ? `₹${price.toLocaleString('en-IN')}` : `₹${price.toLocaleString('en-IN')}`;
  };

  const getGradeColor = (grade: string): string => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const resetAnalysis = () => {
    setUploadedImage(null);
    setUploadedFile(null);
    setSuggestion(null);
    setError(null);
    setCurrentStep('upload');
    setPriceFactors({
      quality: 'A',
      moisture: 8,
      color: 'Golden',
      size: 'Medium',
      origin: '',
      harvestDate: '',
      storageCondition: 'Good'
    });
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center mb-4">
        <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
        <h2 className="text-lg font-semibold text-gray-900">
          {language === 'te' ? 'AI ధర సూచన' : 'AI Price Suggestion'}
        </h2>
      </div>

      {currentStep === 'upload' && (
        <div className="space-y-4">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-red-800 font-medium">
                  {language === 'te' ? 'లోపం' : 'Error'}
                </p>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}

          <div className="text-center">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
              {isAnalyzing ? (
                <div className="space-y-4">
                  <Loader2 className="h-12 w-12 text-green-600 mx-auto animate-spin" />
                  <p className="text-gray-600">
                    {language === 'te' 
                      ? 'చిత్రాన్ని విశ్లేషిస్తోంది...'
                      : 'Analyzing image...'
                    }
                  </p>
                </div>
              ) : (
                <>
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    {language === 'te' 
                      ? 'మీ టర్మరిక్ ఉత్పత్తి యొక్క చిత్రాన్ని అప్‌లోడ్ చేయండి'
                      : 'Upload an image of your turmeric product'
                    }
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors cursor-pointer font-medium"
                  >
                    {language === 'te' ? 'చిత్రాన్ని ఎంచుకోండి' : 'Choose Image'}
                  </label>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {currentStep === 'questions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-medium text-gray-900">
              {language === 'te' ? 'ఉత్పత్తి వివరాలు' : 'Product Details'}
            </h3>
            <button
              onClick={resetAnalysis}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {language === 'te' ? 'మళ్లీ ప్రారంభించండి' : 'Start Over'}
            </button>
          </div>

          {uploadedImage && (
            <div className="text-center">
              <img
                src={uploadedImage}
                alt="Uploaded turmeric"
                className="max-w-xs max-h-48 mx-auto rounded-lg shadow-sm"
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'te' ? 'నాణ్యత గ్రేడ్' : 'Quality Grade'}
              </label>
              <select
                value={priceFactors.quality}
                onChange={(e) => handleFactorChange('quality', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="A">A (Premium)</option>
                <option value="B">B (Good)</option>
                <option value="C">C (Fair)</option>
                <option value="D">D (Poor)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'te' ? 'తేమ శాతం (%)' : 'Moisture Content (%)'}
              </label>
              <input
                type="number"
                min="0"
                max="20"
                step="0.1"
                value={priceFactors.moisture || ''}
                onChange={(e) => handleFactorChange('moisture', parseFloat(e.target.value) || 0)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'te' ? 'రంగు' : 'Color'}
              </label>
              <select
                value={priceFactors.color}
                onChange={(e) => handleFactorChange('color', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="Golden">Golden</option>
                <option value="Yellow">Yellow</option>
                <option value="Light Yellow">Light Yellow</option>
                <option value="Pale">Pale</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'te' ? 'పరిమాణం' : 'Size'}
              </label>
              <select
                value={priceFactors.size}
                onChange={(e) => handleFactorChange('size', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="Large">Large</option>
                <option value="Medium">Medium</option>
                <option value="Small">Small</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'te' ? 'మూలం (ఐచ్ఛికం)' : 'Origin (Optional)'}
              </label>
              <input
                type="text"
                value={priceFactors.origin}
                onChange={(e) => handleFactorChange('origin', e.target.value)}
                placeholder={language === 'te' ? 'ఉదా: తమిళనాడు' : 'e.g., Tamil Nadu'}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'te' ? 'సంగ్రహ తేదీ (ఐచ్ఛికం)' : 'Harvest Date (Optional)'}
              </label>
              <input
                type="date"
                value={priceFactors.harvestDate}
                onChange={(e) => handleFactorChange('harvestDate', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'te' ? 'నిల్వ పరిస్థితి' : 'Storage Condition'}
              </label>
              <select
                value={priceFactors.storageCondition}
                onChange={(e) => handleFactorChange('storageCondition', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
            </div>
          </div>

          <button
            onClick={analyzePrice}
            disabled={isAnalyzing}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>{language === 'te' ? 'విశ్లేషిస్తోంది...' : 'Analyzing...'}</span>
              </>
            ) : (
              <>
                <TrendingUp className="h-4 w-4" />
                <span>{language === 'te' ? 'ధరను విశ్లేషించండి' : 'Analyze Price'}</span>
              </>
            )}
          </button>
        </div>
      )}

      {currentStep === 'result' && suggestion && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-medium text-gray-900">
              {language === 'te' ? 'AI విశ్లేషణ ఫలితాలు' : 'AI Analysis Results'}
            </h3>
            <button
              onClick={resetAnalysis}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              {language === 'te' ? 'మళ్లీ ప్రారంభించండి' : 'Start Over'}
            </button>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{t['ai.grade']}</span>
              <span className={`px-2 py-1 rounded-full text-sm font-medium ${getGradeColor(suggestion.grade)}`}>
                {suggestion.grade}
              </span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">{t['ai.recommended_price']}</span>
              <div className="text-right">
                <span className="font-semibold text-green-600">
                  {formatPrice(suggestion.recommendedPrice, language)}
                </span>
                {suggestion.priceRange && (
                  <div className="text-xs text-gray-500">
                    {language === 'te' ? 'పరిధి:' : 'Range:'} {formatPrice(suggestion.priceRange.min, language)} - {formatPrice(suggestion.priceRange.max, language)}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">{t['ai.confidence']}</span>
              <span className="text-sm font-medium">{suggestion.confidence}%</span>
            </div>
            
            <div className="border-t pt-3">
              <p className="text-sm text-gray-700 mb-2">
                <strong>{language === 'te' ? 'విశ్లేషణ:' : 'Analysis:'}</strong>
              </p>
              <p className="text-sm text-gray-600">{suggestion.analysis}</p>
              
              {/* Market Comparison */}
              {suggestion.livePriceData && (
                <div className="mt-3 bg-blue-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-800 mb-2">
                    {language === 'te' ? 'మార్కెట్ పోలిక' : 'Market Comparison'}
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-blue-700">{language === 'te' ? 'లైవ్ మార్కెట్ ధర:' : 'Live Market Price:'}</span>
                      <span className="font-medium">₹{suggestion.livePriceData.lastPrice?.toLocaleString()}/quintal</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">{language === 'te' ? 'మీ సూచన:' : 'Your Suggestion:'}</span>
                      <span className="font-medium text-green-600">₹{suggestion.recommendedPrice?.toLocaleString()}/quintal</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">{language === 'te' ? 'వ్యత్యాసం:' : 'Difference:'}</span>
                      <span className={`font-medium ${(suggestion.recommendedPrice - suggestion.livePriceData.lastPrice) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {(suggestion.recommendedPrice - suggestion.livePriceData.lastPrice) >= 0 ? '+' : ''}₹{(suggestion.recommendedPrice - suggestion.livePriceData.lastPrice).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-blue-700">{language === 'te' ? 'శాతం:' : 'Percentage:'}</span>
                      <span className={`font-medium ${((suggestion.recommendedPrice - suggestion.livePriceData.lastPrice) / suggestion.livePriceData.lastPrice * 100) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {((suggestion.recommendedPrice - suggestion.livePriceData.lastPrice) / suggestion.livePriceData.lastPrice * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Live Price Data */}
              {suggestion.livePriceData && (
                <div className="mt-3 bg-gray-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-gray-800 mb-2">
                    {language === 'te' ? 'లైవ్ మార్కెట్ వివరాలు' : 'Live Market Details'}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-gray-700">{language === 'te' ? 'స్పాట్ ధర:' : 'Spot Price:'}</span>
                      <span className="font-medium ml-1">₹{suggestion.livePriceData.spotPrice?.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-700">{language === 'te' ? 'మార్పు:' : 'Change:'}</span>
                      <span className={`font-medium ml-1 ${suggestion.livePriceData.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {suggestion.livePriceData.change >= 0 ? '+' : ''}₹{suggestion.livePriceData.change}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-700">{language === 'te' ? 'అప్‌డేట్:' : 'Updated:'}</span>
                      <span className="font-medium ml-1">{suggestion.livePriceData.lastupdTime}</span>
                    </div>
                    <div>
                      <span className="text-gray-700">{language === 'te' ? 'మార్కెట్ రకం:' : 'Market Type:'}</span>
                      <span className="font-medium ml-1">{suggestion.livePriceData.marketType}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Price Calculation Details */}
              {suggestion.basePrice && (
                <div className="mt-3 bg-green-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-800 mb-2">
                    {language === 'te' ? 'ధర గణన వివరాలు' : 'Price Calculation Details'}
                  </p>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-green-700">{language === 'te' ? 'బేస్ ధర:' : 'Base Price:'}</span>
                      <span className="font-medium">₹{suggestion.basePrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">{language === 'te' ? 'నాణ్యత సర్దుబాటు:' : 'Quality Adjustment:'}</span>
                      <span className="font-medium">{(suggestion.qualityAdjustment || 1).toFixed(2)}x</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-700">{language === 'te' ? 'మార్కెట్ ధర:' : 'Market Price:'}</span>
                      <span className="font-medium">₹{suggestion.marketPrice?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
              
              {suggestion.factors.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-700 mb-1">
                    <strong>{language === 'te' ? 'ప్రధాన కారకాలు:' : 'Key Factors:'}</strong>
                  </p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {suggestion.factors.map((factor, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Gemini Recommendations */}
              {suggestion.geminiAnalysis?.recommendations && suggestion.geminiAnalysis.recommendations.length > 0 && (
                <div className="mt-3 bg-yellow-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-yellow-800 mb-2">
                    {language === 'te' ? 'AI సిఫార్సులు' : 'AI Recommendations'}
                  </p>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {suggestion.geminiAnalysis.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-yellow-600 mt-0.5">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fallback Notice */}
              {suggestion.geminiAnalysis?.analysis?.includes('fallback') && (
                <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-orange-600" />
                    <p className="text-sm font-medium text-orange-800">
                      {language === 'te' ? 'ఫాల్‌బ్యాక్ విశ్లేషణ' : 'Fallback Analysis'}
                    </p>
                  </div>
                  <p className="text-sm text-orange-700 mt-1">
                    {language === 'te' 
                      ? 'Gemini AI అందుబాటులో లేదు. మాన్యువల్ విశ్లేషణను సిఫార్సు చేస్తాము.'
                      : 'Gemini AI is not available. Manual verification is recommended.'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-3">
            <button className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium">
              {language === 'te' ? 'ధరను అంగీకరించండి' : 'Accept Price'}
            </button>
            <button 
              onClick={resetAnalysis}
              className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              {language === 'te' ? 'మళ్లీ ప్రయత్నించండి' : 'Try Again'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
