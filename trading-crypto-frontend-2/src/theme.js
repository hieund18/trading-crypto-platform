// src/theme.js
import { createTheme } from "@mui/material/styles";

// 1. Cấu hình Component chung
const commonComponents = {
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: "none",
        fontWeight: 600,
        borderRadius: 8, // Bo góc vừa phải (8px) đẹp hơn 10px
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        fontWeight: 600,
        borderRadius: 6, // Chip vuông vắn hơn chút
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        "& .MuiOutlinedInput-root": {
          borderRadius: 8,
        },
      },
    },
  },
};

// 2. Hàm cấu hình Theme chính
export const getThemeConfig = (mode) => {
  const isDark = mode === "dark";

  // 🔥 MÀU SẮC MỚI (STYLE CRYPTO)
  const tradeColors = {
    up: "#16c784",   // Xanh Binance
    down: "#ea3943", // Đỏ Binance
  };

  // Định nghĩa màu trạng thái chuẩn
  const statusColors = {
    success: {
      main: "#16c784", // Dùng chung màu Trade Up
      light: "#4cd69d",
      dark: "#0f8b5c",
      contrastText: "#ffffff",
    },
    error: {
      main: "#ea3943", // Dùng chung màu Trade Down
      light: "#ee6068",
      dark: "#a3272f",
      contrastText: "#ffffff",
    },
    warning: {
      main: "#F59E0B", // Vàng hổ phách
      contrastText: "#ffffff",
    },
    info: {
      main: "#3b82f6", // Xanh dương
      contrastText: "#ffffff",
    },
  };

  const scrollbarColor = isDark ? "#5A6A85" : "#A7B1C2"; 
  const scrollbarHover = isDark ? "#474D57" : "#9CA3AF";

  const palette = {
    mode,
    ...statusColors, // 🔥 Áp dụng màu mới vào đây
    ...(isDark
      ? {
          // DARK MODE
          background: {
            default: "#181A20",
            paper: "#181A20",
            popup: "#1e2328ff",
          },
          //primary: { main: "#FCD535", contrastText: "#181A20" }, // 🔥 Đổi Primary sang Vàng Binance (nếu thích) hoặc giữ xanh #3b82f6
          primary: { main: "#3b82f6" }, // Giữ màu xanh cũ nếu bạn thích
          trade: tradeColors,
          text: {
            primary: "#EAECEF",
            secondary: "#848E9C", // Màu text phụ chuẩn hơn
          },
        }
      : {
          // LIGHT MODE
          background: {
            default: "#F4F7FA",
            paper: "#FFFFFF",
            popup: "#FFFFFF",
          },
          primary: { main: "#3b82f6" },
          trade: tradeColors,
          text: {
            primary: "#181A20",
            secondary: "#5E6673",
          },
        }),
  };

  return {
    palette,
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: "'Inter', 'Roboto', sans-serif", // Thêm font Inter nếu có
    },
    components: {
      ...commonComponents,
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? "#0E0F14" : "#FFFFFF",
            backgroundImage: "none", // Tắt hiệu ứng overlay của MUI khi dark mode
            border: isDark ? "1px solid #2B2F36" : "1px solid #E6E8EA",
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: isDark ? "#2B2F36" : "#E6E8EA",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: palette.primary.main, 
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: palette.primary.main,
              borderWidth: "1px",
            },
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          html: { scrollbarWidth: "thin", scrollbarColor: `${scrollbarColor} transparent` },
          body: {
            "&::-webkit-scrollbar": { width: "10px", height: "6px" }, // Thanh cuộn mảnh hơn (6px)
            "&::-webkit-scrollbar-track": { background: "transparent" },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: scrollbarColor,
              borderRadius: "3px",
            },
            "&::-webkit-scrollbar-thumb:hover": { backgroundColor: scrollbarHover },
          },
        },
      },

      MuiMenu: {
        styleOverrides: {
          // 1. Cấu hình cho phần khung (Paper) của Menu
          paper: {
            backgroundColor: palette.background.popup, // ✅ Tự động lấy màu popup
            backgroundImage: "none",
            border: isDark ? "1px solid #2B2F36" : "1px solid #E6E8EA",
            borderRadius: 12, // Bo góc mềm mại hơn
            marginTop: 8,     // Tạo khoảng cách nhỏ với nút bấm
            boxShadow: isDark 
              ? "0px 4px 20px rgba(0,0,0,0.5)" // Bóng đổ đẹp cho Dark mode
              : "0px 4px 20px rgba(0,0,0,0.1)",
          },
          // 2. Cấu hình cho danh sách bên trong
          // list: {
          //   padding: "6px", // Padding bao quanh các item
          // },
        },
      },

      
    },
  };
};