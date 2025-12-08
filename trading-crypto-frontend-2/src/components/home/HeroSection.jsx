// src/components/home/HeroSection.jsx
import React from "react";
import { Box, Typography, Button, Container, Grid, Stack, Chip, useTheme } from "@mui/material";
import { useNavigate } from "react-router-dom";
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SecurityIcon from '@mui/icons-material/Security';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';

export default function HeroSection() {
  const theme = useTheme();
  const nav = useNavigate();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Box 
        sx={{ 
            py: { xs: 6, md: 10 }, 
            position: 'relative', 
            overflow: 'hidden',
            borderRadius: 3,
            // Hiệu ứng nền nhẹ nhàng hơn
            background: isDark 
                ? 'radial-gradient(circle at 90% 10%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)' 
                : 'radial-gradient(circle at 90% 10%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)'
        }}
    >
      <Container maxWidth="lg">
        {/* 🔥 Sử dụng Grid chuẩn, nếu bạn dùng MUI v6 thì dùng props `size` */}
        <Grid container spacing={4} alignItems="center">
          
          {/* CỘT TRÁI: TEXT */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Chip 
                label="Nền tảng giao dịch số 1 VN" 
                color="primary" 
                size="small" 
                variant="outlined" 
                sx={{ mb: 3, fontWeight: 600, borderRadius: 2 }}
            />
            
            <Typography 
                variant="h2" 
                fontWeight={800} 
                sx={{ 
                    mb: 2, 
                    lineHeight: 1.2,
                    fontSize: { xs: '2.5rem', md: '3.5rem' } // Responsive font size
                }}
            >
              Giao dịch Crypto <br /> 
              <span style={{ 
                  background: 'linear-gradient(45deg, #3b82f6 30%, #16c784 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
              }}>
                Đơn giản & An toàn
              </span>
            </Typography>
            
            <Typography variant="h6" color="text.secondary" sx={{ mb: 4, fontWeight: 400, maxWidth: 500, lineHeight: 1.6 }}>
              Bitstorm cung cấp trải nghiệm mua bán Bitcoin, Ethereum và hơn 200+ loại tiền mã hóa khác với chi phí thấp nhất thị trường.
            </Typography>

            <Stack direction="row" spacing={2}>
                <Button 
                    variant="contained" 
                    size="large" 
                    onClick={() => nav('/register')}
                    startIcon={<RocketLaunchIcon />}
                    sx={{ px: 4, py: 1.5, fontSize: '1rem', borderRadius: 2, fontWeight: 700 }}
                >
                    Bắt đầu
                </Button>
                <Button 
                    variant="outlined" 
                    size="large" 
                    onClick={() => nav('/markets')}
                    startIcon={<PlayCircleOutlineIcon />}
                    sx={{ px: 3, py: 1.5, fontSize: '1rem', borderRadius: 2, fontWeight: 600 }}
                >
                    Thị trường
                </Button>
            </Stack>

            <Stack direction="row" spacing={5} mt={6}>
                <Box>
                    <Typography variant="h5" fontWeight={700} color="text.primary">$54B+</Typography>
                    <Typography variant="body2" color="text.secondary">Volume quý</Typography>
                </Box>
                <Box>
                    <Typography variant="h5" fontWeight={700} color="text.primary">125+</Typography>
                    <Typography variant="body2" color="text.secondary">Quốc gia</Typography>
                </Box>
                <Box>
                    <Typography variant="h5" fontWeight={700} color="text.primary">2M+</Typography>
                    <Typography variant="body2" color="text.secondary">Người dùng</Typography>
                </Box>
            </Stack>
          </Grid>

          {/* CỘT PHẢI: ẢNH MINH HỌA */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Box 
                sx={{ 
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    perspective: '1000px'
                }}
            >
               {/* 🔥 ẢNH THẬT TỪ UNSPLASH (3D Render) */}
               {/* <Box 
                  component="img"
                  src="https://images.unsplash.com/photo-1622630998477-20aa696fa305?q=80&w=800&auto=format&fit=crop"
                  alt="Crypto Hero"
                  sx={{ 
                      width: '100%', 
                      maxWidth: 500,
                      height: 'auto',
                      borderRadius: 4,
                      boxShadow: '0 20px 40px rgba(0,0,0,0.2)', // Bóng đổ đẹp
                      transform: 'rotateY(-5deg)', // Hiệu ứng nghiêng nhẹ 3D
                      transition: 'transform 0.3s',
                      '&:hover': { transform: 'rotateY(0deg) scale(1.02)' }
                  }}
               /> */}
               
               {/* Card nổi giả lập - Tạo điểm nhấn */}
               <Box
                  sx={{ 
                      position: 'absolute', bottom: -20, left: 0, 
                      p: 2, borderRadius: 3,
                      display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2,
                      bgcolor: 'background.paper',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                      border: '1px solid', borderColor: 'divider'
                  }}
               >
                   <SecurityIcon color="success" sx={{ fontSize: 36 }} />
                   <Box>
                       <Typography variant="subtitle2" fontWeight={700} color="text.primary">Quỹ bảo hiểm SAFU</Typography>
                       <Typography variant="caption" color="text.secondary">Bảo vệ tài sản 24/7</Typography>
                   </Box>
               </Box>
            </Box>
          </Grid>

        </Grid>
      </Container>
    </Box>
  );
}