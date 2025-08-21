import React, { useState, useEffect } from 'react';

import { useAuth } from '../contexts/AuthContext';
import { useWhiteboard } from '../contexts/WhiteboardContext';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../Assets/logo.png'; // Adjust the path as necessary

const Header: React.FC = () => {

  const { state } = useWhiteboard();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);


  useEffect(() => {
    // Count unique users from cursors and strokes
    const userSet = new Set<string>();
    
    state.cursors.forEach(cursor => userSet.add(cursor.userId));
    state.strokes.forEach(stroke => userSet.add(stroke.userId));
    

  }, [state.cursors, state.strokes]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);


  };



  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo/Branding */}
        <div className="flex items-center space-x-3">
          <img
            src={logo}
            alt="Logo"
            className="h-10 w-12 rounded-full"
          />

          <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
            Collaborative <span className="text-blue-600">Whiteboard</span>
          </h1>
        </div>

        {/* Online Users */}
     
        {/* Right Side Controls */}
        <div className="flex items-center space-x-3">
        

          {/* User Menu */}
          
        </div>
      </div>

      {/* Mobile menu backdrop */}
      <AnimatePresence>
        {(showUserMenu || showShareMenu) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-10 z-40"
            onClick={() => {
              setShowUserMenu(false);
              setShowShareMenu(false);
            }}
          />
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;