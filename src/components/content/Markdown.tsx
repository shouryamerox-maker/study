import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { cn } from "@/components/ui";

/** Safe markdown (raw HTML is not rendered) with tables and $math$ support. */
export function Markdown({ children, className, inline }: { children: string; className?: string; inline?: boolean }) {
  return (
    <div className={cn("prose-lesson", inline && "[&>p]:m-0 [&>p]:inline", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          a: ({ href, children }) => (
            <a href={href} target={href?.startsWith("http") ? "_blank" : undefined} rel="noreferrer noopener">
              {children}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
