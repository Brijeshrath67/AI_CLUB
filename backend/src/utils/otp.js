import crypto from 'crypto';

export function generateOTP(length = 6) {
  // Cryptographically secure random OTP
  const max   = Math.pow(10, length);
  const bytes = crypto.randomBytes(4);
  const num   = bytes.readUInt32BE(0) % max;
  return String(num).padStart(length, '0');
}

