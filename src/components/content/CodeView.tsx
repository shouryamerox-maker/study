import { highlightC, tokenClass } from "@/lib/highlight";
import { cn } from "@/components/ui";

/** Read-only highlighted code with optional line numbers and highlighted lines. */
export function CodeView({
  code,
  language = "c",
  lineNumbers = true,
  highlight,
  className,
}: {
  code: string;
  language?: string;
  lineNumbers?: boolean;
  highlight?: Set<number>;
  className?: string;
}) {
  const cLike = ["c", "cpp", "java", "javascript"].includes(language);
  const lines = code.replace(/\n$/, "").split("\n");
  // Highlight per line so line numbers stay aligned (multi-line comments are rare in lessons).
  return (
    <pre className={cn("overflow-x-auto rounded-[8px] border border-border bg-code-bg py-2.5 text-[13px] leading-[1.6]", className)}>
      <code className="block min-w-max">
        {lines.map((line, i) => (
          <span key={i} className={cn("flex pr-4", highlight?.has(i + 1) && "bg-primary-soft/70")}>
            {lineNumbers && (
              <span aria-hidden className="w-9 shrink-0 select-none pr-3 text-right text-faint">
                {i + 1}
              </span>
            )}
            <span className={cn(!lineNumbers && "pl-3.5")}>
              {cLike
                ? highlightC(line).map((t, j) =>
                    t.t === "plain" ? (
                      t.v
                    ) : (
                      <span key={j} className={tokenClass[t.t]}>
                        {t.v}
                      </span>
                    ),
                  )
                : line}
              {line === "" ? " " : null}
            </span>
          </span>
        ))}
      </code>
    </pre>
  );
}

export function OutputView({ text, title = "Output", tone = "neutral" }: { text: string; title?: string; tone?: "neutral" | "error" }) {
  return (
    <div className="overflow-hidden rounded-[8px] border border-border">
      <div className="border-b border-border bg-sidebar px-3 py-1.5 text-[11.5px] font-semibold uppercase tracking-[0.05em] text-muted">{title}</div>
      <pre className={cn("overflow-x-auto bg-[#2e2420] px-3.5 py-2.5 text-[13px] leading-[1.6]", tone === "error" ? "text-[#f3b4a8]" : "text-[#efe7da]")}>
        {text === "" ? <span className="italic text-[#a89c8d]">(no output)</span> : text}
      </pre>
    </div>
  );
}
