import { COPY } from "@/lib/survey";
import { Brand } from "./Brand";

// The card's closing red band — mark on the right, the warm sign-off to its
// left (right-aligned, RTL), mirroring the printed launch card's footer.
// Rendered as the last block inside the survey card so it clips to the rounded
// bottom corners on tablet/desktop.
export function SurveyFooter() {
  return (
    <footer className="flex items-center gap-4 bg-brand px-5 py-7 text-cream sm:px-9 sm:py-8">
      <Brand surface="red" markOnly className="shrink-0" />
      <div className="min-w-0 flex-1 text-start">
        <p className="text-sm font-bold leading-7 sm:text-[0.95rem]">
          {COPY.footer.line1}
        </p>
        <p className="mt-1 text-xs leading-6 text-cream/80 sm:text-sm">
          {COPY.footer.line2}
        </p>
      </div>
    </footer>
  );
}
