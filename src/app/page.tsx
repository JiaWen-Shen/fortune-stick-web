"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PoemDisplay from "@/components/PoemDisplay";
import ReactMarkdown from "react-markdown";
import type { FortuneSystem, FortuneStick } from "@/lib/fortune-types";
import { getSystemTiangan } from "@/lib/systems";

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

type Step = "input" | "interpret";

export default function Home() {
  const [step, setStep] = useState<Step>("input");
  const [selectedSystem, setSelectedSystem] = useState<FortuneSystem | null>(null);
  const [stickNumber, setStickNumber] = useState("");
  const [question, setQuestion] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [stickData, setStickData] = useState<FortuneStick | null>(null);
  const [isPoemLoading, setIsPoemLoading] = useState(false);
  const [interpretation, setInterpretation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const poemRef = useRef<HTMLDivElement>(null);

  // Auto-fetch poem when system + stick number are both valid
  useEffect(() => {
    if (!selectedSystem || !stickNumber) {
      setStickData(null);
      return;
    }
    const num = parseInt(stickNumber, 10);
    const maxCount = SYSTEMS_UI.find(s => s.id === selectedSystem)?.count ?? 0;
    if (isNaN(num) || num < 1 || num > maxCount) {
      setStickData(null);
      return;
    }

    let cancelled = false;
    // Short debounce for number input; dropdowns fire instantly
    const timer = setTimeout(async () => {
      setIsPoemLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/fortune-data?system=${selectedSystem}&number=${num}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "無法取得籤詩資料");
        }
        const data: FortuneStick = await res.json();
        if (!cancelled) {
          setStickData(data);
          // Scroll poem preview into view on mobile
          setTimeout(() => {
            poemRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
          }, 100);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "發生錯誤");
          setStickData(null);
        }
      } finally {
        if (!cancelled) setIsPoemLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [selectedSystem, stickNumber]);

  const handleSystemChange = (system: FortuneSystem) => {
    setSelectedSystem(system);
    setStickNumber("");
    setStickData(null);
    setError("");
  };

  const handleStartInterpretation = async () => {
    if (!selectedSystem || !stickData || !question.trim()) return;

    setStep("interpret");
    setInterpretation("");
    setIsLoading(true);
    setError("");

    try {
      const finalQuestion = additionalDetails.trim()
        ? `${question.trim()}\n\n補充說明：${additionalDetails.trim()}`
        : question.trim();

      const res = await fetch("/api/interpret", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: selectedSystem,
          stickNumber: parseInt(stickNumber, 10),
          question: finalQuestion,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        if (errorText.includes("credit balance")) {
          throw new Error("API 額度不足，請檢查 Anthropic 帳戶餘額");
        }
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
    setStep("input");
    setSelectedSystem(null);
    setStickNumber("");
    setQuestion("");
    setAdditionalDetails("");
    setStickData(null);
    setInterpretation("");
    setError("");
    setIsLoading(false);
  }, []);

  const isSubmitDisabled =
    !stickNumber ||
    !question.trim() ||
    !stickData ||
    isPoemLoading ||
    isLoading;

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-2xl mx-auto px-4 pb-24">
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Step 1: Input */}
        {step === "input" && (
          <div className="space-y-4">
            <h2 className="font-serif text-2xl text-center text-[var(--color-primary)] mb-6">
              輸入籤詩資訊
            </h2>

            {/* System + Stick Number */}
            <div className="bg-white rounded-lg border border-[var(--color-border)] p-6 md:p-8">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">
                    1. 選擇籤詩系統
                  </label>
                  <select
                    value={selectedSystem || ""}
                    onChange={(e) => handleSystemChange(e.target.value as FortuneSystem)}
                    className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] outline-none bg-[var(--color-cream)] cursor-pointer"
                  >
                    <option value="">請選擇籤詩系統</option>
                    {SYSTEMS_UI.map((sys) => (
                      <option key={sys.id} value={sys.id}>
                        {sys.icon} {sys.name} ({sys.count}首)
                      </option>
                    ))}
                  </select>
                </div>

                {selectedSystem && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">
                      2. 選擇籤號
                    </label>
                    {(() => {
                      const tiangan = getSystemTiangan(selectedSystem);
                      if (tiangan) {
                        return (
                          <select
                            value={stickNumber}
                            onChange={(e) => setStickNumber(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] outline-none bg-[var(--color-cream)] cursor-pointer text-base"
                          >
                            <option value="">請選擇籤號</option>
                            {tiangan.map((tz, i) => (
                              <option key={i + 1} value={String(i + 1)}>
                                第 {i + 1} 籤　{tz}
                              </option>
                            ))}
                          </select>
                        );
                      }
                      return (
                        <input
                          type="number"
                          min={1}
                          max={SYSTEMS_UI.find(s => s.id === selectedSystem)?.count}
                          value={stickNumber}
                          onChange={(e) => setStickNumber(e.target.value)}
                          placeholder={`請輸入 1 到 ${SYSTEMS_UI.find(s => s.id === selectedSystem)?.count}`}
                          className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] outline-none text-lg bg-[var(--color-cream)]"
                        />
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Poem Preview — appears automatically when stick is selected */}
            {selectedSystem && stickNumber && (
              <div ref={poemRef}>
                {isPoemLoading ? (
                  <div className="bg-white rounded-lg border border-[var(--color-border)] p-6 flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin shrink-0" />
                    <span className="text-sm text-[var(--color-text-light)]">載入籤詩中…</span>
                  </div>
                ) : stickData ? (
                  <div className="bg-white rounded-lg border border-[var(--color-border)] p-5 md:p-6">
                    <p className="text-xs text-[var(--color-text-light)] mb-3">
                      請確認籤號與手中籤條相符
                    </p>
                    <PoemDisplay
                      poem={stickData.poem}
                      displayNumber={stickData.displayNumber}
                      rank={stickData.rank}
                      story={stickData.story}
                    />
                  </div>
                ) : null}
              </div>
            )}

            {/* Question + Details — appears after poem is loaded */}
            {stickData && (
              <div className="bg-white rounded-lg border border-[var(--color-border)] p-6 md:p-8">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">
                      3. 簡述問題 <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {QUESTION_CHIPS.map((chip) => (
                        <button
                          key={chip}
                          onClick={() => setQuestion(`想請問${chip}方面的問題：`)}
                          className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-text-light)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors cursor-pointer"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="請描述您想問的具體問題..."
                        rows={4}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] outline-none text-sm leading-relaxed bg-[var(--color-cream)] resize-none"
                      />
                      {question && (
                        <button
                          onClick={() => setQuestion("")}
                          className="absolute top-3 right-3 text-[var(--color-text-light)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                          title="清除內容"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1.5 text-[var(--color-text)]">
                      補充說明{" "}
                      <span className="text-xs font-normal text-[var(--color-text-light)]">（可選填）</span>
                    </label>
                    <textarea
                      value={additionalDetails}
                      onChange={(e) => setAdditionalDetails(e.target.value)}
                      placeholder="如有需要補充的細節，可以在這裡說明…"
                      rows={2}
                      className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] outline-none text-sm leading-relaxed bg-[var(--color-cream)] resize-none"
                    />
                  </div>

                  <p className="text-xs text-[var(--color-text-light)] leading-relaxed">
                    原則上一隻籤回答一個問題，問題敘述得愈詳細，個人化解籤就愈完整，請勿輸入個人隱私資訊
                  </p>
                </div>
              </div>
            )}

            <div className="mt-4 text-center">
              <p className="text-sm text-[var(--color-text-light)]">
                還沒有籤號？請先到廟宇或線上求籤，取得籤號後再來解讀
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Interpretation Result */}
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
                    正在為您解讀籤詩…
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

      {/* Sticky bottom CTA — only visible on input step when poem is ready */}
      {step === "input" && stickData && (
        <div className="fixed bottom-0 left-0 right-0 z-20 px-4 pb-safe-area-inset-bottom">
          <div className="max-w-2xl mx-auto pb-4 pt-3 bg-gradient-to-t from-[var(--color-cream)] via-[var(--color-cream)] to-transparent">
            <button
              onClick={handleStartInterpretation}
              disabled={isSubmitDisabled}
              className="w-full py-4 rounded-xl bg-[var(--color-primary)] text-white font-medium text-base shadow-lg hover:bg-[var(--color-primary)]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              {isLoading ? "正在解讀…" : !question.trim() ? "填寫問題後即可解讀" : "開始解讀"}
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
