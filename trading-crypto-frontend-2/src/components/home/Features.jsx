import { Box, Typography, Stack } from "@mui/material";

export default function Features() {
  return (
    <Box sx={{ color: "white", py: 8 }}>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Vì sao chọn BitStorm?
      </Typography>

      <Stack spacing={3}>
        <FeatureItem title="Bảo mật cao" subtitle="Xác thực 2 lớp, mã hóa dữ liệu." />
        <FeatureItem title="Giao dịch nhanh" subtitle="Khớp lệnh trong 0.1 giây." />
        <FeatureItem
          title="Hỗ trợ nhiều loại coin"
          subtitle="BTC, ETH, BNB, DOGE và hơn 200 loại coin."
        />
      </Stack>
    </Box>
  );
}

function FeatureItem({ title, subtitle }) {
  return (
    <Box
      sx={{
        bgcolor: "#1e293b",
        borderRadius: 2,
        border: "1px solid #334155",
        p: 3,
      }}
    >
      <Typography variant="h6" fontWeight={700}>
        {title}
      </Typography>
      <Typography color="#94a3b8">{subtitle}</Typography>
    </Box>
  );
}
