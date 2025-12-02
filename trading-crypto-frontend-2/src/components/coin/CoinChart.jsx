// src/components/coin/CoinChart.jsx
import React, { useState, useEffect, useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import { 
  Box, Button, Stack, ToggleButton, ToggleButtonGroup, 
  CircularProgress, useTheme, alpha 
} from "@mui/material"; // Thêm alpha để xử lý màu nền
import { getMarketChartApi } from "../../api/coinApi";

// Icons
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CandlestickChartIcon from '@mui/icons-material/CandlestickChart';

// XÓA: CONST COLOR_UP, COLOR_DOWN (để lấy từ theme)
const COLOR_LINE = "#2962FF"; 

const LINE_RANGES = [
  { label: "1 Ngày", value: "1D", interval: "5m", duration: 24 * 60 * 60 * 1000 },
  { label: "7 Ngày", value: "7D", interval: "15m", duration: 7 * 24 * 60 * 60 * 1000 },
  { label: "1 Tháng", value: "1M", interval: "1h", duration: 30 * 24 * 60 * 60 * 1000 },
  { label: "1 Năm", value: "1Y", interval: "1d", duration: 365 * 24 * 60 * 60 * 1000 },
  { label: "Tất cả", value: "ALL", interval: "1w", duration: null },
];

const CANDLE_INTERVALS = [
  { label: "5 Phút", value: "5m", millis: 5 * 60 * 1000 },
  { label: "15 Phút", value: "15m", millis: 15 * 60 * 1000 },
  { label: "1 Giờ", value: "1h", millis: 60 * 60 * 1000 },
  { label: "1 Ngày", value: "1d", millis: 24 * 60 * 60 * 1000 },
  { label: "1 Tuần", value: "1w", millis: 7 * 24 * 60 * 60 * 1000 }
];

const DEFAULT_CANDLES_VISIBLE = 90;
const FETCH_LIMIT = 200; 
const CHART_HEIGHT = 450; 

export default function CoinChart({ coinId }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // 1. LẤY MÀU TỪ THEME
  const upColor = theme.palette.trade?.up || "#0de794";
  const downColor = theme.palette.trade?.down || "#e63c45";

  const [chartType, setChartType] = useState("line");
  const [lineRange, setLineRange] = useState("1D");
  const [candleInterval, setCandleInterval] = useState("15m"); 

  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!coinId) return;
    fetchData();
  }, [coinId, chartType, lineRange, candleInterval]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let interval = "1h";
      let startTime = null;
      let endTime = Date.now();
      let limit = 1000;

      if (chartType === "line") {
        const selected = LINE_RANGES.find(r => r.value === lineRange);
        interval = selected.interval;
        if (selected.duration) {
          startTime = endTime - selected.duration;
        }
      } else {
        interval = candleInterval;
        limit = FETCH_LIMIT; 
      }

      const res = await getMarketChartApi(coinId, { interval, startTime, endTime, limit });
      if (res.code === 1000) {
        processData(res.result);
      }
    } catch (error) {
      console.error("Chart error:", error);
    } finally {
      setLoading(false);
    }
  };

  const processData = (data) => {
    if (chartType === "line") {
      const lineData = data.map(item => [item.openTime, item.closePrice]);
      setSeries([{ name: "Price", data: lineData }]);
    } else {
      const candleData = data.map(item => ({
        x: new Date(item.openTime),
        y: [item.openPrice, item.highPrice, item.lowPrice, item.closePrice]
      }));
      setSeries([{ name: "OHLC", data: candleData }]);
    }
  };

  const xaxisOptions = useMemo(() => {
    const common = {
      type: 'datetime',
      tooltip: { enabled: false },
      axisBorder: { show: true, color: isDark ? '#2B2F36' : '#E6E8EA' }, 
      axisTicks: { show: true, color: isDark ? '#2B2F36' : '#E6E8EA' },
      labels: {
        show: true,
        // 2. QUAN TRỌNG: Chuyển về giờ Local (false = Local, true = UTC)
        datetimeUTC: false, 
        style: {
          colors: isDark ? '#848E9C' : '#5E6673',
          fontSize: '11px',
          fontFamily: 'Inter, sans-serif'
        },
        datetimeFormatter: {
          year: 'yyyy',
          month: "MMM 'yy",
          day: 'dd MMM',
          hour: 'HH:mm',
        }
      },
      tickAmount: 6, 
    };

    if (chartType === "line") return common;

    const selectedConfig = CANDLE_INTERVALS.find(c => c.value === candleInterval);
    const intervalMs = selectedConfig ? selectedConfig.millis : 0;
    const viewDuration = DEFAULT_CANDLES_VISIBLE * intervalMs;
    const now = Date.now();
    const minTime = now - viewDuration; 

    return { ...common, min: minTime, max: now, range: undefined };
  }, [chartType, candleInterval, series, isDark]);

  const options = {
    chart: {
      type: chartType === "line" ? "area" : "candlestick",
      height: CHART_HEIGHT,
      background: 'transparent',
      fontFamily: 'Inter, sans-serif',
      toolbar: { show: false }, 
      animations: { enabled: false },
      zoom: { enabled: true, type: 'x', autoScaleYaxis: true }
    },
    theme: { mode: isDark ? 'dark' : 'light' },
    grid: {
      show: true,
      borderColor: isDark ? '#2B2F36' : '#E6E8EA',
      strokeDashArray: 3,
      xaxis: { lines: { show: true } },   
      yaxis: { lines: { show: true } },
    },
    stroke: { curve: 'smooth', width: 2, colors: [COLOR_LINE] },
    xaxis: xaxisOptions,
    yaxis: {
      show: true, 
      tickAmount: 10,
      tooltip: { enabled: true },
      opposite: true, 
      labels: {
        align: 'left',
        style: { colors: isDark ? '#848E9C' : '#5E6673', fontSize: '11px', fontFamily: 'Inter, sans-serif' },
        formatter: (value) => {
           if(value < 1) return value.toFixed(6);
           if(value > 1000) return value.toLocaleString('en-US', { minimumFractionDigits: 2 });
           return value.toFixed(2);
        }
      }
    },
    tooltip: {
      enabled: true,
      theme: isDark ? 'dark' : 'light',
      style: { fontSize: '12px' },
      x: { show: true, format: 'dd MMM yyyy HH:mm' }, // Tooltip cũng sẽ theo giờ Local nhờ datetimeUTC: false
      y: { title: { formatter: () => '' } },
      marker: { show: false }
    },
    plotOptions: {
      candlestick: { 
        colors: { upward: upColor, downward: downColor }, 
        wick: { useFillColor: true } 
      },
      bar: {
        columnWidth: '50%'
      }
    },
    fill: {
       type: chartType === 'line' ? 'gradient' : 'solid',
       gradient: { shadeIntensity: 1, inverseColors: false, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 100], colorStops: [{ offset: 0, color: COLOR_LINE, opacity: 0.2 }, { offset: 100, color: COLOR_LINE, opacity: 0 }] }
    },
    dataLabels: { enabled: false },
  };

  return (
    <Box sx={{ width: '100%', p: 0, bgcolor: 'transparent', boxShadow: 'none' }}> 
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" mb={1} gap={2} alignItems="center">
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={(e, val) => { if(val) setChartType(val) }}
          size="small"
          sx={{ 
            height: 32,
            '& .MuiToggleButton-root': {
              border: 'none',
              borderRadius: '4px !important',
              px: 1.5,
              color: 'text.secondary',
              fontWeight: 500,
              '&.Mui-selected': {
                color: 'primary.main',
                bgcolor: 'action.hover',
                fontWeight: 600
              }
            }
          }}
        >
          <ToggleButton value="line"><ShowChartIcon fontSize="small" sx={{ mr: 0.5 }} /> Line</ToggleButton>
          <ToggleButton value="candle"><CandlestickChartIcon fontSize="small" sx={{ mr: 0.5 }} /> Candle</ToggleButton>
        </ToggleButtonGroup>

        <Stack direction="row" gap={0.5} flexWrap="wrap">
          {(chartType === "line" ? LINE_RANGES : CANDLE_INTERVALS).map((item) => {
            const isActive = (chartType === "line" ? lineRange : candleInterval) === item.value;
            return (
              <Button
                key={item.value}
                size="small"
                onClick={() => chartType === "line" ? setLineRange(item.value) : setCandleInterval(item.value)}
                sx={{ 
                    minWidth: 32, 
                    height: 28, 
                    fontSize: '12px',
                    fontWeight: isActive ? 700 : 500,
                    // 3. SỬA MÀU: Khi Active thì dùng màu Primary (Xanh)
                    color: isActive ? 'primary.main' : 'text.secondary',
                    // Nền màu xanh nhạt khi active
                    bgcolor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                    borderRadius: 1,
                    "&:hover": { 
                      color: 'primary.main', 
                      bgcolor: alpha(theme.palette.primary.main, 0.05) // Hover nhẹ hơn chút
                    }
                }}
              >
                {item.label}
              </Button>
            )
          })}
        </Stack>
      </Stack>

      <Box sx={{ height: CHART_HEIGHT, position: 'relative' }}> 
        {loading && (
            <Box sx={{ 
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                bgcolor: 'transparent',
                zIndex: 10,
            }}>
                <CircularProgress size={40} thickness={4} />
            </Box>
        )}
        
        <ReactApexChart 
            options={options} 
            series={series} 
            type={chartType === "line" ? "area" : "candlestick"} 
            height={CHART_HEIGHT}
            width="100%" 
        />
      </Box>
    </Box>
  );
}