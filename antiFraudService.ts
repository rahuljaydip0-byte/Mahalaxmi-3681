/**
 * Anti-Fake Order & Fraud Prevention Service
 * Performs validation against disposable emails, invalid phone numbers,
 * rate-limiting (5 OTPs/hr), bot reCAPTCHA checks, duplicate order frequency,
 * and calculates a Risk Score for Super Admin review.
 */

import { Order } from '../types';

// Common disposable email domains
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'trashmail.com',
  'dispostable.com',
  'yopmail.com',
  'getnada.com',
  'throwawaymail.com',
  'tempmailo.com',
  'sharklasers.com',
  'fakeinbox.com',
  'maildrop.cc'
]);

export interface AntiFraudCheckResult {
  isDisposableEmail: boolean;
  isPhoneValid: boolean;
  isDuplicateOrder: boolean;
  rateLimitExceeded: boolean;
  riskScore: number; // 0 (Low Risk / Genuine) to 100 (High Risk / Suspicious)
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  reasons: string[];
}

/**
 * Check if email domain is a known disposable / temporary email provider
 */
export function checkIsDisposableEmail(email: string): boolean {
  if (!email || !email.includes('@')) return true;
  const domain = email.split('@')[1]?.toLowerCase().trim();
  return DISPOSABLE_EMAIL_DOMAINS.has(domain);
}

/**
 * Check if phone number is valid and not a dummy sequence
 */
export function checkIsPhoneValid(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/\D/g, '');
  
  // Must be between 8 and 15 digits
  if (cleaned.length < 8 || cleaned.length > 15) return false;

  // Reject obvious dummy sequences like 0000000000, 1234567890, 1111111111
  const dummySequences = ['00000000', '12345678', '11111111', '99999999', '1234567890'];
  for (const seq of dummySequences) {
    if (cleaned.includes(seq)) return false;
  }

  return true;
}

/**
 * Check if user has exceeded max 5 OTP requests per hour
 */
export function checkRateLimit(identifier: string): { exceeded: boolean; currentCount: number } {
  try {
    const key = `otp_rate_limit_${identifier.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const raw = localStorage.getItem(key);
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;

    let timestamps: number[] = raw ? JSON.parse(raw) : [];
    // Keep timestamps within last hour
    timestamps = timestamps.filter(ts => now - ts < ONE_HOUR);

    if (timestamps.length >= 5) {
      return { exceeded: true, currentCount: timestamps.length };
    }

    return { exceeded: false, currentCount: timestamps.length };
  } catch (e) {
    return { exceeded: false, currentCount: 0 };
  }
}

/**
 * Record an OTP request attempt for rate limiting
 */
export function recordOtpRequest(identifier: string): void {
  try {
    const key = `otp_rate_limit_${identifier.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const raw = localStorage.getItem(key);
    const now = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;

    let timestamps: number[] = raw ? JSON.parse(raw) : [];
    timestamps = timestamps.filter(ts => now - ts < ONE_HOUR);
    timestamps.push(now);

    localStorage.setItem(key, JSON.stringify(timestamps));
  } catch (e) {
    // Ignore localStorage errors
  }
}

/**
 * Check if there is a duplicate recent order from same email or phone (within 10 mins)
 */
export function checkDuplicateOrder(email: string, phone: string, existingOrders: Order[]): boolean {
  const TEN_MINS = 10 * 60 * 1000;
  const now = Date.now();

  return existingOrders.some(order => {
    const orderTime = new Date(order.orderDate).getTime();
    if (now - orderTime < TEN_MINS) {
      const matchEmail = order.customerEmail.toLowerCase() === email.toLowerCase();
      const matchPhone = (order.customerPhone || '').replace(/\D/g, '') === phone.replace(/\D/g, '');
      if (matchEmail || (phone && matchPhone)) return true;
    }
    return false;
  });
}

/**
 * Comprehensive Anti-Fraud Evaluation & Risk Scoring
 */
export function evaluateAntiFraudRisk(
  email: string,
  phone: string,
  existingOrders: Order[],
  reCaptchaVerified: boolean
): AntiFraudCheckResult {
  const reasons: string[] = [];
  let score = 0;

  // 1. Disposable Email Check
  const isDisposableEmail = checkIsDisposableEmail(email);
  if (isDisposableEmail) {
    score += 40;
    reasons.push('Disposable or temporary email address detected');
  }

  // 2. Phone Validity Check
  const isPhoneValid = checkIsPhoneValid(phone);
  if (!isPhoneValid) {
    score += 30;
    reasons.push('Suspicious or dummy phone number sequence');
  }

  // 3. Rate Limit Check
  const rateLimit = checkRateLimit(email);
  if (rateLimit.exceeded) {
    score += 35;
    reasons.push('Exceeded maximum 5 OTP requests per hour limit');
  }

  // 4. Duplicate Order Check
  const isDuplicateOrder = checkDuplicateOrder(email, phone, existingOrders);
  if (isDuplicateOrder) {
    score += 25;
    reasons.push('Duplicate order submitted within last 10 minutes');
  }

  // 5. Bot reCAPTCHA Check
  if (!reCaptchaVerified) {
    score += 50;
    reasons.push('Bot reCAPTCHA security verification incomplete');
  }

  const finalScore = Math.min(100, score);
  let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
  if (finalScore >= 50) riskLevel = 'HIGH';
  else if (finalScore >= 20) riskLevel = 'MEDIUM';

  return {
    isDisposableEmail,
    isPhoneValid,
    isDuplicateOrder,
    rateLimitExceeded: rateLimit.exceeded,
    riskScore: finalScore,
    riskLevel,
    reasons
  };
}
