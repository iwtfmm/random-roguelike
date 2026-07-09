import type { ReactNode } from "react";
import { Check, Lock } from "lucide-react";
import { useCyclingText } from "@/hooks/useCyclingText";
import { cn } from "@/lib/utils";

interface ResultSlotProps {
  label: string;
  sublabel: string;
  icon: ReactNode;
  isRolling: boolean;
  isLocked: boolean;
  displayValue: string;
  cyclingOptions: string[];
  accent: string;
  hasResult: boolean;
  // 是否为固定模式（该元素关闭随机，直接显示固定值）
  fixed?: boolean;
}

// 单个结果槽位：滚动时快速切换文字，锁定后高亮显示最终值
export default function ResultSlot({
  label,
  sublabel,
  icon,
  isRolling,
  isLocked,
  displayValue,
  cyclingOptions,
  accent,
  hasResult,
  fixed = false,
}: ResultSlotProps) {
  // 固定模式不参与滚动动画
  const cycling = useCyclingText(cyclingOptions, isRolling && !isLocked && !fixed);

  const showRolling = !fixed && isRolling && !isLocked;
  const showLocked = !fixed && isLocked && hasResult;
  const showFixed = fixed && hasResult;
  const showIdle = !hasResult && !isRolling;
  const active = showLocked || showFixed;

  // 固定模式使用更柔和的边框样式
  const accentStyle = fixed
    ? { borderColor: `${accent}55`, boxShadow: `inset 0 0 16px ${accent}0d` }
    : { borderColor: accent, boxShadow: `0 0 0 1px ${accent}55, 0 0 22px ${accent}2a, inset 0 0 18px ${accent}12` };

  return (
    <div
      className={cn(
        "clip-ark corner-bracket relative flex h-36 flex-col justify-between border bg-panel/70 p-4 transition-all duration-300",
        active ? "border-transparent" : "border-edge/70",
      )}
      style={{
        ...(active ? accentStyle : undefined),
        color: active ? accent : "#243040",
      }}
    >
      {/* 顶部断点装饰条 */}
      <span
        className="accent-bar"
        style={{ background: active ? accent : `${accent}40`, opacity: active ? 1 : 0.5 }}
      />

      {/* 顶部标签 */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span style={{ color: active ? accent : "#6b7785" }}>{icon}</span>
          <div className="leading-none">
            <div
              className="font-mono text-[9px] font-medium tracking-[0.2em] text-muted"
            >
              {sublabel}
            </div>
            <div
              className="mt-1 font-display text-xs font-bold tracking-wide"
              style={{ color: active ? "#e8e8e8" : "#a0a8b0" }}
            >
              {label}
            </div>
          </div>
        </div>
        {showLocked && (
          <span
            className="flex h-4 w-4 items-center justify-center"
            style={{ background: accent, color: "#070a0f" }}
          >
            <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
          </span>
        )}
        {showFixed && (
          <span className="flex items-center gap-1 border border-amber/40 px-1.5 py-0.5 font-mono text-[9px] font-medium tracking-wider text-amber">
            <Lock className="h-2.5 w-2.5" />
            FIXED
          </span>
        )}
      </div>

      {/* 数值显示区 */}
      <div className="slot-mask flex h-12 items-center justify-center overflow-hidden">
        {showIdle && (
          <span className="font-mono text-xs tracking-widest text-muted/50">
            —— 待部署 ——
          </span>
        )}
        {showRolling && (
          <span
            className="rolling-text text-center font-display text-lg font-bold tracking-tight"
            style={{ color: accent }}
          >
            {cycling}
          </span>
        )}
        {showLocked && (
          <span
            key={displayValue}
            className="animate-lock-in text-center font-display text-lg font-bold leading-tight tracking-tight"
            style={{ color: "#f5f5f5" }}
          >
            {displayValue}
          </span>
        )}
        {showFixed && (
          <span
            className="text-center font-display text-lg font-bold leading-tight tracking-tight"
            style={{ color: "#c8a45c" }}
          >
            {displayValue}
          </span>
        )}
      </div>

      {/* 底部数据条：刻度+进度 */}
      <div className="space-y-1">
        <div className="flex items-center justify-between font-mono text-[8px] tracking-wider text-muted/60">
          <span>{active ? "●" : "○"} LOCK</span>
          <span>{active ? "100%" : showRolling ? "ROLL" : "00%"}</span>
        </div>
        <div className="h-px w-full overflow-hidden bg-edge/40">
          <span
            className="block h-full transition-all duration-300"
            style={{
              width: active ? "100%" : showRolling ? "45%" : "0%",
              background: accent,
              opacity: active ? 1 : 0.5,
            }}
          />
        </div>
      </div>
    </div>
  );
}
