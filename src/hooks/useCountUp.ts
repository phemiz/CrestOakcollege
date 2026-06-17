import { useState, useEffect } from "react";

export const useCountUp = (value: string, duration: number = 1500) => {
  const [count, setCount] = useState(0);
  const target = parseInt(value.replace(/[^0-9]/g, ""), 10);
  const isPercent = value.includes("%");
  const isPlus = value.includes("+");

  useEffect(() => {
    let start = 0;
    const totalSteps = duration / 16;
    const increment = target / totalSteps;
    
    if (isNaN(target)) {
      return;
    }

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  const formattedValue = `${count}${isPlus ? "+" : ""}${isPercent ? "%" : ""}`;

  return formattedValue;
};
