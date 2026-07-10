import { Brand } from "@/components/Brand";
import { NavCard } from "@/components/NavCard";
import { FeedbackIcon, MenuIcon } from "@/components/icons";
import { HOME_COPY } from "@/lib/site";

// Home landing — the hub for opening day. A type-forward red hero masthead
// (oversized Vazirmatn-heavy headline; Archivo stays reserved for the "Leno"
// wordmark inside <Brand>) over two destination cards. Expands on tablet/desktop
// instead of staying a phone column: the card widens and the cards go 2-up.
// data-canvas mirrors the cream2 backdrop onto <body> (globals.css) so the
// scrollbar gutter and overscroll match.
export default function Home() {
  return (
    <main
      id="main"
      tabIndex={-1}
      data-canvas="cream2"
      className="flex-1 sm:bg-cream2 sm:px-6 sm:py-10 lg:py-14"
    >
      <div className="mx-auto w-full max-w-150 bg-paper sm:overflow-hidden sm:rounded-4xl sm:border sm:border-line sm:shadow-[0_24px_60px_-32px_rgb(90_24_12/0.4)] md:max-w-3xl lg:max-w-5xl">
        <header className="bg-brand px-5 pb-10 pt-7 text-cream sm:px-9 sm:pb-12 sm:pt-9 lg:px-14 lg:pb-16 lg:pt-14">
          <Brand surface="red" />

          <div className="mt-8 lg:mt-12 lg:max-w-2xl">
            <h1 className="text-4xl font-black leading-tight sm:text-5xl lg:text-[clamp(3rem,5vw,4.5rem)]">
              {HOME_COPY.title}
            </h1>
            <p className="mt-4 text-sm leading-7 text-cream/85 sm:text-base lg:text-lg lg:leading-8">
              {HOME_COPY.subtitle}
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-4 p-5 sm:p-9 md:grid md:grid-cols-2 md:gap-5 lg:gap-6 lg:p-14">
          <NavCard
            href="/menu"
            title={HOME_COPY.menu.title}
            description={HOME_COPY.menu.desc}
            icon={<MenuIcon />}
          />
          <NavCard
            href="/survey"
            title={HOME_COPY.survey.title}
            description={HOME_COPY.survey.desc}
            icon={<FeedbackIcon />}
          />
        </div>
      </div>
    </main>
  );
}
