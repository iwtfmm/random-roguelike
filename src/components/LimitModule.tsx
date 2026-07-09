import { Ban, Check, Lock, Skull, Dices, RotateCw, SlidersHorizontal } from "lucide-react";
import { PROFESSIONS } from "@/types";
import { useCyclingText } from "@/hooks/useCyclingText";
import { useRollStore } from "@/store/useRollStore";
import { cn } from "@/lib/utils";

interface LimitModuleProps {
  accent: string;
}

// 自限模块：独立于主模块，有自己的配置入口与随机按钮
export default function LimitModule({ accent }: LimitModuleProps) {
  const limitConfig = useRollStore((s) => s.limitConfig);
  const limitResult = useRollStore((s) => s.limitResult);
  const isLimitRolling = useRollStore((s) => s.isLimitRolling);
  const rollLimit = useRollStore((s) => s.rollLimit);
  const toggleLimitConfig = useRollStore((s) => s.toggleLimitConfig);

  const hasResult = !!limitResult;

  // 滚动阶段候选文字池：从配置池中循环
  const cycling = useCyclingText(
    limitConfig.pool as string[],
    isLimitRolling && limitConfig.enabled,
  );

  const enabled = limitConfig.enabled;
  const showRolling = enabled && isLimitRolling;
  const showLocked = enabled && hasResult && !isLimitRolling;
  const showIdle = enabled && !hasResult && !isLimitRolling;
  const showDisabled = !enabled;

  const active = showLocked;
  const accentStyle = active
    ? {
        borderColor: accent,
        boxShadow: `0 0 0 1px ${accent}55, 0 0 22px ${accent}2a, inset 0 0 18px ${accent}12`,
      }
    : undefined;

  return (
    <div className="space-y-3">
      {/* 展示卡 */}
      <div
        className={cn(
          "clip-ark corner-bracket relative flex flex-col border bg-panel/70 p-4 transition-all duration-300",
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
          style={{
            background: active ? accent : `${accent}40`,
            opacity: active ? 1 : 0.5,
          }}
        />

        {/* 顶部标签栏 */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span style={{ color: active ? accent : "#6b7785" }}>
              <Ban className="h-4 w-4" />
            </span>
            <div className="leading-none">
              <div className="font-mono text-[9px] font-medium tracking-[0.2em] text-muted">
                SELF LIMIT
              </div>
              <div
                className="mt-1 font-display text-xs font-bold tracking-wide"
                style={{ color: active ? "#e8e8e8" : "#a0a8b0" }}
              >
                自限模块
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* 启用状态徽标 */}
            <span
              className={cn(
                "border px-1.5 py-0.5 font-mono text-[9px] font-medium tracking-wider",
                enabled
                  ? "border-amber/40 text-amber"
                  : "border-edge text-muted",
              )}
            >
              {enabled ? "ON" : "OFF"}
            </span>
            {showLocked && (
              <span
                className="flex h-4 w-4 items-center justify-center"
                style={{ background: accent, color: "#070a0f" }}
              >
                <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
              </span>
            )}
            {showDisabled && (
              <span className="flex items-center gap-1 border border-edge px-1.5 py-0.5 font-mono text-[9px] font-medium tracking-wider text-muted">
                <Lock className="h-2.5 w-2.5" />
                DISABLED
              </span>
            )}
            {/* 配置入口按钮 */}
            <button
              onClick={() => toggleLimitConfig(true)}
              disabled={isLimitRolling}
              className="flex items-center gap-1 border border-edge/80 bg-panel/70 px-1.5 py-0.5 font-mono text-[9px] font-medium tracking-wider text-chalk transition-all hover:border-amber/60 hover:text-amber disabled:opacity-50"
              title="自限配置"
            >
              <SlidersHorizontal className="h-3 w-3" />
              CONFIG
            </button>
          </div>
        </div>

        {/* 主体展示区 */}
        <div className="slot-mask mt-3 flex min-h-[3.5rem] items-center justify-center overflow-hidden">
          {showDisabled && (
            <span className="font-mono text-xs tracking-widest text-muted/50">
              —— 未启用自限 ——
            </span>
          )}
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
              禁用 · {cycling}
            </span>
          )}
          {showLocked && limitResult && (
            <div className="flex w-full flex-wrap items-center justify-center gap-1.5">
              {limitResult.bannedProfessions.length === 0 ? (
                <span className="font-mono text-xs tracking-wider text-muted">
                  本次不禁用
                </span>
              ) : (
                limitResult.bannedProfessions.map((p) => (
                  <span
                    key={p}
                    className="animate-lock-in flex items-center gap-1 border px-2 py-1 font-display text-xs font-bold tracking-wide"
                    style={{
                      borderColor: accent,
                      color: "#f5f5f5",
                      background: `${accent}22`,
                    }}
                  >
                    <Skull className="h-3 w-3" style={{ color: accent }} />
                    <span className="line-through decoration-2">{p}</span>
                  </span>
                ))
              )}
            </div>
          )}
        </div>

        {/* 底部数据条 */}
        <div className="mt-3 space-y-1">
          <div className="flex items-center justify-between font-mono text-[8px] tracking-wider text-muted/60">
            <span>
              {active ? "●" : "○"} BAN{" "}
              <span className="text-muted/80">
                {showLocked && limitResult
                  ? `${limitResult.bannedProfessions.length}`
                  : "0"}
              </span>
            </span>
            <span>
              POOL {limitConfig.pool.length}/{PROFESSIONS.length} ·{" "}
              {limitConfig.minBans}~{limitConfig.maxBans}
            </span>
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

      {/* 独立控制台：随机禁用按钮 */}
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={rollLimit}
          disabled={!enabled || isLimitRolling}
          className={cn(
            "clip-corner group relative flex items-center gap-3 border-2 px-10 py-3 font-display text-base font-bold tracking-wider transition-all",
            "disabled:cursor-not-allowed",
            !enabled
              ? "border-edge bg-panel text-muted"
              : isLimitRolling
                ? "border-edge bg-panel text-muted"
                : "border-amber bg-gradient-to-r from-amber/20 to-amber/5 text-amber hover:scale-105",
          )}
        >
          {isLimitRolling ? (
            <>
              <RotateCw className="h-4 w-4 animate-spin" />
              禁用中…
            </>
          ) : (
            <>
              <Dices className="h-4 w-4" />
              {hasResult ? "重新禁用" : "随机禁用"}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
