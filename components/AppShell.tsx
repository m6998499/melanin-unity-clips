"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Info, LayoutDashboard, Menu, Shield, Upload, X } from "lucide-react";
import { useState } from "react";

const links = [
  { href: "/", label: "Feed", icon: Home },
  { href: "/upload", label: "Upload", icon: Upload },
  { href: "/admin", label: "Admin", icon: LayoutDashboard },
  { href: "/privacy", label: "Privacy", icon: Shield },
  { href: "/terms", label: "Terms", icon: Shield },
  { href: "/community-guidelines", label: "Guidelines", icon: Shield },
  { href: "/support", label: "Support", icon: Info },
  { href: "/app-store-info", label: "Store Info", icon: Info },
];

export function AppShell({ children, feedMode = false }: { children: React.ReactNode; feedMode?: boolean }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <main className={feedMode ? "min-h-screen bg-ink text-white" : "min-h-screen bg-ink text-white"}>
      <button
        aria-label={open ? "Close navigation" : "Open navigation"}
        className="fixed right-4 top-4 z-50 grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-black/70 text-white shadow-glow backdrop-blur"
        onClick={() => setOpen((value) => !value)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      <aside
        className={`fixed inset-y-0 right-0 z-40 w-[min(82vw,340px)] border-l border-white/10 bg-black/95 p-5 pt-20 shadow-2xl backdrop-blur transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-7">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-ember text-lg font-black text-black">MU</div>
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-ember">Melanin Unity</p>
              <h1 className="text-xl font-black">Clips</h1>
            </div>
          </div>
        </div>
        <nav className="grid gap-2">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              className={`flex items-center gap-3 rounded-md px-3 py-3 text-sm font-semibold transition ${
                pathname === href ? "bg-ember text-black" : "text-white/82 hover:bg-white/10"
              }`}
              href={href}
              key={href}
              onClick={() => setOpen(false)}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      {children}
    </main>
  );
}
