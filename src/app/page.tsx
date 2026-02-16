"use client";

import { useState, useCallback } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PoemDisplay from "@/components/PoemDisplay";
import ReactMarkdown from "react-markdown";
import type { FortuneSystem, FortuneStick } from "@/lib/fortune-types";

const SYSTEMS_UI = [
  {
    id: "guanyin" as FortuneSystem,
    name: "觀音靈籤",
    count: 100,
    icon: "🙏",
    description: "觀世音菩薩百首靈籤",
    temple: "龍山寺、各地觀音廟",
  },
  {
    id: "guandi" as FortuneSystem,
    name: "關帝靈籤",
    count: 100,
    icon: "⚔️",
    description: "關聖帝君百首靈籤",
    temple: "行天宮、各地關帝廟",
  },
  {
    id: "liushijiazi" as FortuneSystem,
    name: "六十甲子籤",
    count: 60,
    icon: "🏛️",
    description: "天干地支六十籤詩",
    temple: "台東天后宮、各地天后宮",
  },
  {
    id: "mazu" as FortuneSystem,
    name: "媽祖靈籤",
    count: 60,
    icon: "🌊",
    description: "媽祖廟六十甲子籤系統",
    temple: "大甲鎮瀾宮、各地媽祖廟",
  },
  {
    id: "lvzu" as FortuneSystem,
    name: "呂祖靈籤",
    count: 60,
    icon: "☁️",
    description: "呂洞賓仙祖六十首靈籤",
    temple: "指南宮、各地呂祖廟",
  },
];

const QUESTION_CHIPS = [
  "感情", "事業", "財運", "健康", "考試", "家庭", "出行", "訴訟",
];

type Step = "select" | "input" | "confirm" | "interpret";

