# 籤詩解讀

台灣傳統籤詩個人化 AI 解讀服務

## 功能特色

- **5 種籤詩系統**：觀音靈籤（100首）、關帝靈籤（100首）、六十甲子籤（60首）、媽祖靈籤（60首）、呂祖靈籤（60首）
- **個人化解讀**：根據使用者的具體問題，提供客製化的 AI 解讀
- **串流回應**：即時顯示解讀結果，無需等待
- **現代設計**：簡約風格結合中式文化元素
- **完整資料**：包含籤詩原文、典故、傳統解曰、現代白話解析

## 技術架構

- **框架**: Next.js 15 (App Router) + React 19 + TypeScript
- **樣式**: Tailwind CSS v4 + Noto Serif/Sans TC 字型
- **AI**: Vercel AI SDK + Claude Sonnet 4 API
- **部署**: Vercel

## 本地開發

1. 安裝依賴：

```bash
bun install
```

2. 設定環境變數：

建立 `.env.local` 檔案並加入你的 Anthropic API Key：

```
ANTHROPIC_API_KEY=your_api_key_here
```

3. 啟動開發伺服器：

```bash
bun dev
```

4. 開啟瀏覽器訪問 [http://localhost:3000](http://localhost:3000)

## 部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/JiaWen-Shen/fortune-stick-web)

1. 點擊上方按鈕或前往 [Vercel](https://vercel.com)
2. 匯入此 GitHub repository
3. 設定環境變數 `ANTHROPIC_API_KEY`
4. 點擊 Deploy

## 資料來源

- **六十甲子籤**：台東天后宮 (https://www.taitungtianhou.org.tw/)
- **觀音靈籤、關帝靈籤、呂祖靈籤**：北海觀音明善堂 (https://www.mstn.org/)

## 免責聲明

本服務僅供參考，籤詩解讀為 AI 生成內容，不代表任何宮廟或宗教團體之官方立場。人生重大決定仍應依據個人判斷與專業建議。

## 授權

MIT License
