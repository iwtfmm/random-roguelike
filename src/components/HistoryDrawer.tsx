import { X, History, Trash2 } from "lucide-react";
import { useRollStore } from "@/store/useRollStore";
import { cn } from "@/lib/utils";

// 历史记录抽屉：从右侧滑出，倒序展示历次抽签结果
export default function HistoryDrawer() {
  const open = useRollStore((s) => s.historyOpen);
  const history = useRollStore((s) => s.history);
  const toggle = useRollStore((s) => s.toggleHistory);
  const clear = useRollStore((s) => s.clearHistory);

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
            <History className="h-4 w-4 text-amber" />
            <h2 className="font-display text-base font-bold text-chalk">
              抽签记录
            </h2>
            <span className="font-mono text-xs text-muted">
              [{history.length}]
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
          {history.length === 0 ? (
            <div className="mt-20 text-center font-mono text-sm text-muted">
              暂无记录 · 开始你的第一次抽签
            </div>
          ) : (
            <ul className="space-y-3">
              {history.map((r, i) => (
                <li
                  key={`${r.rolledAt}-${i}`}
                  className="clip-corner animate-rise border bg-panel/60 p-3"
                  style={{ borderColor: `${r.theme.accent}44` }}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span
                      className="font-mono text-[10px] tracking-widest"
                      style={{ color: r.theme.accent }}
                    >
                      {r.theme.index}
                    </span>
                    <span className="font-mono text-[10px] text-muted">
                      {new Date(r.rolledAt).toLocaleTimeString("zh-CN")}
                    </span>
                  </div>
                  <h3
                    className="font-display text-sm font-bold"
                    style={{ color: r.theme.accent }}
                  >
                    {r.theme.name}
                  </h3>
                  <div className="mt-2 grid grid-cols-3 gap-2 font-mono text-[11px]">
                    <div>
                      <div className="text-muted">难度</div>
                      <div className="text-chalk">
                        {r.theme.difficultyLabel}·{r.difficulty}
                      </div>
                    </div>
                    <div>
                      <div className="text-muted">分队</div>
                      <div className="text-chalk">{r.squad}</div>
                    </div>
                    <div>
                      <div className="text-muted">招募</div>
                      <div className="text-chalk">{r.recruitment}</div>
                    </div>
                  </div>
                  {r.endings.length > 0 && (
                    <div className="mt-2 border-t border-edge/40 pt-2">
                      <div className="mb-1 font-mono text-[10px] text-muted">结局</div>
                      <div className="flex flex-wrap items-center gap-1">
                        {r.endings.map((e, i) => (
                          <span key={e.index} className="flex items-center gap-1">
                            <span
                              className="border px-1.5 py-0.5 font-display text-[10px] font-bold"
                              style={{
                                borderColor: `${r.theme.accent}88`,
                                color: "#e8e8e8",
                                background: `${r.theme.accent}1a`,
                              }}
                            >
                              {e.index}. {e.name}
                            </span>
                            {i < r.endings.length - 1 && (
                              <span style={{ color: r.theme.accent }} className="text-[10px]">→</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {history.length > 0 && (
          <footer className="border-t border-edge px-5 py-3">
            <button
              onClick={clear}
              className="flex w-full items-center justify-center gap-2 border border-ember/50 py-2 font-mono text-xs text-ember transition-colors hover:bg-ember/10"
            >
              <Trash2 className="h-3.5 w-3.5" />
              清空记录
            </button>
          </footer>
        )}
      </aside>
    </>
  );
}
