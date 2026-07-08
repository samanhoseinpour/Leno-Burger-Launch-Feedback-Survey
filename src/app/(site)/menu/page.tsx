import type { Metadata } from "next";
import Link from "next/link";
import { LenoMark } from "@/components/Brand";
import { CenteredPanel } from "@/components/CenteredPanel";
import { MENU_COPY } from "@/lib/site";

export const metadata: Metadata = {
  title: "لنو | منو",
};

// Branded "coming soon" placeholder until the real menu is ready. Uses the
// shared CenteredPanel so it frames consistently with /thanks and /404, with
// the title scaled up as a type-forward statement rather than a small caption.
// The back-to-home pill is dropped — the sticky nav now covers that — leaving
// the survey CTA as the single clear next step.
export default function MenuPage() {
  return (
    <CenteredPanel>
      <div className="mx-auto flex max-w-lg flex-col items-center gap-7 px-5 py-20 text-center md:py-24">
        <span
          aria-hidden="true"
          className="grid size-20 place-items-center rounded-full bg-brand text-cream md:size-24"
        >
          <LenoMark className="w-10 md:w-12" />
        </span>

        <div className="space-y-3">
          <h1 className="text-2xl font-black leading-tight text-ink md:text-4xl">
            {MENU_COPY.title}
          </h1>
          <p className="text-sm leading-7 text-muted md:text-base">
            {MENU_COPY.body}
          </p>
        </div>

        <div className="flex flex-col items-center gap-4">
          <p className="text-sm leading-7 text-ink/80 md:text-base">
            {MENU_COPY.surveyNudge}
          </p>
          <Link
            href="/survey"
            className="inline-flex h-14 items-center justify-center rounded-2xl bg-brand px-8 text-base font-bold text-cream transition active:scale-[0.99]"
          >
            {MENU_COPY.surveyCta}
          </Link>
        </div>
      </div>
    </CenteredPanel>
  );
}
