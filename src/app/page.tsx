import { Brand } from "@/components/Brand";

// Placeholder brand shell — the full survey replaces this in the next step.
export default function Home() {
  return (
    <div className="mx-auto min-h-dvh max-w-md">
      <header className="bg-brand px-5 py-6">
        <Brand surface="red" />
      </header>
    </div>
  );
}
