import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const footerLinks = {
    Workspace: [
      { name: 'Events Portal', path: '/events' },
      { name: 'Transactions Ledger', path: '/transactions' },
      { name: 'Create Event', path: '/events/create' },
    ],
    Company: [
      { name: 'About Us', path: '/about' },
      { name: 'Contact Support', path: '/contact' },
      { name: 'Features', path: '/features' },
    ],
    Support: [
      { name: 'Help Center', path: '/contact' },
      { name: 'Terms of Service', path: '/terms' },
      { name: 'Refund Policy', path: '/refund-policy' },
    ],
  };

  return (
    <footer className="border-t border-white/[0.05] bg-[#0a0818] mt-auto">
      <div className="max-w-[1200px] mx-auto px-6 lg:px-12 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">

          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-[8px] bg-gradient-to-br from-[#8155ff] to-[#6035f5] flex items-center justify-center">
                <span className="font-bold text-[13px] text-white italic" style={{ fontFamily: 'serif' }}>F</span>
              </div>
              <span className="font-bold text-lg tracking-tight text-white">ML Hive Organiser</span>
            </Link>
            <p className="text-[13px] text-white/35 leading-relaxed mb-5 max-w-[220px]">
              The event management and payment system for college event organisers.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a href="https://www.instagram.com/rahil.ralu/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/35 hover:text-white/70 hover:border-white/[0.12] transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="m16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="https://x.com/ralu_rahil" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/35 hover:text-white/70 hover:border-white/[0.12] transition-all">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://www.linkedin.com/in/muhammed-rahil-nazar-ab9393316/" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/35 hover:text-white/70 hover:border-white/[0.12] transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
              <a href="https://github.com/Rahilralu" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/35 hover:text-white/70 hover:border-white/[0.12] transition-all">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-[13px] font-semibold text-white/70 mb-4 tracking-wide">{heading}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} className="text-[13px] text-white/35 hover:text-white/70 transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/[0.05] mt-12 pt-6 text-center">
          <p className="text-[12px] text-white/25 font-medium">© 2026 ML Hive. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
