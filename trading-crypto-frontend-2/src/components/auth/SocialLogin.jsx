import React from "react";
import { Button, Stack } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";

export default function SocialLogin({ mode = "login" }) {
  const isRegister = mode === "register";

  const googleText = isRegister
    ? "Đăng ký với Google"
    : "Đăng nhập với Google";

  const githubText = isRegister
    ? "Đăng ký với GitHub"
    : "Đăng nhập với GitHub";

  const handleGoogle = () => {
    console.log(isRegister ? "REGISTER with Google" : "LOGIN with Google");
  };

  const handleGithub = () => {
    console.log(isRegister ? "REGISTER with GitHub" : "LOGIN with GitHub");
  };

  return (
    <Stack spacing={1}>
      <Button variant="outlined" fullWidth startIcon={<GoogleIcon />} onClick={handleGoogle} color="white">
        {googleText}
      </Button>

      <Button variant="outlined" fullWidth startIcon={<GitHubIcon />} onClick={handleGithub} color="white">
        {githubText}
      </Button>
    </Stack>
  );
}
