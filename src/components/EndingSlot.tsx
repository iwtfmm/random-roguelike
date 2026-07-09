import { Flag, Check } from "lucide-react";
import type { Ending } from "@/types";
import { useCyclingText } from "@/hooks/useCyclingText";
import { cn } from "@/lib/utils";

interface EndingSlotProps {
  isRolling: boolean;
  isLocked: boolean;
  endings: Ending[];
  cyclingOptions: string[];
  accent: string;
  hasResult: boolean;
}

// 随机结局槽位：展示结局链（可连打），滚动时快速切换文字
export default function EndingSlot({
  isRolling,
  isLocked,
  endings,
  cyclingOptions,
  accent,
  hasResult,
}: EndingSlotProps) {
  const cycling = useCyclingText(cyclingOptions, isRolling && !isLocked);

  const showRolling = isRolling && !isLocked;
  const showLocked = isLocked && hasResult;
  const showIdle = !hasResult && !isRolling;
  const active = showLocked;

  const accentStyle = active
    ? {
        borderColor: accent,
        boxShadow: `0 0 0 1px ${accent}55, 0 0 22px ${accent}2a, inset 0 0 18px ${accent}12`,
      }
    : undefined;

  return (
    <div
      className={cn(
        "clip-ark corner-bracket relative flex min-h-[8rem] flex-col justify-between border bg-panel/70 p-4 transition-all duration-300",
        active ? "border-transparent" : "border-edge/70",
      )}
      style={{
        ...accentStyle,
        color: active ? accent : "#6b7785",
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
          <span style={{ color: active ? accent : "#6b7785" }}>
            <Flag className="h-4 w-4" />
          </span>
          <div className="leading-none">
            <div className="font-mono text-[9px] font-medium tracking-[0.2em] text-muted">
              ENDING
            </div>
            <div
              className="mt-1 font-display text-xs font-bold tracking-wide"
              style={{ color: active ? "#e8e8e8" : "#a0a8b0" }}
            >
              随机结局
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showLocked && endings.length > 0 && (
            <>
              <span className="font-mono text-[9px] text-muted">
                ×{endings.length}
              </span>
              <span
                className="flex h-4 w-4 items-center justify-center"
                style={{ background: accent, color: "#070a0f" }}
              >
                <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
              </span>
            </>
          )}
        </div>
      </div>

      {/* 数值显示区 */}
      <div className="slot-mask flex min-h-[3rem] items-center justify-center overflow-hidden py-2">
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
          <div className="flex w-full flex-wrap items-center justify-center gap-1.5">
            {endings.length === 0 ? (
              <span className="font-mono text-xs tracking-wider text-muted">
                本次无结局
              </span>
            ) : (
              endings.map((e, i) => (
                <span key={e.index} className="flex items-center gap-1.5">
                  <span
                    className="animate-lock-in border px-2 py-0.5 font-display text-xs font-bold tracking-wide"
                    style={{
                      borderColor: accent,
                      color: "#f5f5f5",
                      background: `${accent}22`,
                    }}
                  >
                    {e.index}. {e.name}
                  </span>
                  {i < endings.length - 1 && (
                    <span style={{ color: accent }} className="font-mono text-xs">
                      →
                    </span>
                  )}
                </span>
              ))
            )}
          </div>
        )}
      </div>

      {/* 底部数据条 */}
      <div className="space-y-1">
        <div className="flex items-center justify-between font-mono text-[8px] tracking-wider text-muted/60">
          <span>{active ? "●" : "○"} CHAIN</span>
          <span>{active ? `${endings.length} ENDING(S)` : showRolling ? "ROLL" : "00%"}</span>
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
