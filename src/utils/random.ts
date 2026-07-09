import type {
  ElementToggles,
  FixedValues,
  RollResult,
  Theme,
  ThemeConfig,
} from "@/types";
import { THEMES } from "@/data/themes";

// 从非空数组中随机取一项；空数组回退到 fallback
export function pick<T>(arr: readonly T[], fallback: T): T {
  if (arr.length === 0) return fallback;
  return arr[Math.floor(Math.random() * arr.length)];
}

// 在 [min, max] 闭区间内随机取整数；自动纠正 min>max，避免 NaN
export function randInt(min: number, max: number): number {
  if (min > max) [min, max] = [max, min];
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// 生成某主题的默认池配置（全分队/全招募/难度满范围）
export function defaultThemeConfig(theme: Theme): ThemeConfig {
  return {
    themeId: theme.id,
    difficultyMin: 0,
    difficultyMax: theme.difficultyMax,
    enabledSquads: [...theme.squads],
    enabledRecruitments: [...theme.recruitments],
  };
}

interface RollOptions {
  pool: Theme[]; // 主题池（固定主题，空则全部）
  configs: Record<string, ThemeConfig>; // 每主题池配置
  toggles: ElementToggles; // 元素开关
  fixed: FixedValues; // 关闭随机的元素取此固定值
}

// 随机抽取一次完整开局方案
export function rollOnce(opts: RollOptions): RollResult {
  const { pool, configs, toggles, fixed } = opts;

  // 主题：开启随机 → 从池中选；关闭 → 用固定主题
  const themePool = pool.length > 0 ? pool : THEMES;
  const theme = toggles.theme
    ? pick(themePool, fixed.theme)
    : fixed.theme;

  const cfg = configs[theme.id] ?? defaultThemeConfig(theme);

  // 难度：开启随机 → 在 [min,max] 间取（randInt 自动纠正越界）；关闭 → 用固定难度
  const difficulty = toggles.difficulty
    ? randInt(cfg.difficultyMin, cfg.difficultyMax)
    : fixed.difficulty;

  // 分队：开启随机 → 从启用分队池中选（池空回退固定值）；关闭 → 用固定分队
  const squadPool =
    cfg.enabledSquads.length > 0 ? cfg.enabledSquads : theme.squads;
  const squad = toggles.squad ? pick(squadPool, fixed.squad) : fixed.squad;

  // 招募：开启随机 → 从启用招募池中选（池空回退固定值）；关闭 → 用固定招募
  const recruitmentPool =
    cfg.enabledRecruitments.length > 0
      ? cfg.enabledRecruitments
      : theme.recruitments;
  const recruitment = toggles.recruitment
    ? pick(recruitmentPool, fixed.recruitment)
    : fixed.recruitment;

  return { theme, difficulty, squad, recruitment, rolledAt: Date.now() };
}
