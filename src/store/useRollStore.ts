import { create } from "zustand";
import type {
  ElementKey,
  ElementToggles,
  FixedValues,
  RollResult,
  Theme,
  ThemeConfig,
} from "@/types";
import { THEMES } from "@/data/themes";
import { defaultThemeConfig, rollOnce } from "@/utils/random";

// 抽签阶段：四个要素依次锁定
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

interface RollState {
  // 当前结果
  result: RollResult | null;
  // 是否正在滚动
  isRolling: boolean;
  // 已锁定的阶段（滚动时逐个点亮；关闭随机的元素初始即锁定）
  lockedSlots: Record<SlotKey, boolean>;
  // 历史记录（最新在前）
  history: RollResult[];
  // 是否展开历史抽屉
  historyOpen: boolean;
  // 固定的主题池（可多个，空数组表示不限制）
  pinnedThemes: Theme[];
  // 元素开关：哪些参与随机
  toggles: ElementToggles;
  // 关闭随机的元素使用的固定值
  fixedValues: FixedValues;
  // 每主题的随机池配置
  configs: Record<string, ThemeConfig>;
  // 是否展开配置抽屉
  configOpen: boolean;

  roll: () => void;
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
  clearHistory: () => void;
}

export const useRollStore = create<RollState>((set, get) => ({
  result: null,
  isRolling: false,
  lockedSlots: { theme: true, difficulty: true, squad: true, recruitment: true },
  history: [],
  historyOpen: false,
  pinnedThemes: [],
  toggles: { theme: true, difficulty: true, squad: true, recruitment: true },
  fixedValues: buildDefaultFixed(),
  configs: buildDefaultConfigs(),
  configOpen: false,

  roll: () => {
    if (get().isRolling) return;
    const { pinnedThemes, configs, toggles, fixedValues } = get();

    const finalResult = rollOnce({
      pool: pinnedThemes,
      configs,
      toggles,
      fixed: fixedValues,
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
    });

    // 仅对开启随机的元素依次锁定
    const order: SlotKey[] = ["theme", "difficulty", "squad", "recruitment"];
    const enabledSlots = order.filter((s) => toggles[s]);

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
        set((state) => ({
          lockedSlots: { ...state.lockedSlots, [slot]: true },
        }));
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
      // 至少保留一个元素参与随机，禁止全部关闭
      const anyOn = Object.values(next).some(Boolean);
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
  clearHistory: () => set({ history: [] }),
}));
