import React, { useRef } from "react";
import { Box, TextField } from "@mui/material";

export default function OtpInput({ value = "", onChange }) {
  const inputsRef = useRef([]);

  const handleChange = (index, val) => {
    // ❌ Không cho nhập nếu không phải số
    if (!/^[0-9]*$/.test(val)) return;

    const newValue = value.split("");
    newValue[index] = val.slice(-1); // chỉ nhận 1 ký tự
    const finalValue = newValue.join("");

    onChange(finalValue);

    // 🔥 Auto chuyển sang ô tiếp theo
    if (val && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // 🔥 Backspace lùi lại ô trước
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="center"
      gap={1}
      sx={{
        width: "100%",
        maxWidth: "330px",   // 🔥 Không cho vượt form
        margin: "0 auto",
      }}
    >
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <TextField
          key={i}
          value={value[i] || ""}
          inputRef={(el) => (inputsRef.current[i] = el)}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          inputProps={{
            inputMode: "numeric",   // 🔥 mở bàn phím số trên mobile
            pattern: "[0-9]*",      // hỗ trợ HTML validation
            maxLength: 1,
            style: {
              textAlign: "center",
              fontSize: 22,
              width: 46,
              height: 55,
            },
          }}
          sx={{
            "& input": {
              padding: 0,
            },
          }}
        />
      ))}
    </Box>
  );
}
