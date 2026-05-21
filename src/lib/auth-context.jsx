import axiosInstance from "@/API/axiosInstance";
import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import { useNavigate } from "react-router-dom";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [business, setBusiness] = useState(null);

  const [loading, setLoading] = useState(true);


  const navigate = useNavigate();

  const getTokens = () => {
    return {
      accessToken:
        localStorage.getItem("accessToken"),
      refreshToken:
        localStorage.getItem("refreshToken"),
    };
  };

  const logoutLocal = () => {
    setUser(null);

    setBusiness(null);

    localStorage.removeItem("accessToken");

    localStorage.removeItem("refreshToken");
  };

  const fetchUserProfile = async () => {
    try {
      const response = await axiosInstance.get(
        "/auth/me"
      );

      if (response.status === 200) {
        setUser(response.data.user);

        setBusiness(response.data.business);
      }
    } catch (error) {
      logoutLocal();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { accessToken } = getTokens();

    if (accessToken) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (payload) => {
    localStorage.setItem(
      "accessToken",
      payload.accessToken
    );

    localStorage.setItem(
      "refreshToken",
      payload.refreshToken
    );

    await fetchUserProfile();
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/auth/logout", {
        refreshToken:
          localStorage.getItem("refreshToken"),
      });
    } catch (error) {
      console.error(error);
    } finally {
      logoutLocal();

      navigate("/", { replace: true });
    }
  };

  

  return (
    <Ctx.Provider
      value={{
        user,
        business,
        loading,
        login,
        logout,
        fetchUserProfile,
        logoutLocal,
        isAuthenticated: !!user,
      }}
    >
      {!loading && children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(Ctx);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};