// src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
// import { ThemeProvider, CssBaseline } from "@mui/material"; // <-- XÓA 2 DÒNG NÀY
import { BrowserRouter } from "react-router-dom";
// import { binanceTheme } from "./theme"; // <-- XÓA DÒNG NÀY

import AppRouter from "./routes/AppRouter";
import { AuthProvider } from "./context/AuthContext";
import { SnackbarProvider } from "notistack";
import { AppThemeProvider } from "./context/ThemeContext"; // <-- IMPORT MỚI
import "./styles/toast.css";

//import "./theme";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <ThemeProvider theme={binanceTheme}> // <-- XÓA DÒNG NÀY
  //   <CssBaseline /> // <-- XÓA DÒNG NÀY
      <BrowserRouter>
        <AppThemeProvider> {/* <-- THÊM CÁI NÀY BỌC BÊN NGOÀI */}
          <AuthProvider>
            <SnackbarProvider
              maxSnack={3}
              autoHideDuration={3000}
              anchorOrigin={{ vertical: "top", horizontal: "right" }}
              classes={{
                containerAnchorOriginTopRight: "binance-toast-container",
              }}
            >
              <AppRouter />
            </SnackbarProvider>
          </AuthProvider>
        </AppThemeProvider> {/* <-- ĐÓNG NÓ LẠI */}
      </BrowserRouter>
  // </ThemeProvider> // <-- XÓA DÒNG NÀY
);