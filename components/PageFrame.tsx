import { AppShell } from "@/components/AppShell";

export function PageFrame({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <AppShell>
      <section className="mx-auto min-h-screen w-full max-w-5xl px-5 py-16 sm:px-8">
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-ember">{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-balance sm:text-6xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-white/70">{description}</p>
        <div className="mt-10">{children}</div>
      </section>
    </AppShell>
  );
}

export function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-md border border-white/10 bg-white/[0.045] p-5 shadow-glow">{children}</div>;
}
