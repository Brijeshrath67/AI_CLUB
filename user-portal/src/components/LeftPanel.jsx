import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function LeftPanel() {
  return (
    <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative h-screen bg-transparent z-10">

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col pointer-events-none">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 mb-12 pointer-events-auto hover:opacity-80 transition-opacity w-fit">
          <div className="w-10 h-10 rounded-xl bg-black border border-white/10 flex items-center justify-center shadow-lg shadow-white/10">
            <img src="/logo.png" alt="Fundo Logo" className="w-6 h-6 object-contain" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">Fundo</span>
        </Link>

        {/* Hero Text */}
        <div className="max-w-xl flex-1 flex flex-col justify-center pb-12">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-block px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-10 backdrop-blur-sm"
            >
              Finance. Simplified. Secured.
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl font-bold leading-tight mb-8 text-white"
            >
              Powering the Next Generation of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-purple-300">
                Financial Operations
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-gray-400 text-lg mb-16 max-w-md"
            >
              Manage your college event payments, track registrations, and get real-time insights with our all-in-one platform.
            </motion.p>
          </div>


        </div>
      </div>
    </div>
  );
}