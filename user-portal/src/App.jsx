import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Landing from './pages/Landing';
import EventsList from './pages/EventsList';
import EventDetail from './pages/EventDetail';
import Register from './pages/Register';
import OTP from './pages/OTP';
import PrivateInvite from './pages/PrivateInvite';
import JoinWithCode from './pages/JoinWithCode';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './components/LoginPage';
import AuthCallback from './pages/AuthCallback';
import ProblemStatements from './pages/ProblemStatements';
import TeamRegistration from './pages/TeamRegistration';
import Confirmation from './pages/Confirmation';

import Contact from './pages/Contact';
import About from './pages/About';
import Features from './pages/Features';
import AllTransactions from './pages/AllTransactions';
import Terms from './pages/Terms';
import RefundPolicy from './pages/RefundPolicy';

// Wrapper for the existing LoginPage to integrate with React Router and AuthContext
function LoginRoute() {
  const { login, register } = useAuth();
  return <LoginPage onLogin={login} onRegister={register} />;
}

// Wrapper for layout that includes Navbar/Footer
function MainLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen font-sans bg-[#050508] text-white selection:bg-[#7c5cfc]/30">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}

// Helper component to scroll to top on page transition
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <ToastProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route path="/register" element={<Register />} />
            <Route path="/otp" element={<OTP />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            <Route path="/*" element={
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/refund-policy" element={<RefundPolicy />} />
                  <Route 
                    path="/events" 
                    element={
                      <ProtectedRoute>
                        <EventsList />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/events/:id" 
                    element={
                      <ProtectedRoute>
                        <EventDetail />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/events/invite/:token" 
                    element={
                      <ProtectedRoute>
                        <PrivateInvite />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/join" 
                    element={
                      <ProtectedRoute>
                        <JoinWithCode />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/transactions" 
                    element={
                      <ProtectedRoute>
                        <AllTransactions />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/hackathon/problems/:id" 
                    element={
                      <ProtectedRoute>
                        <ProblemStatements />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/hackathon/register/:id" 
                    element={
                      <ProtectedRoute>
                        <TeamRegistration />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/hackathon/confirmation/:teamId" 
                    element={
                      <ProtectedRoute>
                        <Confirmation />
                      </ProtectedRoute>
                    } 
                  />
                  <Route path="*" element={<Landing />} />
                </Routes>
              </MainLayout>
            } />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}

export default App;