export default function Home() {
  const [step, setStep] = useState<Step>("select");
  const [selectedSystem, setSelectedSystem] = useState<FortuneSystem | null>(null);
  const [stickNumber, setStickNumber] = useState("");
  const [question, setQuestion] = useState("");
  const [stickData, setStickData] = useState<FortuneStick | null>(null);
  const [interpretation, setInterpretation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedSystemInfo = SYSTEMS_UI.find((s) => s.id === selectedSystem);

  const handleSelectSystem = (system: FortuneSystem) => {
    setSelectedSystem(system);
    setStep("input");
    setError("");
  };

  const handleSubmitForm = async () => {
    if (!selectedSystem || !stickNumber || !question.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(
        `/api/fortune-data?system=${selectedSystem}&number=${stickNumber}`
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "無法取得籤詩資料");
      }
      const data: FortuneStick = await res.json();
      setStickData(data);
      setStep("confirm");
    } catch (err) {
      setError(err instanceof Error ? err.message : "發生錯誤");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedSystem || !stickData) return;

    setStep("interpret");
    setInterpretation("");
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: selectedSystem,
          stickNumber: parseInt(stickNumber, 10),
          question: question.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error("解籤服務暫時無法使用");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("無法讀取回應");

      let fullText = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        setInterpretation(fullText);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "解籤過程發生錯誤");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = useCallback(() => {
    setStep("select");
    setSelectedSystem(null);
    setStickNumber("");
    setQuestion("");
    setStickData(null);
    setInterpretation("");
    setError("");
    setIsLoading(false);
  }, []);

  const handleBack = () => {
    if (step === "input") {
      setStep("select");
      setSelectedSystem(null);
    } else if (step === "confirm") {
      setStep("input");
      setStickData(null);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-2xl mx-auto px-4 pb-8">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: System Selection */}
        {step === "select" && (
          <div>
            <h2 className="font-serif text-lg text-center text-[var(--color-text-light)] mb-6">
              請選擇您的籤詩系統
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SYSTEMS_UI.map((sys) => (
                <button
                  key={sys.id}
                  onClick={() => handleSelectSystem(sys.id)}
                  className="text-left p-5 rounded-lg border border-[var(--color-border)] bg-white hover:border-[var(--color-gold)] hover:shadow-md transition-all duration-200 cursor-pointer"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{sys.icon}</span>
                    <span className="font-serif text-lg font-bold text-[var(--color-primary)]">
                      {sys.name}
                    </span>
                    <span className="text-xs text-[var(--color-text-light)] ml-auto">
                      {sys.count} 首
                    </span>
                  </div>
                  <p className="text-sm text-[var(--color-text-light)]">
                    {sys.description}
                  </p>
                  <p className="text-xs text-[var(--color-text-light)] mt-1 opacity-70">
                    {sys.temple}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-[var(--color-text-light)]">
                還沒有籤號？請先到廟宇或線上求籤，取得籤號後再來解讀
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Input Form */}
        {step === "input" && selectedSystemInfo && (
          <div>
            <button
              onClick={handleBack}
              className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-primary)] mb-4 cursor-pointer"
            >
              ← 重新選擇系統
            </button>

            <div className="bg-white rounded-lg border border-[var(--color-border)] p-6">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xl">{selectedSystemInfo.icon}</span>
                <h2 className="font-serif text-lg font-bold text-[var(--color-primary)]">
                  {selectedSystemInfo.name}
                </h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">
                    籤號（1 - {selectedSystemInfo.count}）
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={selectedSystemInfo.count}
                    value={stickNumber}
                    onChange={(e) => setStickNumber(e.target.value)}
                    placeholder={`請輸入 1 到 ${selectedSystemInfo.count}`}
                    className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] outline-none text-lg bg-[var(--color-cream)]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">
                    您想問的問題
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {QUESTION_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        onClick={() =>
                          setQuestion((q) =>
                            q ? `${q}（${chip}方面）` : `想請問${chip}方面的問題：`
                          )
                        }
                        className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-text-light)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors cursor-pointer"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="請描述您想問的具體問題，越具體越能獲得精準的解讀..."
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] outline-none text-sm leading-relaxed bg-[var(--color-cream)] resize-none"
                  />
                </div>

                <button
                  onClick={handleSubmitForm}
                  disabled={
                    !stickNumber ||
                    !question.trim() ||
                    isLoading ||
                    parseInt(stickNumber) < 1 ||
                    parseInt(stickNumber) > selectedSystemInfo.count
                  }
                  className="w-full py-3 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  {isLoading ? "查詢中..." : "查看籤詩"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Poem Confirmation */}
        {step === "confirm" && stickData && (
          <div>
            <button
              onClick={handleBack}
              className="text-sm text-[var(--color-text-light)] hover:text-[var(--color-primary)] mb-4 cursor-pointer"
            >
              ← 修改籤號或問題
            </button>

            <h2 className="font-serif text-lg text-center text-[var(--color-text-light)] mb-6">
              請確認這是您抽到的籤
            </h2>

            <PoemDisplay
              poem={stickData.poem}
              displayNumber={stickData.displayNumber}
              rank={stickData.rank}
              story={stickData.story}
            />

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleBack}
                className="flex-1 py-3 rounded-lg border border-[var(--color-border)] text-[var(--color-text-light)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
              >
                不對，重新輸入
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 py-3 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary)]/90 transition-colors cursor-pointer"
              >
                確認，開始解讀
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Interpretation Result */}
        {step === "interpret" && (
          <div>
            {stickData && (
              <PoemDisplay
                poem={stickData.poem}
                displayNumber={stickData.displayNumber}
                rank={stickData.rank}
                story={stickData.story}
              />
            )}

            <div className="mt-6 bg-white rounded-lg border border-[var(--color-border)] p-6 md:p-8">
              {isLoading && !interpretation && (
                <div className="text-center py-8">
                  <div className="inline-block w-6 h-6 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
                  <p className="mt-3 text-sm text-[var(--color-text-light)]">
                    正在為您解讀籤詩...
                  </p>
                </div>
              )}

              {interpretation && (
                <div className="interpretation-result stream-text">
                  <ReactMarkdown>{interpretation}</ReactMarkdown>
                </div>
              )}

              {!isLoading && interpretation && (
                <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
                  <button
                    onClick={handleReset}
                    className="w-full py-3 rounded-lg border border-[var(--color-primary)] text-[var(--color-primary)] font-medium hover:bg-[var(--color-primary)] hover:text-white transition-colors cursor-pointer"
                  >
                    解讀另一支籤
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
