// src/context/ThemeContext.jsx
import React, { createContext, useContext, useState, useMemo, useEffect } from "react";
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { getThemeConfig } from "../theme"; // Import hàm vừa tạo

// 1. Tạo Context
const ThemeContext = createContext(null);

// 2. Tạo Provider
export function AppThemeProvider({ children }) {
  // Lấy mode từ localStorage hoặc mặc định là 'dark'
  const [mode, setMode] = useState(() => {
    try {
      const savedMode = localStorage.getItem("themeMode");
      return savedMode ? savedMode : "dark";
    } catch (e) {
      return "dark";
    }
  });

  // Lưu mode vào localStorage mỗi khi nó thay đổi
  useEffect(() => {
    localStorage.setItem("themeMode", mode);
  }, [mode]);

  // Hàm để thay đổi theme
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
  };

  // 3. Tạo theme của MUI động
  // useMemo giúp không phải tính toán lại theme mỗi lần render
  const theme = useMemo(() => createTheme(getThemeConfig(mode)), [mode]);

  // 4. Cung cấp MuiThemeProvider (đã có theme) và cả hàm toggleTheme
  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline /> {/* Bắt buộc để reset CSS */}
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

// 5. Tạo hook 'useThemeContext' để dễ dàng sử dụng
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useThemeContext phải được dùng bên trong AppThemeProvider");
  }
  return context;
};