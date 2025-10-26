# Mobile Number OTP Authentication

## Overview
A complete mobile number verification system using OTP (One-Time Password) has been implemented for TurmericChain. Users must authenticate before accessing farmer or buyer dashboards.

## Components Created

### 1. OTP Service (`utils/otp.ts`)
- **Purpose**: Handles OTP generation, validation, and storage
- **Features**:
  - Generates 6-digit random OTP codes
  - Stores OTPs with 5-minute expiration
  - Validates Indian mobile number format (+91XXXXXXXXXX)
  - Cleanup expired OTPs automatically
  - **Note**: In production, integrate with SMS providers like Twilio, AWS SNS, or MessageBird

### 2. OTP API Route (`app/api/auth/otp/route.ts`)
- **Endpoint**: `POST /api/auth/otp`
- **Actions**:
  - `generate`: Generate and send OTP to mobile number
  - `verify`: Verify OTP against mobile number
  - `resend`: Resend OTP to mobile number

### 3. Authentication Context (`lib/auth-context.tsx`)
- **Purpose**: Global authentication state management
- **Features**:
  - Tracks login state (`isAuthenticated`)
  - Stores user phone number
  - Manages user role (farmer/buyer)
  - Persists auth state in localStorage
  - Login/logout functions
  - React Context API for global access

### 4. Login Page (`app/auth/login/page.tsx`)
- **URL**: `/auth/login`
- **Features**:
  - 3-step authentication flow:
    1. Enter mobile number
    2. Enter OTP code
    3. Select role (Farmer or Buyer)
  - Mobile-responsive UI
  - Bilingual support (English/Telugu)
  - Real-time validation
  - Resend OTP functionality
  - Loading states and error handling

### 5. Route Protection
- **Dashboard Protection**: Both farmer and buyer dashboards check authentication
- **Auto-redirect**: Unauthenticated users redirected to `/auth/login`
- **Role-based Redirects**: Users redirected to correct dashboard based on role

### 6. Logout Functionality
- **Added to TopNav**: Logout button in mobile menu
- **Action**: Clears auth state and redirects to login

## User Flow

1. **User visits any dashboard** → Redirected to `/auth/login`
2. **Enter mobile number** → OTP generated and displayed in console (for now)
3. **Enter OTP** → OTP verified
4. **Select role** → Farmer or Buyer
5. **Redirected to dashboard** → Based on selected role
6. **Can switch roles** → Using TopNav menu
7. **Can logout** → Using TopNav menu

## Development vs Production

### Current (Development)
- OTP stored in-memory
- OTP displayed in console
- No actual SMS sending
- 5-minute OTP validity
- Cleanup runs every 10 minutes

### Production Ready
- Use Redis or database for OTP storage
- Integrate SMS provider (Twilio, AWS SNS, MessageBird)
- Add rate limiting for OTP requests
- Add IP-based throttling
- Use secure session management
- Add CAPTCHA for OTP generation
- Implement OTP retry limits

## API Usage

### Generate OTP
```javascript
POST /api/auth/otp
Body: {
  "action": "generate",
  "mobileNumber": "9876543210"
}
Response: { "success": true }
```

### Verify OTP
```javascript
POST /api/auth/otp
Body: {
  "action": "verify",
  "mobileNumber": "9876543210",
  "otp": "123456"
}
Response: { "success": true }
```

### Resend OTP
```javascript
POST /api/auth/otp
Body: {
  "action": "resend",
  "mobileNumber": "9876543210"
}
Response: { "success": true }
```

## Security Considerations

1. **OTP Expiration**: 5 minutes
2. **Number Validation**: Indian format only
3. **Rate Limiting**: Implement in production
4. **Session Management**: localStorage for now, use secure cookies in production
5. **Error Messages**: Generic messages to prevent enumeration

## Testing

### Test Flow
1. Visit http://localhost:3000
2. Try to access `/farmer/dashboard` or `/buyer/dashboard`
3. Should redirect to `/auth/login`
4. Enter any 10-digit mobile number
5. Check console for OTP (in development)
6. Enter OTP
7. Select role
8. Should be redirected to dashboard
9. Try logout button
10. Should return to login

### Test Mobile Numbers
- Any 10-digit number: 9876543210
- Any number starting with 6-9: 9876543210

### Test OTP
- In development, check console for generated OTP
- Example output: "OTP for +919876543210: 123456"

## Next Steps for Production

1. **Integrate SMS Provider**
   ```typescript
   import twilio from 'twilio';
   
   const client = twilio(accountSid, authToken);
   
   await client.messages.create({
     to: normalizedNumber,
     from: '+1234567890',
     body: `Your TurmericChain OTP is: ${otp}`
   });
   ```

2. **Add Redis for OTP Storage**
   ```typescript
   import Redis from 'ioredis';
   const redis = new Redis();
   
   await redis.setex(`otp:${mobileNumber}`, 300, otp);
   const storedOTP = await redis.get(`otp:${mobileNumber}`);
   ```

3. **Add Rate Limiting**
   ```typescript
   import rateLimit from 'express-rate-limit';
   
   const otpLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 3 // 3 requests per window
   });
   ```

## Files Modified

- `app/layout.tsx` - Added AuthProvider wrapper
- `app/farmer/dashboard/page.tsx` - Added authentication check
- `app/buyer/dashboard/page.tsx` - Added authentication check
- `components/TopNav.tsx` - Added logout functionality

## Files Created

- `utils/otp.ts` - OTP service
- `app/api/auth/otp/route.ts` - OTP API endpoint
- `lib/auth-context.tsx` - Auth context provider
- `app/auth/login/page.tsx` - Login UI
- `middleware.ts` - Route middleware
- `docs/AUTH_IMPLEMENTATION.md` - This documentation

