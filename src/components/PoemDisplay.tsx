interface PoemDisplayProps {
  poem: string[];
  displayNumber: string;
  rank?: string;
  story?: string;
  attribute?: string;
}

export default function PoemDisplay({ poem, displayNumber, rank, story, attribute }: PoemDisplayProps) {
  return (
    <div className="poem-card rounded-lg p-6 md:p-8 text-center">
      <div className="flex items-center justify-center gap-3 mb-4">
        <span className="font-serif text-lg text-[var(--color-primary)] font-bold">
          {displayNumber}
        </span>
        {rank && (
          <span className="text-sm px-2 py-0.5 rounded bg-[var(--color-gold)]/10 text-[var(--color-gold)] font-medium">
            {rank}
          </span>
        )}
      </div>

      <div className="space-y-2 my-6">
        {poem.map((line, i) => (
          <p key={i} className="font-serif text-xl md:text-2xl text-[var(--color-text)] tracking-wider leading-relaxed">
            {line}
          </p>
        ))}
      </div>

      {(story || attribute) && (
        <div className="mt-4 space-y-1">
          {attribute && (
            <p className="text-sm text-[var(--color-text-light)]">{attribute}</p>
          )}
          {story && (
            <p className="text-sm text-[var(--color-text-light)]">典故：{story}</p>
          )}
        </div>
      )}
    </div>
  );
}
