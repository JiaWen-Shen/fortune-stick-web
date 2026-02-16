import type { FortuneStick, FortuneSystem } from './fortune-types';

const CHINESE_NUMBERS: Record<string, number> = {
  '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
  '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
  '十一': 11, '十二': 12, '十三': 13, '十四': 14, '十五': 15,
  '十六': 16, '十七': 17, '十八': 18, '十九': 19, '二十': 20,
  '二十一': 21, '二十二': 22, '二十三': 23, '二十四': 24, '二十五': 25,
  '二十六': 26, '二十七': 27, '二十八': 28, '二十九': 29, '三十': 30,
  '三十一': 31, '三十二': 32, '三十三': 33, '三十四': 34, '三十五': 35,
  '三十六': 36, '三十七': 37, '三十八': 38, '三十九': 39, '四十': 40,
  '四十一': 41, '四十二': 42, '四十三': 43, '四十四': 44, '四十五': 45,
  '四十六': 46, '四十七': 47, '四十八': 48, '四十九': 49, '五十': 50,
  '五十一': 51, '五十二': 52, '五十三': 53, '五十四': 54, '五十五': 55,
  '五十六': 56, '五十七': 57, '五十八': 58, '五十九': 59, '六十': 60,
  '六十一': 61, '六十二': 62, '六十三': 63, '六十四': 64, '六十五': 65,
  '六十六': 66, '六十七': 67, '六十八': 68, '六十九': 69, '七十': 70,
  '七十一': 71, '七十二': 72, '七十三': 73, '七十四': 74, '七十五': 75,
  '七十六': 76, '七十七': 77, '七十八': 78, '七十九': 79, '八十': 80,
  '八十一': 81, '八十二': 82, '八十三': 83, '八十四': 84, '八十五': 85,
  '八十六': 86, '八十七': 87, '八十八': 88, '八十九': 89, '九十': 90,
  '九十一': 91, '九十二': 92, '九十三': 93, '九十四': 94, '九十五': 95,
  '九十六': 96, '九十七': 97, '九十八': 98, '九十九': 99, '一百': 100,
};

function parseChineseNumber(text: string): number {
  const trimmed = text.trim();
  if (CHINESE_NUMBERS[trimmed] !== undefined) return CHINESE_NUMBERS[trimmed];
  const num = parseInt(trimmed, 10);
  if (!isNaN(num)) return num;
  return -1;
}

// Remove boilerplate text from mstn.org scrapes
const BOILERPLATE_PATTERNS = [
  /本堂代為佛前供花[\s\S]*?。\n/g,
  /求籤解籤必讀[\s\S]*?受天譴\n/g,
  /您的瀏覽器不支援[\s\S]*?\n/g,
  /請加本堂LINE[\s\S]*?\n/g,
  /1\. 抽到不好的籤詩[\s\S]*?潛水\n/g,
];

function stripBoilerplate(text: string): string {
  let result = text;
  for (const pattern of BOILERPLATE_PATTERNS) {
    result = result.replace(pattern, '');
  }
  return result;
}

function extractPoemFromCodeBlock(text: string): string[] {
  const codeBlockMatch = text.match(/```\n?([\s\S]*?)\n?```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1]
      .split('\n')
      .map(l => l.replace(/[，。、；！？,.]$/g, '').trim())
      .filter(l => l.length > 0);
  }
  return [];
}

function extractPoemFromInline(text: string): string[] {
  const poemMatch = text.match(/詩曰:\n([\s\S]*?)(?=\n(?:本堂|請加|1\.))/);
  if (poemMatch) {
    return poemMatch[1]
      .split('\n')
      .map(l => l.replace(/[，。、；！？,.]$/g, '').trim())
      .filter(l => l.length > 0);
  }
  return [];
}

