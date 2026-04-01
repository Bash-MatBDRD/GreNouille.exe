import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import React, { useState } from "react";
import { AnimatePresence } from "motion/react";
import Splashscreen from "./components/Splashscreen";
import LoadingScreen from "./components/LoadingScreen";
import LockScreen from "./components/LockScreen";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Spotify from "./pages/Spotify";
import SpotifyCallback from "./pages/SpotifyCallback";
import Discord from "./pages/Discord";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import Security from "./pages/Security";
import Database from "./pages/Database";
import SystemLogs from "./pages/SystemLogs";
import AI from "./pages/AI";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";
import { SpotifyProvider } from "./context/SpotifyContext";
import { useIsMobile } from "./hooks/useMediaQuery";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();
  const { isLocked, unlock, signOut, user } = useAuth();

  return (
    <div
      className="flex min-h-screen bg-[#05050f] text-white"
      style={{ backgroundImage: "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(79,110,247,0.12), transparent)" }}
    >
      <AnimatePresence>
        {isLocked && user && (
          <LockScreen onUnlock={unlock} onLogout={async () => { await signOut(); }} />
        )}
      </AnimatePresence>
      <Sidebar />
      <main className={`flex-1 overflow-y-auto custom-scrollbar ${isMobile ? "pb-20" : ""}`}>
        {children}
      </main>
    </div>
  );
}

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <Splashscreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/spotify/callback" element={<SpotifyCallback />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/spotify"
        element={
          <PrivateRoute>
            <AppLayout>
              <Spotify />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/discord"
        element={
          <PrivateRoute>
            <AppLayout>
              <Discord />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <PrivateRoute>
            <AppLayout>
              <Analytics />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <AppLayout>
              <Profile />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <PrivateRoute>
            <AppLayout>
              <Settings />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/security"
        element={
          <PrivateRoute>
            <AppLayout>
              <Security />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/database"
        element={
          <PrivateRoute>
            <AppLayout>
              <Database />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/logs"
        element={
          <PrivateRoute>
            <AppLayout>
              <SystemLogs />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/ai"
        element={
          <PrivateRoute>
            <AppLayout>
              <AI />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <AuthProvider>
          <SpotifyProvider>
            <AppContent />
          </SpotifyProvider>
        </AuthProvider>
      </Router>
    </LanguageProvider>
  );
}
