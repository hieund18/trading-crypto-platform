// src/components/admin/DashboardChart.jsx
import React, { useEffect, useState } from "react";
import { Box, Typography, ToggleButton, ToggleButtonGroup, CircularProgress, useTheme } from "@mui/material";
import ReactApexChart from "react-apexcharts";
import { formatPrice, formatCompactCurrency } from "../../utils/formatters";
import { getVolumeChartApi } from "../../api/orderApi";

export default function DashboardChart() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  const [timeRange, setTimeRange] = useState("1D");
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState([]);

  // --- 1. LOGIC TÍNH TOÁN THỜI GIAN (UTC -> ISO) ---
  const formatDateParam = (date) => {
      // Trả về YYYY-MM-DD
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  };

  const getChartParams = (range) => {
      const toDate = new Date();
      let fromDate = new Date();
      let timeType = "DAY";

      switch (range) {
          case "1D": // 1 Ngày (24h)
              timeType = "HOUR";
              // Lấy từ 24h trước đến hiện tại
              fromDate.setTime(toDate.getTime() - 24 * 60 * 60 * 1000);
              break;
          case "1W": // 7 Ngày
              timeType = "DAY";
              fromDate.setDate(toDate.getDate() - 6);
              break;
          case "1M": // 30 Ngày
              timeType = "DAY";
              fromDate.setDate(toDate.getDate() - 29);
              break;
          case "1Y": // 1 Năm
              timeType = "MONTH";
              fromDate.setMonth(toDate.getMonth() - 11);
              break;
          default: break;
      }
      return {
          timeType,
          from: fromDate.toISOString(), // Gửi UTC (Instant)
          to: toDate.toISOString()      // Gửi UTC (Instant)
      };
  };

  // --- 2. HÀM PARSE UTC -> LOCAL CHO HIỂN THỊ ---
  const parseDataToLocal = (item, timeType) => {
      // item.period: "2025-12-02 00:00" hoặc "2025-11-01"
      let dateStr = item.period.replace(" ", "T");
      if (dateStr.length <= 10) dateStr += "T00:00:00";
      if (!dateStr.endsWith("Z")) dateStr += "Z"; // Ép kiểu UTC

      const d = new Date(dateStr);
      
      // Tạo label cho trục X (Ngắn gọn)
      let xLabel = "";
      // Tạo label cho Tooltip (Đầy đủ)
      let tooltipTitle = "";

      if (timeType === "HOUR") {
          // Trục X: 07:00
          // Tooltip: 02/12/2025 07:00
          const h = String(d.getHours()).padStart(2, '0');
          const m = String(d.getMinutes()).padStart(2, '0');
          xLabel = `${h}:${m}`;
          tooltipTitle = `${d.getDate()}/${d.getMonth()+1} ${h}:${m}`;
      } else if (timeType === "MONTH") {
          // Trục X: T12
          // Tooltip: Tháng 12/2025
          xLabel = `T${d.getMonth() + 1}`;
          tooltipTitle = `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
      } else {
          // DAY
          // Trục X: 02/12
          // Tooltip: 02/12/2025
          const day = String(d.getDate()).padStart(2, '0');
          const month = String(d.getMonth() + 1).padStart(2, '0');
          xLabel = `${day}/${month}`;
          tooltipTitle = `${day}/${month}/${d.getFullYear()}`;
      }

      return {
          x: xLabel,
          y: item.totalVolume,
          tooltipTitle: tooltipTitle,
          transactionCount: item.transactionCount // Lưu lại để hiện tooltip
      };
  };

  // --- 3. FETCH DATA ---
  useEffect(() => {
      const fetchData = async () => {
          setLoading(true);
          try {
              const params = getChartParams(timeRange);
              const res = await getVolumeChartApi(params);
              if (res.code === 1000) {
                  const processedData = (res.result || []).map(item => 
                      parseDataToLocal(item, params.timeType)
                  );
                  setChartData(processedData);
              }
          } catch (error) {
              console.error(error);
          } finally {
              setLoading(false);
          }
      };
      fetchData();
  }, [timeRange]);

  // --- 4. CẤU HÌNH CHART ---
  const chartOptions = {
    chart: { 
        type: 'area', 
        toolbar: { show: false }, 
        background: 'transparent',
        fontFamily: 'inherit'
    },
    colors: [theme.palette.primary.main],
    stroke: { curve: 'smooth', width: 2 },
    dataLabels: { enabled: false },
    grid: { 
        show: true, 
        borderColor: theme.palette.divider,
        strokeDashArray: 4,
        xaxis: { lines: { show: false } }   
    },
    xaxis: { 
        categories: chartData.map(d => d.x),
        axisBorder: { show: false },
        axisTicks: { show: false },
        labels: { 
            style: { colors: theme.palette.text.secondary, fontSize: '11px' },
            rotate: 0 
        },
        // 🔥 GIẢM SỐ LƯỢNG NHÃN TRÊN TRỤC X
        tickAmount: 6, 
    },
    yaxis: { 
        show: true,
        labels: { 
            style: { colors: theme.palette.text.secondary },
            formatter: (val) => formatCompactCurrency(val)
        }
    },
    fill: { 
        type: 'gradient', 
        gradient: { 
            shadeIntensity: 1, 
            opacityFrom: 0.4, 
            opacityTo: 0.05, 
            stops: [0, 100] 
        } 
    },
    // 🔥 CẤU HÌNH TOOLTIP HIỆN ĐẦY ĐỦ
    tooltip: { 
        theme: isDark ? 'dark' : 'light',
        x: {
            show: false // Tắt mặc định để dùng custom hoặc formatter
        },
        y: { 
            formatter: (val) => formatPrice(val) 
        },
        // Custom Tooltip để hiện thêm Transaction Count & Full Date
        custom: function({series, seriesIndex, dataPointIndex, w}) {
            const data = chartData[dataPointIndex];
            if (!data) return "";
            
            const color = w.globals.colors[seriesIndex];
            return `
                <div style="padding: 10px; background: ${isDark ? '#1C2024' : '#fff'}; border: 1px solid ${isDark ? '#2B2F36' : '#eee'}; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
                    <div style="font-size: 11px; color: ${isDark ? '#848E9C' : '#5E6673'}; margin-bottom: 4px;">
                        ${data.tooltipTitle}
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                        <span style="width: 8px; height: 8px; border-radius: 50%; background: ${color}; display: inline-block;"></span>
                        <span style="font-weight: 600; font-size: 13px; color: ${isDark ? '#fff' : '#000'}">
                            ${formatPrice(data.y)}
                        </span>
                    </div>
                    <div style="font-size: 11px; color: ${isDark ? '#EAECEF' : '#181A20'}; margin-left: 16px;">
                        Số giao dịch: <b>${data.transactionCount}</b>
                    </div>
                </div>
            `;
        }
    }
  };

  return (
    <Box sx={{ p: 3, borderRadius: 3, height: '100%', bgcolor: "background.default", border: "1px solid", borderColor: "divider" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={2}>
            <Typography variant="h6" fontWeight={700}>Phân tích Volume</Typography>
            
            <ToggleButtonGroup
                value={timeRange}
                exclusive
                onChange={(e, val) => val && setTimeRange(val)}
                size="small"
                sx={{ 
                    '& .MuiToggleButton-root': { 
                        textTransform: 'none', fontWeight: 600, px: 2, 
                        border: '1px solid', borderColor: 'divider',
                        color: 'text.secondary',
                        '&.Mui-selected': { bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }
                    } 
                }}
            >
                <ToggleButton value="1D">1 Ngày</ToggleButton>
                <ToggleButton value="1W">1 Tuần</ToggleButton>
                <ToggleButton value="1M">1 Tháng</ToggleButton>
                <ToggleButton value="1Y">1 Năm</ToggleButton>
            </ToggleButtonGroup>
        </Box>

        <Box height={350} position="relative">
            {loading && (
                <Box position="absolute" top={0} left={0} right={0} bottom={0} display="flex" alignItems="center" justifyContent="center" zIndex={1} bgcolor={isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.5)"}>
                    <CircularProgress />
                </Box>
            )}
            <ReactApexChart 
                options={chartOptions} 
                series={[{ name: 'Volume', data: chartData.map(d => d.y) }]} 
                type="area" 
                height="100%" 
            />
        </Box>
    </Box>
  );
}