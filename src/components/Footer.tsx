export default function Footer() {
  return (
    <footer className="mt-16 pb-8 px-4 text-center">
      <div className="divider-cloud mx-auto max-w-xs mb-6" />
      <p className="text-xs text-[var(--color-text-light)] max-w-lg mx-auto leading-relaxed">
        本服務僅供參考，籤詩解讀為 AI 生成內容，不代表任何宮廟或宗教團體之官方立場。
        人生重大決定仍應依據個人判斷與專業建議。
      </p>
      <p className="text-xs text-[var(--color-text-light)] mt-3">
        籤詩資料來源：台東天后宮、北海觀音明善堂
      </p>
    </footer>
  );
}
