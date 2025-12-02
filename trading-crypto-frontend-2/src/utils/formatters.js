// src/utils/formatters.js

export const formatPrice = (value) => {
  if (value === undefined || value === null) return "$0.00";
  const options = { style: "currency", currency: "USD" };
  // Nếu giá nhỏ hơn 1 đô, hiển thị nhiều số thập phân hơn
  if (value < 1) {
    options.minimumFractionDigits = 2;
    options.maximumFractionDigits = 6;
  } else {
    options.minimumFractionDigits = 2;
    options.maximumFractionDigits = 2;
  }
  return new Intl.NumberFormat("en-US", options).format(value);
};

export const formatCompactCurrency = (value) => {
  if (!value) return "$0";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    compactDisplay: "short",
    maximumFractionDigits: 2,
  }).format(value);
};