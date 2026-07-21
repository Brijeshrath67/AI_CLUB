import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, RefreshCw, ShieldAlert, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';

export default function OtpCard({ email = 'your email', onVerify, onResend, onBack }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [shake, setShake] = useState(false);
  
  const inputRefs = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null)
  ];

  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (error) setError('');
    if (success) setSuccess('');

    if (value && index < 5) {
      inputRefs[index + 1].current.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d+$/.test(pastedData)) return;

    const pastedDigits = pastedData.substring(0, 6).split('');
    const newOtp = [...otp];

    for (let i = 0; i < 6; i++) {
      if (pastedDigits[i]) {
        newOtp[i] = pastedDigits[i];
      }
    }
    setOtp(newOtp);

    const focusIndex = Math.min(pastedDigits.length - 1, 5);
    if (inputRefs[focusIndex]?.current) {
      inputRefs[focusIndex].current.focus();
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const code = otp.join('');
    
    if (code.length < 6) {
      setError('Please enter all 6 digits.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const err = await onVerify(code);
      if (err) {
        setError(err);
        setShake(true);
        setTimeout(() => setShake(false), 500);
      } else {
        setSuccess('Email verified successfully!');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const handleResendClick = async () => {
    if (!canResend) return;
    setCanResend(false);
    setResendTimer(30);
    setError('');
    setSuccess('');
    setOtp(['', '', '', '', '', '']);
    if (inputRefs[0].current) inputRefs[0].current.focus();

    try {
      const err = await onResend();
      if (err) {
        setError(err);
        setCanResend(true);
        setResendTimer(0);
      } else {
        setSuccess('A new verification code has been sent!');
      }
    } catch (err) {
      setError('Failed to resend OTP.');
      setCanResend(true);
      setResendTimer(0);
    }
  };

  return (
    <motion.div
      animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
      transition={{ duration: 0.4 }}
      className="w-full max-w-[380px]"
    >
      <Card className="relative overflow-hidden border border-white/5 border-l-purple-500/20 border-t-purple-500/20 bg-black/40 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] rounded-[2rem] p-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-black/40 pointer-events-none" />
        
        <CardHeader className="space-y-3 pb-3 pt-5">
          <button 
            onClick={onBack} 
            className="group flex items-center gap-1.5 text-xs text-white/50 hover:text-white/90 transition-colors w-fit cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to registration
          </button>

          <div className="space-y-1.5 pt-1">
            <CardTitle className="text-xl font-heading text-white font-medium flex items-center gap-2">
              Verify OTP
            </CardTitle>
            <CardDescription className="text-white/60 text-[11px] leading-relaxed">
              We've sent a 6-digit verification code to <span className="text-brand-500 font-medium break-all">{email}</span>. Please enter it below.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="relative">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex justify-between gap-1.5 px-0.5">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={inputRefs[index]}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  disabled={loading}
                  className={`w-11 h-12 text-center text-lg font-semibold rounded-xl bg-black/20 border text-white transition-all focus:outline-none focus:bg-black/40
                    ${error 
                      ? 'border-red-500/40 focus:border-red-500 shadow-[0_0_8px_0_rgba(239,68,68,0.2)]' 
                      : 'border-white/5 focus:border-brand-500 shadow-[0_0_12px_0_rgba(123,110,232,0.1)]'
                    }`}
                />
              ))}
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex items-center gap-2 text-[11px] text-red-400 bg-red-500/10 px-3 py-2.5 rounded-xl border border-red-500/20"
              >
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {success && (
              <motion.div 
                initial={{ opacity: 0, y: -5 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-500/10 px-3 py-2.5 rounded-xl border border-emerald-500/20"
              >
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </motion.div>
            )}

            <div className="space-y-3 pt-1">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-500 font-semibold text-sm transition-all shadow-[0_4px_20px_0_rgba(123,110,232,0.3)] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </Button>

              <div className="text-center text-xs">
                {canResend ? (
                  <button
                    type="button"
                    onClick={handleResendClick}
                    className="text-brand-500 hover:text-brand-400 hover:underline font-medium transition-colors cursor-pointer"
                  >
                    Didn't receive code? Resend
                  </button>
                ) : (
                  <span className="text-white/40">
                    Resend code in <span className="text-brand-500 font-medium">{resendTimer}s</span>
                  </span>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
