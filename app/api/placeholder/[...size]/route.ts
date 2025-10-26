import { NextRequest, NextResponse } from 'next/server';

// Colorful turmeric images with different shades
const turmericColors = [
  { bg: '#FFD700', label: 'Golden Turmeric' },
  { bg: '#FFA500', label: 'Orange Turmeric' },
  { bg: '#FF8C00', label: 'Deep Orange Turmeric' },
  { bg: '#FF6B35', label: 'Vibrant Turmeric' },
  { bg: '#F4A460', label: 'Sandy Turmeric' },
  { bg: '#DAA520', label: 'Light Golden Turmeric' },
  { bg: '#FF9500', label: 'Bright Turmeric' },
  { bg: '#FF7F00', label: 'Rich Turmeric' }
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ size: string[] }> }
) {
  try {
    // Await params as it's a Promise in Next.js 16
    const resolvedParams = await params;
    const searchParams = request.nextUrl.searchParams;
    const width = parseInt(searchParams.get('w') || '400');
    const height = parseInt(searchParams.get('h') || '300');
    const index = parseInt(searchParams.get('i') || '0');
    
    const color = turmericColors[index % turmericColors.length];
    
    // Generate SVG image with turmeric color
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:${color.bg};stop-opacity:1" />
            <stop offset="100%" style="stop-color:${getDarkerColor(color.bg)};stop-opacity:1" />
          </linearGradient>
          <filter id="texture">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" />
            <feDisplacementMap in="SourceGraphic" scale="2" />
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad1)" />
        <text x="50%" y="40%" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="white" text-anchor="middle" opacity="0.3">
          🫚 Turmeric
        </text>
        <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="16" fill="white" text-anchor="middle" opacity="0.2">
          ${color.label}
        </text>
        <circle cx="${width * 0.3}" cy="${height * 0.3}" r="20" fill="white" opacity="0.15" />
        <circle cx="${width * 0.7}" cy="${height * 0.7}" r="30" fill="white" opacity="0.1" />
      </svg>
    `;
    
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating placeholder:', error);
    return new NextResponse('Error', { status: 500 });
  }
}

function getDarkerColor(color: string): string {
  // Convert hex to RGB
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  
  // Darken by 30%
  const newR = Math.floor(r * 0.7).toString(16).padStart(2, '0');
  const newG = Math.floor(g * 0.7).toString(16).padStart(2, '0');
  const newB = Math.floor(b * 0.7).toString(16).padStart(2, '0');
  
  return `#${newR}${newG}${newB}`;
}