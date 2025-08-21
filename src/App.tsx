import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { WhiteboardProvider } from './contexts/WhiteboardContext';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import EnhancedToolbar from './components/EnhancedToolbar';
import EnhancedWhiteboardCanvas from './components/EnhancedWhiteboardCanvas';
import AIAssistPanel from './components/AIAssistPanel';
import VoiceControlPanel from './components/VoiceControlPanel';
import CollaborationPanel from './components/CollaborationPanel';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css'; // or whatever your CSS file is named

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <WhiteboardProvider>
      <div className="h-screen flex flex-col bg-gray-50 relative">
        <Header />
        <EnhancedToolbar />
        <EnhancedWhiteboardCanvas />
        
        {/* Floating Panels */}
        <AIAssistPanel />

        <VoiceControlPanel className="voice-control-panel" />
      </div>
    </WhiteboardProvider>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;