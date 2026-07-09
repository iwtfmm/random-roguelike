import { X, Ban } from "lucide-react";
import { PROFESSIONS } from "@/types";
import type { Profession } from "@/types";
import { useRollStore } from "@/store/useRollStore";
import { cn } from "@/lib/utils";

// 自限模块独立配置抽屉：与主配置分开
export default function LimitConfigPanel() {
  const open = useRollStore((s) => s.limitConfigOpen);
  const toggle = useRollStore((s) => s.toggleLimitConfig);

  const limitConfig = useRollStore((s) => s.limitConfig);
  const setLimitEnabled = useRollStore((s) => s.setLimitEnabled);
  const setLimitMinBans = useRollStore((s) => s.setLimitMinBans);
  const setLimitMaxBans = useRollStore((s) => s.setLimitMaxBans);
  const toggleLimitProfession = useRollStore((s) => s.toggleLimitProfession);

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
          "clip-corner fixed right-0 top-0 z-40 flex h-full w-full max-w-md flex-col border-l border-edge bg-abyss/95 transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <header className="flex items-center justify-between border-b border-edge px-5 py-4">
          <div className="flex items-center gap-2">
            <Ban className="h-4 w-4 text-amber" />
            <h2 className="font-display text-base font-bold text-chalk">自限配置</h2>
            <span className="font-mono text-[10px] tracking-widest text-muted">
              SELF LIMIT
            </span>
          </div>
          <button
            onClick={() => toggle(false)}
            className="rounded p-1 text-muted transition-colors hover:bg-panel2 hover:text-chalk"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="scroll-thin flex-1 overflow-y-auto px-5 py-4">
          {/* 启用开关 */}
          <section className="mb-6">
            <div className="mb-3 flex items-center gap-2 font-mono text-[11px] tracking-widest text-muted">
              <span className="h-px w-5 bg-edge" />
              启用自限
            </div>
            <div className="border border-edge bg-panel/50 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Ban className="h-3.5 w-3.5 text-amber" />
                  <span className="font-display text-sm font-bold text-chalk">
                    {limitConfig.enabled ? "已启用" : "未启用"}
                  </span>
                </div>
                <button
                  onClick={() => setLimitEnabled(!limitConfig.enabled)}
                  className={cn(
                    "relative h-6 w-12 rounded-full border transition-colors",
                    limitConfig.enabled
                      ? "border-amber bg-amber/30"
                      : "border-edge bg-abyss",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-4 w-4 rounded-full transition-all",
                      limitConfig.enabled
                        ? "left-7 bg-amber"
                        : "left-0.5 bg-muted",
                    )}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* 禁用数量区间 */}
          <section className="mb-6">
            <div className="mb-3 flex items-center gap-2 font-mono text-[11px] tracking-widest text-muted">
              <span className="h-px w-5 bg-edge" />
              禁用数量区间
            </div>
            <div
              className={cn(
                "border border-edge bg-panel/50 p-3 transition-opacity",
                !limitConfig.enabled && "pointer-events-none opacity-40",
              )}
            >
              <div className="flex items-center gap-2 font-mono text-xs text-chalk">
                <span className="text-muted">禁用</span>
                <input
                  type="number"
                  min={1}
                  max={limitConfig.pool.length}
                  value={limitConfig.minBans}
                  onChange={(e) => setLimitMinBans(Number(e.target.value))}
                  className="w-14 border border-edge bg-abyss px-1.5 py-1 text-center outline-none focus:border-amber"
                />
                <span className="text-muted">~</span>
                <input
                  type="number"
                  min={1}
                  max={limitConfig.pool.length}
                  value={limitConfig.maxBans}
                  onChange={(e) => setLimitMaxBans(Number(e.target.value))}
                  className="w-14 border border-edge bg-abyss px-1.5 py-1 text-center outline-none focus:border-amber"
                />
                <span className="text-muted">个职业</span>
              </div>
            </div>
          </section>

          {/* 可被禁用的职业池 */}
          <section>
            <div className="mb-3 flex items-center gap-2 font-mono text-[11px] tracking-widest text-muted">
              <span className="h-px w-5 bg-edge" />
              可被禁用的职业池
            </div>
            <div
              className={cn(
                "border border-edge bg-panel/50 p-3 transition-opacity",
                !limitConfig.enabled && "pointer-events-none opacity-40",
              )}
            >
              <div className="mb-3 font-mono text-[10px] tracking-wider text-muted">
                已选 {limitConfig.pool.length}/{PROFESSIONS.length}
              </div>
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {PROFESSIONS.map((p) => {
                  const on = limitConfig.pool.includes(p as Profession);
                  return (
                    <button
                      key={p}
                      onClick={() => toggleLimitProfession(p as Profession)}
                      className={cn(
                        "border px-2 py-2 font-display text-xs font-bold tracking-wide transition-colors",
                        on
                          ? "border-amber bg-amber/20 text-amber"
                          : "border-edge bg-abyss text-muted hover:border-edge/80",
                      )}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
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
