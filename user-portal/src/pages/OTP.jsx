import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import LeftPanel from '../components/LeftPanel';
import OtpCard from '../components/OtpCard';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function OTP() {
  const navigate = useNavigate();
  const location = useLocation();
  const { register, login } = useAuth();
  const { addToast } = useToast();
  const [is3dLoaded, setIs3dLoaded] = useState(false);
  
  // Grab parameters from router state
  const email = location.state?.email || '';
  const password = location.state?.password || '';
  const name = location.state?.name || '';
  const fromRegister = location.state?.fromRegister || false;
  const fromLogin = location.state?.fromLogin || false;
  const from = location.state?.from || '';

  useEffect(() => {
    const viewer = document.querySelector('spline-viewer');
    if (!viewer) {
      setIs3dLoaded(true);
      return;
    }

    const handleLoad = () => {
      setIs3dLoaded(true);
    };

    viewer.addEventListener('load-complete', handleLoad);

    // Safety fallback: load anyway after 4 seconds
    const fallback = setTimeout(() => {
      setIs3dLoaded(true);
    }, 4000);

    return () => {
      viewer.removeEventListener('load-complete', handleLoad);
      clearTimeout(fallback);
    };
  }, []);

  const handleVerify = async (code) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Verification succeeded!
        if (fromRegister && name && password) {
          // If we verified during registration flow, submit the actual registration call now.
          // Since email is now marked as verified in redis, this call will succeed and log us in.
          const regErr = await register(name, email, password, from);
          if (regErr) {
            addToast(regErr, 'error');
            return regErr;
          }
          addToast('Registered and logged in successfully!', 'success');
          return null;
        }

        if (fromLogin && password) {
          // If we verified during login flow, trigger login directly.
          const loginErr = await login(email, password, undefined, from);
          if (loginErr) {
            addToast(loginErr, 'error');
            return loginErr;
          }
          addToast('Logged in successfully!', 'success');
          return null;
        }

        addToast('Verification successful!', 'success');
        // Fallback: Redirect the user to login page after a short delay
        setTimeout(() => {
          navigate('/login');
        }, 1500);
        return null;
      }
      
      addToast(data.error || 'Verification failed. Please try again.', 'error');
      return data.error || 'Verification failed. Please try again.';
    } catch (err) {
      console.error('OTP verification error:', err);
      addToast('Network error. Please try again.', 'error');
      return 'Network error. Please check your connection and try again.';
    }
  };

  const handleResend = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        return null; // success
      }

      return data.error || 'Failed to resend verification code.';
    } catch (err) {
      console.error('OTP resend error:', err);
      return 'Network error. Failed to resend code.';
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <AnimatePresence>
        {!is3dLoaded && (
          <motion.div
            key="otp-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col justify-center items-center bg-[#050508]"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="flex flex-col items-center gap-4 z-10">
              <motion.div 
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8155ff] to-[#6035f5] flex items-center justify-center shadow-lg shadow-brand-500/30"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                <span className="font-heading font-bold text-3xl text-white">F</span>
              </motion.div>
              
              <div className="flex flex-col items-center gap-1.5 text-center">
                <h2 className="text-base font-heading font-medium tracking-tight text-white">Initializing Experience</h2>
                <p className="text-white/40 text-[10px] font-sans">Configuring 3D environment...</p>
              </div>
              
              <div className="w-32 h-[3px] bg-white/5 rounded-full overflow-hidden relative">
                <motion.div 
                  className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full"
                  initial={{ x: "-100%" }}
                  animate={{ x: "100%" }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
                  style={{ width: '100%' }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: is3dLoaded ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="h-screen w-full flex bg-[radial-gradient(circle_at_30%_30%,#1a1033_0%,#000000_100%)] overflow-hidden relative"
      >
        {/* 3D spline background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <spline-viewer
            url="https://prod.spline.design/qM1MVE4Z6pyI5df0/scene.splinecode"
            style={{ width: '100%', height: '100%', pointerEvents: 'none' }}
          />
        </div>

        <LeftPanel />

        <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 relative bg-transparent z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[800px] bg-purple-600/40 rounded-full blur-[150px] -z-10 pointer-events-none" />
          <div className="w-full max-w-[360px] relative translate-x-[10px]">
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <OtpCard
                email={email}
                onVerify={handleVerify}
                onResend={handleResend}
                onBack={() => navigate('/register')}
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
