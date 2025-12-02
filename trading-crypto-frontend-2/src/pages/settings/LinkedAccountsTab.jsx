// src/pages/settings/LinkedAccountsTab.jsx
import React from "react";
import { Paper, Typography, List, ListItem, ListItemIcon, ListItemText, ListItemSecondaryAction, Button, Divider } from "@mui/material";
import GoogleIcon from '@mui/icons-material/Google';
import GitHubIcon from '@mui/icons-material/GitHub';
import { useToast } from "../../utils/toast";

export default function LinkedAccountsTab({ identity, onRefresh }) {
  const { toastInfo } = useToast();

  // Lấy ENV
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
  const REDIRECT_URI = import.meta.env.VITE_REDIRECT_URI; // http://localhost:5173/authenticate

  // Xử lý click nút Link Google
  const handleLinkGoogle = () => {
    // 🔥 QUAN TRỌNG: Thêm state="google-link" để trang Authenticate biết đây là link chứ không phải login
    const targetUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=openid%20email%20profile&state=google-link`;
    window.location.href = targetUrl;
  };

  // Xử lý click nút Link GitHub
  const handleLinkGithub = () => {
    // 🔥 QUAN TRỌNG: Thêm state="github-link"
    const targetUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=user:email&state=github-link`;
    window.location.href = targetUrl;
  };

  const handleUnlink = (provider) => {
    toastInfo(`Tính năng hủy liên kết ${provider} đang phát triển`);
  };

  const commonPaperSx = {
    borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.default', overflow: 'hidden', p: 3
  };

  const actionBtnSx = {
    color: "text.primary", bgcolor: "action.hover", boxShadow: "none", textTransform: "none", fontWeight: 600,
    borderRadius: 1, px: 2, py: 0.6, minWidth: 'auto', border: '1px solid transparent',
    "&:hover": { bgcolor: "action.selected", boxShadow: "none", borderColor: "divider" }
  };

  const disconnectBtnSx = { 
    ...actionBtnSx, bgcolor: 'rgba(234, 57, 67, 0.1)', color: '#ea3943',
    "&:hover": { bgcolor: 'rgba(234, 57, 67, 0.2)' }
  };

  return (
    <Paper elevation={0} sx={commonPaperSx}>
      <Typography variant="h6" fontWeight={700} mb={3}>Tài khoản liên kết</Typography>
      <List>
        {/* GOOGLE ITEM */}
        <ListItem>
          <ListItemIcon><GoogleIcon sx={{ color: 'text.primary' }} /></ListItemIcon>
          <ListItemText 
            primary="Google" 
            secondary={identity?.googleAccountId ? "Đã liên kết" : "Chưa liên kết"} 
            primaryTypographyProps={{ fontWeight: 600 }} 
          />
          <ListItemSecondaryAction>
            {identity?.googleAccountId ? (
              <Button variant="contained" sx={disconnectBtnSx} onClick={() => handleUnlink("Google")}>Hủy</Button>
            ) : (
              <Button variant="contained" sx={actionBtnSx} onClick={handleLinkGoogle}>Kết nối</Button>
            )}
          </ListItemSecondaryAction>
        </ListItem>
        
        <Divider variant="inset" component="li" />
        
        {/* GITHUB ITEM */}
        <ListItem>
          <ListItemIcon><GitHubIcon sx={{ color: 'text.primary' }} /></ListItemIcon>
          <ListItemText 
            primary="GitHub" 
            secondary={identity?.githubAccountId ? "Đã liên kết" : "Chưa liên kết"} 
            primaryTypographyProps={{ fontWeight: 600 }} 
          />
          <ListItemSecondaryAction>
            {identity?.githubAccountId ? (
              <Button variant="contained" sx={disconnectBtnSx} onClick={() => handleUnlink("GitHub")}>Hủy</Button>
            ) : (
              <Button variant="contained" sx={actionBtnSx} onClick={handleLinkGithub}>Kết nối</Button>
            )}
          </ListItemSecondaryAction>
        </ListItem>
      </List>
    </Paper>
  );
}