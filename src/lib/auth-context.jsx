import axiosInstance from "@/API/axiosInstance";
import { createContext, useContext, useState, useEffect } from "react";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper to get tokens
  const getTokens = () => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    return { accessToken, refreshToken };
  };

  // Fetch user data using the access token
  const fetchUserProfile = async (token) => {
    try {
      const response = await axiosInstance.get("/auth/me");
      if (response.status === 200) {
        const data = response.data;
        setUser(data.user);
        setBusiness(data.business);
      } else {
        logout();
      }
    } catch (error) {
      console.error("Failed to fetch user profile:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // On initial mount, check if tokens exist and fetch profile
  useEffect(() => {
    const { accessToken } = getTokens();
    if (accessToken) {
      fetchUserProfile(accessToken);
    } else {
      setLoading(false);
    }
  }, []);

  // LOGIN: Store only tokens, then fetch profile
  const login = async (payload) => {
    // payload should contain: { accessToken, refreshToken }
    localStorage.setItem("accessToken", payload.accessToken);
    localStorage.setItem("refreshToken", payload.refreshToken);

    // After setting tokens, fetch the actual user data
    await fetchUserProfile(payload.accessToken);
  };

  // LOGOUT: Clear tokens and state
  const logout = () => {
    setUser(null);
    setBusiness(null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  return (
    <Ctx.Provider
      value={{
        fetchUserProfile,
        user,
        business,
        login,
        logout,
        isAuthenticated: !!user,
        loading, // Useful for showing a splash screen while fetching profile
      }}
    >
      {!loading && children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(Ctx);
  if (!context) {
    throw new Error("AuthProvider missing");
  }
  return context;
};