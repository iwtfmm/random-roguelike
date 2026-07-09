import { X, SlidersHorizontal, Lock } from "lucide-react";
import type { ElementKey } from "@/types";
import { THEMES } from "@/data/themes";
import { useRollStore } from "@/store/useRollStore";
import { cn } from "@/lib/utils";
import ThemeConfigSection from "@/components/ThemeConfigSection";

// 元素元信息
const ELEMENTS: { key: ElementKey; label: string; sub: string }[] = [
  { key: "theme", label: "主题", sub: "THEME" },
  { key: "difficulty", label: "难度", sub: "DIFFICULTY" },
  { key: "squad", label: "分队", sub: "SQUAD" },
  { key: "recruitment", label: "招募组合", sub: "RECRUIT" },
];

export default function ConfigPanel() {
  const open = useRollStore((s) => s.configOpen);
  const toggle = useRollStore((s) => s.toggleConfig);

  const toggles = useRollStore((s) => s.toggles);
  const setElementToggle = useRollStore((s) => s.setElementToggle);
  const fixed = useRollStore((s) => s.fixedValues);
  const setFixedTheme = useRollStore((s) => s.setFixedTheme);
  const setFixedDifficulty = useRollStore((s) => s.setFixedDifficulty);
  const setFixedSquad = useRollStore((s) => s.setFixedSquad);
  const setFixedRecruitment = useRollStore((s) => s.setFixedRecruitment);

  return (
    <>
      {/* 遮罩 */}
      <div
        className={cn(
          "fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => toggle(false)}
      />
      {/* 抽屉 */}
      <aside
        className={cn(
          "clip-corner fixed right-0 top-0 z-40 flex h-full w-full max-w-lg flex-col border-l border-edge bg-abyss/95 transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center justify-between border-b border-edge px-5 py-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-amber" />
            <h2 className="font-display text-base font-bold text-chalk">随机配置</h2>
          </div>
          <button
            onClick={() => toggle(false)}
            className="rounded p-1 text-muted transition-colors hover:bg-panel2 hover:text-chalk"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="scroll-thin flex-1 overflow-y-auto px-5 py-4">
          {/* 第一部分：元素开关 + 固定值 */}
          <section className="mb-6">
            <div className="mb-3 flex items-center gap-2 font-mono text-[11px] tracking-widest text-muted">
              <span className="h-px w-5 bg-edge" />
              参与随机的元素（关闭则使用固定值）
            </div>
            <div className="space-y-2">
              {ELEMENTS.map(({ key, label, sub }) => {
                const on = toggles[key];
                return (
                  <div
                    key={key}
                    className="border border-edge bg-panel/50 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-sm font-bold text-chalk">
                          {label}
                        </span>
                        <span className="font-mono text-[10px] text-muted">{sub}</span>
                      </div>
                      {/* 开关 */}
                      <button
                        onClick={() => setElementToggle(key, !on)}
                        className={cn(
                          "relative h-6 w-12 rounded-full border transition-colors",
                          on
                            ? "border-amber bg-amber/30"
                            : "border-edge bg-abyss",
                        )}
                      >
                        <span
                          className={cn(
                            "absolute top-0.5 h-4 w-4 rounded-full transition-all",
                            on ? "left-7 bg-amber" : "left-0.5 bg-muted",
                          )}
                        />
                      </button>
                    </div>

                    {/* 关闭随机时显示固定值选择器 */}
                    {!on && (
                      <div className="mt-3 flex items-start gap-2 border-t border-edge/60 pt-3">
                        <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber" />
                        <div className="flex-1">
                          {key === "theme" && (
                            <select
                              value={fixed.theme.id}
                              onChange={(e) => {
                                const t = THEMES.find((x) => x.id === e.target.value);
                                if (t) setFixedTheme(t);
                              }}
                              className="w-full border border-edge bg-abyss px-2 py-1.5 font-sans text-xs text-chalk outline-none focus:border-amber"
                            >
                              {THEMES.map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.name}
                                </option>
                              ))}
                            </select>
                          )}
                          {key === "difficulty" && (
                            <div className="flex items-center gap-2 font-mono text-xs text-chalk">
                              <span>{fixed.theme.difficultyLabel}·</span>
                              <input
                                type="number"
                                min={0}
                                max={fixed.theme.difficultyMax}
                                value={fixed.difficulty}
                                onChange={(e) =>
                                  setFixedDifficulty(Number(e.target.value))
                                }
                                className="w-16 border border-edge bg-abyss px-1.5 py-1 outline-none focus:border-amber"
                              />
                              <span className="text-muted">
                                / {fixed.theme.difficultyMax}
                              </span>
                            </div>
                          )}
                          {key === "squad" && (
                            <select
                              value={fixed.squad}
                              onChange={(e) => setFixedSquad(e.target.value)}
                              className="w-full border border-edge bg-abyss px-2 py-1.5 font-sans text-xs text-chalk outline-none focus:border-amber"
                            >
                              {fixed.theme.squads.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          )}
                          {key === "recruitment" && (
                            <select
                              value={fixed.recruitment}
                              onChange={(e) => setFixedRecruitment(e.target.value)}
                              className="w-full border border-edge bg-abyss px-2 py-1.5 font-sans text-xs text-chalk outline-none focus:border-amber"
                            >
                              {fixed.theme.recruitments.map((r) => (
                                <option key={r} value={r}>
                                  {r}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="mt-2 font-mono text-[10px] text-muted">
              至少保留一个元素参与随机。固定值仅在对应元素关闭随机时生效。
            </p>
          </section>

          {/* 第二部分：每主题随机池配置 */}
          <section>
            <div className="mb-3 flex items-center gap-2 font-mono text-[11px] tracking-widest text-muted">
              <span className="h-px w-5 bg-edge" />
              每主题随机池（难度范围 / 分队 / 招募）
            </div>
            <div className="space-y-2">
              {THEMES.map((t) => (
                <ThemeConfigSection key={t.id} theme={t} />
              ))}
            </div>
            <p className="mt-3 font-mono text-[10px] text-muted">
              展开某主题可限定其难度上下限，并勾选参与随机的分队与招募组合。抽中该主题时按此池随机。
            </p>
          </section>
        </div>

        <footer className="border-t border-edge px-5 py-3">
          <button
            onClick={() => toggle(false)}
            className="w-full border border-amber/50 bg-amber/10 py-2 font-mono text-xs text-amber transition-colors hover:bg-amber/20"
          >
            完成配置
          </button>
        </footer>
      </aside>
    </>
  );
}
