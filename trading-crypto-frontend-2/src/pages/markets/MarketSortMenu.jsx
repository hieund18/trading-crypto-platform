// src/pages/markets/MarketSortMenu.jsx
import React, { useState } from "react";
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
  ListSubheader // <-- Thêm component này để làm tiêu đề section
} from "@mui/material";

// Icons
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import CheckIcon from '@mui/icons-material/Check';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered'; // <-- Icon cho số hàng

const COLOR_UP = "#16c784";
const COLOR_DOWN = "#ea3943";

const SORT_OPTIONS = [
  { label: "Vốn hóa giảm dần", value: "marketCap,desc", icon: <TrendingDownIcon fontSize="small" sx={{ color: COLOR_DOWN }} /> },
  { label: "Vốn hóa tăng dần", value: "marketCap,asc", icon: <TrendingUpIcon fontSize="small" sx={{ color: COLOR_UP }} /> },
  { label: "Giá giảm dần", value: "currentPrice,desc", icon: <TrendingDownIcon fontSize="small" sx={{ color: COLOR_DOWN }} /> },
  { label: "Giá tăng dần", value: "currentPrice,asc", icon: <TrendingUpIcon fontSize="small" sx={{ color: COLOR_UP }} /> },
];

const SIZE_OPTIONS = [30, 50, 100]; // <-- Các tùy chọn số hàng

// Thêm props: currentSize, onSizeChange
export default function MarketSortMenu({ currentSort, onSortChange, currentSize, onSizeChange }) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSelectSort = (val) => {
    onSortChange(val);
    handleClose();
  };

  const handleSelectSize = (size) => {
    onSizeChange(size);
    handleClose();
  };

  return (
    <Box>
      <Button
        variant={currentSort ? "contained" : "outlined"}
        onClick={handleClick}
        startIcon={<TuneRoundedIcon />}
        sx={{ 
          height: 40,
          textTransform: "none",
          fontWeight: 600,
          borderRadius: "8px",
          borderColor: "divider",
          boxShadow: "none",
          color: currentSort ? "white" : "text.primary",
          bgcolor: currentSort ? "primary.main" : "transparent",
          "&:hover": { 
            borderColor: "text.secondary", 
            bgcolor: currentSort ? "primary.dark" : "action.hover" 
          }
        }}
      >
        Tùy chỉnh
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 260, // Tăng chiều rộng xíu để chứa nội dung
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* === SECTION 1: SẮP XẾP === */}
        <ListSubheader sx={{ lineHeight: '32px', bgcolor: 'transparent', fontWeight: 700, fontSize: '0.9rem' }}>
          Sắp xếp theo
        </ListSubheader>

        {SORT_OPTIONS.map((option) => {
          const isSelected = currentSort === option.value;
          return (
            <MenuItem 
              key={option.value} 
              onClick={() => handleSelectSort(option.value)}
              selected={isSelected}
              sx={{ py: 1 }}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>{option.icon}</ListItemIcon>
              <ListItemText primaryTypographyProps={{ fontSize: "0.95rem", fontWeight: isSelected ? 600 : 500 }}>
                {option.label}
              </ListItemText>
              {isSelected && <CheckIcon fontSize="small" color="primary" sx={{ ml: 1 }} />}
            </MenuItem>
          );
        })}

        <Divider sx={{ my: 1 }} />

        {/* === SECTION 2: SỐ HÀNG HIỂN THỊ === */}
        <ListSubheader sx={{ lineHeight: '32px', bgcolor: 'transparent', fontWeight: 700, fontSize: '0.9rem' }}>
          Hiển thị (Hàng)
        </ListSubheader>

        <Box sx={{ display: 'flex', px: 2, pb: 1, gap: 1 }}>
          {SIZE_OPTIONS.map((size) => {
             const isActive = currentSize === size;
             return (
               <Button
                 key={size}
                 variant={isActive ? "contained" : "outlined"}
                 size="small"
                 onClick={() => handleSelectSize(size)}
                 sx={{ 
                    minWidth: 'auto', 
                    flex: 1, 
                    borderRadius: 2,
                    borderColor: 'divider',
                    color: isActive ? 'white' : 'text.primary',
                    bgcolor: isActive ? 'primary.main' : 'transparent',
                    "&:hover": {
                       bgcolor: isActive ? 'primary.dark' : 'action.hover',
                       borderColor: 'text.secondary'
                    }
                 }}
               >
                 {size}
               </Button>
             )
          })}
        </Box>

        {/* === SECTION 3: ĐẶT LẠI === */}
        {currentSort && (
          <Box>
            <Divider sx={{ my: 1 }} />
            <MenuItem 
              onClick={() => handleSelectSort(null)} 
              sx={{ color: "error.main", justifyContent: "center", gap: 1 }}
            >
              <RestartAltIcon fontSize="small" />
              <Typography fontWeight={600} fontSize="0.95rem">Đặt lại</Typography>
            </MenuItem>
          </Box>
        )}
      </Menu>
    </Box>
  );
}