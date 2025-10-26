@echo off
REM TurmericChain Demo Script for Windows
REM This script helps demonstrate the application features

echo 🌱 TurmericChain Demo Script
echo ==========================
echo.

REM Check if the development server is running
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Development server is not running!
    echo Please run: npm run dev
    echo.
    pause
    exit /b 1
)

echo ✅ Development server is running at http://localhost:3000
echo.

echo 🎯 Demo Scenarios:
echo ==================
echo.
echo 1. 🌾 Farmer Dashboard Demo
echo    - Navigate to: http://localhost:3000
echo    - Click 'Login as Farmer'
echo    - Explore price ticker, AI suggestions, voice assistant
echo    - Upload a new batch using the wizard
echo    - View and manage listings
echo.
echo 2. 🛒 Buyer Marketplace Demo
echo    - Switch to buyer role from top navigation
echo    - Browse available batches
echo    - Place bids and add to cart
echo    - Complete checkout process
echo.
echo 3. 🎤 Voice Assistant Demo
echo    - Use the voice assistant on farmer dashboard
echo    - Try asking: 'What's the current price?'
echo    - Test Telugu voice commands
echo.
echo 4. 🌐 Language ^& Accessibility Demo
echo    - Toggle between Telugu and English
echo    - Enable low literacy mode
echo    - Test responsive design on mobile
echo.
echo 5. 🔗 Integration Demo
echo    - Click 'Call Agent' to trigger n8n webhook
echo    - Observe simulated call status updates
echo    - Test Razorpay checkout simulation
echo.

echo 📱 Test Responsive Design:
echo ==========================
echo - Mobile (320px): Test touch targets and navigation
echo - Tablet (768px): Check layout adjustments
echo - Desktop (1024px+): Full feature experience
echo.

echo 🔧 Environment Variables:
echo ========================
echo Check .env.local for configuration:
echo - NEXT_PUBLIC_PRICE_API_URL (optional)
echo - NEXT_PUBLIC_N8N_WEBHOOK_URL (optional)
echo - NEXT_PUBLIC_RAZORPAY_KEY_ID (optional)
echo - NEXT_PUBLIC_DEFAULT_LANG=te
echo.

echo 📊 Mock Data Available:
echo =====================
echo - 4 Farmers (Telugu/English names)
echo - 6 Turmeric Batches (different grades)
echo - Live Price Simulation
echo - Sample Buyer Offers
echo.

echo 🚀 Quick Start Commands:
echo =======================
echo npm run dev     # Start development server
echo npm run build   # Build for production
echo npm run start   # Start production server
echo npm run lint    # Run ESLint
echo.

echo ✨ Happy Demo-ing!
echo ==================
echo The application is ready for demonstration.
echo All features are functional with mock data.
echo.

REM Open browser
echo 🌐 Opening browser...
start http://localhost:3000

pause
