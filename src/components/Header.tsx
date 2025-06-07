import React, { useState, useEffect } from 'react';
import { LogOut, Users, Share2, Settings, User, HelpCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useWhiteboard } from '../contexts/WhiteboardContext';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { state } = useWhiteboard();
  const [onlineUsers, setOnlineUsers] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Count unique users from cursors and strokes
    const userSet = new Set<string>();
    
    state.cursors.forEach(cursor => userSet.add(cursor.userId));
    state.strokes.forEach(stroke => userSet.add(stroke.userId));
    
    setOnlineUsers(userSet.size);
  }, [state.cursors, state.strokes]);

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = () => {
    setShowUserMenu(false);
    logout();
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo/Branding */}
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <motion.div 
              className="w-3.5 h-3.5 bg-white rounded-sm"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            />
          </div>
          <h1 className="text-xl font-bold text-gray-900 hidden sm:block">
            Collaborative <span className="text-blue-600">Whiteboard</span>
          </h1>
        </div>

        {/* Online Users */}
        <div className="hidden md:flex items-center px-4 py-1.5 bg-blue-50 rounded-full text-sm font-medium text-blue-700">
          <Users size={16} className="mr-2" />
          <span>{onlineUsers} {onlineUsers === 1 ? 'user' : 'users'} online</span>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center space-x-3">
          {/* Share Button */}
          <div className="relative">
            <button 
              onClick={() => setShowShareMenu(!showShareMenu)}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
            >
              <Share2 size={16} className="text-gray-500 group-hover:text-gray-700" />
              <span className="hidden sm:inline">Share</span>
            </button>
            
            <AnimatePresence>
              {showShareMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                >
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      Invite others to collaborate
                    </div>
                    <button
                      onClick={handleShare}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Share2 size={14} className="mr-3" />
                      {copied ? 'Copied to clipboard!' : 'Copy link'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Menu */}
          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 group"
            >
              <div className="relative">
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-8 h-8 rounded-full bg-gray-200 border-2 border-transparent group-hover:border-blue-300 transition-colors"
                />
                {onlineUsers > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {onlineUsers}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden md:inline">
                {user?.name}
              </span>
            </button>
            
            <AnimatePresence>
              {showUserMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="py-1">
                    <div className="px-4 py-2 text-sm text-gray-700 border-b">
                      Signed in as <span className="font-medium">{user?.name}</span>
                    </div>
                    <a
                      href="#"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User size={14} className="mr-3" />
                      Your profile
                    </a>
                    <a
                      href="#"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Settings size={14} className="mr-3" />
                      Settings
                    </a>
                    <a
                      href="#"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <HelpCircle size={14} className="mr-3" />
                      Help
                    </a>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-t"
                    >
                      <LogOut size={14} className="mr-3" />
                      Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
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