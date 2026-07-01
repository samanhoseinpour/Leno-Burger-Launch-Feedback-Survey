import { Brand } from "@/components/Brand";
import { SurveyForm } from "@/components/SurveyForm";
import { COPY } from "@/lib/survey";

export default function Home() {
  return (
    // Warm page surface on tablet/desktop so the survey reads as a physical
    // "feedback card"; edge-to-edge and full-bleed on phones. data-canvas
    // mirrors the cream2 backdrop onto <body> (globals.css) so the scrollbar
    // gutter and overscroll match.
    <main
      data-canvas="cream2"
      className="min-h-dvh sm:bg-cream2 sm:px-6 sm:py-10 lg:py-14"
    >
      <div className="mx-auto w-full max-w-150 bg-paper sm:overflow-hidden sm:rounded-4xl sm:border sm:border-line sm:shadow-[0_24px_60px_-32px_rgb(90_24_12/0.4)]">
        <header className="bg-brand px-5 pb-9 pt-7 text-cream sm:px-9 sm:pb-11 sm:pt-9">
          {/* Logo left, tag pill right — matches the launch card header. */}
          <div dir="ltr" className="flex items-center justify-between gap-3">
            <Brand surface="red" />
            <span className="inline-flex items-center rounded-full px-3.5 py-1 text-xs font-medium tracking-wide text-cream ring-1 ring-inset ring-cream/45">
              {COPY.tag}
            </span>
          </div>

          <div className="mt-8">
            <h1 className="text-2xl font-bold leading-9 sm:text-[1.75rem] sm:leading-10">
              {COPY.title}
            </h1>
            <p className="mt-3 text-sm leading-7 text-cream/85 sm:text-[0.95rem]">
              {COPY.subtitle}
            </p>
          </div>
        </header>

        <SurveyForm />
      </div>
    </main>
  );
}
