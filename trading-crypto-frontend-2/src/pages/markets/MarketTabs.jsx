// src/components/market/MarketTabs.jsx

import React from "react";
import { Tabs, Tab } from "@mui/material";

// Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

const COLOR_UP = "#16c784";
const COLOR_DOWN = "#ea3943";
const COLOR_TRENDING = "#f59e0b";

export default function MarketTabs({ tab, onChange }) {
  return (
    <Tabs
      value={tab}
      onChange={onChange}
      aria-label="market tabs"
      sx={{
        minHeight: 40,
        "& .MuiTabs-indicator": {
          height: 3,
          borderRadius: "3px 3px 0 0",
          backgroundColor: "primary.main",
        },
        "& .MuiTab-root": {
          minHeight: 40,
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.95rem",
          color: "text.secondary",
          mr: 1,
          "&.Mui-selected": {
            color: "text.primary",
          },
          "&:hover": {
            color: "text.primary",
            opacity: 0.8,
          }
        }
      }}
    >
      <Tab 
        icon={<FormatListBulletedIcon fontSize="small" />} 
        iconPosition="start" 
        label="Tất cả" 
      />
      
      <Tab 
        icon={<TrendingUpIcon fontSize="small" sx={{ color: COLOR_UP }} />} 
        iconPosition="start" 
        label="Top Tăng giá" 
      />
      
      <Tab 
        icon={<TrendingDownIcon fontSize="small" sx={{ color: COLOR_DOWN }} />} 
        iconPosition="start" 
        label="Top Giảm giá" 
      />
      
      <Tab 
        icon={<LocalFireDepartmentIcon fontSize="small" sx={{ color: COLOR_TRENDING }} />} 
        iconPosition="start" 
        label="Thịnh hành" 
      />
    </Tabs>
  );
}