// Parse 六十甲子籤 format
function parseLiushijiazi(content: string, number: number): FortuneStick | null {
  const entries = content.split(/\n---\n/);

  for (const entry of entries) {
    const headerMatch = entry.match(/## 第(.+?)籤\s+(.+)/);
    if (!headerMatch) continue;

    const num = parseChineseNumber(headerMatch[1]);
    if (num !== number) continue;

    const tiangan = headerMatch[2].trim();
    const displayNumber = `第${headerMatch[1].trim()}籤 ${tiangan}`;

    const attrMatch = entry.match(/\*\*(.+?)\*\*/);
    const attribute = attrMatch ? attrMatch[1] : undefined;

    const poem = extractPoemFromCodeBlock(entry);

    const sections: Record<string, string> = {};

    const sectionPattern = /### (.+?)\n\n([\s\S]*?)(?=\n### |\n---|\n$)/g;
    let match;
    while ((match = sectionPattern.exec(entry)) !== null) {
      const sectionName = match[1].trim();
      if (sectionName === '籤詩原文') continue;
      sections[sectionName] = match[2].trim();
    }

    return {
      system: 'liushijiazi',
      number: num,
      displayNumber,
      attribute,
      poem,
      story: tiangan,
      sections,
    };
  }
  return null;
}

// Parse 觀音靈籤 format
function parseGuanyin(content: string, number: number): FortuneStick | null {
  const entries = content.split(/\n---\n/);

  for (const entry of entries) {
    const headerMatch = entry.match(/## 第\s*(\d+)\s*籤/);
    if (!headerMatch) continue;

    const num = parseInt(headerMatch[1], 10);
    if (num !== number) continue;

    const cleaned = stripBoilerplate(entry);
    const displayNumber = `第${num}籤`;

    // Extract story and rank from the header area
    const lines = cleaned.split('\n');
    let story: string | undefined;
    let rank: string | undefined;

    // Find the line with Chinese number + story
    for (const line of lines) {
      const storyMatch = line.match(/第.+?籤\n(.+)/);
      if (storyMatch) {
        story = storyMatch[1].trim();
      }
    }

    // Look for story on standalone line after the Chinese number heading
    const chineseNumLine = lines.findIndex(l => /^第[一二三四五六七八九十百]+籤$/.test(l.trim()));
    if (chineseNumLine >= 0 && chineseNumLine + 1 < lines.length) {
      story = lines[chineseNumLine + 1].trim();
      if (chineseNumLine + 2 < lines.length) {
        const maybeRank = lines[chineseNumLine + 2].trim();
        if (/^[上中下][上中下]?$/.test(maybeRank)) {
          rank = maybeRank;
        }
      }
    }

    const poem = extractPoemFromInline(cleaned);

    const sections: Record<string, string> = {};

    // Parse 【section】 format
    const sectionPattern = /[〖【]\s*(.+?)\s*[〗】]\n([\s\S]*?)(?=[〖【]|$)/g;
    let match;
    while ((match = sectionPattern.exec(cleaned)) !== null) {
      sections[match[1].trim()] = match[2].trim();
    }

    return {
      system: 'guanyin',
      number: num,
      displayNumber,
      rank,
      poem,
      story,
      sections,
    };
  }
  return null;
}

// Parse 關帝靈籤 format
function parseGuandi(content: string, number: number): FortuneStick | null {
  const entries = content.split(/\n---\n/);

  for (const entry of entries) {
    const headerMatch = entry.match(/## 第\s*(\d+)\s*籤/);
    if (!headerMatch) continue;

    const num = parseInt(headerMatch[1], 10);
    if (num !== number) continue;

    const cleaned = stripBoilerplate(entry);
    const displayNumber = `第${num}籤`;

    const lines = cleaned.split('\n');
    let story: string | undefined;
    let rank: string | undefined;

    const chineseNumLine = lines.findIndex(l => /^第[一二三四五六七八九十百]+籤$/.test(l.trim()));
    if (chineseNumLine >= 0) {
      // Next line has rank + tiangan
      const nextLine = lines[chineseNumLine + 1]?.trim() || '';
      const rankMatch = nextLine.match(/^(大吉|上吉|中吉|中平|下吉|下下|上上|中|下)\s*[甲乙丙丁戊己庚辛壬癸]/);
      if (rankMatch) {
        rank = rankMatch[1];
      }
      // Story is on the line after rank
      if (chineseNumLine + 2 < lines.length) {
        const storyLine = lines[chineseNumLine + 2]?.trim();
        if (storyLine && !storyLine.startsWith('關聖') && !storyLine.startsWith('詩曰')) {
          story = storyLine;
        }
      }
    }

    const poem = extractPoemFromInline(cleaned);

    const sections: Record<string, string> = {};
    const sectionPattern = /[〖【]\s*(.+?)\s*[〗】]\n([\s\S]*?)(?=[〖【]|$)/g;
    let match;
    while ((match = sectionPattern.exec(cleaned)) !== null) {
      sections[match[1].trim()] = match[2].trim();
    }

    return {
      system: 'guandi',
      number: num,
      displayNumber,
      rank,
      poem,
      story,
      sections,
    };
  }
  return null;
}

// Parse 呂祖靈籤 format
function parseLvzu(content: string, number: number): FortuneStick | null {
  const entries = content.split(/\n---\n/);

  for (const entry of entries) {
    const headerMatch = entry.match(/## 第(\d+)\s*籤/);
    if (!headerMatch) continue;

    const num = parseInt(headerMatch[1], 10);
    if (num !== number) continue;

    const cleaned = stripBoilerplate(entry);
    const displayNumber = `第${num}籤`;

    // Get tiangan from header or 典故 line
    const tianganMatch = entry.match(/## 第\d+\s*籤\s+(.+)/);
    const storyMatch = cleaned.match(/\*\*典故\*\*[：:]\s*(.+)/);
    const story = storyMatch?.[1]?.trim();

    const poem = extractPoemFromCodeBlock(cleaned);

    const sections: Record<string, string> = {};
    const sectionPattern = /### (.+?)\n\n([\s\S]*?)(?=\n### |\n---|\n$)/g;
    let match;
    while ((match = sectionPattern.exec(cleaned)) !== null) {
      const sectionName = match[1].trim();
      if (sectionName === '籤詩原文') continue;
      sections[sectionName] = match[2].trim();
    }

    // Also try **典故** format
    if (!story) {
      const storySection = cleaned.match(/### 典故說明\n\n([\s\S]*?)(?=\n### |\n$)/);
      if (storySection) {
        sections['典故說明'] = storySection[1].trim();
      }
    }

    return {
      system: 'lvzu',
      number: num,
      displayNumber,
      poem,
      story,
      sections,
    };
  }
  return null;
}

export function parseFortuneStick(
  content: string,
  system: FortuneSystem,
  number: number
): FortuneStick | null {
  switch (system) {
    case 'liushijiazi':
    case 'mazu':
      const stick = parseLiushijiazi(content, number);
      if (stick && system === 'mazu') {
        return { ...stick, system: 'mazu' };
      }
      return stick;
    case 'guanyin':
      return parseGuanyin(content, number);
    case 'guandi':
      return parseGuandi(content, number);
    case 'lvzu':
      return parseLvzu(content, number);
    default:
      return null;
  }
}
