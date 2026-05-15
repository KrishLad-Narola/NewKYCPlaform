import { createContext, useContext, useState } from "react";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser || storedUser === "undefined") {
        localStorage.removeItem("user");
        return null;
      }

      return JSON.parse(storedUser);
    } catch (error) {
      localStorage.removeItem("user");
      return null;
    }
  });

  // BUSINESS
  const [business, setBusiness] = useState(() => {
    try {
      const storedBusiness = localStorage.getItem("business");

      if (!storedBusiness || storedBusiness === "undefined") {
        localStorage.removeItem("business");
        return null;
      }

      return JSON.parse(storedBusiness);
    } catch (error) {
      localStorage.removeItem("business");
      return null;
    }
  });

  // LOGIN
  const login = (payload) => {
    setUser(payload.user);
    setBusiness(payload.business);

    localStorage.setItem("user", JSON.stringify(payload.user));
    localStorage.setItem("business", JSON.stringify(payload.business));
  };

  // LOGOUT
  const logout = () => {
    setUser(null);
    setBusiness(null);

    localStorage.removeItem("user");
    localStorage.removeItem("business");
  };

  return (
    <Ctx.Provider
      value={{
        user,
        business,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
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