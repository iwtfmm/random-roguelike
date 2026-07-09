// 集成战略主题数据结构
export interface Theme {
  id: string; // 主题唯一标识
  name: string; // 主题名称，如「傀影与猩红孤钻」
  difficultyLabel: string; // 难度前缀，如「正式调查」
  difficultyMax: number; // 难度上限，如 18
  squads: string[]; // 分队列表
  recruitments: string[]; // 初始招募组合列表
  accent: string; // 主题强调色
  accentSoft: string; // 主题强调色（柔光）
  tagline: string; // 主题标语
  index: string; // 主题编号
}

// 单次抽签结果
export interface RollResult {
  theme: Theme;
  difficulty: number; // 0~difficultyMax
  squad: string;
  recruitment: string;
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
}
