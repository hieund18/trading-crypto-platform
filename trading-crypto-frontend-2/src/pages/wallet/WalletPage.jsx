// src/pages/wallet/WalletPage.jsx
import React, { useEffect, useState } from "react";
import {
  Box, Typography, Paper, Button, Container, Stack, IconButton,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, CircularProgress, alpha, useTheme, useMediaQuery, Tooltip
} from "@mui/material";
import { useNavigate } from "react-router-dom";

// Icons
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import HistoryIcon from '@mui/icons-material/History';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ContentCopyIcon from '@mui/icons-material/ContentCopy'; 
import RefreshIcon from '@mui/icons-material/Refresh';        

import MainLayout from "../../components/layout/MainLayout";
import WithdrawDialog from "../../components/wallet/WithdrawDialog";
import TransferDialog from "../../components/wallet/TransferDialog";
import DepositDialog from "../../components/wallet/DepositDialog";

import { getMyWalletApi, getMyWalletTransactionApi } from "../../api/walletApi";
import { formatPrice } from "../../utils/formatters";
import { useToast } from "../../utils/toast";

// --- CONSTANTS ---
const COLOR_UP = "#16c784";
const COLOR_DOWN = "#ea3943";
const TEXT_HEAD_COLOR = "#848e9c"; 
const COMMON_WEIGHT = 500;         
const ROW_FONT_SIZE = "0.95rem";   

const formatDate = (dateString) => {
    if(!dateString) return "--";
    return new Date(dateString).toLocaleString('vi-VN', {
        year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit'
    });
}

const getTransactionConfig = (type) => {
    const key = type.split(" ")[0]; 
    switch (key) {
        case "DEPOSIT":
        case "TRANSFER_IN":
        case "TRADE_SELL": 
        case "REFUND":
            return { label: "Nhận tiền", color: COLOR_UP, sign: "+", chipColor: "success" };
        case "WITHDRAW":
        case "TRANSFER_OUT":
        case "TRADE_BUY": 
            return { label: "Chi tiền", color: COLOR_DOWN, sign: "-", chipColor: "error" };
        default:
            return { label: "Khác", color: "text.primary", sign: "", chipColor: "default" };
    }
};

