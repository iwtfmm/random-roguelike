import { Compass, X } from "lucide-react";
import type { Theme } from "@/types";
import { THEMES } from "@/data/themes";
import { useRollStore } from "@/store/useRollStore";
import { cn } from "@/lib/utils";

// 主题选择区：点击可固定多个主题，从固定池中随机抽取
export default function ThemeSelector() {
  const pinnedThemes = useRollStore((s) => s.pinnedThemes);
  const toggleThemePin = useRollStore((s) => s.toggleThemePin);
  const clearPinnedThemes = useRollStore((s) => s.clearPinnedThemes);
  const isRolling = useRollStore((s) => s.isRolling);

  const pinnedCount = pinnedThemes.length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-mono text-[11px] tracking-widest text-muted">
          <span className="diamond bg-amber/70" />
          <span>SELECT // 主题池（可多选）</span>
        </div>
        {pinnedCount > 0 && (
          <button
            onClick={clearPinnedThemes}
            disabled={isRolling}
            className="flex items-center gap-1 font-mono text-[10px] tracking-wider text-muted transition-colors hover:text-ember disabled:opacity-50"
          >
            <X className="h-3 w-3" />
            CLEAR [{pinnedCount}]
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 lg:grid-cols-5">
        {THEMES.map((t: Theme) => {
          const active = pinnedThemes.some((p) => p.id === t.id);
          return (
            <button
              key={t.id}
              disabled={isRolling}
              onClick={() => toggleThemePin(t)}
              className={cn(
                "clip-ark corner-bracket group relative overflow-hidden border bg-panel/70 p-3 text-left transition-all",
                "hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60",
                active ? "border-transparent" : "border-edge/70 hover:border-amber/50",
              )}
              style={{
                ...(active
                  ? {
                      borderColor: t.accent,
                      boxShadow: `0 0 0 1px ${t.accent}, 0 0 20px ${t.accentSoft}, inset 0 0 26px ${t.accentSoft}`,
                    }
                  : {}),
                color: active ? t.accent : "#243040",
              }}
            >
              {/* 顶部断点装饰条 */}
              <span
                className="accent-bar"
                style={{ background: active ? t.accent : `${t.accent}40` }}
              />
              <div className="mb-2 flex items-center justify-between">
                <span
                  className="font-mono text-[9px] font-bold tracking-[0.2em]"
                  style={{ color: t.accent }}
                >
                  {t.index}
                </span>
                {active ? (
                  <span
                    className="flex h-4 w-4 items-center justify-center font-mono text-[9px] font-bold"
                    style={{ background: t.accent, color: "#070a0f" }}
                  >
                    ✓
                  </span>
                ) : (
                  <Compass className="h-3.5 w-3.5 text-muted" />
                )}
              </div>
              <h3 className="font-display text-sm font-bold leading-tight tracking-wide text-chalk">
                {t.name}
              </h3>
              <p className="mt-1 text-[10px] leading-snug text-muted/80 line-clamp-1">
                {t.tagline}
              </p>
              <div className="mt-2 flex items-center gap-1.5 font-mono text-[9px] tracking-wider text-muted">
                <span style={{ color: active ? t.accent : "#6b7785" }}>
                  {t.difficultyLabel}·0~{t.difficultyMax}
                </span>
                <span className="text-edge">/</span>
                <span>{t.squads.length}SQ</span>
              </div>
            </button>
          );
        })}
      </div>
      {pinnedCount > 0 && (
        <div className="mt-3 flex items-center gap-1.5 font-mono text-[10px] tracking-wider text-amber/80">
          <span className="diamond bg-amber" />
          POOL LOCKED // 已固定 {pinnedCount} 个主题，从中随机
        </div>
      )}
    </div>
  );
}
