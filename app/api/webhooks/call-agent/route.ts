import { NextRequest, NextResponse } from 'next/server';

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

export async function POST(request: NextRequest) {
  try {
    const callRequest: CallRequest = await request.json();
    
    console.log('Call Agent Request Received:', callRequest);
    
    // Validate required fields
    if (!callRequest.name || !callRequest.phone || !callRequest.farmerNumber) {
      return NextResponse.json(
        { error: 'Name, phone number, and farmer phone number are required' },
        { status: 400 }
      );
    }
    
    // Send to n8n webhook for call processing
    const webhookUrl = 'https://sammmmm.app.n8n.cloud/webhook/09d1214c-9830-42f4-8b3d-e54e417f50ef';
    
    const webhookPayload = {
      type: 'CALL_AGENT_REQUEST',
      data: {
        // Core customer information
        customerName: callRequest.name,
        customerPhone: callRequest.phone,
        farmerPhone: callRequest.farmerPhone,
        farmerNumber: callRequest.farmerNumber,
        buyerPhone: callRequest.buyerPhone,
        batchId: callRequest.batchId,
        language: callRequest.language,
        timestamp: callRequest.timestamp,
        
        // Request metadata
        priority: 'high',
        source: 'turmeric-chain-web',
        requestType: 'turmeric_specialist_call',
        estimatedDuration: '10-15 minutes',
        callPurpose: 'turmeric_price_inquiry',
        customerType: 'farmer',
        urgency: 'normal',
        
        // Platform and session information
        platform: 'web',
        userAgent: request.headers.get('user-agent') || 'unknown',
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        
        // Call preferences and settings
        preferredLanguage: callRequest.language,
        timeZone: 'Asia/Kolkata',
        callBackTime: 'immediate',
        maxWaitTime: '5 minutes',
        
        // Turmeric-specific context
        productType: 'turmeric',
        inquiryType: 'price_suggestion',
        expectedTopics: [
          'current_market_price',
          'quality_assessment', 
          'selling_advice',
          'market_trends',
          'harvest_timing',
          'storage_advice',
          'grading_information',
          'pricing_strategies'
        ],
        
        // Twilio account and voice settings
        twilioAccountType: 'free',
        verificationRequired: true,
        verificationNumber: '9100982321',
        voiceType: 'human-like',
        multiLanguageSupport: true,
        supportedLanguages: ['te', 'en'],
        
        // SMS functionality
        smsEnabled: true,
        smsRecipient: callRequest.farmerNumber,
        smsLanguage: callRequest.language,
        smsPurpose: 'call_summary',
        smsTemplate: callRequest.language === 'te' 
          ? 'కాల్ సారాంశం: {callDetails} - TurmericChain'
          : 'Call Summary: {callDetails} - TurmericChain',
        
        // Call agent instructions
        agentInstructions: {
          greeting: callRequest.language === 'te' 
            ? 'నమస్కారం, నేను TurmericChain నుండి టర్మరిక్ స్పెషలిస్ట్. మీరు టర్మరిక్ గురించి ప్రశ్నలు ఉంటే నాకు తెలియజేయండి.'
            : 'Hello, I am a Turmeric Specialist from TurmericChain. Please let me know if you have any questions about turmeric.',
          mainTopics: [
            'Current turmeric market prices',
            'Quality assessment of turmeric',
            'Best time to sell turmeric',
            'Storage and preservation tips',
            'Market trends and predictions'
          ],
          closing: callRequest.language === 'te'
            ? 'ధన్యవాదాలు! మీ టర్మరిక్ వ్యాపారంలో విజయం కోరుకుంటున్నాను.'
            : 'Thank you! Wishing you success in your turmeric business.'
        },
        
        // Additional context for better call experience
        marketContext: {
          currentSeason: 'harvest',
          marketLocation: 'Nizamabad',
          priceRange: '₹7,000 - ₹10,000 per quintal',
          qualityFactors: ['color', 'moisture', 'curcumin_content', 'size']
        },
        
        // Call tracking and analytics
        tracking: {
          sourcePage: 'dashboard',
          userJourney: 'price_inquiry',
          conversionGoal: 'expert_consultation',
          followUpRequired: true,
          followUpMethod: 'sms'
        },
        
        // Error handling and fallback
        fallbackOptions: {
          smsFallback: true,
          emailFallback: false,
          callbackScheduling: true,
          alternativeContact: '+919876543210'
        }
      }
    };
    
    console.log('Sending webhook payload to production n8n:', {
      url: webhookUrl,
      payloadSize: JSON.stringify(webhookPayload).length,
      timestamp: new Date().toISOString()
    });
    
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TurmericChain-Webhook/1.0',
        'X-Request-ID': webhookPayload.data.requestId
      },
      body: JSON.stringify(webhookPayload),
      // Add timeout to prevent hanging requests
      signal: AbortSignal.timeout(30000) // 30 second timeout
    });
    
    if (webhookResponse.ok) {
      const responseData = await webhookResponse.json().catch(() => ({}));
      console.log('Call request sent to n8n successfully:', {
        status: webhookResponse.status,
        responseData,
        requestId: webhookPayload.data.requestId
      });
      
      // Log the call request for tracking
      console.log('Call Agent Request Logged:', {
        id: webhookPayload.data.requestId,
        ...callRequest,
        status: 'pending',
        webhookResponse: 'success',
        webhookStatus: webhookResponse.status,
        responseData
      });
      
      return NextResponse.json({
        success: true,
        message: 'Call request submitted successfully',
        callId: webhookPayload.data.requestId,
        estimatedWaitTime: '2-5 minutes',
        webhookStatus: webhookResponse.status,
        responseData
      });
    } else {
      const errorText = await webhookResponse.text().catch(() => 'Unknown error');
      console.error('Failed to send call request to n8n:', {
        status: webhookResponse.status,
        statusText: webhookResponse.statusText,
        error: errorText,
        requestId: webhookPayload.data.requestId
      });
      
      // Fallback: Log the request locally
      console.log('Call Agent Request (Fallback):', {
        id: webhookPayload.data.requestId,
        ...callRequest,
        status: 'pending',
        webhookResponse: 'failed',
        fallback: true,
        error: errorText
      });
      
      return NextResponse.json({
        success: true,
        message: 'Call request logged (webhook unavailable)',
        callId: webhookPayload.data.requestId,
        estimatedWaitTime: '5-10 minutes',
        note: 'Manual processing required',
        webhookError: errorText
      });
    }
    
  } catch (error) {
    console.error('Error processing call agent request:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: 'Unable to process call request at this time'
      },
      { status: 500 }
    );
  }
}
