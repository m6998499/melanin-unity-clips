export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-white/10 py-6">
      <h2 className="text-2xl font-black">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-7 text-white/72">{children}</div>
    </section>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2">
      {items.map((item) => (
        <li className="rounded-md border border-white/10 bg-white/[0.035] px-4 py-3" key={item}>
          {item}
        </li>
      ))}
    </ul>
  );
}
