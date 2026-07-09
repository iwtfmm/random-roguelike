import { create } from "zustand";
import type {
  ElementKey,
  ElementToggles,
  FixedValues,
  LimitConfig,
  LimitResult,
  Profession,
  RollResult,
  Theme,
  ThemeConfig,
} from "@/types";
import { PROFESSIONS } from "@/types";
import { THEMES } from "@/data/themes";
import { defaultThemeConfig, rollLimit, rollOnce } from "@/utils/random";

// 抽签阶段：四个要素 + 结局依次锁定
export type SlotKey = ElementKey;

// 初始化每主题默认池配置
function buildDefaultConfigs(): Record<string, ThemeConfig> {
  const map: Record<string, ThemeConfig> = {};
  for (const t of THEMES) map[t.id] = defaultThemeConfig(t);
  return map;
}

// 初始化固定值默认值
function buildDefaultFixed(): FixedValues {
  const t = THEMES[0];
  return {
    theme: t,
    difficulty: 0,
    squad: t.squads[0],
    recruitment: t.recruitments[0],
  };
}

// 自限模块默认配置：已启用；固定禁用 1 个；池为全部职业
function buildDefaultLimitConfig(): LimitConfig {
  return {
    enabled: true,
    minBans: 1,
    maxBans: 1,
    pool: [...PROFESSIONS],
  };
}

interface RollState {
  // 当前结果
  result: RollResult | null;
  // 主模块是否正在滚动
  isRolling: boolean;
  // 已锁定的阶段（滚动时逐个点亮；关闭随机的元素初始即锁定）
  lockedSlots: Record<SlotKey, boolean>;
  // 结局是否已锁定（结局不在 ElementKey 中，单独管理）
  endingLocked: boolean;
  // 历史记录（最新在前）
  history: RollResult[];
  // 是否展开历史抽屉
  historyOpen: boolean;
  // 固定的主题池（可多个，空数组表示不限制）
  pinnedThemes: Theme[];
  // 元素开关：哪些参与随机
  toggles: ElementToggles;
  // 关闭随机的元素使用的固定值（仅内部使用，不再展示）
  fixedValues: FixedValues;
  // 每主题的随机池配置
  configs: Record<string, ThemeConfig>;
  // 是否展开主配置抽屉
  configOpen: boolean;
  // 随机结局开关
  endingEnabled: boolean;
  // 自限模块：本次禁用的职业结果
  limitResult: LimitResult | null;
  // 自限模块配置
  limitConfig: LimitConfig;
  // 自限模块是否正在滚动（独立于主模块）
  isLimitRolling: boolean;
  // 是否展开自限配置抽屉（独立于主配置）
  limitConfigOpen: boolean;

  rollMain: () => void;
  rollLimit: () => void;
  toggleThemePin: (theme: Theme) => void;
  clearPinnedThemes: () => void;
  setElementToggle: (key: ElementKey, value: boolean) => void;
  setFixedTheme: (theme: Theme) => void;
  setFixedDifficulty: (n: number) => void;
  setFixedSquad: (squad: string) => void;
  setFixedRecruitment: (recruitment: string) => void;
  updateThemeConfig: (themeId: string, patch: Partial<ThemeConfig>) => void;
  resetThemeConfig: (themeId: string) => void;
  toggleHistory: (open?: boolean) => void;
  toggleConfig: (open?: boolean) => void;
  toggleLimitConfig: (open?: boolean) => void;
  clearHistory: () => void;
  setEndingEnabled: (v: boolean) => void;
  // 自限模块操作
  setLimitEnabled: (v: boolean) => void;
  setLimitMinBans: (n: number) => void;
  setLimitMaxBans: (n: number) => void;
  toggleLimitProfession: (p: Profession) => void;
}

