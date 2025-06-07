import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  Heart, 
  Smile,
  Vote,
  Eye,
  EyeOff,
  Share2,
  Plus,
  X,
  ChevronRight,
  ChevronDown,
  User,
  UserCheck,
  UserPlus
} from 'lucide-react';
import { useWhiteboard } from '../contexts/WhiteboardContext';
import { useAuth } from '../contexts/AuthContext';

const CollaborationPanel: React.FC = () => {
  const { user } = useAuth();
  const { 
    state, 
    followingUser, 
    followUser, 
    addReaction, 
    createVote, 
    castVote,
    sendMessage
  } = useWhiteboard();
  
  const [showReactions, setShowReactions] = useState(false);
  const [showVoteCreator, setShowVoteCreator] = useState(false);
  const [showUserList, setShowUserList] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [voteQuestion, setVoteQuestion] = useState('');
  const [voteOptions, setVoteOptions] = useState(['', '']);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'collaborate' | 'chat'>('collaborate');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const reactions = [
    { emoji: '👍', label: 'Thumbs Up', icon: <ThumbsUp className="w-4 h-4" /> },
    { emoji: '❤️', label: 'Heart', icon: <Heart className="w-4 h-4" /> },
    { emoji: '😊', label: 'Smile', icon: <Smile className="w-4 h-4" /> },
    { emoji: '🎉', label: 'Celebrate', icon: '🎉' },
    { emoji: '💡', label: 'Idea', icon: '💡' },
    { emoji: '🔥', label: 'Fire', icon: '🔥' },
  ];

  useEffect(() => {
    if (showChat && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [state.messages, showChat]);

  const handleReaction = (emoji: string) => {
    if (!user) return;
    
    // Random position in the visible canvas area
    const x = Math.floor(Math.random() * 800) + 100;
    const y = Math.floor(Math.random() * 500) + 100;
    
    addReaction({
      userId: user.id,
      emoji,
      x,
      y
    });
    setShowReactions(false);
  };

  const handleCreateVote = () => {
    if (voteQuestion.trim() && voteOptions.every(opt => opt.trim())) {
      createVote(voteQuestion, voteOptions.filter(opt => opt.trim()));
      setVoteQuestion('');
      setVoteOptions(['', '']);
      setShowVoteCreator(false);
    }
  };

  const handleAddVoteOption = () => {
    if (voteOptions.length < 5) {
      setVoteOptions([...voteOptions, '']);
    }
  };

  const handleRemoveVoteOption = (index: number) => {
    if (voteOptions.length > 2) {
      const newOptions = [...voteOptions];
      newOptions.splice(index, 1);
      setVoteOptions(newOptions);
    }
  };

  const handleSendMessage = () => {
    if (message.trim() && user) {
      sendMessage({
        userId: user.id,
        userName: user.name,
        text: message,
        timestamp: new Date().toISOString()
      });
      setMessage('');
    }
  };

  const handleFollowToggle = () => {
    followUser(followingUser ? null : 'demo-user');
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40">
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden backdrop-blur-sm bg-opacity-90"
        style={{ width: showChat ? '320px' : '60px' }}
      >
        {/* Header */}
        <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
          <div className="flex items-center justify-between">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowChat(!showChat)}
              className={`p-2 rounded-xl transition-all duration-300 ${
                showChat
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
            </motion.button>
            
            {showChat && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <h2 className="text-sm font-semibold text-gray-800">Collaboration</h2>
                </div>
                
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setActiveTab('collaborate')}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      activeTab === 'collaborate' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'
                    }`}
                  >
                    Tools
                  </button>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`px-2 py-1 text-xs rounded-md transition-colors ${
                      activeTab === 'chat' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'
                    }`}
                  >
                    Chat
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {showChat ? (
            <motion.div
              key="chat-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {activeTab === 'collaborate' ? (
                <div className="p-3 space-y-3 max-h-[400px] overflow-y-auto">
                  {/* Online Users */}
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowUserList(!showUserList)}
                      className="flex items-center justify-between w-full p-2 hover:bg-gray-50 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">Online Users</span>
                      </div>
                      {showUserList ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    
                    {showUserList && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="overflow-hidden pl-10"
                      >
                        <div className="space-y-2 py-1">
                          <div className="flex items-center space-x-2 p-2 rounded-lg bg-green-50">
                            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                              <User className="w-3 h-3 text-green-600" />
                            </div>
                            <span className="text-sm text-gray-700">{user?.name}</span>
                            <span className="text-xs text-green-500 ml-auto">You</span>
                          </div>
                          <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-3 h-3 text-blue-600" />
                            </div>
                            <span className="text-sm text-gray-700">Team Member</span>
                            <button className="text-xs text-blue-500 ml-auto hover:text-blue-700">
                              {followingUser ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Follow Mode */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={handleFollowToggle}
                    className={`w-full p-3 rounded-lg transition-all flex items-center space-x-3 ${
                      followingUser 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {followingUser ? (
                      <EyeOff className="w-5 h-5 text-blue-500" />
                    ) : (
                      <Eye className="w-5 h-5 text-gray-500" />
                    )}
                    <span className="text-sm font-medium">
                      {followingUser ? 'Stop Following' : 'Follow Mode'}
                    </span>
                  </motion.button>

                  {/* Reactions */}
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setShowReactions(!showReactions)}
                      className="w-full p-3 rounded-lg bg-yellow-50 text-yellow-700 hover:bg-yellow-100 transition-all flex items-center space-x-3"
                    >
                      <Smile className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm font-medium">Send Reaction</span>
                    </motion.button>
                    
                    <AnimatePresence>
                      {showReactions && (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0, y: 20 }}
                          animate={{ scale: 1, opacity: 1, y: 0 }}
                          exit={{ scale: 0.8, opacity: 0, y: 20 }}
                          className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-3"
                        >
                          <h4 className="text-xs font-medium text-gray-500 mb-2">Quick Reactions</h4>
                          <div className="grid grid-cols-4 gap-2">
                            {reactions.map((reaction, index) => (
                              <motion.button
                                key={index}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => handleReaction(reaction.emoji)}
                                className="flex flex-col items-center p-2 hover:bg-gray-50 rounded transition-colors"
                                title={reaction.label}
                              >
                                <span className="text-xl">{reaction.emoji}</span>
                                <span className="text-xs text-gray-500 mt-1">{reaction.label}</span>
                              </motion.button>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Voting */}
                  <div className="relative">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setShowVoteCreator(!showVoteCreator)}
                      className="w-full p-3 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-all flex items-center space-x-3"
                    >
                      <Vote className="w-5 h-5 text-purple-500" />
                      <span className="text-sm font-medium">Create Poll</span>
                    </motion.button>
                    
                    <AnimatePresence>
                      {showVoteCreator && (
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0, y: 20 }}
                          animate={{ scale: 1, opacity: 1, y: 0 }}
                          exit={{ scale: 0.8, opacity: 0, y: 20 }}
                          className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-medium text-gray-900">Create Poll</h4>
                            <button
                              onClick={() => setShowVoteCreator(false)}
                              className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <input
                            type="text"
                            placeholder="Ask a question..."
                            value={voteQuestion}
                            onChange={(e) => setVoteQuestion(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg mb-3 text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          />
                          
                          <div className="space-y-2 mb-3">
                            {voteOptions.map((option, index) => (
                              <div key={index} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  placeholder={`Option ${index + 1}`}
                                  value={option}
                                  onChange={(e) => {
                                    const newOptions = [...voteOptions];
                                    newOptions[index] = e.target.value;
                                    setVoteOptions(newOptions);
                                  }}
                                  className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                {voteOptions.length > 2 && (
                                  <button
                                    onClick={() => handleRemoveVoteOption(index)}
                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          {voteOptions.length < 5 && (
                            <button
                              onClick={handleAddVoteOption}
                              className="flex items-center text-xs text-purple-600 hover:text-purple-800 mb-3 transition-colors"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add option
                            </button>
                          )}
                          
                          <div className="flex space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleCreateVote}
                              disabled={!voteQuestion.trim() || voteOptions.some(opt => !opt.trim())}
                              className={`flex-1 bg-purple-600 text-white py-2 px-3 rounded-lg text-sm transition-colors ${
                                !voteQuestion.trim() || voteOptions.some(opt => !opt.trim()) 
                                  ? 'opacity-50 cursor-not-allowed' 
                                  : 'hover:bg-purple-700'
                              }`}
                            >
                              Create Poll
                            </motion.button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Share */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full p-3 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-all flex items-center space-x-3"
                  >
                    <Share2 className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-medium">Share Whiteboard</span>
                  </motion.button>
                </div>
              ) : (
                <div className="flex flex-col h-[400px]">
                  <div className="flex-1 p-3 overflow-y-auto space-y-3">
                    {state.messages.length === 0 ? (
                      <div className="text-center py-10">
                        <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                        <p className="text-sm text-gray-500">No messages yet</p>
                        <p className="text-xs text-gray-400 mt-1">Start the conversation!</p>
                      </div>
                    ) : (
                      state.messages.map((msg) => (
                        <div key={msg.timestamp} className={`flex ${msg.userId === user?.id ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] p-3 rounded-lg ${
                            msg.userId === user?.id 
                              ? 'bg-blue-500 text-white rounded-br-none' 
                              : 'bg-gray-100 text-gray-800 rounded-bl-none'
                          }`}>
                            <div className="text-xs font-medium mb-1">
                              {msg.userId === user?.id ? 'You' : msg.userName}
                            </div>
                            <p className="text-sm">{msg.text}</p>
                            <div className={`text-xs mt-1 ${
                              msg.userId === user?.id ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {formatTime(msg.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  <div className="p-3 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1 p-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSendMessage}
                        disabled={!message.trim()}
                        className={`p-2 bg-blue-500 text-white rounded-lg ${
                          !message.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
                        }`}
                      >
                        <MessageSquare className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="collapsed-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="p-2 space-y-2"
            >
              <button
                onClick={() => setShowChat(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Open chat"
              >
                <MessageSquare className="w-5 h-5 text-gray-600" />
              </button>
              <button
                onClick={handleFollowToggle}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title={followingUser ? 'Stop following' : 'Follow mode'}
              >
                {followingUser ? (
                  <EyeOff className="w-5 h-5 text-blue-600" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-600" />
                )}
              </button>
              <button
                onClick={() => setShowReactions(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Send reaction"
              >
                <Smile className="w-5 h-5 text-yellow-500" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Reactions Display */}
        {state.reactions.map((reaction) => (
          <motion.div
            key={reaction.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
            transition={{ duration: 0.5 }}
            className="absolute pointer-events-none z-50"
            style={{
              left: reaction.x,
              top: reaction.y,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <motion.div 
              className="text-3xl"
              animate={{ y: [0, -20], opacity: [1, 0] }}
              transition={{ delay: 1, duration: 0.5, ease: "easeOut" }}
              onAnimationComplete={() => {}}
            >
              {reaction.emoji}
            </motion.div>
          </motion.div>
        ))}

        {/* Active Votes */}
        {state.votes.filter(vote => vote.isActive).map((vote) => (
          <motion.div
            key={vote.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute left-full ml-4 top-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 w-72 z-50"
          >
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-sm font-medium text-gray-900">{vote.question}</h4>
              <button
                onClick={() => {}}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="space-y-2">
              {vote.options.map((option) => {
                const totalVotes = vote.options.reduce((total, opt) => total + opt.votes.length, 0);
                const percentage = totalVotes > 0
                  ? (option.votes.length / totalVotes) * 100
                  : 0;
                const hasVoted = option.votes.some(v => v.userId === user?.id);
                
                return (
                  <motion.button
                    key={option.id}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => castVote(vote.id, option.id)}
                    className={`w-full text-left p-2 border rounded-lg transition-all ${
                      hasVoted
                        ? 'border-blue-300 bg-blue-50'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm">{option.text}</span>
                      <span className={`text-xs ${
                        hasVoted ? 'text-blue-600 font-medium' : 'text-gray-500'
                      }`}>
                        {option.votes.length} {option.votes.length === 1 ? 'vote' : 'votes'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          hasVoted ? 'bg-blue-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    {percentage > 0 && (
                      <div className="text-right mt-1">
                        <span className="text-xs text-gray-500">
                          {Math.round(percentage)}%
                        </span>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      {/* Expand button when collapsed */}
      {!showChat && (
        <motion.button
          whileHover={{ x: 5 }}
          onClick={() => setShowChat(true)}
          className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-8 bg-white p-1.5 rounded-full shadow-sm border border-gray-200 text-gray-500 hover:text-blue-500 transition-colors"
          title="Expand panel"
        >
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      )}
    </div>
  );
};

export default CollaborationPanel;