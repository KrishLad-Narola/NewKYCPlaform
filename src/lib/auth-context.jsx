import axiosInstance from "@/API/axiosInstance";
import { createContext, useContext, useState, useEffect } from "react";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  const getTokens = () => {
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");
    return { accessToken, refreshToken };
  };

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

  useEffect(() => {
    const { accessToken } = getTokens();
    if (accessToken) {
      fetchUserProfile(accessToken);
    } else {
      setLoading(false);
    }
  }, []);

    const login = async (payload) => {
    localStorage.setItem("accessToken", payload.accessToken);
    localStorage.setItem("refreshToken", payload.refreshToken);

    await fetchUserProfile(payload.accessToken);
  };

const logout = async () => {
  try {
    const refreshToken =
      localStorage.getItem("refreshToken");

    await axiosInstance.post("/auth/logout", {
      refreshToken,
    });

  } catch (error) {
    console.error("Logout API error:", error);
  } finally {
    setUser(null);
    setBusiness(null);

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    window.location.href = "/";
  }
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
        loading, 
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