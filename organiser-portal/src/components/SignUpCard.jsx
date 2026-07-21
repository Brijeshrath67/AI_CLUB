import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Checkbox } from './ui/checkbox';
import { z } from 'zod';
import { useToast } from '../context/ToastContext';

const passwordSchema = z.string()
  .min(8, { message: "Password must be at least 8 characters long" })
  .refine((val) => /[A-Z]/.test(val), {
    message: "Password must contain at least one uppercase letter",
  })
  .refine((val) => /[^A-Za-z0-9]/.test(val), {
    message: "Password must contain at least one special character",
  });

export default function SignUpCard({ onRegister, onSwitchToLogin }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(0);
  const { addToast } = useToast();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    if (emailError) setEmailError('');
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (val === '') {
      setPasswordErrors([]);
      return;
    }
    const result = passwordSchema.safeParse(val);
    if (!result.success) {
      setPasswordErrors(result.error?.errors?.map(err => err.message) ?? []);
    } else {
      setPasswordErrors([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (redirectCountdown > 0) return; // Prevent submission during redirect countdown
    setEmailError('');
    if (!email || !password || !name) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      addToast('Please fill in all fields', 'error');
      return;
    }
    const result = passwordSchema.safeParse(password);
    if (!result.success) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPasswordErrors(result.error?.errors?.map(err => err.message) ?? []);
      return;
    }
    const regError = await onRegister(name, email, password);
    if (regError) {
      const errorLower = regError.toLowerCase();
      
      // Check if email already registered
      if (errorLower.includes('email') && (errorLower.includes('already') || errorLower.includes('exist') || errorLower.includes('registered'))) {
        setEmailError('Email already registered. Redirecting to login in 5 seconds...');
        addToast('Email already registered. Redirecting to login...', 'info');
        
        // Start countdown
        let count = 5;
        setRedirectCountdown(count);
        const countdownInterval = setInterval(() => {
          count--;
          setRedirectCountdown(count);
          if (count <= 0) {
            clearInterval(countdownInterval);
            onSwitchToLogin();
          }
        }, 1000);
      } else {
        setEmailError(regError);
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    } else {
      addToast('Registration successful!', 'success');
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
          <div className="flex flex-col items-center relative">
            <Link to="/" className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center shadow-lg shadow-white/10">
                <img src="/logo.png" alt="ML Hive Logo" className="w-8 h-8 object-contain" />
              </div>
              <span className="font-heading font-bold text-lg tracking-tight text-white">ML Hive</span>
            </Link>
          </div>

          <div className="space-y-1 pt-1">
            <CardTitle className="text-xl font-heading text-white font-medium">Create Organiser Account</CardTitle>
            <CardDescription className="text-white/60 text-[11px]">
              Join ML Hive to manage your events today.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="relative">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5 relative group">
              <label htmlFor="signup-name" className="text-xs font-medium text-white/90">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-brand-400 transition-colors" />
                <Input
                  id="signup-name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  placeholder="Enter your name"
                  className="pl-10 h-11 rounded-xl bg-black/20 border-white/5 text-white placeholder:text-white/30 focus:border-brand-400 focus:bg-black/40 transition-all text-xs"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5 relative group">
              <label htmlFor="signup-email" className="text-xs font-medium text-white/90">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-brand-400 transition-colors" />
                <Input
                  id="signup-email"
                  type="email"
                  name="email"
                  autoComplete="username"
                  placeholder="Enter your email"
                  className="pl-10 h-11 rounded-xl bg-black/20 border-white/5 text-white placeholder:text-white/30 focus:border-brand-400 focus:bg-black/40 transition-all text-xs"
                  value={email}
                  onChange={handleEmailChange}
                />
              </div>
              {emailError && (
                <p className={`text-[10px] mt-1.5 pl-1 flex items-center gap-1.5 font-medium leading-normal ${
                  emailError.includes('Redirecting') 
                    ? 'text-amber-400/90' 
                    : 'text-red-400/90'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    emailError.includes('Redirecting')
                      ? 'bg-amber-400 animate-pulse'
                      : 'bg-red-400 animate-pulse'
                  }`} />
                  {emailError}
                </p>
              )}
            </div>

            <div className="space-y-1.5 relative group">
              <label htmlFor="signup-password" className="text-xs font-medium text-white/90">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-brand-400 transition-colors" />
                <Input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="new-password"
                  placeholder="Enter your password"
                  className="pl-10 pr-10 h-11 rounded-xl bg-black/20 border-white/5 text-white placeholder:text-white/30 focus:border-brand-400 focus:bg-black/40 transition-all text-xs"
                  value={password}
                  onChange={handlePasswordChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordErrors.length > 0 && (
                <div className="mt-1.5 space-y-1 pl-1 bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                  <p className="text-[10px] text-red-400/90 font-semibold uppercase tracking-wide mb-1">Password Requirements:</p>
                  {passwordErrors.map((msg, index) => (
                    <p key={index} className="text-[10px] text-red-400/90 flex items-center gap-1.5 font-medium leading-normal">
                      <span className="w-1 bg-red-400 rounded-full shrink-0" />
                      {msg}
                    </p>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2 pt-1 pb-1">
              <Checkbox id="terms" required className="border-white/30 data-[state=checked]:bg-[#8155ff] w-4 h-4" />
              <label htmlFor="terms" className="text-xs text-white/80 cursor-pointer">
                I agree to the <span className="text-[#a385ff]">Terms of Service</span> and <span className="text-[#a385ff]">Privacy Policy</span>.
              </label>
            </div>

            <Button 
              type="submit" 
              disabled={redirectCountdown > 0}
              className="w-full h-11 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-500 font-semibold text-sm mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {redirectCountdown > 0 ? `Redirecting in ${redirectCountdown}s` : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-5">
            <div className="flex items-center gap-4 py-1.5">
              <div className="flex-1 border-t border-white/10"></div>
              <span className="text-[10px] uppercase text-white/50 font-medium tracking-wider">or continue with</span>
              <div className="flex-1 border-t border-white/10"></div>
            </div>

            <div className="mt-3">
              <Button type="button" onClick={() => window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`} variant="outline" className="w-full flex items-center justify-center gap-2 bg-black/20 border border-white/5 hover:bg-black/40 rounded-xl h-10 hover:border-brand-500/30 hover:text-white transition-all duration-300 active:scale-95 text-white/80 font-medium text-xs">
                <svg viewBox="0 0 24 24" width="14" height="14" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Google
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <button onClick={onSwitchToLogin} className="text-brand-500 hover:text-brand-600 font-medium cursor-pointer">
              Log in
            </button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
