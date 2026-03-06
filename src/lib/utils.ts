import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}

export function numberToVietnameseWords(number: number): string {
  if (number === 0) return "Không đồng";

  const units = ["", " nghìn", " triệu", " tỷ", " nghìn tỷ", " triệu tỷ"];
  const digits = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"];

  function readThreeDigits(n: number, isLast: boolean): string {
    let res = "";
    const hundreds = Math.floor(n / 100);
    const tens = Math.floor((n % 100) / 10);
    const ones = n % 10;

    if (hundreds > 0 || !isLast) {
      res += digits[hundreds] + " trăm ";
    }

    if (tens > 0) {
      if (tens === 1) res += "mười ";
      else res += digits[tens] + " mươi ";
    } else if (hundreds > 0 && ones > 0) {
      res += "lẻ ";
    }

    if (ones > 0) {
      if (ones === 1 && tens > 1) res += "mốt";
      else if (ones === 5 && tens >= 1) res += "lăm";
      else res += digits[ones];
    } else if (tens === 0 && hundreds === 0 && !isLast) {
      // res remains empty
    }

    return res.trim();
  }

  let res = "";
  let unitIdx = 0;
  let n = Math.abs(number);

  while (n > 0) {
    const threeDigits = n % 1000;
    if (threeDigits > 0) {
      const s = readThreeDigits(threeDigits, n < 1000);
      res = s + units[unitIdx] + " " + res;
    }
    n = Math.floor(n / 1000);
    unitIdx++;
  }

  res = res.trim();
  return res.charAt(0).toUpperCase() + res.slice(1) + " đồng chẵn";
}
