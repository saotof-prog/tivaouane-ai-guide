import type { SuggestedQuestion } from "@/lib/mock/assistant";

export interface SuggestedQuestionsProps {
  questions: SuggestedQuestion[];
  onSelect: (question: SuggestedQuestion) => void;
  disabled?: boolean;
}

export function SuggestedQuestions({
  questions,
  onSelect,
  disabled = false,
}: SuggestedQuestionsProps) {
  if (questions.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {questions.map((question) => (
        <button
          key={question.id}
          type="button"
          onClick={() => onSelect(question)}
          disabled={disabled}
          className="cursor-pointer rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground transition-colors hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-50"
        >
          {question.label}
        </button>
      ))}
    </div>
  );
}