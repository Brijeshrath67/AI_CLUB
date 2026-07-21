import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion } from 'framer-motion';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const { addToast } = useToast();
  const processedRef = useRef(false);

  useEffect(() => {
    if (processedRef.current) return;
    processedRef.current = true;

    const handleCallback = async () => {
      try {
        // Exchange the httpOnly cookie for an access token
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/google/exchange-token`, {
          method: 'POST',
          credentials: 'include',
        });
        const data = await res.json();

        if (data.success && data.access_token) {
          const user = await loginWithToken(data.access_token);
          if (user) {
            addToast(`Welcome back, ${user.name}!`, 'success');
            navigate('/events');
          } else {
            addToast('Failed to retrieve user profile.', 'error');
            navigate('/login');
          }
        } else {
          addToast('Authentication failed.', 'error');
          navigate('/login');
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        addToast('Authentication failed.', 'error');
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, loginWithToken, addToast]);

  return (
    <div className="h-screen w-full flex flex-col justify-center items-center bg-[#050508] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="flex flex-col items-center gap-4 z-10">
        <motion.div 
          className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8155ff] to-[#6035f5] flex items-center justify-center shadow-lg shadow-brand-500/30"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <span className="font-heading font-bold text-3xl text-white">F</span>
        </motion.div>
        
        <div className="flex flex-col items-center gap-1.5 text-center">
          <h2 className="text-base font-heading font-medium tracking-tight text-white">Signing you in...</h2>
          <p className="text-white/40 text-[10px] font-sans">Verifying authentication status...</p>
        </div>
      </div>
    </div>
  );
}
