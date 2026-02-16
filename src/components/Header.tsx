export default function Header() {
  return (
    <header className="text-center py-10 px-4">
      <h1 className="font-serif text-3xl md:text-4xl font-bold text-[var(--color-primary)] tracking-wide">
        籤詩解讀
      </h1>
      <p className="mt-3 text-[var(--color-text-light)] text-sm md:text-base">
        傳統籤詩 · 個人化解讀服務
      </p>
      <div className="divider-cloud mt-6 mx-auto max-w-xs" />
    </header>
  );
}
