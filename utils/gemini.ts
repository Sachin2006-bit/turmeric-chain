import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini AI configuration
const GEMINI_API_KEY = 'AIzaSyDxJqODbQSJ3tq6uDPcivZUmAraXGSUthg';

// Initialize with default settings (no API version specified)
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

interface TurmericAnalysis {
  isTurmeric: boolean;
  quality: 'A' | 'B' | 'C' | 'D';
  color: 'Golden' | 'Yellow' | 'Light Yellow' | 'Pale';
  size: 'Large' | 'Medium' | 'Small';
  moisture: number;
  defects: string[];
  qualityScore: number;
  priceMultiplier: number;
  analysis: string;
  recommendations: string[];
}

interface PriceData {
  spotPrice: number;
  lastPrice: number;
  change: number;
  perChange: number;
  highPrice: number;
  lowPrice: number;
  lastupdTime: string;
}

export class GeminiTurmericAnalyzer {
  private model: any;
  private modelName: string = '';

  constructor() {
    this.initializeModel();
  }

  private initializeModel() {
    // Try model names that work with the default API - prioritizing Gemini 2.5 Flash
    const modelNames = ['gemini-2.0-flash-exp', 'gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.0-pro'];
    
    for (const modelName of modelNames) {
      try {
        this.model = genAI.getGenerativeModel({ model: modelName });
        this.modelName = modelName;
        console.log(`Successfully initialized Gemini model: ${modelName}`);
        return;
      } catch (error) {
        console.warn(`Failed to initialize ${modelName}:`, error);
      }
    }
    
    // If all models fail, set to fallback
    console.error('Failed to initialize any Gemini model, using fallback');
    this.modelName = 'fallback';
  }

  // Test direct REST API call with multiple configurations
  async testDirectAPI() {
    try {
      console.log('Testing direct REST API calls...');
      
      const apiConfigs = [
        { version: 'v1beta', model: 'gemini-2.0-flash-exp' },
        { version: 'v1beta', model: 'gemini-2.5-flash' },
        { version: 'v1beta', model: 'gemini-1.5-flash' },
        { version: 'v1beta', model: 'gemini-1.5-pro' },
        { version: 'v1beta', model: 'gemini-pro' },
        { version: 'v1', model: 'gemini-2.0-flash-exp' },
        { version: 'v1', model: 'gemini-2.5-flash' },
        { version: 'v1', model: 'gemini-1.5-flash' },
        { version: 'v1', model: 'gemini-1.5-pro' },
        { version: 'v1', model: 'gemini-pro' }
      ];

      const results: any = {};
      
      for (const config of apiConfigs) {
        try {
          console.log(`Testing ${config.version} API with ${config.model} model...`);
          
          const url = `https://generativelanguage.googleapis.com/${config.version}/models/${config.model}:generateContent?key=${GEMINI_API_KEY}`;
          
          const requestBody = {
            contents: [{
              parts: [{
                text: "Hello, are you working?"
              }]
            }]
          };
          
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
          });
          
          const key = `${config.version}/${config.model}`;
          
          if (response.ok) {
            const data = await response.json();
            console.log(`Success with ${key}:`, data);
            results[key] = { success: true, data };
          } else {
            console.warn(`Failed with ${key}: ${response.status}`);
            results[key] = { success: false, error: `HTTP ${response.status}` };
          }
        } catch (error) {
          const key = `${config.version}/${config.model}`;
          console.error(`Error with ${key}:`, error);
          results[key] = { success: false, error: error.message };
        }
      }
      
