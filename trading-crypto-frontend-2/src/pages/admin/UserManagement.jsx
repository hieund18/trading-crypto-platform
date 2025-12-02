// src/pages/admin/UserManagement.jsx
import React, { useEffect, useState } from "react";
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Typography, Chip, IconButton, Avatar, Pagination, Stack, TextField, InputAdornment,
  MenuItem, Select, FormControl, ListItemText, Button
} from "@mui/material"; 

import SearchIcon from "@mui/icons-material/Search";
import LockIcon from '@mui/icons-material/Lock'; 
import LockOpenIcon from '@mui/icons-material/LockOpen'; 
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckIcon from '@mui/icons-material/Check'; 
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

import AdminLayout from "../../components/admin/AdminLayout";
import { getAllUsersApi, updateUserStatusApi } from "../../api/userApi";
import { getAllRolesApi } from "../../api/roleApi";
import { useToast } from "../../utils/toast";

import UserDetailModal from "../../components/admin/UserDetailModal";
import AddUserModal from "../../components/admin/AddUserModal";
import ConfirmLockDialog from "../../components/admin/ConfirmLockDialog";

const TEXT_HEAD_COLOR = "#848e9c"; 

const formatDate = (dateString) => {
  if (!dateString) return "--";
  return new Date(dateString).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [keyword, setKeyword] = useState("");
  
  const [filterActive, setFilterActive] = useState("ALL"); 
  const [filterRole, setFilterRole] = useState("ALL");
  const [rolesList, setRolesList] = useState([]);      

  const [openAdd, setOpenAdd] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, user: null, loading: false });

  const { toastSuccess, toastError } = useToast();

  useEffect(() => {
    const fetchRoles = async () => {
        try {
            const res = await getAllRolesApi();
            if (res.code === 1000) setRolesList(res.result.data || []);
        } catch (err) { console.error(err); }
    };
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const params = { page: page, size: 10, sort: "createdAt,desc" };
      if (keyword) params.keyword = keyword;
      if (filterActive !== "ALL") params.isActive = filterActive === "TRUE";
      if (filterRole !== "ALL") params.roleId = filterRole; 

      const res = await getAllUsersApi(params);
      if (res.code === 1000) {
        setUsers(res.result.data || []);
        setTotalPages(res.result.totalPages || 1);
      }
    } catch (error) { console.error(error); }
  };

  useEffect(() => { fetchUsers(); }, [page, keyword, filterActive, filterRole]);

  const handleResetFilters = () => {
      setKeyword("");
      setFilterActive("ALL");
      setFilterRole("ALL");
      setPage(1);
  };

  const handleClickLock = (e, user) => {
    e.stopPropagation(); 
    setConfirmDialog({ open: true, user: user, loading: false });
  };

  const handleConfirmStatus = async () => {
    const { user } = confirmDialog;
    if (!user) return;
    setConfirmDialog(prev => ({ ...prev, loading: true }));
    try {
      const res = await updateUserStatusApi(user.id);
      if (res.code === 1000) {
        const actionText = user.isActive ? "Đã khóa" : "Đã mở khóa";
        toastSuccess(`${actionText} tài khoản ${user.email || user.username}`);
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
        setConfirmDialog({ open: false, user: null, loading: false });
      } 
      else if (res.code === 1003) toastError("Bạn không có quyền thực hiện thao tác này!");
      else if (res.code === 1310) { toastError("Người dùng không tồn tại!"); fetchUsers(); } 
      else toastError(res.message || "Thao tác thất bại");
    } catch (err) { toastError("Lỗi hệ thống"); } 
    finally { setConfirmDialog(prev => ({ ...prev, loading: false })); }
  };

  const actionButtonStyle = { 
    color: "text.primary", bgcolor: "action.hover", boxShadow: "none", 
    textTransform: "none", fontWeight: 600, borderRadius: 1, px: 2, py: 0.8, 
    minWidth: 'auto', border: '1px solid transparent', 
    "&:hover": { bgcolor: "action.selected", boxShadow: "none", borderColor: "divider" } 
  };
  
  const inputStyle = { bgcolor: "background.default", borderRadius: 1, "& .MuiOutlinedInput-root": { fontSize: "0.875rem", "& fieldset": { borderColor: "divider" }, "&:hover fieldset": { borderColor: "primary.main" }, "&.Mui-focused fieldset": { borderColor: "primary.main" } }, "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" }, "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "primary.main" }, "& input::placeholder": { fontSize: "0.85rem" } };
  const menuItemSx = { display: "flex", justifyContent: "space-between", alignItems: "center", color: "text.secondary", py: 1.2, fontSize: "0.875rem", "&.Mui-selected": { bgcolor: "action.selected", color: "text.primary", fontWeight: 700 }, "& .MuiTypography-root": { fontSize: "0.875rem" } };
  const getStatusLabel = (val) => { if (val === "TRUE") return "Đang hoạt động"; if (val === "FALSE") return "Đang khóa"; return "Tất cả"; };
  
  const getRoleLabel = (id) => {
      if (id === "ALL") return "Tất cả";
      const found = rolesList.find(r => r.id === id);
      return found ? found.name : id;
  };

  return (
    <AdminLayout>
      
      {/* 1. HEADER ROW */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={700}>Quản lý người dùng</Typography>
        <Button 
            variant="contained" 
            startIcon={<PersonAddIcon />} 
            onClick={() => setOpenAdd(true)} 
            sx={actionButtonStyle}
        >
            Thêm mới
        </Button>
      </Box>

      {/* 2. FILTER ROW (ĐÃ XÓA KHUNG VIỀN CARD) */}
      <Box 
        sx={{ 
            display: "flex", 
            gap: 2, 
            mb: 3, 
            flexWrap: "wrap",
            alignItems: "center"
            // 🔥 ĐÃ XÓA: bgcolor, p, border, borderRadius
        }}
      >
          {/* Lọc Role */}
          <FormControl size="small" sx={{ minWidth: 260 }}> 
            <Select
              value={filterRole}
              onChange={(e) => { setFilterRole(e.target.value); setPage(1); }}
              displayEmpty sx={inputStyle}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                  <Typography color="text.primary" fontSize="0.875rem" fontWeight={600}>Vai trò</Typography>
                  <Typography fontWeight={600} color="text.primary" fontSize="0.875rem">{getRoleLabel(selected)}</Typography>
                </Box>
              )}
            >
              <MenuItem value="ALL" sx={menuItemSx}><ListItemText primary="Tất cả" />{filterRole === "ALL" && <CheckIcon fontSize="small" />}</MenuItem>
              {rolesList.map((role) => (
                  <MenuItem key={role.id} value={role.id} sx={menuItemSx}>
                      <ListItemText primary={role.name} />
                      {filterRole === role.id && <CheckIcon fontSize="small" />}
                  </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Lọc Trạng thái */}
          <FormControl size="small" sx={{ minWidth: 260 }}> 
            <Select
              value={filterActive}
              onChange={(e) => { setFilterActive(e.target.value); setPage(1); }}
              displayEmpty sx={inputStyle}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                  <Typography color="text.primary" fontSize="0.875rem" fontWeight={600}>Trạng thái</Typography>
                  <Typography fontWeight={600} color="text.primary" fontSize="0.875rem">{getStatusLabel(selected)}</Typography>
                </Box>
              )}
            >
              <MenuItem value="ALL" sx={menuItemSx}><ListItemText primary="Tất cả" />{filterActive === "ALL" && <CheckIcon fontSize="small" />}</MenuItem>
              <MenuItem value="TRUE" sx={menuItemSx}><ListItemText primary="Đang hoạt động" />{filterActive === "TRUE" && <CheckIcon fontSize="small" />}</MenuItem>
              <MenuItem value="FALSE" sx={menuItemSx}><ListItemText primary="Đang khóa" />{filterActive === "FALSE" && <CheckIcon fontSize="small" />}</MenuItem>
            </Select>
          </FormControl>

          {/* Nút Đặt lại */}
          <Button 
            variant="contained" 
            startIcon={<RestartAltIcon />} 
            onClick={handleResetFilters} 
            sx={{ ...actionButtonStyle, height: 40 }} 
          >
            Đặt lại
          </Button>

          {/* Khoảng trống đẩy Search sang phải */}
          <Box flexGrow={1} />

          {/* Tìm kiếm */}
          <TextField 
            size="small" placeholder="Tìm kiếm..." value={keyword} onChange={(e) => setKeyword(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} /></InputAdornment> }}
            sx={{ width: 280, ...inputStyle }}
          />
      </Box>

      {/* Bảng dữ liệu */}
      <TableContainer component={Paper} elevation={0} sx={{ bgcolor: "background.default", border: "none", borderRadius: 0, "& .MuiTableCell-root": { borderBottom: "1px solid", borderColor: "divider" } }}>
        <Table>
          <TableHead>
            <TableRow>
              {/* 🔥 SỬA: Giảm width cột User Info xuống 25% (hoặc fix cứng 250px) để Email gần hơn */}
              <TableCell sx={{ color: TEXT_HEAD_COLOR, fontWeight: 600, pl: 0, width: '25%' }}>User Info</TableCell> 
              <TableCell sx={{ color: TEXT_HEAD_COLOR, fontWeight: 600, width: '25%' }}>Email</TableCell>
              
              <TableCell sx={{ color: TEXT_HEAD_COLOR, fontWeight: 600 }}>Vai trò</TableCell>
              <TableCell sx={{ color: TEXT_HEAD_COLOR, fontWeight: 600 }}>Ngày tạo</TableCell>
              <TableCell sx={{ color: TEXT_HEAD_COLOR, fontWeight: 600 }} align="center">Verify</TableCell>
              <TableCell sx={{ color: TEXT_HEAD_COLOR, fontWeight: 600 }} align="center">Trạng thái</TableCell>
              <TableCell align="right" sx={{ color: TEXT_HEAD_COLOR, fontWeight: 600, pr: 0 }}>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
               <TableRow><TableCell colSpan={7} align="center" sx={{ py: 3, borderBottom: "none" }}>Không tìm thấy người dùng nào</TableCell></TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id} hover onClick={() => setSelectedUser(u)} sx={{ cursor: "pointer", "&:last-child td": { borderBottom: 0 }, "&:hover": { bgcolor: "action.hover" } }}>
                  <TableCell sx={{ pl: 0 }}>
                     <Stack direction="row" gap={1.5} alignItems="flex-start">
                        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 15, fontWeight: 600, mt: 0.5 }}>
                          {u.username?.charAt(0).toUpperCase() || u.email?.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography fontWeight={600} variant="body2" color="text.primary">
                            {u.username || "No Username"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', display: 'block', fontSize: '0.75rem', wordBreak: 'break-all', lineHeight: 1.2, mt: 0.5 }}>
                            {u.id}
                          </Typography>
                        </Box>
                     </Stack>
                  </TableCell>
                  
                  <TableCell><Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{u.email}</Typography></TableCell>
                  
                  <TableCell>{u.roles?.map(r => (<Chip key={r.id} label={r.name} size="small" color={r.name === 'ADMIN' ? 'error' : 'default'} variant={r.name === 'ADMIN' ? 'filled' : 'outlined'} sx={{ mr: 0.5, fontWeight: 600, height: 20, fontSize: 10 }} />))}</TableCell>
                  <TableCell sx={{ fontSize: "0.875rem" }}>{formatDate(u.createdAt)}</TableCell>
                  <TableCell align="center">{u.emailVerified ? <CheckCircleIcon color="success" fontSize="small" /> : <CancelIcon color="disabled" fontSize="small" />}</TableCell>
                  <TableCell align="center"><Chip label={u.isActive ? "Active" : "Locked"} color={u.isActive ? "success" : "error"} size="small" sx={{ fontWeight: 600, minWidth: 70 }} /></TableCell>
                  <TableCell align="right" sx={{ pr: 0 }}>
                    <IconButton onClick={(e) => handleClickLock(e, u)} color={u.isActive ? "default" : "error"}>{u.isActive ? <LockOpenIcon /> : <LockIcon />}</IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {totalPages > 1 && (<Box mt={3} display="flex" justifyContent="center"><Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} color="primary" shape="rounded" /></Box>)}

      <AddUserModal open={openAdd} onClose={() => setOpenAdd(false)} onSuccess={fetchUsers} />
      <UserDetailModal 
        open={!!selectedUser} 
        onClose={() => setSelectedUser(null)} 
        user={selectedUser}
        rolesList={rolesList} // 🔥 Truyền danh sách quyền để hiển thị checkbox
        onSuccess={fetchUsers} // 🔥 Gọi lại hàm load user khi cập nhật xong
      />
      <ConfirmLockDialog open={confirmDialog.open} onClose={() => setConfirmDialog({ ...confirmDialog, open: false })} onConfirm={handleConfirmStatus} user={confirmDialog.user} loading={confirmDialog.loading} />
    </AdminLayout>
  );
}