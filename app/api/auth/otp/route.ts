import { NextRequest, NextResponse } from 'next/server';
import { generateOTPForMobile, verifyOTPForMobile, resendOTPForMobile } from '../../../../utils/otp';

/**
 * POST /api/auth/otp
 * Handles OTP generation and verification
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, mobileNumber, otp } = body;

    if (!action || !mobileNumber) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'generate':
        const generateResult = await generateOTPForMobile(mobileNumber);
        if (!generateResult.success) {
          return NextResponse.json(
            { success: false, error: generateResult.error },
            { status: 400 }
          );
        }
        // In development, return OTP for testing
        return NextResponse.json({ 
          success: true,
          otp: generateResult.otp || ''
        });

      case 'verify':
        if (!otp) {
          return NextResponse.json(
            { success: false, error: 'OTP is required for verification' },
            { status: 400 }
          );
        }
        const verifyResult = await verifyOTPForMobile(mobileNumber, otp);
        if (!verifyResult.success) {
          return NextResponse.json(
            { success: false, error: verifyResult.error },
            { status: 400 }
          );
        }
        return NextResponse.json({ success: true });

      case 'resend':
        const resendResult = await resendOTPForMobile(mobileNumber);
        if (!resendResult.success) {
          return NextResponse.json(
            { success: false, error: resendResult.error },
            { status: 400 }
          );
        }
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in OTP API route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

