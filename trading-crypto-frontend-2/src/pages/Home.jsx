// src/pages/Home.jsx
import React from "react";
import { Box, Typography, Button, Container, Paper, useTheme } from "@mui/material";
import MainLayout from "../components/layout/MainLayout";
import HeroSection from "../components/home/HeroSection";
import MarketPreview from "../components/home/MarketPreview";
import Features from "../components/home/Features";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();
  const theme = useTheme();

  return (
    // 🔥 SỬA LỖI: Dùng "100%" thay vì false để full màn hình
    <MainLayout maxWidth="100%"> 
      
      {/* 1. Banner */}
      <HeroSection />

      {/* 2. Top Coins */}
      <Box sx={{ py: 4, bgcolor: 'background.default' }}> 
         <MarketPreview />
      </Box>

      {/* 3. Tính năng */}
      <Features />

      {/* 4. CTA Section - Kêu gọi hành động cuối trang */}
      <Box sx={{ py: 10, textAlign: 'center', bgcolor: 'background.paper' }}>
          <Container maxWidth="md">
              <Paper 
                elevation={0} 
                sx={{ 
                    p: 6, borderRadius: 4, 
                    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
                    border: '1px solid', borderColor: 'divider',
                    color: 'text.primary',
                    position: 'relative', overflow: 'hidden'
                }}
              >
                  <Box position="relative" zIndex={2}>
                      <Typography variant="h3" fontWeight={800} mb={2}>Bắt đầu hành trình Crypto</Typography>
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 400 }}>
                          Tham gia cùng cộng đồng nhà đầu tư thông minh ngay hôm nay.
                      </Typography>
                      <Button 
                          variant="contained" 
                          size="large" 
                          onClick={() => nav('/register')}
                          sx={{ 
                              px: 5, py: 1.5, fontSize: '1.1rem', fontWeight: 700
                          }}
                      >
                          Đăng ký miễn phí
                      </Button>
                  </Box>
                  
                  {/* Decor Background Circles */}
                  <Box sx={{ position: 'absolute', top: -100, left: -100, width: 300, height: 300, borderRadius: '50%', bgcolor: 'primary.main', opacity: 0.05 }} />
                  <Box sx={{ position: 'absolute', bottom: -50, right: -50, width: 200, height: 200, borderRadius: '50%', bgcolor: 'secondary.main', opacity: 0.05 }} />
              </Paper>
          </Container>
      </Box>

    </MainLayout>
  );
}