      console.log('All API test results:', results);
      return { success: true, results };
    } catch (error) {
      console.error('Direct API test failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Test what models are available via REST API
  async testAvailableModels() {
    try {
      console.log('Testing available models via REST API...');
      
      // Test different API versions
      const apiVersions = ['v1beta', 'v1'];
      const results: any = {};
      
      for (const version of apiVersions) {
        try {
          const url = `https://generativelanguage.googleapis.com/${version}/models?key=${GEMINI_API_KEY}`;
          const response = await fetch(url);
          const data = await response.json();
          
          console.log(`${version} API response:`, data);
          results[version] = data;
          
          if (data.models) {
            const modelNames = data.models.map((model: any) => model.name);
            console.log(`Available models in ${version}:`, modelNames);
          }
        } catch (error) {
          console.error(`Error testing ${version} API:`, error);
          results[version] = { error: error.message };
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error testing available models:', error);
      return { error: error.message };
    }
  }

  // Test connection using REST API
  async testConnection(): Promise<boolean> {
    try {
      console.log('Testing Gemini API connection via REST API...');
      
      // Try different API versions and models
      const apiConfigs = [
        { version: 'v1beta', model: 'gemini-2.0-flash-exp' },
        { version: 'v1beta', model: 'gemini-2.5-flash' },
        { version: 'v1beta', model: 'gemini-1.5-flash' },
        { version: 'v1beta', model: 'gemini-1.5-pro' },
        { version: 'v1beta', model: 'gemini-pro' },
        { version: 'v1', model: 'gemini-2.0-flash-exp' },
        { version: 'v1', model: 'gemini-2.5-flash' },
        { version: 'v1', model: 'gemini-1.5-flash' },
        { version: 'v1', model: 'gemini-1.5-pro' },
        { version: 'v1', model: 'gemini-pro' }
      ];

      for (const config of apiConfigs) {
        try {
          console.log(`Testing ${config.version} API with ${config.model} model...`);
          
          const url = `https://generativelanguage.googleapis.com/${config.version}/models/${config.model}:generateContent?key=${GEMINI_API_KEY}`;
          
          const requestBody = {
            contents: [{
              parts: [{ text: "Hello, are you working?" }]
            }]
          };

          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
          });

          if (response.ok) {
            const data = await response.json();
            console.log(`Gemini API test successful with ${config.version}/${config.model}:`, data);
            return true;
          } else {
            console.warn(`Failed with ${config.version}/${config.model}: ${response.status}`);
          }
        } catch (error) {
          console.warn(`Error testing ${config.version}/${config.model}:`, error);
        }
      }

      console.log('All API tests failed');
      return false;
    } catch (error) {
      console.error('Gemini API test failed:', error);
      return false;
    }
  }

  // Analyze turmeric image using direct REST API call
  async analyzeTurmericImage(imageBase64: string): Promise<TurmericAnalysis> {
    try {
      console.log('Starting Gemini image analysis via REST API...');
      
      const prompt = `
        Analyze this image and determine if it shows turmeric (curcuma longa). Please respond in JSON format with the following structure:
        
        {
          "isTurmeric": boolean,
          "quality": "A" | "B" | "C" | "D",
          "color": "Golden" | "Yellow" | "Light Yellow" | "Pale",
          "size": "Large" | "Medium" | "Small",
          "moisture": number (estimated percentage 0-20),
          "defects": string[],
          "qualityScore": number (0-100),
          "priceMultiplier": number (0.5-1.5),
          "analysis": string,
          "recommendations": string[]
        }
        
        IMPORTANT: First determine if this image shows actual turmeric (curcuma longa). Look for:
        - Characteristic golden-yellow color
        - Rhizome shape (finger-like projections)
        - Texture and appearance typical of turmeric
        - Not other spices like ginger, galangal, or other roots
        
        If the image is NOT turmeric, set isTurmeric to false and provide appropriate analysis explaining why it's not turmeric.
        
        If it IS turmeric, then assess:
        1. quality: Grade A (premium), B (good), C (fair), D (poor)
        2. color: Golden (best), Yellow (good), Light Yellow (fair), Pale (poor)
        3. size: Large (premium), Medium (standard), Small (lower grade)
        4. moisture: Estimate moisture content percentage
        5. defects: List any visible defects, discoloration, or impurities
        6. qualityScore: Overall quality score out of 100
        7. priceMultiplier: Suggested price multiplier based on quality (0.5-1.5 range)
        8. analysis: Detailed analysis of the turmeric quality
        9. recommendations: Suggestions for improvement or selling advice
        
        IMPORTANT PRICING CONTEXT:
        - Current live turmeric market price: ₹15,360 per quintal
        - Spot price: ₹13,895.65 per quintal
        - Market range: ₹15,200 - ₹15,500 per quintal
        - Your suggested priceMultiplier should be realistic compared to these market rates
        - Grade A turmeric typically sells at 1.0-1.2x market price
        - Grade B turmeric typically sells at 0.8-1.0x market price
        - Grade C turmeric typically sells at 0.6-0.8x market price
        - Grade D turmeric typically sells at 0.4-0.6x market price
        
        Focus on:
        - Color intensity and uniformity
        - Size and shape consistency
        - Presence of defects or impurities
        - Overall freshness and quality
        - Market readiness
        - Realistic pricing compared to live market rates
      `;

      // Try different API versions and models
      const apiConfigs = [
        { version: 'v1beta', model: 'gemini-2.0-flash-exp' },
        { version: 'v1beta', model: 'gemini-2.5-flash' },
        { version: 'v1beta', model: 'gemini-1.5-flash' },
        { version: 'v1beta', model: 'gemini-1.5-pro' },
        { version: 'v1beta', model: 'gemini-pro' },
        { version: 'v1', model: 'gemini-2.0-flash-exp' },
        { version: 'v1', model: 'gemini-2.5-flash' },
        { version: 'v1', model: 'gemini-1.5-flash' },
        { version: 'v1', model: 'gemini-1.5-pro' },
        { version: 'v1', model: 'gemini-pro' }
      ];

      for (const config of apiConfigs) {
        try {
          console.log(`Trying ${config.version} API with ${config.model} model...`);
          
          const url = `https://generativelanguage.googleapis.com/${config.version}/models/${config.model}:generateContent?key=${GEMINI_API_KEY}`;
          
          const requestBody = {
            contents: [{
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    data: imageBase64,
                    mimeType: 'image/jpeg'
                  }
                }
              ]
            }]
          };

          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
          });

          if (!response.ok) {
            console.warn(`Failed with ${config.version}/${config.model}: ${response.status}`);
            continue;
          }

          const data = await response.json();
          console.log(`Success with ${config.version}/${config.model}:`, data);

          if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            const text = data.candidates[0].content.parts[0].text;
            console.log('Gemini API response received:', text);

            // Parse JSON response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
              console.error('No JSON found in response:', text);
              continue;
            }

            const analysis = JSON.parse(jsonMatch[0]);
            
            // Validate response structure
            if (typeof analysis.isTurmeric !== 'boolean') {
              console.error('Invalid analysis response structure:', analysis);
              continue;
            }

            console.log('Gemini analysis completed successfully:', analysis);
            return analysis as TurmericAnalysis;
          }
        } catch (error) {
          console.warn(`Error with ${config.version}/${config.model}:`, error);
          continue;
        }
      }

      // If all API calls fail, use fallback
      console.log('All API calls failed, using fallback analysis');
      return this.getFallbackAnalysis();

    } catch (error) {
      console.error('Error analyzing turmeric image:', error);
      console.log('Using fallback analysis due to error');
      return this.getFallbackAnalysis();
    }
  }

  // Fallback analysis when Gemini API fails
  private getFallbackAnalysis(): TurmericAnalysis {
    console.log('Using fallback analysis');
    return {
      isTurmeric: true,
      quality: 'B',
      color: 'Yellow',
      size: 'Medium',
      moisture: 8,
      defects: [],
      qualityScore: 75,
      priceMultiplier: 1.0,
      analysis: 'Analysis completed using fallback method. Gemini AI is not available. Manual verification is recommended.',
      recommendations: ['Verify quality manually', 'Check for defects', 'Consider professional assessment']
    };
  }

  // Convert image file to base64
  async convertImageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get just the base64 data
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Fetch live price data from MoneyControl API via server route
  async fetchLivePriceData(): Promise<PriceData> {
    try {
      console.log('Fetching live price data from MoneyControl via server route...');
      
      const response = await fetch('/api/price/moneycontrol');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Live price data received:', data);
      
      // Extract relevant price information
      const priceData: PriceData = {
        spotPrice: data.data?.spotPrice || 8500,
        lastPrice: data.data?.lastPrice || 8500,
        change: data.data?.change || 0,
        perChange: data.data?.perChange || 0,
        highPrice: data.data?.highPrice || 8600,
        lowPrice: data.data?.lowPrice || 8400,
        lastupdTime: data.data?.lastupdTime || new Date().toISOString()
      };
      
      return priceData;
    } catch (error) {
      console.error('Error fetching live price data:', error);
      
      // Return mock data if API fails
      return {
        spotPrice: 8500,
        lastPrice: 8500,
        change: 0,
        perChange: 0,
        highPrice: 8600,
        lowPrice: 8400,
        lastupdTime: new Date().toISOString()
      };
    }
  }

  // Calculate recommended price based on analysis and live data
  calculateRecommendedPrice(analysis: TurmericAnalysis, livePriceData: PriceData): {
    recommendedPrice: number;
    confidence: number;
    basePrice: number;
    qualityAdjustment: number;
    marketPrice: number;
    priceRange: { min: number; max: number };
  } {
    // Use live market price as base (₹15,360 from MoneyControl API)
    const basePrice = livePriceData.lastPrice; // ₹15,360 per quintal
    const spotPrice = livePriceData.spotPrice; // ₹13,895.65 per quintal
    
    // Ensure priceMultiplier is realistic based on live market data
    let qualityAdjustment = analysis.priceMultiplier;
    
    // Adjust multiplier based on quality grade to match market reality
    switch (analysis.quality) {
      case 'A':
        qualityAdjustment = Math.min(qualityAdjustment, 1.2); // Max 20% above market
        break;
      case 'B':
        qualityAdjustment = Math.min(qualityAdjustment, 1.0); // At or below market
        break;
      case 'C':
        qualityAdjustment = Math.min(qualityAdjustment, 0.8); // Max 20% below market
        break;
      case 'D':
        qualityAdjustment = Math.min(qualityAdjustment, 0.6); // Max 40% below market
        break;
    }
    
    // Calculate base recommended price
    const marketPrice = Math.round(basePrice * qualityAdjustment);
    
    // Add small quality bonus based on score (max ₹200 per quintal)
    const qualityBonus = Math.min((analysis.qualityScore - 75) * 5, 200);
    const recommendedPrice = Math.round(marketPrice + qualityBonus);
    
    // Calculate price range (±5% of recommended price)
    const priceRange = {
      min: Math.round(recommendedPrice * 0.95),
      max: Math.round(recommendedPrice * 1.05)
    };
    
    // Calculate confidence based on analysis quality
    let confidence = 60; // Base confidence
    if (analysis.qualityScore > 80) confidence += 15;
    if (analysis.defects.length === 0) confidence += 10;
    if (analysis.moisture >= 6 && analysis.moisture <= 12) confidence += 10;
    if (analysis.color === 'Golden') confidence += 5;
    
    confidence = Math.min(confidence, 95); // Cap at 95%
    
    console.log(`Price Calculation:
      Live Market Price: ₹${basePrice}/quintal
      Spot Price: ₹${spotPrice}/quintal
      Quality Grade: ${analysis.quality}
      Quality Multiplier: ${qualityAdjustment}
      Recommended Price: ₹${recommendedPrice}/quintal
      Price Range: ₹${priceRange.min} - ₹${priceRange.max}/quintal
      Confidence: ${confidence}%`);
    
    return {
      recommendedPrice,
      confidence,
      basePrice,
      qualityAdjustment,
      marketPrice,
      priceRange
    };
  }
}

export const geminiAnalyzer = new GeminiTurmericAnalyzer();