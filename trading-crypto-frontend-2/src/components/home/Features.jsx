// src/components/home/Features.jsx
import React from "react";
import { Box, Typography, Container, Grid, Paper, Avatar } from "@mui/material";
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';

const features = [
  {
    icon: <VerifiedUserOutlinedIcon fontSize="large" />,
    title: "Bảo mật hàng đầu",
    desc: "Hệ thống bảo mật đa lớp, xác thực 2FA và quỹ bảo hiểm người dùng an toàn tuyệt đối.",
    color: "#3b82f6"
  },
  {
    icon: <BoltOutlinedIcon fontSize="large" />,
    title: "Khớp lệnh siêu tốc",
    desc: "Công nghệ khớp lệnh lên đến 1.4 triệu giao dịch/giây, đảm bảo không bị trễ lệnh.",
    color: "#16c784"
  },
  {
    icon: <SupportAgentOutlinedIcon fontSize="large" />,
    title: "Hỗ trợ 24/7",
    desc: "Đội ngũ chăm sóc khách hàng luôn sẵn sàng giải đáp mọi thắc mắc của bạn bất cứ lúc nào.",
    color: "#F59E0B"
  }
];

export default function Features() {
  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Box textAlign="center" mb={6}>
            <Typography variant="h3" fontWeight={800} mb={2}>Tại sao chọn Bitstorm?</Typography>
            <Typography variant="body1" color="text.secondary" maxWidth={600} mx="auto">
                Chúng tôi cam kết mang lại trải nghiệm giao dịch tốt nhất, an toàn nhất và nhanh chóng nhất cho mọi nhà đầu tư.
            </Typography>
        </Box>

        {/* 🔥 Sửa Grid2 thành Grid */}
        <Grid container spacing={4}>
            {features.map((item, index) => (
                <Grid size={{ xs: 12, md: 4 }} key={index}>
                    <Paper 
                        elevation={0}
                        sx={{ 
                            p: 4, height: '100%', borderRadius: 4, textAlign: 'center',
                            border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper',
                            transition: '0.3s', '&:hover': { transform: 'translateY(-8px)', boxShadow: '0 12px 30px rgba(0,0,0,0.08)' }
                        }}
                    >
                        <Avatar 
                            sx={{ 
                                width: 64, height: 64, mx: 'auto', mb: 3, 
                                bgcolor: `${item.color}15`, color: item.color 
                            }}
                        >
                            {item.icon}
                        </Avatar>
                        <Typography variant="h5" fontWeight={700} gutterBottom>{item.title}</Typography>
                        <Typography variant="body1" color="text.secondary">{item.desc}</Typography>
                    </Paper>
                </Grid>
            ))}
        </Grid>
      </Container>
    </Box>
  );
}