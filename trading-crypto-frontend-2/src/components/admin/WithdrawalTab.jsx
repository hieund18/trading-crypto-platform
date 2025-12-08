// src/components/admin/WithdrawalTab.jsx
import React, { useEffect, useState } from "react";
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Chip, Pagination, Stack, TextField, InputAdornment,
  MenuItem, Select, FormControl, ListItemText, Button, CircularProgress, 
  IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, Divider
} from "@mui/material"; 
import SearchIcon from "@mui/icons-material/Search";
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckIcon from '@mui/icons-material/Check'; 
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ConfirmWithdrawalDialog from "./ConfirmWithdrawalDialog";

import { getAllWithdrawalsApi, approveWithdrawalApi, rejectWithdrawalApi } from "../../api/walletApi";
import { formatPrice } from "../../utils/formatters";
import { useToast } from "../../utils/toast";

const TEXT_HEAD_COLOR = "#848e9c"; 

const formatDate = (dateString) => {
  if (!dateString) return "--";
  return new Date(dateString).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export default function WithdrawalTab() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("ALL");

  const [confirmDialog, setConfirmDialog] = useState({ 
      open: false, 
      type: null, 
      item: null, 
      loading: false 
  });

  const { toastSuccess, toastError } = useToast();

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = { page, size: 20 };
      if (keyword) params.keyword = keyword;
      if (status !== "ALL") params.status = status;

      const res = await getAllWithdrawalsApi(params);
      if (res.code === 1000) {
        setData(res.result.content || []);
        setTotalPages(res.result.totalPage || 1);
      }
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchData(), 500);
    return () => clearTimeout(timer);
  }, [page, keyword, status]);

  const handleReset = () => {
      setKeyword("");
      setStatus("ALL");
      setPage(1);
  };

  const handleOpenConfirm = (type, item) => {
      setConfirmDialog({ open: true, type, item, loading: false });
  };

  const handleProcess = async () => {
      const { type, item } = confirmDialog;
      if (!item) return;

      setConfirmDialog(prev => ({ ...prev, loading: true }));
      try {
          let res;
          if (type === "APPROVE") res = await approveWithdrawalApi(item.id);
          else res = await rejectWithdrawalApi(item.id);

          if (res.code === 1000) {
              toastSuccess(type === "APPROVE" ? "Đã duyệt yêu cầu!" : "Đã từ chối yêu cầu!");
              setConfirmDialog({ open: false, type: null, item: null, loading: false });
              fetchData(); 
          } else {
              handleError(res);
          }
      } catch (err) {
          if(err.response?.data) handleError(err.response.data);
          else toastError("Lỗi kết nối máy chủ");
      } finally {
          setConfirmDialog(prev => ({ ...prev, loading: false }));
      }
  };

  const handleError = (data) => {
      switch(data.code) {
          case 6106: toastError("Yêu cầu không tồn tại!"); break;
          case 6107: toastError("Trạng thái không hợp lệ!"); fetchData(); break;
          case 1003: toastError("Bạn không có quyền!"); break;
          default: toastError(data.message || "Thao tác thất bại");
      }
  };

  const copyToClipboard = (text) => {
      navigator.clipboard.writeText(text);
      toastSuccess("Đã sao chép!");
  };

  // Helper lấy label hiển thị cho Select
  const getStatusLabel = (val) => {
      const map = {
          "ALL": "Tất cả",
          "PENDING": "Đang chờ",
          "APPROVED": "Đã duyệt",
          "REJECTED": "Từ chối"
      };
      return map[val] || val;
  };

  const actionButtonStyle = { color: "text.primary", bgcolor: "action.hover", boxShadow: "none", textTransform: "none", fontWeight: 600, borderRadius: 1, px: 2, py: 0.8, minWidth: 'auto', border: '1px solid transparent', "&:hover": { bgcolor: "action.selected", boxShadow: "none", borderColor: "divider" } };
  const inputStyle = { bgcolor: "background.default", borderRadius: 1, "& .MuiOutlinedInput-root": { fontSize: "0.875rem", "& fieldset": { borderColor: "divider" }, "&:hover fieldset": { borderColor: "primary.main" }, "&.Mui-focused fieldset": { borderColor: "primary.main" } }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" }, "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" }, "& input::placeholder": { fontSize: "0.85rem" } };
  const menuItemSx = { display: "flex", justifyContent: "space-between", alignItems: "center", color: "text.secondary", py: 1.2, fontSize: "0.875rem", "&.Mui-selected": { bgcolor: "action.selected", color: "text.primary", fontWeight: 700 }, "& .MuiTypography-root": { fontSize: "0.875rem" } };

  return (
    <>
      {/* FILTER BAR */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>
          
          {/* 🔥 THANH LỌC TRẠNG THÁI (Đã chỉnh renderValue giống TransactionHistory) */}
          <FormControl size="small" sx={{ minWidth: 260 }}>
              <Select 
                value={status} 
                onChange={(e) => { setStatus(e.target.value); setPage(1); }} 
                displayEmpty 
                sx={inputStyle}
                renderValue={(selected) => (
                    <Box sx={{ display: 'flex', justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                        <Typography color="text.primary" fontSize="0.875rem" fontWeight={600}>Trạng thái</Typography>
                        <Typography fontWeight={600} color="text.primary" fontSize="0.875rem">{getStatusLabel(selected)}</Typography>
                    </Box>
                )}
              >
                  <MenuItem value="ALL" sx={menuItemSx}><ListItemText primary="Tất cả trạng thái" />{status === "ALL" && <CheckIcon fontSize="small" />}</MenuItem>
                  <MenuItem value="PENDING" sx={menuItemSx}><ListItemText primary="Đang chờ xử lý" />{status === "PENDING" && <CheckIcon fontSize="small" />}</MenuItem>
                  <MenuItem value="APPROVED" sx={menuItemSx}><ListItemText primary="Đã duyệt" />{status === "APPROVED" && <CheckIcon fontSize="small" />}</MenuItem>
                  <MenuItem value="REJECTED" sx={menuItemSx}><ListItemText primary="Từ chối" />{status === "REJECTED" && <CheckIcon fontSize="small" />}</MenuItem>
              </Select>
          </FormControl>

          <Button variant="contained" startIcon={<RestartAltIcon />} onClick={handleReset} sx={{ ...actionButtonStyle, height: 40 }}>Đặt lại</Button>
          <Box flexGrow={1} />
          <TextField size="small" placeholder="Tìm User ID, Request ID..." value={keyword} onChange={(e) => { setKeyword(e.target.value); setPage(1); }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} /></InputAdornment> }} sx={{ width: 300, ...inputStyle }} />
      </Box>

      {/* TABLE */}
      <TableContainer component={Paper} elevation={0} sx={{ bgcolor: "background.default", border: "none", borderRadius: 0, "& .MuiTableCell-root": { borderBottom: "1px solid", borderColor: "divider" } }}>
          <Table>
              <TableHead>
                  <TableRow>
                      <TableCell sx={{ color: TEXT_HEAD_COLOR, fontWeight: 600, pl: 0, width: '20%' }}>Request ID</TableCell>
                      <TableCell sx={{ color: TEXT_HEAD_COLOR, fontWeight: 600, width: '20%' }}>User ID</TableCell>
                      <TableCell sx={{ color: TEXT_HEAD_COLOR, fontWeight: 600 }}>Ngân hàng</TableCell>
                      <TableCell align="right" sx={{ color: TEXT_HEAD_COLOR, fontWeight: 600 }}>Số tiền rút</TableCell>
                      <TableCell align="center" sx={{ color: TEXT_HEAD_COLOR, fontWeight: 600 }}>Trạng thái</TableCell>
                      <TableCell align="right" sx={{ color: TEXT_HEAD_COLOR, fontWeight: 600 }}>Thời gian</TableCell>
                      <TableCell align="right" sx={{ color: TEXT_HEAD_COLOR, fontWeight: 600, pr: 0 }}>Hành động</TableCell>
                  </TableRow>
              </TableHead>
              <TableBody>
                  {loading ? (
                      <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5, borderBottom: "none" }}><CircularProgress /></TableCell></TableRow>
                  ) : data.length === 0 ? (
                      <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3, borderBottom: "none" }}><Typography color="text.secondary">Không tìm thấy yêu cầu nào</Typography></TableCell></TableRow>
                  ) : (
                      data.map((item) => (
                          <TableRow key={item.id} hover sx={{ "&:last-child td": { borderBottom: 0 }, "&:hover": { bgcolor: "action.hover" } }}>
                              {/* Request ID */}
                              <TableCell sx={{ pl: 0 }}>
                                  <Stack direction="row" alignItems="center" gap={0.5}>
                                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                                          {item.id}
                                      </Typography>
                                      <Tooltip title="Sao chép ID"><IconButton size="small" onClick={() => copyToClipboard(item.id)}><ContentCopyIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                                  </Stack>
                              </TableCell>

                              {/* User ID */}
                              <TableCell>
                                  <Stack direction="row" alignItems="center" gap={0.5}>
                                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                                          {item.userId}
                                      </Typography>
                                      <Tooltip title="Sao chép User ID"><IconButton size="small" onClick={() => copyToClipboard(item.userId)}><ContentCopyIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                                  </Stack>
                              </TableCell>

                              <TableCell>
                                  <Box>
                                      <Typography variant="body2" color="text.primary">
                                          {item.bankName}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                          {item.bankAccount}
                                      </Typography>
                                  </Box>
                              </TableCell>

                              <TableCell align="right">
                                  <Typography variant="body2" color="error.main">
                                      -{formatPrice(item.amount)}
                                  </Typography>
                              </TableCell>

                              <TableCell align="center">
                                  <Chip 
                                      label={item.status === 'PENDING' ? 'Chờ xử lý' : item.status === 'APPROVED' ? 'Đã duyệt' : 'Từ chối'}
                                      color={item.status === 'APPROVED' ? 'success' : item.status === 'REJECTED' ? 'error' : 'warning'}
                                      size="small" sx={{ fontWeight: 600, minWidth: 90 }}
                                  />
                              </TableCell>
                              <TableCell align="right"><Typography variant="body2" color="text.secondary" fontSize="0.85rem">{formatDate(item.createdAt)}</Typography></TableCell>
                              <TableCell align="right" sx={{ pr: 0 }}>
                                  {item.status === 'PENDING' && (
                                      <Stack direction="row" justifyContent="flex-end" spacing={1}>
                                          <Tooltip title="Duyệt"><IconButton size="small" color="success" onClick={() => handleOpenConfirm("APPROVE", item)} sx={{ bgcolor: 'rgba(22, 199, 132, 0.1)' }}><CheckCircleIcon fontSize="small" /></IconButton></Tooltip>
                                          <Tooltip title="Từ chối"><IconButton size="small" color="error" onClick={() => handleOpenConfirm("REJECT", item)} sx={{ bgcolor: 'rgba(234, 57, 67, 0.1)' }}><CancelIcon fontSize="small" /></IconButton></Tooltip>
                                      </Stack>
                                  )}
                              </TableCell>
                          </TableRow>
                      ))
                  )}
              </TableBody>
          </Table>
      </TableContainer>

      {totalPages > 1 && (<Box mt={3} display="flex" justifyContent="center"><Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} color="primary" shape="rounded" /></Box>)}

      {/* CONFIRM DIALOG */}
      <ConfirmWithdrawalDialog 
          open={confirmDialog.open}
          onClose={() => setConfirmDialog({...confirmDialog, open: false})}
          onConfirm={handleProcess}
          type={confirmDialog.type}
          item={confirmDialog.item}
          loading={confirmDialog.loading}
      />
    </>
  );
}

// Helper component cho Dialog chi tiết
function DetailRow({ label, value, isMono, isBold, color = "text.primary" }) {
    return (
        <Box display="flex" justifyContent="space-between" mb={1} sx={{ wordBreak: 'break-all' }}>
            <Typography variant="body2" color="text.secondary">{label}:</Typography>
            <Typography 
                variant="body2" 
                color={color} 
                fontWeight={isBold ? 700 : 500}
                sx={{ fontFamily: isMono ? 'monospace' : 'inherit', textAlign: 'right', pl: 2 }}
            >
                {value}
            </Typography>
        </Box>
    )
}