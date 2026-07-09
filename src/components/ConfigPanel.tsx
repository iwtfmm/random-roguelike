import { X, SlidersHorizontal, Flag } from "lucide-react";
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
  const endingEnabled = useRollStore((s) => s.endingEnabled);
  const setEndingEnabled = useRollStore((s) => s.setEndingEnabled);

  return (
    <aside
      className={cn(
        "fixed inset-0 z-40 flex h-full w-full flex-col bg-abyss transition-transform duration-300",
        open ? "translate-x-0" : "pointer-events-none translate-x-full",
      )}
    >
      <header className="border-b border-edge">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-4">
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
        </div>
      </header>

      <div className="scroll-thin flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-5 py-4">
          {/* 第一部分：元素开关（关闭则对应界面不显示） */}
          <section className="mb-6">
            <div className="mb-3 flex items-center gap-2 font-mono text-[11px] tracking-widest text-muted">
              <span className="h-px w-5 bg-edge" />
              参与随机的元素
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
                  </div>
                );
              })}

              {/* 随机结局开关 */}
              <div className="border border-edge bg-panel/50 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flag className="h-3.5 w-3.5 text-amber" />
                    <span className="font-display text-sm font-bold text-chalk">
                      随机结局
                    </span>
                    <span className="font-mono text-[10px] text-muted">ENDING</span>
                  </div>
                  <button
                    onClick={() => setEndingEnabled(!endingEnabled)}
                    className={cn(
                      "relative h-6 w-12 rounded-full border transition-colors",
                      endingEnabled
                        ? "border-amber bg-amber/30"
                        : "border-edge bg-abyss",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 h-4 w-4 rounded-full transition-all",
                        endingEnabled ? "left-7 bg-amber" : "left-0.5 bg-muted",
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* 第二部分：每主题随机池配置 */}
          <section>
            <div className="mb-3 flex items-center gap-2 font-mono text-[11px] tracking-widest text-muted">
              <span className="h-px w-5 bg-edge" />
              每主题随机池
            </div>
            <div className="space-y-2">
              {THEMES.map((t) => (
                <ThemeConfigSection key={t.id} theme={t} />
              ))}
            </div>
          </section>
        </div>
      </div>

      <footer className="border-t border-edge">
        <div className="mx-auto w-full max-w-3xl px-5 py-3">
          <button
            onClick={() => toggle(false)}
            className="w-full border border-amber/50 bg-amber/10 py-2 font-mono text-xs text-amber transition-colors hover:bg-amber/20"
          >
            完成配置
          </button>
        </div>
      </footer>
    </aside>
  );
}
