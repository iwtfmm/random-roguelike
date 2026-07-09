// 集成战略主题数据结构
export interface Theme {
  id: string; // 主题唯一标识
  name: string; // 主题名称，如「傀影与猩红孤钻」
  difficultyLabel: string; // 难度前缀，如「正式调查」
  difficultyMax: number; // 难度上限，如 18
  squads: string[]; // 分队列表
  recruitments: string[]; // 初始招募组合列表
  endings: Ending[]; // 结局列表
  accent: string; // 主题强调色
  accentSoft: string; // 主题强调色（柔光）
  tagline: string; // 主题标语
  index: string; // 主题编号
}

// 结局数据结构
export interface Ending {
  index: number; // 结局编号 1~5
  name: string; // 结局名称
  // 同组结局互斥（同组最多抽 1 个）；undefined 表示独立可多选
  exclusiveGroup?: string;
}

// 明日方舟干员职业（自限模块用）
export const PROFESSIONS = [
  "先锋",
  "近卫",
  "重装",
  "狙击",
  "术师",
  "医疗",
  "辅助",
  "特种",
] as const;

export type Profession = (typeof PROFESSIONS)[number];

// 单次抽签结果
export interface RollResult {
  theme: Theme;
  difficulty: number; // 0~difficultyMax
  squad: string;
  recruitment: string;
  endings: Ending[]; // 本次抽中的结局链（可连打）
  rolledAt: number; // 时间戳
}

// 自限模块结果：本次禁用的职业列表
export interface LimitResult {
  bannedProfessions: Profession[]; // 被禁用的职业
  rolledAt: number; // 时间戳
}

// 四个抽签元素
export type ElementKey = "theme" | "difficulty" | "squad" | "recruitment";

// 元素参与随机的开关（false 表示该元素使用固定值）
export type ElementToggles = Record<ElementKey, boolean>;

// 元素被关闭随机时使用的固定值
export interface FixedValues {
  theme: Theme;
  difficulty: number;
  squad: string;
  recruitment: string;
}

// 单个主题的随机池配置
export interface ThemeConfig {
  themeId: string;
  difficultyMin: number; // 难度下限
  difficultyMax: number; // 难度上限
  enabledSquads: string[]; // 参与随机的分队子集
  enabledRecruitments: string[]; // 参与随机的招募子集
  enabledEndings: number[]; // 参与随机的结局 index 列表
}

// 自限模块配置
export interface LimitConfig {
  enabled: boolean; // 是否启用自限
  minBans: number; // 最少禁用职业数
  maxBans: number; // 最多禁用职业数
  // 允许被禁用的职业池（从这些职业中随机选 n 个禁用）
  pool: Profession[];
}

