// src/components/wallet/WithdrawalRequestTable.jsx
import React, { useEffect, useState } from "react";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, CircularProgress, Chip, Pagination, Box
} from "@mui/material";
import { getMyWithdrawalHistoryApi } from "../../api/walletApi";
import { formatPrice } from "../../utils/formatters";

// --- STYLE CONSTANTS ---
const TEXT_HEAD_COLOR = "#848e9c";
const COMMON_WEIGHT = 500;
const ROW_FONT_SIZE = "0.95rem";

const formatDate = (dateString) => {
  if (!dateString) return "--";
  return new Date(dateString).toLocaleString('vi-VN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  });
};

const getStatusConfig = (status) => {
  switch (status) {
    case "APPROVED":
      return { label: "Thành công", color: "#16c784", bgcolor: "rgba(22, 199, 132, 0.1)" };
    case "PENDING":
      return { label: "Đang xử lý", color: "#f59e0b", bgcolor: "rgba(245, 158, 11, 0.1)" };
    case "REJECTED":
      return { label: "Từ chối", color: "#ea3943", bgcolor: "rgba(234, 57, 67, 0.1)" };
    default:
      return { label: status, color: "text.primary", bgcolor: "action.hover" };
  }
};

export default function WithdrawalRequestTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getMyWithdrawalHistoryApi({ page, size: 10 });
        if (res.code === 1000) {
          setData(res.result.content);
          setTotalPages(res.result.totalPage);
        }
      } catch (error) {
        console.error("Failed to load withdrawal history", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page]);

  const headerSx = { color: TEXT_HEAD_COLOR, fontWeight: 600, fontSize: 13 };
  const cellSx = { fontWeight: COMMON_WEIGHT, fontSize: ROW_FONT_SIZE };

  return (
    <>
      {/* 🔥 SỬA: Bỏ border và nền trắng của khung bao ngoài */}
      <TableContainer 
        component={Paper} 
        elevation={0} 
        sx={{ 
            bgcolor: "transparent", 
            border: "none", 
            minHeight: 400 
        }}
      >
        <Table sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...headerSx, width: 50, pl: 3 }}>#</TableCell>
              <TableCell sx={headerSx}>Ngân hàng</TableCell>
              <TableCell sx={headerSx}>Số tài khoản</TableCell>
              <TableCell align="right" sx={headerSx}>Số tiền rút</TableCell>
              <TableCell align="center" sx={headerSx}>Trạng thái</TableCell>
              <TableCell align="right" sx={{ ...headerSx, pr: 3 }}>Thời gian tạo</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && data.length === 0 ? (
              <TableRow>
                {/* 🔥 SỬA: Bỏ borderBottom */}
                <TableCell colSpan={6} align="center" sx={{ py: 10, borderBottom: "none" }}>
                    <CircularProgress size={30} />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                 {/* 🔥 SỬA: Bỏ borderBottom */}
                <TableCell colSpan={6} align="center" sx={{ py: 10, borderBottom: "none" }}>
                    <Typography color="text.secondary">Chưa có yêu cầu rút tiền nào.</Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => {
                const config = getStatusConfig(item.status);
                return (
                  <TableRow key={item.id} hover sx={{ "& td": { borderBottom: "1px solid", borderColor: "divider" } }}>
                    <TableCell sx={{ color: TEXT_HEAD_COLOR, pl: 3 }}>{(page - 1) * 10 + index + 1}</TableCell>
                    <TableCell sx={cellSx}>{item.bankName}</TableCell>
                    <TableCell sx={{ ...cellSx }}>{item.bankAccount}</TableCell>
                    <TableCell align="right">
                      <Typography sx={{ ...cellSx, fontWeight: COMMON_WEIGHT, color: "#ea3943" }}>
                         -{formatPrice(item.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={config.label} 
                        size="small"
                        sx={{ 
                            height: 28, 
                            fontWeight: 500, 
                            fontSize: "0.85rem",
                            borderRadius: 1.5,
                            bgcolor: config.bgcolor, 
                            color: config.color,
                            minWidth: 90
                        }}
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ color: "text.secondary", fontSize: "0.9rem", pr: 3 }}>
                        {formatDate(item.createdAt)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} color="primary" shape="rounded" />
        </Box>
      )}
    </>
  );
}