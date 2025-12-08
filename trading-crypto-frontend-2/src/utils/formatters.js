// src/utils/formatters.js

export const formatPrice = (value) => {
  if (value === undefined || value === null) return "$0.00";
  
  const val = parseFloat(value);
  const options = { style: "currency", currency: "USD" };

  if (val === 0) {
      options.minimumFractionDigits = 2;
      options.maximumFractionDigits = 2;
  } 
  // 🔥 CASE 1: Coin siêu nhỏ (VD: BTTC 0.0000004)
  else if (val < 0.000001) {
      options.minimumFractionDigits = 2;
      options.maximumFractionDigits = 10; 
  } 
  // 🔥 CASE 2: Coin rất nhỏ (VD: SHIB 0.00002)
  else if (val < 0.001) {
      options.minimumFractionDigits = 2;
      options.maximumFractionDigits = 8;
  } 
  // 🔥 CASE 3: Coin nhỏ (VD: DOGE 0.15)
  else if (val < 1) {
      options.minimumFractionDigits = 2;
      options.maximumFractionDigits = 6;
  } 
  // 🔥 CASE 4: Coin bình thường (VD: BTC 60000)
  else {
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