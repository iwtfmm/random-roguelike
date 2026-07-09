import { useState } from "react";
import { ChevronDown, RotateCcw } from "lucide-react";
import type { Theme, ThemeConfig } from "@/types";
import { useRollStore } from "@/store/useRollStore";
import { cn } from "@/lib/utils";

interface Props {
  theme: Theme;
}

// 单个主题的随机池配置：难度范围 + 分队多选 + 招募多选
export default function ThemeConfigSection({ theme }: Props) {
  const config = useRollStore((s) => s.configs[theme.id]);
  const update = useRollStore((s) => s.updateThemeConfig);
  const reset = useRollStore((s) => s.resetThemeConfig);
  const [open, setOpen] = useState(false);

  const cfg: ThemeConfig =
    config ?? {
      themeId: theme.id,
      difficultyMin: 0,
      difficultyMax: theme.difficultyMax,
      enabledSquads: [...theme.squads],
      enabledRecruitments: [...theme.recruitments],
      enabledEndings: theme.endings.map((e) => e.index),
    };

  // 分队多选切换
  const toggleSquad = (squad: string) => {
    const exists = cfg.enabledSquads.includes(squad);
    const next = exists
      ? cfg.enabledSquads.filter((s) => s !== squad)
      : [...cfg.enabledSquads, squad];
    update(theme.id, { enabledSquads: next });
  };
  const toggleRecruitment = (rec: string) => {
    const exists = cfg.enabledRecruitments.includes(rec);
    const next = exists
      ? cfg.enabledRecruitments.filter((r) => r !== rec)
      : [...cfg.enabledRecruitments, rec];
    update(theme.id, { enabledRecruitments: next });
  };
  const toggleEnding = (idx: number) => {
    const exists = cfg.enabledEndings.includes(idx);
    const next = exists
      ? cfg.enabledEndings.filter((i) => i !== idx)
      : [...cfg.enabledEndings, idx];
    update(theme.id, { enabledEndings: next });
  };

  return (
    <div className="border border-edge bg-panel/40">
      {/* 折叠头部 */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-3 py-2.5 text-left transition-colors hover:bg-panel2/60"
      >
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-[10px] tracking-widest"
            style={{ color: theme.accent }}
          >
            {theme.index}
          </span>
          <span className="font-display text-sm font-bold text-chalk">
            {theme.name}
          </span>
          <span className="font-mono text-[10px] text-muted">
            难度 {cfg.difficultyMin}~{cfg.difficultyMax} · 分队 {cfg.enabledSquads.length}/{theme.squads.length} · 招募 {cfg.enabledRecruitments.length}/{theme.recruitments.length} · 结局 {cfg.enabledEndings.length}/{theme.endings.length}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {/* 展开内容 */}
      {open && (
        <div className="space-y-4 border-t border-edge px-3 py-3">
          {/* 难度范围 */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[11px] tracking-wider text-muted">
                难度范围 · {theme.difficultyLabel}
              </span>
              <span className="font-mono text-[11px]" style={{ color: theme.accent }}>
                {cfg.difficultyMin} ~ {cfg.difficultyMax} / {theme.difficultyMax}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 font-mono text-[11px] text-muted">
                下限
                <input
                  type="number"
                  min={0}
                  max={cfg.difficultyMax}
                  value={cfg.difficultyMin}
                  onChange={(e) => {
                    const raw = Number(e.target.value);
                    // 输入为空或非法时回退到 0
                    const v = Number.isFinite(raw)
                      ? Math.max(0, Math.min(raw, cfg.difficultyMax))
                      : 0;
                    update(theme.id, { difficultyMin: v });
                  }}
                  className="w-14 border border-edge bg-abyss px-1.5 py-1 text-chalk outline-none focus:border-amber"
                />
              </label>
              <label className="flex items-center gap-1.5 font-mono text-[11px] text-muted">
                上限
                <input
                  type="number"
                  min={cfg.difficultyMin}
                  max={theme.difficultyMax}
                  value={cfg.difficultyMax}
                  onChange={(e) => {
                    const raw = Number(e.target.value);
                    // 输入为空或非法时回退到当前下限
                    const v = Number.isFinite(raw)
                      ? Math.max(cfg.difficultyMin, Math.min(raw, theme.difficultyMax))
                      : cfg.difficultyMin;
                    update(theme.id, { difficultyMax: v });
                  }}
                  className="w-14 border border-edge bg-abyss px-1.5 py-1 text-chalk outline-none focus:border-amber"
                />
              </label>
            </div>
          </div>

          {/* 分队多选 */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[11px] tracking-wider text-muted">
                参与随机的分队
              </span>
              <button
                onClick={() =>
                  update(theme.id, {
                    enabledSquads:
                      cfg.enabledSquads.length === theme.squads.length
                        ? []
                        : [...theme.squads],
                  })
                }
                className="font-mono text-[10px] text-amber/80 hover:text-amber"
              >
                {cfg.enabledSquads.length === theme.squads.length ? "全不选" : "全选"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 md:grid-cols-3">
              {theme.squads.map((squad) => {
                const on = cfg.enabledSquads.includes(squad);
                return (
                  <button
                    key={squad}
                    onClick={() => toggleSquad(squad)}
                    className={cn(
                      "border px-2 py-1 text-left font-sans text-[11px] transition-all",
                      on
                        ? "border-transparent text-void"
                        : "border-edge text-muted hover:border-amber/40",
                    )}
                    style={on ? { background: theme.accent } : undefined}
                  >
                    {squad}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 招募多选 */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[11px] tracking-wider text-muted">
                参与随机的招募组合
              </span>
              <button
                onClick={() =>
                  update(theme.id, {
                    enabledRecruitments:
                      cfg.enabledRecruitments.length === theme.recruitments.length
                        ? []
                        : [...theme.recruitments],
                  })
                }
                className="font-mono text-[10px] text-amber/80 hover:text-amber"
              >
                {cfg.enabledRecruitments.length === theme.recruitments.length ? "全不选" : "全选"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5 md:grid-cols-3">
              {theme.recruitments.map((rec) => {
                const on = cfg.enabledRecruitments.includes(rec);
                return (
                  <button
                    key={rec}
                    onClick={() => toggleRecruitment(rec)}
                    className={cn(
                      "border px-2 py-1 text-left font-sans text-[11px] transition-all",
                      on
                        ? "border-transparent text-void"
                        : "border-edge text-muted hover:border-amber/40",
                    )}
                    style={on ? { background: theme.accent } : undefined}
                  >
                    {rec}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 结局多选 */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="font-mono text-[11px] tracking-wider text-muted">
                参与随机的结局
              </span>
              <button
                onClick={() =>
                  update(theme.id, {
                    enabledEndings:
                      cfg.enabledEndings.length === theme.endings.length
                        ? []
                        : theme.endings.map((e) => e.index),
                  })
                }
                className="font-mono text-[10px] text-amber/80 hover:text-amber"
              >
                {cfg.enabledEndings.length === theme.endings.length ? "全不选" : "全选"}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {theme.endings.map((ending) => {
                const on = cfg.enabledEndings.includes(ending.index);
                // 显示互斥信息
                const groupLabel = ending.exclusiveGroup
                  ? ending.exclusiveGroup === "A"
                    ? "1/2 必选"
                    : "3/4互斥"
                  : "独立";
                return (
                  <button
                    key={ending.index}
                    onClick={() => toggleEnding(ending.index)}
                    className={cn(
                      "border px-2 py-1.5 text-left transition-all",
                      on
                        ? "border-transparent text-void"
                        : "border-edge text-muted hover:border-amber/40",
                    )}
                    style={on ? { background: theme.accent } : undefined}
                  >
                    <div className="font-sans text-[11px] font-bold">
                      {ending.index}. {ending.name}
                    </div>
                    <div className="font-mono text-[8px] tracking-wider opacity-70">
                      {groupLabel}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 重置 */}
          <button
            onClick={() => reset(theme.id)}
            className="flex items-center gap-1.5 font-mono text-[10px] text-muted transition-colors hover:text-ember"
          >
            <RotateCcw className="h-3 w-3" />
            重置该主题配置
          </button>
        </div>
      )}
    </div>
  );
}
