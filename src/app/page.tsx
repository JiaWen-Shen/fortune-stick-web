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

type Step = "input" | "confirm" | "interpret";

export default function Home() {
  const [step, setStep] = useState<Step>("input");
  const [selectedSystem, setSelectedSystem] = useState<FortuneSystem | null>(null);
  const [stickNumber, setStickNumber] = useState("");
  const [question, setQuestion] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [questionRestatement, setQuestionRestatement] = useState("");
  const [stickData, setStickData] = useState<FortuneStick | null>(null);
  const [interpretation, setInterpretation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedSystemInfo = SYSTEMS_UI.find((s) => s.id === selectedSystem);

  const handleSubmitForm = async () => {
    if (!selectedSystem || !stickNumber || !question.trim()) return;

    setIsLoading(true);
    setError("");

    try {
      // Fetch fortune stick data
      const res = await fetch(
        `/api/fortune-data?system=${selectedSystem}&number=${stickNumber}`
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "無法取得籤詩資料");
      }
      const data: FortuneStick = await res.json();
      setStickData(data);

      // Set question restatement (use original for now, can add AI rephrasing later)
      setQuestionRestatement(question.trim());
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
      const finalQuestion = additionalDetails.trim()
        ? `${questionRestatement}\n\n補充說明：${additionalDetails.trim()}`
        : questionRestatement;

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
    setQuestionRestatement("");
    setStickData(null);
    setInterpretation("");
    setError("");
    setIsLoading(false);
  }, []);

  const handleBack = () => {
    if (step === "confirm") {
      setStep("input");
      setStickData(null);
      setQuestionRestatement("");
      setAdditionalDetails("");
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

        {/* Step 1: Input Form */}
        {step === "input" && (
          <div>
            <h2 className="font-serif text-2xl text-center text-[var(--color-primary)] mb-8">
              籤詩解讀
            </h2>

            <div className="bg-white rounded-lg border border-[var(--color-border)] p-6 md:p-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">
                    1. 選擇籤詩系統
                  </label>
                  <select
                    value={selectedSystem || ""}
                    onChange={(e) => setSelectedSystem(e.target.value as FortuneSystem)}
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
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">
                        2. 輸入籤號
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={SYSTEMS_UI.find(s => s.id === selectedSystem)?.count}
                        value={stickNumber}
                        onChange={(e) => setStickNumber(e.target.value)}
                        placeholder={`請輸入 1 到 ${SYSTEMS_UI.find(s => s.id === selectedSystem)?.count}`}
                        className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] outline-none text-lg bg-[var(--color-cream)]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-[var(--color-text)]">
                        3. 簡述問題 <span className="text-red-500">*</span>
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
                        placeholder="請描述您想問的具體問題..."
                        rows={4}
                        required
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
                        parseInt(stickNumber) > (SYSTEMS_UI.find(s => s.id === selectedSystem)?.count || 0)
                      }
                      className="w-full py-3 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      {isLoading ? "處理中..." : "下一步"}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-[var(--color-text-light)]">
                還沒有籤號？請先到廟宇或線上求籤，取得籤號後再來解讀
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Confirmation */}
        {step === "confirm" && stickData && (
          <div>
            <h2 className="font-serif text-2xl text-center text-[var(--color-primary)] mb-8">
              確認資訊
            </h2>

            <div className="space-y-6">
              {/* Question Restatement */}
              <div className="bg-white rounded-lg border border-[var(--color-border)] p-6">
                <h3 className="font-serif text-lg font-bold text-[var(--color-primary)] mb-3">
                  問題整理
                </h3>
                <p className="text-[var(--color-text)] leading-relaxed bg-[var(--color-cream-dark)] p-4 rounded-lg">
                  {questionRestatement || question}
                </p>
              </div>

              {/* Additional Details */}
              <div className="bg-white rounded-lg border border-[var(--color-border)] p-6">
                <h3 className="font-serif text-lg font-bold text-[var(--color-primary)] mb-3">
                  問題補充 <span className="text-sm font-normal text-[var(--color-text-light)]">(可選填)</span>
                </h3>
                <textarea
                  value={additionalDetails}
                  onChange={(e) => setAdditionalDetails(e.target.value)}
                  placeholder="如果有需要補充的細節，可以在這裡說明..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg border border-[var(--color-border)] focus:border-[var(--color-gold)] focus:ring-1 focus:ring-[var(--color-gold)] outline-none text-sm leading-relaxed bg-[var(--color-cream)] resize-none"
                />
              </div>

              {/* Poem Preview */}
              <div className="bg-white rounded-lg border border-[var(--color-border)] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-serif text-lg font-bold text-[var(--color-primary)]">
                    籤詩預覽及核對
                  </h3>
                  <button
                    onClick={handleBack}
                    className="text-sm px-4 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-light)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-colors cursor-pointer"
                  >
                    更正籤詩
                  </button>
                </div>

                <PoemDisplay
                  poem={stickData.poem}
                  displayNumber={stickData.displayNumber}
                  rank={stickData.rank}
                  story={stickData.story}
                />
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="w-full py-3 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {isLoading ? "正在解讀..." : "確認，開始解讀"}
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
