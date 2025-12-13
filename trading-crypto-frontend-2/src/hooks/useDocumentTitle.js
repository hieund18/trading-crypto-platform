// src/hooks/useDocumentTitle.js
import { useEffect } from "react";

export function useDocumentTitle(title) {
  useEffect(() => {
    // Nếu có title thì set: "Title | Bitstorm", ngược lại dùng mặc định
    document.title = title 
      ? `${title} | Bitstorm - Sàn giao dịch Crypto` 
      : "Bitstorm - Giao dịch tiền mã hóa an toàn";
  }, [title]);
}