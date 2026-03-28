import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { supabase } from "../lib/supabase";
import type { Session } from "@supabase/supabase-js";

type User = {
  id: number;
  username: string;
  email: string;
  hasSpotify: boolean;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  session: Session | null;
  setUser: (user: User | null) => void;
  checkAuth: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getAuthHeaders(session: Session | null) {
  if (!session?.access_token) return {};
  return { Authorization: `Bearer ${session.access_token}` };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (currentSession: Session | null) => {
    if (!currentSession?.access_token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get("/api/auth/me", {
        headers: getAuthHeaders(currentSession),
      });
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const checkAuth = async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    setSession(currentSession);
    await fetchProfile(currentSession);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      fetchProfile(currentSession);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
      fetchProfile(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.access_token) return;
    const interceptor = axios.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${session.access_token}`;
      return config;
    });
    return () => axios.interceptors.request.eject(interceptor);
  }, [session?.access_token]);

  return (
    <AuthContext.Provider value={{ user, loading, session, setUser, checkAuth, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
