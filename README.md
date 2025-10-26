# TurmericChain - Farmer & Buyer Dashboard

A responsive frontend PWA for turmeric farmers and buyers with AI-powered price suggestions and voice assistance. Built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Farmer Dashboard**: Upload batches, view AI price suggestions, manage listings
- **Buyer Marketplace**: Browse batches, place bids, manage cart
- **AI Price Suggestions**: Upload product images and answer questions for AI-powered price recommendations using Gemini AI
- **Call Agent**: Connect with turmeric specialists through professional call service
- **Voice Assistant**: Telugu/English voice commands with ElevenLabs AI agent
- **AI Integration**: ElevenLabs conversational AI with n8n webhook fallback
- **Multi-language Support**: Telugu and English with accessibility features
- **Responsive Design**: Mobile-first design with low-literacy mode
- **Blockchain Traceability**: QR code generation and batch verification

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Chart.js / Recharts
- **Icons**: Lucide React
- **QR Generation**: qrcode
- **Speech**: Web Speech API
- **State Management**: React Context

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd turmeric-chain
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   # ElevenLabs Configuration
   NEXT_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   
   # Gemini AI Configuration
   NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyDxJqODbQSJ3tq6uDPcivZUmAraXGSUthg
   
   # n8n Webhook Configuration (fallback)
   NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/turmeric-chain
   
   # Call Agent Webhook Configuration
   N8N_WEBHOOK_URL=https://sammmmm.app.n8n.cloud/webhook-test/09d1214c-9830-42f4-8b3d-e54e417f50ef
   
   # Price API Configuration
   NEXT_PUBLIC_PRICE_API_URL=http://localhost:3001/api/price
   
   # Razorpay Configuration
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_your_key_id
   
   # Supabase Configuration (Optional)
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Default Language (te for Telugu, en for English)
   NEXT_PUBLIC_DEFAULT_LANG=en
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Demo Scenarios

### Scenario 1: Farmer Workflow
1. **Login as Farmer**: Click "Login as Farmer" on the landing page
2. **View Dashboard**: See current price, AI suggestions, and recent batches
3. **Upload Batch**: Click "Upload New Batch" and follow the wizard
4. **AI Analysis**: Review AI quality analysis and price recommendations
5. **Call Agent**: Click "Call Agent" to simulate AI-powered farmer assistance
6. **Manage Listings**: View and manage your batch listings

### Scenario 2: Buyer Workflow
1. **Login as Buyer**: Click "Login as Buyer" on the landing page
2. **Browse Marketplace**: View available turmeric batches
3. **Place Bid**: Click "Place Bid" on a batch
4. **Add to Cart**: Add batches to your cart
5. **Checkout**: Complete payment via Razorpay simulation

### Scenario 3: Voice Assistant
1. **Access Voice Assistant**: Available on farmer dashboard
2. **Ask Questions**: 
   - "What's the current price?" (Telugu: "ప్రస్తుత ధర ఎంత?")
   - "Should I sell now?" (Telugu: "ఇప్పుడు విక్రయించాలా?")
   - "Market trend?" (Telugu: "మార్కెట్ ట్రెండ్ ఎలా ఉంది?")

## 📱 Routes

