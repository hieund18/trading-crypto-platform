// src/theme.js
import { createTheme } from "@mui/material/styles";

// Cấu hình chung cho cả 2 theme
const commonSettings = {
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: "Inter, sans-serif",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: 10,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
          },
        },
      },
    },
  },
};

// Hàm này sẽ trả về config dựa trên mode
export const getThemeConfig = (mode) => {
  if (mode === "dark") {
    return {
      ...commonSettings, // Dùng chung
      palette: {
        mode: "dark",
        background: {
          default: "#181A20",
          paper: "#0E0F14",
        },
        primary: { main: "#3b82f6" },
        text: {
          primary: "#EAECEF",
          secondary: "#A7B1C2",
        },
      },
      // Ghi đè component cho dark mode (nếu cần)
      components: {
        ...commonSettings.components, // Lấy chung
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundColor: "#0E0F14",
              border: "1px solid #2B2F36",
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              ...commonSettings.components.MuiTextField.styleOverrides.root,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#181A20", // Nền input dark
              },
            },
          },
        },
      },
    };
  }

  // Cấu hình cho Light Mode
  return {
    ...commonSettings, // Dùng chung
    palette: {
      mode: "light",
      background: {
        default: "#F4F7FA", // Màu nền sáng
        paper: "#FFFFFF", // Màu paper sáng
      },
      primary: { main: "#3b82f6" },
      text: {
        primary: "#181A20", // Text đen
        secondary: "#5A6A85", // Text xám
      },
    },
    // Ghi đè component cho light mode
    components: {
      ...commonSettings.components, // Lấy chung
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: "#FFFFFF",
            border: "1px solid #E0E0E0",
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            ...commonSettings.components.MuiTextField.styleOverrides.root,
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#FFFFFF", // Nền input trắng
            },
          },
        },
      },
    },
  };
};