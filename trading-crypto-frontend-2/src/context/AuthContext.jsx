import React, { createContext, useContext, useState, useEffect } from "react";
import { getToken, setToken, clearAuth } from "../api/tokenUtils";
import { getMyInfo } from "../api/authApi";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // full user info từ my-info
  const [token, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true); // chờ load my-info sau reload

  // 🧩 Load token từ localStorage khi F5 trang
  useEffect(() => {
    const savedToken = getToken();
    if (!savedToken) {
      setLoading(false);
      return;
    }

    setAccessToken(savedToken);

    // 🔥 Gọi API my-info để lấy user
    getMyInfo()
      .then((res) => {
        if (res.code === 1000) {
          setUser(res.result);
        }
      })
      .catch(() => {
        clearAuth();
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // 🧩 Hàm login sau khi có token từ API login
  const login = async (accessToken) => {
    setToken(accessToken);
    setAccessToken(accessToken);

    try {
      const res = await getMyInfo();
      if (res.code === 1000) {
        setUser(res.result);
        return res.result;
      }
    } catch (e) {
      clearAuth();
      return null;
    }
  };

  const logout = () => {
    clearAuth();
    setUser(null);
    setAccessToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
