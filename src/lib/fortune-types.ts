export type FortuneSystem =
  | 'liushijiazi'  // 六十甲子籤
  | 'guanyin'      // 觀音靈籤
  | 'guandi'       // 關帝靈籤
  | 'mazu'         // 媽祖靈籤 (uses 六十甲子 data)
  | 'lvzu';        // 呂祖靈籤

export interface FortuneStick {
  system: FortuneSystem;
  number: number;
  displayNumber: string;
  rank?: string;
  poem: string[];
  story?: string;
  storyContent?: string;
  attribute?: string;
  sections: Record<string, string>;
}

export interface SystemInfo {
  id: FortuneSystem;
  name: string;
  count: number;
  description: string;
  temple: string;
  dataFile: string;
}
