import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Menu, X, QrCode } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    setAvatarError(false);
  }, [user?.avatar]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Events', path: '/events' },
    { name: 'Features', path: '/features' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' },
    ...(user ? [{ name: 'Transactions', path: '/transactions' }] : [])
  ];

  const isActive = (path) => {
    if (path.includes('#')) {
      return false; // hash links aren't "active" in a traditional sense
    }
    if (path === '/') {
      return location.pathname === '/' && !location.hash;
    }
    return location.pathname.startsWith(path);
  };

  const isLanding = location.pathname === '/';

  return (
    <nav className={
      isLanding
        ? 'absolute top-0 left-0 w-full pt-5 pb-4 px-6 md:px-12 z-50'
        : 'sticky top-0 bg-[#050508]/80 backdrop-blur-xl pt-5 pb-4 px-6 md:px-12 z-50 w-full border-b border-white/[0.04]'
    }>
      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link className="flex items-center gap-2.5" to="/">
          <div className="w-10 h-10 rounded-2xl bg-black border border-white/10 flex items-center justify-center shadow-lg shadow-white/10">
            <img 
              src="/logo.png" 
              alt="Fundo Logo" 
              className="w-8 h-8 object-contain" 
            />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-purple-200">
            Fundo
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden lg:flex items-center gap-7">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`text-[13px] font-medium transition-colors relative pb-0.5 ${active ? 'text-white' : 'text-white/55 hover:text-white'
                  }`}
              >
                {link.name}
                {active && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#8155ff] to-[#6035f5] rounded-full" />
                )}
              </Link>
            );
          })}
        </div>

        {/* Desktop Auth */}
        <div className="hidden lg:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/join')} 
                className="flex items-center gap-1.5 bg-[#8155ff]/10 border border-[#8155ff]/20 text-[#a855f7] hover:bg-[#8155ff] hover:text-white px-4 py-1.5 rounded-full font-semibold text-[12px] transition-all cursor-pointer"
              >
                <QrCode size={13} /> Join with code
              </button>
              <Link to="/profile" className="flex items-center gap-2 bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1.5 rounded-full border border-white/[0.06] hover:border-purple-500/20 transition-all cursor-pointer">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-[#8155ff] text-white flex items-center justify-center font-bold text-[10px] overflow-hidden">
                  {user.avatar && !avatarError ? (
                    <img 
                      src={user.avatar} 
                      alt="Avatar" 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer" 
                      onError={() => setAvatarError(true)}
                    />
                  ) : (
                    user.name ? user.name.charAt(0).toUpperCase() : 'U'
                  )}
                </div>
                <span className="text-[13px] font-medium text-white/85">{user.name || user.email?.split('@')[0]}</span>
              </Link>
            </div>
          ) : (
            <>
              <Link to="/login" className="text-white/80 hover:text-white hover:bg-white/[0.04] border border-white/15 px-5 py-2 rounded-full font-medium transition-all text-[13px]">
                Log In
              </Link>
              <Link to="/register" className="bg-gradient-to-r from-[#8155ff] to-[#6e44e5] text-white px-5 py-2 rounded-full font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-purple-500/20 text-[13px]">
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="lg:hidden text-white/55 hover:text-white transition-colors border border-white/10 p-2 rounded-lg bg-white/[0.03]" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 w-full bg-[#0D0B1A]/97 backdrop-blur-2xl border-b border-white/[0.06] py-5 px-6 flex flex-col gap-3 shadow-2xl z-50">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`font-medium text-[14px] py-2 ${active ? 'text-white border-l-2 border-[#8155ff] pl-3' : 'text-white/70 hover:text-white'
                  }`}
              >
                {link.name}
              </Link>
            );
          })}

          <div className="h-px bg-white/[0.06] my-2" />

          {user ? (
            <div className="flex flex-col gap-2.5 mt-2">
              <button 
                onClick={() => { navigate('/join'); setIsOpen(false); }} 
                className="flex items-center justify-center gap-1.5 bg-[#8155ff]/10 border border-[#8155ff]/20 text-[#a855f7] hover:bg-[#8155ff] hover:text-white py-2.5 rounded-full font-semibold text-[13px] transition-all w-full cursor-pointer"
              >
                <QrCode size={14} /> Join with code
              </button>
              <Link to="/profile" onClick={() => setIsOpen(false)} className="text-left text-white/70 font-medium text-[14px] py-2.5 flex items-center gap-2 hover:text-white border-t border-white/[0.06] mt-1.5 pt-2.5">
                <User size={15} className="text-purple-400" /> Account Settings
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mt-1">
              <Link to="/login" onClick={() => setIsOpen(false)} className="text-white text-center border border-white/15 px-6 py-2.5 rounded-full font-medium transition-all text-[14px] hover:bg-white/[0.04]">
                Log In
              </Link>
              <Link to="/register" onClick={() => setIsOpen(false)} className="bg-gradient-to-r from-[#8155ff] to-[#6e44e5] text-white text-center px-6 py-2.5 rounded-full font-semibold shadow-lg shadow-purple-500/20 text-[14px]">
                Get Started
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
