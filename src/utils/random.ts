import type {
  ElementToggles,
  Ending,
  FixedValues,
  LimitConfig,
  LimitResult,
  Profession,
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

// 从池中无重复地抽取 n 个元素（Fisher-Yates 部分洗牌）
export function sample<T>(arr: readonly T[], n: number): T[] {
  if (arr.length === 0 || n <= 0) return [];
  const copy = [...arr];
  const count = Math.min(n, copy.length);
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(Math.random() * (copy.length - i));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, count);
}

// 生成某主题的默认池配置（全分队/全招募/全结局/难度满范围）
export function defaultThemeConfig(theme: Theme): ThemeConfig {
  return {
    themeId: theme.id,
    difficultyMin: 0,
    difficultyMax: theme.difficultyMax,
    enabledSquads: [...theme.squads],
    enabledRecruitments: [...theme.recruitments],
    enabledEndings: theme.endings.map((e) => e.index),
  };
}

// 随机结局：从启用结局中按互斥规则抽取结局链（可连打）
// 规则：
// 1. 1/2 结局（A组）为必选前置，必抽 1 个
// 2. 3/4 结局（B组）互斥（萨米除外，各自独立），50% 概率抽中
// 3. 5 结局独立，50% 概率抽中
// 4. 3/4/5 结局仅在 1/2 抽中后才有机会出现（由前置关系保证）
export function rollEndings(theme: Theme, enabledIndices: number[]): Ending[] {
  if (enabledIndices.length === 0) return [];
  const enabled = theme.endings.filter((e) => enabledIndices.includes(e.index));
  if (enabled.length === 0) return [];

  const result: Ending[] = [];

  // 按互斥组分组
  const groupMap = new Map<string, Ending[]>();
  const independent: Ending[] = [];
  for (const e of enabled) {
    if (e.exclusiveGroup) {
      if (!groupMap.has(e.exclusiveGroup)) groupMap.set(e.exclusiveGroup, []);
      groupMap.get(e.exclusiveGroup)!.push(e);
    } else {
      independent.push(e);
    }
  }

  // A组（1/2）：必选前置，必抽 1 个
  const groupA = groupMap.get("A");
  if (groupA && groupA.length > 0) {
    result.push(groupA[Math.floor(Math.random() * groupA.length)]);
  }

  // 仅当 1/2 前置已抽中，才可能抽中后续结局（3/4/5）
  const hasPrerequisite = result.some((e) => e.exclusiveGroup === "A");

  if (hasPrerequisite) {
    // B组（3/4）及其他互斥组：50% 概率抽中一个
    for (const [group, endings] of groupMap) {
      if (group === "A") continue; // A组已处理
      if (Math.random() < 0.5) {
        result.push(endings[Math.floor(Math.random() * endings.length)]);
      }
    }

    // 独立结局（5等）：各自 50% 概率
    for (const e of independent) {
      if (Math.random() < 0.5) {
        result.push(e);
      }
    }
  }

  // 保证至少 1 个结局：若 A 组未启用或未抽中，回退到任意可用结局
  if (result.length === 0) {
    const firstGroup = groupMap.values().next();
    if (!firstGroup.done && firstGroup.value.length > 0) {
      result.push(
        firstGroup.value[Math.floor(Math.random() * firstGroup.value.length)],
      );
    } else if (independent.length > 0) {
      result.push(independent[Math.floor(Math.random() * independent.length)]);
    }
  }

  // 按 index 排序，形成连打链（1/2 → 3/4 → 5）
  return result.sort((a, b) => a.index - b.index);
}

interface RollOptions {
  pool: Theme[]; // 主题池（固定主题，空则全部）
  configs: Record<string, ThemeConfig>; // 每主题池配置
  toggles: ElementToggles; // 元素开关
  fixed: FixedValues; // 关闭随机的元素取此固定值
  endingEnabled: boolean; // 是否参与随机结局
}

// 随机抽取一次完整开局方案
export function rollOnce(opts: RollOptions): RollResult {
  const { pool, configs, toggles, fixed, endingEnabled } = opts;

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

  // 结局：开启随机结局 → 按互斥规则抽取结局链；关闭 → 空链
  const endings = endingEnabled ? rollEndings(theme, cfg.enabledEndings) : [];

  return { theme, difficulty, squad, recruitment, endings, rolledAt: Date.now() };
}

// 自限模块：随机禁用 n 个职业的干员
export function rollLimit(cfg: LimitConfig): LimitResult | null {
  // 未启用或池为空，返回 null（表示本次不自限）
  if (!cfg.enabled || cfg.pool.length === 0) return null;

  // 随机决定本次禁用数量，闭区间 [min, max]，且不超过池大小
  const max = Math.min(cfg.maxBans, cfg.pool.length);
  const min = Math.min(cfg.minBans, max);
  const n = randInt(min, max);

  const bannedProfessions = sample(cfg.pool, n) as Profession[];
  return { bannedProfessions, rolledAt: Date.now() };
}

