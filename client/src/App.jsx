import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ItemsProvider } from './context/ItemsContext';
import { Navbar } from './components/Navbar';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { SubmitItem } from './pages/SubmitItem';
import { ModeratorDashboard } from './pages/ModeratorDashboard';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ItemsProvider>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route 
                  path="/submit" 
                  element={
                    <ProtectedRoute>
                      <SubmitItem />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/moderator" 
                  element={
                    <ProtectedRoute role="moderator">
                      <ModeratorDashboard />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
            <Toaster
              position="top-center"
              containerStyle={{ top: '50%', transform: 'translateY(-50%)' }}
              toastOptions={{
                duration: 2000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
          </div>
        </ItemsProvider>
      </AuthProvider>
    </Router>
  );
}