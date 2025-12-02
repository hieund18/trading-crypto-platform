// src/pages/settings/SettingsPage.jsx
import React, { useEffect, useState } from "react";
import { 
  Box, Container, Grid, Typography, Avatar, IconButton, 
  List, ListItemButton, ListItemIcon, ListItemText, 
  CircularProgress, useTheme 
} from "@mui/material";
// ... (Giữ nguyên các import Icon)
import PhotoCamera from "@mui/icons-material/PhotoCamera";
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';

import MainLayout from "../../components/layout/MainLayout";
import AdminLayout from "../../components/admin/AdminLayout";

import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../utils/toast";
import { getMyInfo } from "../../api/authApi";
import { getMyProfileApi, uploadAvatarApi } from "../../api/profileApi";
import { getToken } from "../../api/tokenUtils";

import ProfileTab from "./ProfileTab"; 
import SecurityTab from "./SecurityTab";
import LinkedAccountsTab from "./LinkedAccountsTab";

export default function SettingsPage({ isAdmin = false }) {
  const { login } = useAuth();
  const { toastSuccess, toastError } = useToast();
  const theme = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); 
  const [identity, setIdentity] = useState(null);
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // ... (Giữ nguyên fetchData, useEffect, handleAvatarChange)
  const fetchData = async () => {
    try {
      const [idRes, profRes] = await Promise.all([getMyInfo(), getMyProfileApi()]);
      if (idRes.code === 1000) setIdentity(idRes.result);
      if (profRes.code === 1000) setProfile(profRes.result);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadAvatarApi(file);
      if (res.code === 1000) {
        toastSuccess("Ảnh đại diện đã cập nhật");
        setProfile(res.result);
        const token = getToken(); if(token) login(token);
      } else toastError(res.message);
    } catch (err) { toastError("Lỗi tải ảnh"); } finally { setUploading(false); }
  };

  // 🔥 CẬP NHẬT: Thêm logic kế thừa màu cho Icon
  const sidebarItemSx = (index) => {
    const active = activeTab === index;
    return {
      borderRadius: 1, 
      mb: 1, 
      fontWeight: 600, 
      py: 1, 
      
      bgcolor: active ? "action.selected" : "transparent",
      color: active ? "text.primary" : "text.secondary",
      
      // 🔥 DÒNG MỚI: Ép Icon dùng màu của Text (inherit)
      "& .MuiListItemIcon-root": {
        color: "inherit"
      },

      "&:hover": { 
        bgcolor: active ? "action.selected" : "action.hover", 
        // Icon sẽ tự đổi màu theo text.primary nhờ dòng inherit ở trên
      }
    };
  };

  if (loading) {
    const Layout = isAdmin ? AdminLayout : MainLayout;
    return <Layout><Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box></Layout>;
  }

  const LayoutComponent = isAdmin ? AdminLayout : MainLayout;
  const Wrapper = isAdmin ? Box : Container;
  const wrapperProps = isAdmin 
    ? { sx: { p: 0, width: '100%' } } 
    : { maxWidth: "lg", sx: { py: 4 } };

  return (
    <LayoutComponent maxWidth={1200}>
      <Wrapper {...wrapperProps}>
        
        {isAdmin && <Typography variant="h5" fontWeight={700} mb={3}>Cài đặt tài khoản</Typography>}

        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 3 }}>
                <Box textAlign="center" mb={3} mt={1}>
                    <Box position="relative" display="inline-block">
                        <Avatar src={profile?.avatar} sx={{ width: 80, height: 80, mb: 1, border: '1px solid', borderColor: 'divider' }} />
                        <input accept="image/*" style={{ display: 'none' }} id="avatar-upload" type="file" onChange={handleAvatarChange} />
                        <label htmlFor="avatar-upload">
                            <IconButton component="span" size="small" sx={{ position: 'absolute', bottom: 5, right: 0, bgcolor: 'background.default', border: '1px solid', borderColor: 'divider' }}>
                                {uploading ? <CircularProgress size={16} /> : <PhotoCamera fontSize="small" />}
                            </IconButton>
                        </label>
                    </Box>
                    <Typography fontWeight={700}>{profile?.fullName || identity?.username}</Typography>
                    <Typography variant="caption" color="text.secondary">{identity?.email}</Typography>
                </Box>

                <List component="nav">
                    {/* 🔥 CẬP NHẬT: Bỏ prop color trong Icon để nó tự inherit */}
                    
                    <ListItemButton onClick={() => setActiveTab(0)} sx={sidebarItemSx(0)}>
                        <ListItemIcon><PersonOutlineIcon /></ListItemIcon> 
                        <ListItemText primary="Hồ sơ cá nhân" />
                    </ListItemButton>

                    <ListItemButton onClick={() => setActiveTab(1)} sx={sidebarItemSx(1)}>
                        <ListItemIcon><LockOutlinedIcon /></ListItemIcon>
                        <ListItemText primary="Bảo mật" />
                    </ListItemButton>

                    <ListItemButton onClick={() => setActiveTab(2)} sx={sidebarItemSx(2)}>
                        <ListItemIcon><ShareOutlinedIcon /></ListItemIcon>
                        <ListItemText primary="Liên kết" />
                    </ListItemButton>
                </List>
          </Grid>

          <Grid size={{ xs: 12, md: 9 }}>
            {activeTab === 0 && <ProfileTab identity={identity} profile={profile} onRefresh={fetchData} />}
            {activeTab === 1 && <SecurityTab identity={identity} onRefresh={fetchData} />}
            {activeTab === 2 && <LinkedAccountsTab identity={identity} onRefresh={fetchData} />}
          </Grid>
        </Grid>
      </Wrapper>
    </LayoutComponent>
  );
}