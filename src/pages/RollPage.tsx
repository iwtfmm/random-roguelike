import {
  Dices,
  History,
  MapPinned,
  Gauge,
  Users,
  Sparkles,
  RotateCw,
  SlidersHorizontal,
} from "lucide-react";
import { useRollStore } from "@/store/useRollStore";
import { THEMES } from "@/data/themes";
import ThemeSelector from "@/components/ThemeSelector";
import ResultSlot from "@/components/ResultSlot";
import EndingSlot from "@/components/EndingSlot";
import HistoryDrawer from "@/components/HistoryDrawer";
import ConfigPanel from "@/components/ConfigPanel";
import LimitConfigPanel from "@/components/LimitConfigPanel";
import LimitModule from "@/components/LimitModule";
import { cn } from "@/lib/utils";

export default function RollPage() {
  const result = useRollStore((s) => s.result);
  const isRolling = useRollStore((s) => s.isRolling);
  const lockedSlots = useRollStore((s) => s.lockedSlots);
  const endingLocked = useRollStore((s) => s.endingLocked);
  const pinnedThemes = useRollStore((s) => s.pinnedThemes);
  const toggles = useRollStore((s) => s.toggles);
  const fixedValues = useRollStore((s) => s.fixedValues);
  const configs = useRollStore((s) => s.configs);
  const endingEnabled = useRollStore((s) => s.endingEnabled);
  const rollMain = useRollStore((s) => s.rollMain);
  const toggleHistory = useRollStore((s) => s.toggleHistory);
  const toggleConfig = useRollStore((s) => s.toggleConfig);
  const historyCount = useRollStore((s) => s.history.length);

  // 当前展示用的主题：有结果用结果主题；否则用固定主题
  const activeTheme = result?.theme ?? fixedValues.theme;
  const accent = activeTheme.accent;
  const hasResult = !!result;

  // 滚动时各槽位的候选文字池
  const themePool = (pinnedThemes.length > 0 ? pinnedThemes : THEMES).map((t) => t.name);
  const difficultyPool = Array.from(
    { length: activeTheme.difficultyMax + 1 },
    (_, i) => String(i),
  );
  const activeCfg = configs[activeTheme.id];
  const squadPool = activeCfg?.enabledSquads?.length
    ? activeCfg.enabledSquads
    : activeTheme.squads;
  const recruitmentPool = activeCfg?.enabledRecruitments?.length
    ? activeCfg.enabledRecruitments
    : activeTheme.recruitments;
  // 结局滚动候选文字池
  const endingPool = activeCfg?.enabledEndings?.length
    ? activeTheme.endings
        .filter((e) => activeCfg.enabledEndings.includes(e.index))
        .map((e) => e.name)
    : activeTheme.endings.map((e) => e.name);

  // 每个元素的展示值（仅开启随机的元素才显示）
  const themeDisplay = result?.theme.name ?? "";
  const difficultyDisplay = result
    ? `${result.theme.difficultyLabel}·${result.difficulty}`
    : "";
  const squadDisplay = result?.squad ?? "";
  const recruitmentDisplay = result?.recruitment ?? "";

  // 提示文案：参与随机的元素（含结局）
  const enabledNames: Record<string, string> = {
    theme: "主题",
    difficulty: "难度",
    squad: "分队",
    recruitment: "招募",
    ending: "结局",
  };
  const enabledList = [
    ...(toggles.theme ? ["theme"] : []),
    ...(toggles.difficulty ? ["difficulty"] : []),
    ...(toggles.squad ? ["squad"] : []),
    ...(toggles.recruitment ? ["recruitment"] : []),
    ...(endingEnabled ? ["ending"] : []),
  ];

  return (
    <div className="terminal-bg noise relative min-h-screen w-full overflow-x-hidden">
      {/* 扫描线动效 */}
      <div className="scanline animate-scanline" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6 md:px-8 md:py-10">
        {/* 顶部标题栏 */}
        <header className="mb-8 border-b border-edge/60 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="clip-tab flex h-11 w-11 items-center justify-center"
                style={{ background: "linear-gradient(135deg, #c8a45c, #8a6d35)" }}
              >
                <Dices className="h-5 w-5 text-void" strokeWidth={2.5} />
              </div>
              <div className="leading-none">
                <div className="mb-1 flex items-center gap-2">
                  <span className="diamond bg-amber" />
                  <span className="font-mono text-[9px] font-medium tracking-[0.25em] text-amber">
                    IS // RANDOM DEPLOYMENT
                  </span>
                </div>
                <h1 className="font-display text-xl font-black tracking-wider text-chalk md:text-2xl">
                  集成战略 · 随机开局终端
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleConfig(true)}
                disabled={isRolling}
                className="clip-ark flex items-center gap-2 border border-edge/80 bg-panel/70 px-3 py-2 font-mono text-xs font-medium tracking-wider text-chalk transition-all hover:border-amber/60 hover:text-amber disabled:opacity-50"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">CONFIG</span>
              </button>
              <button
                onClick={() => toggleHistory(true)}
                disabled={isRolling}
                className="clip-ark relative flex items-center gap-2 border border-edge/80 bg-panel/70 px-3 py-2 font-mono text-xs font-medium tracking-wider text-chalk transition-all hover:border-amber/60 hover:text-amber disabled:opacity-50"
              >
                <History className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">LOG</span>
                {historyCount > 0 && (
                  <span className="flex h-4 min-w-4 items-center justify-center bg-amber px-1 font-mono text-[9px] font-bold text-void">
                    {historyCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        {/* 主题选择区 */}
        <section className="mb-8">
          <ThemeSelector />
        </section>

        {/* 分隔细线 */}
        <div className="hairline mb-8" />

        {/* 抽签控制台 */}
        <section className="mb-8 flex flex-col items-center">
          <button
            onClick={rollMain}
            disabled={isRolling}
            className={cn(
              "clip-corner group relative flex items-center gap-3 border-2 px-12 py-4 font-display text-lg font-bold tracking-wider transition-all",
              "disabled:cursor-not-allowed",
              isRolling
                ? "border-edge bg-panel text-muted"
                : "animate-pulse-glow border-amber bg-gradient-to-r from-amber/20 to-amber/5 text-amber hover:scale-105",
            )}
          >
            {isRolling ? (
              <>
                <RotateCw className="h-5 w-5 animate-spin" />
                部署中…
              </>
            ) : (
              <>
                <Dices className="h-5 w-5" />
                {hasResult ? "重新抽签" : "开始随机"}
              </>
            )}
          </button>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 font-mono text-[11px] tracking-wider text-muted">
            <span className="diamond bg-amber/60" />
            <span>
              ROLL: {enabledList.map((k) => enabledNames[k]).join(" / ")}
            </span>
            {pinnedThemes.length > 0 && toggles.theme && (
              <>
                <span className="text-edge">│</span>
                <span>POOL {pinnedThemes.length}</span>
              </>
            )}
          </div>
        </section>

        {/* 结果展示区：仅显示开启随机的元素 */}
        <section className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {toggles.theme && (
            <ResultSlot
              label="主题"
              sublabel="THEME"
              icon={<MapPinned className="h-4 w-4" />}
              isRolling={isRolling}
              isLocked={lockedSlots.theme}
              displayValue={themeDisplay}
              cyclingOptions={themePool}
              accent={accent}
              hasResult={hasResult}
            />
          )}
          {toggles.difficulty && (
            <ResultSlot
              label="难度"
              sublabel="DIFFICULTY"
              icon={<Gauge className="h-4 w-4" />}
              isRolling={isRolling}
              isLocked={lockedSlots.difficulty}
              displayValue={difficultyDisplay}
              cyclingOptions={difficultyPool}
              accent={accent}
              hasResult={hasResult}
            />
          )}
          {toggles.squad && (
            <ResultSlot
              label="分队"
              sublabel="SQUAD"
              icon={<Users className="h-4 w-4" />}
              isRolling={isRolling}
              isLocked={lockedSlots.squad}
              displayValue={squadDisplay}
              cyclingOptions={squadPool}
              accent={accent}
              hasResult={hasResult}
            />
          )}
          {toggles.recruitment && (
            <ResultSlot
              label="招募组合"
              sublabel="RECRUIT"
              icon={<Sparkles className="h-4 w-4" />}
              isRolling={isRolling}
              isLocked={lockedSlots.recruitment}
              displayValue={recruitmentDisplay}
              cyclingOptions={recruitmentPool}
              accent={accent}
              hasResult={hasResult}
            />
          )}
        </section>

        {/* 随机结局：独立展示区，仅开启时显示 */}
        {endingEnabled && (
          <section className="mb-8">
            <div className="mb-3 flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-muted">
              <span className="h-px w-5 bg-edge" />
              <span>RANDOM ENDING // 随机结局</span>
            </div>
            <EndingSlot
              isRolling={isRolling}
              isLocked={endingLocked}
              endings={result?.endings ?? []}
              cyclingOptions={endingPool}
              accent={accent}
              hasResult={hasResult}
            />
          </section>
        )}

        {/* 自限模块：位于主结果下方，独立展示禁用职业，独立配置与抽签 */}
        <section className="mb-8">
          <div className="mb-3 flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-muted">
            <span className="h-px w-5 bg-edge" />
            <span>SELF LIMIT MODULE // 自限模块</span>
          </div>
          <LimitModule accent={accent} />
        </section>

        {/* 底部信息条 */}
        <footer className="mt-auto border-t border-edge/60 pt-4">
          <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] tracking-wider text-muted">
            <span className="flex items-center gap-1.5">
              <span className="diamond bg-muted/60" />
              SRC // info.txt
            </span>
            <span className="flex items-center gap-2">
              <span>{THEMES.length}T</span>
              <span className="text-edge">/</span>
              <span>{THEMES.reduce((n, t) => n + t.squads.length, 0)}SQ</span>
              <span className="text-edge">/</span>
              <span>{THEMES.reduce((n, t) => n + t.recruitments.length, 0)}RC</span>
              <span className="text-edge">/</span>
              <span>{THEMES.reduce((n, t) => n + t.endings.length, 0)}ED</span>
            </span>
            <span className="text-edge">v1.3 · ROGUELIKE TERMINAL</span>
          </div>
        </footer>
      </div>

      <HistoryDrawer />
      <ConfigPanel />
      <LimitConfigPanel />
    </div>
  );
}
