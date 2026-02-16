import fs from 'fs';
import path from 'path';
import type { FortuneStick, FortuneSystem } from './fortune-types';
import { SYSTEMS } from './systems';
import { parseFortuneStick } from './parse-markdown';

const dataCache = new Map<string, string>();

function loadDataFile(filename: string): string {
  if (dataCache.has(filename)) {
    return dataCache.get(filename)!;
  }
  const filePath = path.join(process.cwd(), 'src', 'data', filename);
  const content = fs.readFileSync(filePath, 'utf-8');
  dataCache.set(filename, content);
  return content;
}

export function getFortuneStick(
  system: FortuneSystem,
  number: number
): FortuneStick | null {
  const systemInfo = SYSTEMS[system];
  if (!systemInfo) return null;

  if (number < 1 || number > systemInfo.count) return null;

  const content = loadDataFile(systemInfo.dataFile);
  return parseFortuneStick(content, system, number);
}
