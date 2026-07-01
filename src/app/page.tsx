import { Brand } from "@/components/Brand";
import { SurveyForm } from "@/components/SurveyForm";
import { COPY } from "@/lib/survey";

export default function Home() {
  return (
    <main className="mx-auto min-h-dvh max-w-md">
      <header className="bg-brand px-5 pb-9 pt-7 text-cream">
        <Brand surface="red" />
        <div className="mt-7">
          <span className="inline-flex items-center rounded-full bg-cream/15 px-3 py-1 text-xs font-medium tracking-wide text-cream ring-1 ring-inset ring-cream/25">
            {COPY.tag}
          </span>
          <h1 className="mt-4 text-2xl font-bold leading-9">{COPY.title}</h1>
          <p className="mt-3 text-sm leading-7 text-cream/85">
            {COPY.subtitle}
          </p>
        </div>
      </header>

      <SurveyForm />
    </main>
  );
}
