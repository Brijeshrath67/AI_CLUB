import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import LeftPanel from '../components/LeftPanel';
import LoginCard from '../components/LoginCard';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [is3dLoaded, setIs3dLoaded] = useState(false);
  const from = location.state?.from || '/';

  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIs3dLoaded(true);
      return;
    }

    const viewer = document.querySelector('spline-viewer');
    if (!viewer) {
      setIs3dLoaded(true);
      return;
    }

    const handleLoad = () => {
      setIs3dLoaded(true);
    };

    viewer.addEventListener('load-complete', handleLoad);

    const fallback = setTimeout(() => {
      setIs3dLoaded(true);
    }, 4000);

    return () => {
      viewer.removeEventListener('load-complete', handleLoad);
      clearTimeout(fallback);
    };
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden font-sans">
      <AnimatePresence>
        {!is3dLoaded && (
          <motion.div
            key="login-loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="fixed inset-0 z-50 flex flex-col justify-center items-center bg-[#050508]"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />
            
            <div className="flex flex-col items-center gap-4 z-10">
              <motion.div 
                className="w-16 h-16 rounded-2xl bg-black border border-white/10 flex items-center justify-center shadow-lg shadow-white/10"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                <img src="/logo.png" alt="ML Hive Logo" className="w-12 h-12 object-contain" />
              </motion.div>
              
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
        {/* Spline background */}
        <div className="hidden lg:block absolute inset-0 z-0 pointer-events-none">
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
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <LoginCard 
                onLogin={(email, password) => login(email, password, undefined, from)} 
                onSwitchToSignUp={() => navigate('/register', { state: { from } })} 
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