- `/` - Landing page with role selection
- `/farmer/dashboard` - Farmer dashboard with price ticker and AI suggestions
- `/farmer/listings` - Manage farmer's batch listings
- `/farmer/upload` - Batch upload wizard with QR generation
- `/buyer/dashboard` - Buyer marketplace (coming soon)
- `/buyer/listing/[id]` - Individual batch details (coming soon)
- `/cart` - Shopping cart and checkout (coming soon)
- `/demo/mockdata` - Demo data control panel (coming soon)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_ELEVENLABS_API_KEY` | ElevenLabs API key for voice AI | No (uses fallback) |
| `NEXT_PUBLIC_N8N_WEBHOOK_URL` | n8n webhook for AI actions (fallback) | No (simulates actions) |
| `NEXT_PUBLIC_PRICE_API_URL` | Price data API endpoint | No (uses mock data) |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay payment key | No (simulates payments) |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase database URL | No (uses localStorage) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | No |
| `NEXT_PUBLIC_DEFAULT_LANG` | Default language (te/en) | No (defaults to en) |

### Mock Data

The application includes comprehensive mock data:
- **Farmers**: 4 sample farmers with Telugu/English names
- **Batches**: 6 turmeric batches with different grades and statuses
- **Price Ticks**: Live price data simulation
- **Offers**: Sample buyer offers

## 🎨 UI/UX Features

### Accessibility
- **Large Touch Targets**: 48px minimum button sizes
- **Low Literacy Mode**: Larger icons and text-to-speech
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **High Contrast**: Clear color schemes for visibility

### Responsive Design
- **Mobile First**: Optimized for mobile devices
- **Breakpoints**: sm (640px), md (768px), lg (1024px)
- **Touch Friendly**: Large buttons and easy navigation

### Language Support
- **English**: Primary language with full support
- **Telugu (తెలుగు)**: Secondary language with native script
- **Dynamic Switching**: Real-time language toggle
- **Voice Support**: English and Telugu speech synthesis

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Set Environment Variables**
   - Go to your Vercel project dashboard
   - Add all environment variables from `.env.local.example`

3. **Deploy**
   ```bash
   vercel --prod
   ```

### Manual Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Start production server**
   ```bash
   npm start
   ```

## 🧪 Testing

### Manual Test Cases

1. **Price Feed Updates**
   - Verify price ticker updates every 5 seconds
   - Test TTS announcement in low literacy mode

2. **Batch Upload**
   - Upload photos, enter details, generate QR code
   - Verify AI quality analysis display

3. **n8n Webhook Integration**
   - Click "Call Agent" button
   - Observe simulated call status updates

4. **Razorpay Checkout**
   - Add items to cart, proceed to checkout
   - Complete payment simulation

5. **Low Literacy Mode**
   - Toggle low literacy mode
   - Verify larger icons and auto-read features

6. **Responsive Design**
   - Test at 320px, 768px, 1024px widths
   - Verify mobile navigation and touch targets

## 📊 Mock Data Structure

### Price Tick
```typescript
{
  symbol: "TURMERIC",
  market: "Nizamabad",
  unit: "quintal",
  price: 8250,
  change_pct_24h: 2.3,
  timestamp: "2025-10-25T14:02:12+05:30",
  source: "agmarknet",
  volume: 2500,
  ohlc: {
    open: 8200,
    high: 8300,
    low: 8100,
    close: 8250
  }
}
```

### Batch
```typescript
{
  id: "batch_001",
  farmerId: "farmer_01",
  photos: ["base64_or_url"],
  weight_qtl: 2.5,
  moisture_pct: 8.5,
  harvest_date: "2025-10-10",
  grade: "Finger",
  ai: {
    grade: "A",
    curcumin_est: "2.5%",
    confidence: 0.78
  },
  status: "listed",
  price_recommended: 8400,
  batch_hash: "sha256...",
  qr: "data:image/png;base64,..."
}
```

## 🔌 Integration Points

### n8n Webhook Payloads

**Call Agent**
```json
{
  "type": "CALL_AGENT",
  "data": {
    "farmer": { "phone": "+919876543210" },
    "buyer": { "phone": "+919876543220" },
    "batchId": "batch_001",
    "language": "te"
  }
}
```

**AI Chat**
```json
{
  "type": "AI_CHAT",
  "data": {
    "text": "What's the current price?",
    "farmerPhone": "+919876543210",
    "language": "te"
  }
}
```

**Payment Success**
```json
{
  "type": "PAYMENT_SUCCESS",
  "data": {
    "batchId": "batch_001",
    "farmerPhone": "+919876543210",
    "amount": 21000,
    "buyerPhone": "+919876543220"
  }
}
```

## 🎯 Hackathon Demo Script

### 20-Minute Demo Flow

1. **Introduction (2 min)**
   - Show landing page
   - Explain farmer/buyer roles
   - Highlight Telugu language support

2. **Farmer Dashboard (5 min)**
   - Login as farmer
   - Show price ticker with live updates
   - Demonstrate AI price suggestions
   - Use voice assistant for price inquiry

3. **Batch Upload (5 min)**
   - Upload photos (simulate camera)
   - Enter batch details
   - Generate QR code
   - Show AI quality analysis

4. **Marketplace (5 min)**
   - Switch to buyer role
   - Browse available batches
   - Place bid on a batch
   - Add to cart and checkout

5. **Advanced Features (3 min)**
   - Show blockchain traceability
   - Demonstrate n8n webhook calls
   - Test responsive design
   - Toggle low literacy mode

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for BITS Hackathon
- Inspired by real farmer needs in Telangana
- Uses modern web technologies for accessibility
- Designed for low-literacy users

## 📞 Support

For support or questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ for farmers and buyers in India**