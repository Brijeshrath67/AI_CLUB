import { sendOtpService, verifyOtpService } from '../services/otp.service.js';

export async function sendOtp(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    await sendOtpService(email);
    res.json({ message: 'OTP sent' });
  } catch (err) {
    console.error('sendOtp error:', err)
    res.status(500).json({ error: 'Failed to send OTP' });
  }
}

export async function verifyOtp(req, res) {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP required' });
    await verifyOtpService(email, otp);
    res.json({ message: 'OTP verified' });
  } catch (err) {
    const map = {
      OTP_NOT_FOUND: [400, 'OTP not found or expired'],
      OTP_EXPIRED: [400, 'OTP expired'],
      TOO_MANY_ATTEMPTS: [429, 'Too many attempts'],
      INVALID_OTP: [400, 'Invalid OTP'],
    };
    const [status, message] = map[err.message] || [500, 'Failed to verify OTP'];
    res.status(status).json({ error: message });
  }
}