import { useEffect, useRef, useState } from "react";

// 在 active 期间，按 interval 快速从 options 池中随机切换显示文本，模拟滚动抽签
export function useCyclingText(options: string[], active: boolean, interval = 65) {
  const [text, setText] = useState(options[0] ?? "—");
  const lastRef = useRef<string>("");

  useEffect(() => {
    if (!active || options.length === 0) return;
    const id = setInterval(() => {
      let idx = Math.floor(Math.random() * options.length);
      let next = options[idx];
      // 尽量避免连续重复，提升滚动观感
      if (next === lastRef.current && options.length > 1) {
        idx = (idx + 1) % options.length;
        next = options[idx];
      }
      lastRef.current = next;
      setText(next);
    }, interval);
    return () => clearInterval(id);
  }, [active, options, interval]);

  return text;
}
