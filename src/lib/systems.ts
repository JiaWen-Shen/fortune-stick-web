import type { FortuneSystem, SystemInfo } from './fortune-types';

export const SYSTEMS: Record<FortuneSystem, SystemInfo> = {
  guanyin: {
    id: 'guanyin',
    name: '觀音靈籤',
    count: 100,
    description: '觀世音菩薩百首靈籤，廣泛使用於各地觀音廟宇',
    temple: '龍山寺、各地觀音廟',
    dataFile: '觀音靈籤.md',
  },
  guandi: {
    id: 'guandi',
    name: '關帝靈籤',
    count: 100,
    description: '關聖帝君百首靈籤，常見於關帝廟與武廟',
    temple: '行天宮、各地關帝廟',
    dataFile: '關帝靈籤.md',
  },
  liushijiazi: {
    id: 'liushijiazi',
    name: '六十甲子籤',
    count: 60,
    description: '以天干地支排列的六十支籤詩，常見於天后宮',
    temple: '台東天后宮、各地媽祖廟',
    dataFile: '六十甲子籤.md',
  },
  mazu: {
    id: 'mazu',
    name: '媽祖靈籤',
    count: 60,
    description: '媽祖廟使用的六十甲子籤系統',
    temple: '大甲鎮瀾宮、各地媽祖廟',
    dataFile: '六十甲子籤.md',
  },
  lvzu: {
    id: 'lvzu',
    name: '呂祖靈籤',
    count: 60,
    description: '呂洞賓仙祖六十首靈籤，指南宮常用',
    temple: '指南宮、各地呂祖廟',
    dataFile: '呂祖靈籤.md',
  },
};

export const SYSTEM_ORDER: FortuneSystem[] = [
  'guanyin',
  'guandi',
  'liushijiazi',
  'mazu',
  'lvzu',
];

// 六十甲子籤 / 媽祖靈籤：按天干分組排列（非標準甲子順序）
export const TIANGAN_DIZHI = [
  '甲子', '甲寅', '甲辰', '甲午', '甲申', '甲戌',
  '乙丑', '乙卯', '乙巳', '乙未', '乙酉', '乙亥',
  '丙子', '丙寅', '丙辰', '丙午', '丙申', '丙戌',
  '丁丑', '丁卯', '丁巳', '丁未', '丁酉', '丁亥',
  '戊子', '戊寅', '戊辰', '戊午', '戊申', '戊戌',
  '己丑', '己卯', '己巳', '己未', '己酉', '己亥',
  '庚子', '庚寅', '庚辰', '庚午', '庚申', '庚戌',
  '辛丑', '辛卯', '辛巳', '辛未', '辛酉', '辛亥',
  '壬子', '壬寅', '壬辰', '壬午', '壬申', '壬戌',
  '癸丑', '癸卯', '癸巳', '癸未', '癸酉', '癸亥',
];

// 呂祖靈籤：標準六十甲子順序
export const TIANGAN_DIZHI_STANDARD = [
  '甲子', '乙丑', '丙寅', '丁卯', '戊辰', '己巳', '庚午', '辛未', '壬申', '癸酉',
  '甲戌', '乙亥', '丙子', '丁丑', '戊寅', '己卯', '庚辰', '辛巳', '壬午', '癸未',
  '甲申', '乙酉', '丙戌', '丁亥', '戊子', '己丑', '庚寅', '辛卯', '壬辰', '癸巳',
  '甲午', '乙未', '丙申', '丁酉', '戊戌', '己亥', '庚子', '辛丑', '壬寅', '癸卯',
  '甲辰', '乙巳', '丙午', '丁未', '戊申', '己酉', '庚戌', '辛亥', '壬子', '癸丑',
  '甲寅', '乙卯', '丙辰', '丁巳', '戊午', '己未', '庚申', '辛酉', '壬戌', '癸亥',
];

export function getSystemTiangan(system: string): string[] | null {
  if (system === 'liushijiazi' || system === 'mazu') return TIANGAN_DIZHI;
  if (system === 'lvzu') return TIANGAN_DIZHI_STANDARD;
  return null;
}
