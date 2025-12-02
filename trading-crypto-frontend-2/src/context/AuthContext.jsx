// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect
} from "react";

import { getToken, setToken, clearAuth } from "../api/tokenUtils";
import { getMyInfo } from "../api/authApi";
import { getMyProfileApi } from "../api/profileApi";

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // ============================================
  // 🔥 HÀM GỘP USER CHUẨN MICRO-SERVICE
  // ============================================
  const fetchAndMergeUser = async () => {
    try {
      // Gọi Identity + Profile song song
      const [identityRes, profileRes] = await Promise.all([
        getMyInfo(),
        getMyProfileApi()
      ]);

      if (identityRes.code !== 1000) {
        throw new Error("Cannot load identity info");
      }

      const identityUser = identityRes.result;
      const profileUser =
        profileRes.code === 1000 ? profileRes.result : null;

      // Gộp theo chuẩn:
      // identity ở ngoài, profile trong 1 field riêng
      const fullUser = {
        ...identityUser,
        profile: profileUser
      };

      setUser(fullUser);
      return fullUser;
    } catch (err) {
      console.error("Failed to fetch user → logout:", err);
      clearAuth();
      setUser(null);
      return null;
    }
  };

  // ============================================
  // 🔥 LOAD USER KHI F5 TRANG
  // ============================================
  useEffect(() => {
    const savedToken = getToken();

    if (!savedToken) {
      setLoading(false);
      return;
    }

    setAccessToken(savedToken);

    fetchAndMergeUser().finally(() => setLoading(false));
  }, []);

  // ============================================
  // 🔥 LOGIN (sau khi lấy được accessToken)
  // ============================================
  const login = async (accessToken) => {
    setToken(accessToken);
    setAccessToken(accessToken);

    return await fetchAndMergeUser();
  };

  // ============================================
  // 🔥 LOGOUT (client-side)
  // ============================================
  const logout = () => {
    setIsLoggingOut(true);

    if (user?.id) {
      sessionStorage.removeItem(`skip_pass_setup_${user.id}`);
    }

    clearAuth();
    setUser(null);
    setAccessToken(null);

    // Tắt trạng thái logout sau 1 tick
    setTimeout(() => setIsLoggingOut(false), 50);
  };

  // ============================================
  // PROVIDER
  // ============================================
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        isLoggingOut
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