export default function WalletPage() {
  const nav = useNavigate();
  const { toastInfo, toastSuccess } = useToast();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [balance, setBalance] = useState(0);
  const [walletId, setWalletId] = useState(""); 
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [openDeposit, setOpenDeposit] = useState(false);
  
  // 🔥 SỬA LOGIC XOAY: Dùng góc quay tích lũy để luôn quay tới
  const [rotation, setRotation] = useState(0); 

  const [openWithdraw, setOpenWithdraw] = useState(false);
  const [openTransfer, setOpenTransfer] = useState(false);

  const fetchWalletData = async () => {
    try {
        const [balanceRes, historyRes] = await Promise.all([
            getMyWalletApi(),
            getMyWalletTransactionApi({ page: 1, size: 10 }) 
        ]);
        
        if (balanceRes.code === 1000) {
            setBalance(balanceRes.result.balance);
            setWalletId(balanceRes.result.id); 
        }
        if (historyRes.code === 1000) {
            setTransactions(historyRes.result.content);
        }
    } catch (error) {
        console.error("Error loading wallet", error);
    }
  };

  useEffect(() => {
    const init = async () => {
        setLoading(true);
        await fetchWalletData();
        setLoading(false);
    }
    init();
  }, []);

  // 🔥 SỬA: Mỗi lần bấm cộng thêm 360 độ -> Luôn quay tiếp chứ không quay ngược
  const handleReload = async () => {
      setRotation(prev => prev + 360); 
      await fetchWalletData();
  };

  const handleCopyId = () => {
      if(walletId) {
          navigator.clipboard.writeText(walletId);
          toastSuccess("Đã sao chép Wallet ID!");
      }
  };

  const handleAction = (action) => {
      if (action === "Nạp tiền") {
          setOpenDeposit(true); // Mở modal
      } else {
          toastInfo(`Tính năng ${action} đang phát triển!`);
      }
  };

  // --- STYLE CHUNG ---
  const headerSx = { color: TEXT_HEAD_COLOR, fontWeight: 600, fontSize: 13 };
  const cellSx = { fontWeight: COMMON_WEIGHT, fontSize: ROW_FONT_SIZE };

  // 🔥 SỬA STYLE CHIP: Font to hơn (0.95rem), chiều cao lớn hơn
  const renderTypeCell = (typeString) => {
    const parts = typeString.split(" ");
    const rawType = parts[0]; 
    const coinName = parts.slice(1).join(" "); 
    
    let displayLabel = rawType;
    if(rawType === "TRADE_BUY") displayLabel = "Mua";
    else if(rawType === "TRADE_SELL") displayLabel = "Bán";
    else if(rawType === "DEPOSIT") displayLabel = "Nạp";
    else if(rawType === "WITHDRAW") displayLabel = "Rút";
    else if(rawType === "TRANSFER_IN") displayLabel = "Nhận";
    else if(rawType === "TRANSFER_OUT") displayLabel = "Chuyển";
    else if(rawType === "REFUND") displayLabel = "Hoàn";

    const config = getTransactionConfig(rawType);

    return (
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Chip 
            label={displayLabel} 
            size="small" 
            sx={{ 
                height: 28, // 🔥 Tăng chiều cao để chứa font to
                fontWeight: 500, // 🔥 Font weight bằng các chữ khác
                fontSize: ROW_FONT_SIZE, // 🔥 Font size 0.95rem bằng các chữ khác
                borderRadius: 1.5,
                bgcolor: alpha(config.color, 0.1), 
                color: config.color,
                minWidth: 60,
                // Canh giữa chữ trong chip
                "& .MuiChip-label": { px: 1, paddingBottom: "2px" } 
            }} 
        />
        {coinName && (
            <Typography sx={cellSx} color="text.primary">
                {coinName}
            </Typography>
        )}
      </Stack>
    );
  };
  
  const cardStyle = {
    p: 3, borderRadius: 3, 
    bgcolor: "background.default",
    border: "1px solid", borderColor: "divider",
  };

  const actionButtonStyle = {
      variant: "contained",
      sx: {
          color: "text.primary",      
          bgcolor: "action.hover",    
          boxShadow: "none",          
          textTransform: "none",      
          fontWeight: 600,
          borderRadius: 1,            
          px: 2,
          py: 0.8,
          minWidth: 'auto',
          border: '1px solid transparent', 
          "&:hover": {
              bgcolor: "action.selected", 
              boxShadow: "none",
              borderColor: "divider"
          }
      }
  };

  return (
    <MainLayout maxWidth={1300}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        
        {/* === PHẦN 1: TỔNG QUAN VÍ === */}
        <Paper elevation={0} sx={{ ...cardStyle, mb: 4 }}>
            <Box 
                display="flex" 
                flexDirection={isMobile ? "column" : "row"} 
                justifyContent="space-between" 
                alignItems={isMobile ? "flex-start" : "flex-start"}
                gap={3}
            >
                {/* CỘT TRÁI: THÔNG TIN VÍ */}
                <Box>
                    {/* 🔥 SỬA VỊ TRÍ: Đưa Wallet ID lên trên số tiền */}
                    <Stack 
                        direction="row" 
                        alignItems="center" 
                        gap={1} 
                        sx={{ 
                            bgcolor: "action.hover", 
                            py: 0.5, px: 1.5, mb: 1.5, // Thêm margin bottom
                            borderRadius: 2,
                            width: "fit-content",
                            border: "1px solid",
                            borderColor: "divider"
                        }}
                    >
                        <Typography variant="caption" color="text.secondary" fontWeight={600}>ID:</Typography>
                        <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ fontFamily: 'monospace' }}>
                             {walletId || "---"}
                        </Typography>
                        <IconButton size="small" onClick={handleCopyId} sx={{ ml: -0.5, p: 0.5 }}>
                             <ContentCopyIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                    </Stack>

                    {/* Dòng 1: Header + Reload */}
                    <Stack direction="row" alignItems="center" gap={1} mb={1}>
                        <Typography variant="h6" fontWeight={700}>Số dư Ví</Typography>
                        
                        <IconButton onClick={() => setShowBalance(!showBalance)} size="small" sx={{ color: "text.secondary" }}>
                            {showBalance ? <VisibilityIcon fontSize="small"/> : <VisibilityOffIcon fontSize="small"/>}
                        </IconButton>

                        <Tooltip>
                            <IconButton 
                                onClick={handleReload} 
                                size="small" 
                                sx={{ 
                                    color: "text.secondary",
                                    transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)", // Hiệu ứng mượt
                                    transform: `rotate(${rotation}deg)` // Xoay theo giá trị tích lũy
                                }}
                            >
                                <RefreshIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>

                    {/* Dòng 3: Số dư (Nằm dưới ID) */}
                    <Stack direction="row" alignItems="baseline" gap={1}>
                        <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: -1 }}>
                            {showBalance ? formatPrice(balance).replace("$", "") : "******"} 
                        </Typography>
                        <Typography variant="h6" color="text.secondary" fontWeight={500}>USD</Typography>
                    </Stack>
                    
                    <Typography variant="caption" color="text.secondary" mt={0.5} display="block" fontWeight={500}>
                       ≈ {showBalance ? (balance * 25450).toLocaleString('vi-VN') : "******"} VND
                    </Typography>
                </Box>

                {/* CỘT PHẢI: CÁC NÚT CHỨC NĂNG */}
                <Stack direction="row" spacing={1.5} flexWrap="wrap">
                    <Button 
                        {...actionButtonStyle}
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={() => handleAction("Nạp tiền")}
                    >
                        Nạp
                    </Button>

                    <Button 
                        {...actionButtonStyle}
                        startIcon={<RemoveCircleOutlineIcon />} 
                        onClick={() => setOpenWithdraw(true)}
                    >
                        Rút
                    </Button>

                    <Button 
                        {...actionButtonStyle}
                        startIcon={<SwapHorizIcon />}
                        onClick={() => setOpenTransfer(true)} 
                    >
                        Chuyển
                    </Button>
                    
                    <Button 
                        {...actionButtonStyle}
                        startIcon={<HistoryIcon />}
                        onClick={() => nav('/wallet-history')}
                    >
                        Lịch sử
                    </Button>
                </Stack>
            </Box>
        </Paper>

        {/* === PHẦN 2: DANH SÁCH GIAO DỊCH === */}
        <Paper elevation={0} sx={{ ...cardStyle, p: 0, overflow: 'hidden' }}>
            <Box sx={{ p: 2.5, pb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" fontWeight={700}>Giao dịch gần đây</Typography>
                <Button 
                    endIcon={<ArrowForwardIcon />} 
                    onClick={() => nav('/wallet-history')} 
                    size="small"
                    sx={{ color: "text.primary", fontWeight: 600 }}
                >
                    Xem tất cả
                </Button>
            </Box>

            <TableContainer sx={{ bgcolor: "transparent" }}>
                <Table sx={{ minWidth: 800 }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ ...headerSx, width: 50, pl: 3 }}>#</TableCell>
                            <TableCell sx={headerSx}>Loại giao dịch</TableCell>
                            <TableCell align="right" sx={headerSx}>Số tiền</TableCell>
                            <TableCell align="right" sx={headerSx}>Số dư sau GD</TableCell>
                            <TableCell align="right" sx={{ ...headerSx, pr: 3 }}>Thời gian</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}><CircularProgress /></TableCell></TableRow>
                        ) : transactions.length === 0 ? (
                            <TableRow><TableCell colSpan={5} align="center" sx={{ py: 6 }}><Typography color="text.secondary">Chưa có giao dịch nào.</Typography></TableCell></TableRow>
                        ) : (
                            transactions.map((item, index) => {
                                const config = getTransactionConfig(item.type);
                                return (
                                    <TableRow key={item.id} hover sx={{ "& td": { borderBottom: "1px solid", borderColor: "divider" } }}>
                                        <TableCell sx={{ color: TEXT_HEAD_COLOR, pl: 3 }}>{index + 1}</TableCell>
                                        
                                        <TableCell>{renderTypeCell(item.type)}</TableCell>
                                        
                                        <TableCell align="right">
                                            <Typography sx={{ ...cellSx, fontWeight: 500 }} color={config.color}>
                                                {showBalance ? `${config.sign}${formatPrice(item.amount)}` : "******"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Typography sx={{ ...cellSx, color: "text.primary" }}>
                                                {showBalance ? formatPrice(item.balanceAfter) : "******"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right" sx={{ color: "text.secondary", fontSize: "0.9rem", pr: 3 }}>
                                            {formatDate(item.createdAt)}
                                        </TableCell>
                                    </TableRow>
                                )
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>

        <DepositDialog 
            open={openDeposit}
            onClose={() => setOpenDeposit(false)}
            onSuccess={fetchWalletData} // Refresh lại số dư sau khi nạp
        />

        <WithdrawDialog 
            open={openWithdraw}
            onClose={() => setOpenWithdraw(false)}
            onSuccess={fetchWalletData}
            balance={balance}
        />

        <TransferDialog
            open={openTransfer}
            onClose={() => setOpenTransfer(false)}
            onSuccess={fetchWalletData}
            balance={balance}
        />

      </Container>
    </MainLayout>
  );
}