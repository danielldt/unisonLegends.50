import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Login';
import { Register } from './components/Register';
import GamePage from './pages/GamePage';
import DebugPage from './pages/DebugPage';
import { authService } from './services/authService';
import MapPage from './pages/MapPage';
import DungeonListPage from './pages/DungeonListPage';
import JoinRoomPage from './pages/JoinRoomPage';
import HomePage from './pages/HomePage';
import SocialPage from './pages/SocialPage';
import { StoreProvider } from './utils/store';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// AuthenticatedRedirect - redirects to home if authenticated
const AuthenticatedRedirect = ({ children }: { children: React.ReactNode }) => {
  if (authService.isAuthenticated()) {
    return <Navigate to="/game" state={{ activeTab: 'home' }} replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <StoreProvider>
      <Router>
        <Routes>
          {/* Auth routes - redirect to home if already logged in */}
          <Route 
            path="/login" 
            element={
              <AuthenticatedRedirect>
                <Login />
              </AuthenticatedRedirect>
            } 
          />
          <Route 
            path="/register" 
            element={
              <AuthenticatedRedirect>
                <Register />
              </AuthenticatedRedirect>
            } 
          />
          
          {/* Protected routes */}
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/game" 
            element={
              <ProtectedRoute>
                <GamePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/map" 
            element={
              <ProtectedRoute>
                <MapPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dungeons/:type" 
            element={
              <ProtectedRoute>
                <DungeonListPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/join-room" 
            element={
              <ProtectedRoute>
                <JoinRoomPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/social" 
            element={
              <ProtectedRoute>
                <SocialPage />
              </ProtectedRoute>
            } 
          />
          
          {/* Character, Inventory, Spells pages now redirect via GamePage tabs */}
          <Route
            path="/character"
            element={
              <ProtectedRoute>
                <Navigate to="/game" state={{ activeTab: 'character' }} replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <Navigate to="/game" state={{ activeTab: 'inventory' }} replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/spells"
            element={
              <ProtectedRoute>
                <Navigate to="/game" state={{ activeTab: 'spells' }} replace />
              </ProtectedRoute>
            }
          />
          
          {/* Debug route not protected */}
          <Route 
            path="/debug" 
            element={<DebugPage />}
          />
          
          {/* Default routes */}
          <Route path="/" element={
            authService.isAuthenticated() 
              ? <Navigate to="/game" state={{ activeTab: 'home' }} replace /> 
              : <Navigate to="/login" replace />
          } />
        </Routes>
      </Router>
    </StoreProvider>
  );
}

export default App; 