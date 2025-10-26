// OTP service for mobile number verification
// In production, integrate with SMS providers like Twilio, AWS SNS, or MessageBird

// In-memory store for OTPs (use Redis or database in production)
const otpStore = new Map<string, { code: string; expiresAt: number }>();

// Generate a random 6-digit OTP
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// OTP validity duration (5 minutes)
const OTP_VALIDITY_MS = 5 * 60 * 1000;

/**
 * Generate and send OTP to mobile number
 * @param mobileNumber - The mobile number to send OTP to
 * @returns { success: boolean, error?: string, otp?: string }
 */
export async function generateOTPForMobile(mobileNumber: string): Promise<{ success: boolean; error?: string; otp?: string }> {
  try {
    // Validate mobile number format (Indian format)
    if (!/^\+91[6-9]\d{9}$/.test(mobileNumber) && !/^[6-9]\d{9}$/.test(mobileNumber)) {
      return { success: false, error: 'Invalid mobile number format' };
    }

    // Normalize mobile number
    const normalizedNumber = mobileNumber.startsWith('+91') 
      ? mobileNumber 
      : `+91${mobileNumber}`;

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = Date.now() + OTP_VALIDITY_MS;

    // Store OTP
    otpStore.set(normalizedNumber, { code: otp, expiresAt });

    // In production, send SMS here using a service like Twilio, AWS SNS, etc.
    console.log(`OTP for ${normalizedNumber}: ${otp}`);
    console.log('In production, this OTP would be sent via SMS');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return OTP in development for testing
    return { success: true, otp };
  } catch (error) {
    console.error('Error generating OTP:', error);
    return { success: false, error: 'Failed to generate OTP' };
  }
}

/**
 * Verify OTP for mobile number
 * @param mobileNumber - The mobile number
 * @param otp - The OTP to verify
 * @returns { success: boolean, error?: string }
 */
export async function verifyOTPForMobile(
  mobileNumber: string,
  otp: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Normalize mobile number
    const normalizedNumber = mobileNumber.startsWith('+91') 
      ? mobileNumber 
      : `+91${mobileNumber}`;

    const storedOTP = otpStore.get(normalizedNumber);

    if (!storedOTP) {
      return { success: false, error: 'OTP not found or expired' };
    }

    // Check if OTP expired
    if (Date.now() > storedOTP.expiresAt) {
      otpStore.delete(normalizedNumber);
      return { success: false, error: 'OTP expired' };
    }

    // Verify OTP
    if (storedOTP.code !== otp) {
      return { success: false, error: 'Invalid OTP' };
    }

    // Remove OTP after successful verification
    otpStore.delete(normalizedNumber);

    return { success: true };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { success: false, error: 'Failed to verify OTP' };
  }
}

/**
 * Resend OTP
 * @param mobileNumber - The mobile number
 * @returns { success: boolean, error?: string }
 */
export async function resendOTPForMobile(mobileNumber: string): Promise<{ success: boolean; error?: string }> {
  return generateOTPForMobile(mobileNumber);
}

/**
 * Cleanup expired OTPs (call periodically in production)
 */
export function cleanupExpiredOTPs(): void {
  const now = Date.now();
  for (const [mobile, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(mobile);
    }
  }
}

// Run cleanup every 10 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredOTPs, 10 * 60 * 1000);
}

