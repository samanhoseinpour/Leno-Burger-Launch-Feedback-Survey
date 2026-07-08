import type { Metadata } from "next";
import { Brand } from "@/components/Brand";
import { SurveyForm } from "@/components/SurveyForm";
import { COPY } from "@/lib/survey";

export const metadata: Metadata = {
  title: "لنو | نظرسنجی",
  description:
    "حضور شما مایه‌ی افتخار ماست؛ چند لحظه وقت بگذارید و نظر ارزشمندتان را با ما در میان بگذارید.",
};

export default function SurveyPage() {
  return (
    // Warm "feedback card" surface on tablet/desktop; edge-to-edge on phones.
    // At lg the card becomes a two-panel frame — the branded intro (the same
    // markup that is the top red band on smaller screens) becomes a left rail,
    // and the form keeps a comfortable ~640px reading column beside it, so the
    // wide screen is framed rather than left empty. data-canvas mirrors the
    // cream2 backdrop onto <body> (globals.css).
    <main
      id="main"
      tabIndex={-1}
      data-canvas="cream2"
      className="flex-1 sm:bg-cream2 sm:px-6 sm:py-10 lg:py-14"
    >
      {/* lg:overflow-visible drops the clip so the rail's intro can position:
          sticky (an overflow!=visible ancestor would silently break it); the two
          red bands re-round their own corners below. Keep the default grid
          align-items:stretch — it's what makes the rail full-height, giving the
          sticky intro its scroll travel. Don't add lg:items-start/self-start. */}
      <div className="mx-auto w-full max-w-150 bg-paper sm:overflow-hidden lg:overflow-visible sm:rounded-4xl sm:border sm:border-line sm:shadow-[0_24px_60px_-32px_rgb(90_24_12/0.4)] lg:grid lg:max-w-[60rem] lg:grid-cols-[20rem_minmax(0,40rem)]">
        {/* Full-height red rail. On lg the intro is wrapped in a sticky box so
            it stays pinned beside the (tall) form instead of floating centered
            in a 4000px column. lg:rounded-s re-rounds the start-side corners the
            card no longer clips. */}
        <header className="bg-brand px-5 pb-9 pt-7 text-cream sm:px-9 sm:pb-11 sm:pt-9 lg:rounded-s-[calc(2rem-1px)] lg:px-10 lg:py-12">
          <div className="lg:sticky lg:top-[calc(var(--nav-h)+1.5rem)]">
            <Brand surface="red" />

            <div className="mt-8 lg:mt-10">
              <h1 className="text-2xl font-black leading-9 sm:text-[1.75rem] sm:leading-10 lg:text-4xl lg:leading-tight">
                {COPY.title}
              </h1>
              <p className="mt-3 text-sm leading-7 text-cream/85 sm:text-[0.95rem] lg:mt-4 lg:text-base">
                {COPY.subtitle}
              </p>
            </div>
          </div>
        </header>

        <div className="lg:min-w-0">
          <SurveyForm />
        </div>
      </div>
    </main>
  );
}