export const useRollStore = create<RollState>((set, get) => ({
  result: null,
  isRolling: false,
  lockedSlots: { theme: true, difficulty: true, squad: true, recruitment: true },
  endingLocked: true,
  history: [],
  historyOpen: false,
  pinnedThemes: [],
  toggles: { theme: true, difficulty: true, squad: true, recruitment: true },
  fixedValues: buildDefaultFixed(),
  configs: buildDefaultConfigs(),
  configOpen: false,
  endingEnabled: true,
  limitResult: null,
  limitConfig: buildDefaultLimitConfig(),
  isLimitRolling: false,
  limitConfigOpen: false,

  // 主模块抽签：处理 主题/难度/分队/招募/结局
  rollMain: () => {
    if (get().isRolling) return;
    const { pinnedThemes, configs, toggles, fixedValues, endingEnabled } = get();

    const finalResult = rollOnce({
      pool: pinnedThemes,
      configs,
      toggles,
      fixed: fixedValues,
      endingEnabled,
    });

    // 关闭随机的元素初始即视为锁定；开启随机的元素从 false 开始依次点亮
    const initialLocked: Record<SlotKey, boolean> = {
      theme: !toggles.theme,
      difficulty: !toggles.difficulty,
      squad: !toggles.squad,
      recruitment: !toggles.recruitment,
    };

    set({
      isRolling: true,
      result: finalResult,
      lockedSlots: initialLocked,
      endingLocked: !endingEnabled,
    });

    // 构建揭示序列：开启随机的元素 + 结局（若启用）
    const order: SlotKey[] = ["theme", "difficulty", "squad", "recruitment"];
    const enabledSlots: string[] = order.filter((s) => toggles[s as ElementKey]);
    if (endingEnabled) enabledSlots.push("ending");

    // 没有任何元素参与随机：直接揭示并写入历史
    if (enabledSlots.length === 0) {
      set((state) => ({
        isRolling: false,
        history: [finalResult, ...state.history].slice(0, 20),
      }));
      return;
    }

    // 每个启用元素间隔 360ms 锁定，营造依次揭晓的节奏感
    enabledSlots.forEach((slot, i) => {
      setTimeout(() => {
        if (slot === "ending") {
          set({ endingLocked: true });
        } else {
          set((state) => ({
            lockedSlots: { ...state.lockedSlots, [slot]: true },
          }));
        }
        if (i === enabledSlots.length - 1) {
          setTimeout(() => {
            set((state) => ({
              isRolling: false,
              history: [finalResult, ...state.history].slice(0, 20),
            }));
          }, 220);
        }
      }, 360 * (i + 1));
    });
  },

  // 自限模块抽签：仅处理禁用职业，独立于主模块
  rollLimit: () => {
    if (get().isLimitRolling) return;
    const { limitConfig } = get();
    if (!limitConfig.enabled || limitConfig.pool.length === 0) return;

    const finalLimit = rollLimit(limitConfig);

    set({ isLimitRolling: true, limitResult: null });

    // 滚动 900ms 后揭示结果，营造抽签节奏
    setTimeout(() => {
      set({ isLimitRolling: false, limitResult: finalLimit });
    }, 900);
  },

  toggleThemePin: (theme) =>
    set((state) => {
      const exists = state.pinnedThemes.some((t) => t.id === theme.id);
      return {
        pinnedThemes: exists
          ? state.pinnedThemes.filter((t) => t.id !== theme.id)
          : [...state.pinnedThemes, theme],
      };
    }),
  clearPinnedThemes: () => set({ pinnedThemes: [] }),

  setElementToggle: (key, value) =>
    set((state) => {
      const next = { ...state.toggles, [key]: value };
      // 至少保留一个元素参与随机（含结局），禁止全部关闭
      const anyOn = Object.values(next).some(Boolean) || state.endingEnabled;
      if (!anyOn) return state;
      return { toggles: next };
    }),

  setFixedTheme: (theme) =>
    set((state) => {
      // 切换固定主题时，若原固定分队/招募不在新主题中，回退到首项
      const squad = theme.squads.includes(state.fixedValues.squad)
        ? state.fixedValues.squad
        : theme.squads[0];
      const recruitment = theme.recruitments.includes(state.fixedValues.recruitment)
        ? state.fixedValues.recruitment
        : theme.recruitments[0];
      const difficulty = Math.min(state.fixedValues.difficulty, theme.difficultyMax);
      return {
        fixedValues: { theme, difficulty, squad, recruitment },
      };
    }),
  setFixedDifficulty: (n) =>
    set((state) => {
      const max = state.fixedValues.theme.difficultyMax;
      const safe = Number.isFinite(n) ? n : 0;
      return {
        fixedValues: {
          ...state.fixedValues,
          difficulty: Math.max(0, Math.min(safe, max)),
        },
      };
    }),
  setFixedSquad: (squad) =>
    set((state) => ({ fixedValues: { ...state.fixedValues, squad } })),
  setFixedRecruitment: (recruitment) =>
    set((state) => ({ fixedValues: { ...state.fixedValues, recruitment } })),

  updateThemeConfig: (themeId, patch) =>
    set((state) => ({
      configs: {
        ...state.configs,
        [themeId]: { ...state.configs[themeId], ...patch },
      },
    })),
  resetThemeConfig: (themeId) => {
    const theme = THEMES.find((t) => t.id === themeId);
    if (!theme) return;
    set((state) => ({
      configs: { ...state.configs, [themeId]: defaultThemeConfig(theme) },
    }));
  },

  toggleHistory: (open) =>
    set((state) => ({ historyOpen: open ?? !state.historyOpen })),
  toggleConfig: (open) =>
    set((state) => ({ configOpen: open ?? !state.configOpen })),
  toggleLimitConfig: (open) =>
    set((state) => ({ limitConfigOpen: open ?? !state.limitConfigOpen })),
  clearHistory: () => set({ history: [] }),

  setEndingEnabled: (v) =>
    set((state) => {
      // 关闭结局时，至少保留一个其他元素参与随机
      if (!v) {
        const anyOtherOn = Object.values(state.toggles).some(Boolean);
        if (!anyOtherOn) return state;
      }
      return { endingEnabled: v };
    }),

  setLimitEnabled: (v) =>
    set((state) => ({ limitConfig: { ...state.limitConfig, enabled: v } })),

  setLimitMinBans: (n) =>
    set((state) => {
      // 防御 NaN：非有限数视为 1
      const safe = Number.isFinite(n) ? n : 1;
      const poolSize = state.limitConfig.pool.length;
      // 不能超过池大小，且不能大于当前 maxBans
      const min = Math.max(1, Math.min(safe, poolSize, state.limitConfig.maxBans));
      return { limitConfig: { ...state.limitConfig, minBans: min } };
    }),

  setLimitMaxBans: (n) =>
    set((state) => {
      const safe = Number.isFinite(n) ? n : 1;
      const poolSize = state.limitConfig.pool.length;
      // 不能超过池大小，且不能小于当前 minBans（保证区间合法）
      const max = Math.max(
        state.limitConfig.minBans,
        Math.min(safe, poolSize),
      );
      return { limitConfig: { ...state.limitConfig, maxBans: max } };
    }),

  toggleLimitProfession: (p) =>
    set((state) => {
      const exists = state.limitConfig.pool.includes(p);
      const nextPool = exists
        ? state.limitConfig.pool.filter((x) => x !== p)
        : [...state.limitConfig.pool, p];
      // 至少保留一个职业在池中，否则禁用无从下手
      if (nextPool.length === 0) return state;
      // 调整 minBans/maxBans 不超过新池大小
      const poolSize = nextPool.length;
      const minBans = Math.min(state.limitConfig.minBans, poolSize);
      const maxBans = Math.min(state.limitConfig.maxBans, poolSize);
      return {
        limitConfig: { ...state.limitConfig, pool: nextPool, minBans, maxBans },
      };
    }),
}));
