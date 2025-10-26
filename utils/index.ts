import CryptoJS from 'crypto-js';
import QRCode from 'qrcode';

export function generateBatchHash(batchData: {
  farmerId: string;
  weight: number;
  moisture: number;
  harvestDate: string;
  grade: string;
  timestamp: string;
}): string {
  const dataString = `${batchData.farmerId}-${batchData.weight}-${batchData.moisture}-${batchData.harvestDate}-${batchData.grade}-${batchData.timestamp}`;
  return CryptoJS.SHA256(dataString).toString();
}

export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return '';
  }
}

export function formatPrice(price: number, language: 'te' | 'en' = 'en'): string {
  if (language === 'te') {
    return `₹${price.toLocaleString('en-IN')}`;
  }
  return `₹${price.toLocaleString('en-IN')}`;
}

export function formatWeight(weight: number, language: 'te' | 'en' = 'en'): string {
  if (language === 'te') {
    return `${weight} క్వింటల్`;
  }
  return `${weight} Quintal`;
}

export function formatDate(date: string, language: 'te' | 'en' = 'en'): string {
  const d = new Date(date);
  if (language === 'te') {
    return d.toLocaleDateString('te-IN');
  }
  return d.toLocaleDateString('en-IN');
}

export function formatDateTime(date: string, language: 'te' | 'en' = 'en'): string {
  const d = new Date(date);
  if (language === 'te') {
    return d.toLocaleString('te-IN');
  }
  return d.toLocaleString('en-IN');
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'listed':
      return 'bg-blue-100 text-blue-800';
    case 'booked':
      return 'bg-yellow-100 text-yellow-800';
    case 'sold':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-orange-100 text-orange-800';
    case 'accepted':
      return 'bg-green-100 text-green-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function getGradeColor(grade: string): string {
  switch (grade) {
    case 'A+':
      return 'bg-green-100 text-green-800';
    case 'A':
      return 'bg-blue-100 text-blue-800';
    case 'B+':
      return 'bg-yellow-100 text-yellow-800';
    case 'B':
      return 'bg-orange-100 text-orange-800';
    case 'C':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

export { createNotification } from './api';