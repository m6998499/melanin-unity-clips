import { PageFrame, Panel } from "@/components/PageFrame";

export default function LoginPage() {
  return (
    <PageFrame
      eyebrow="Secure access"
      title="Sign in to upload or moderate clips."
      description="Connect Supabase Auth to enable approved uploader and admin-only workflows."
    >
      <Panel>
        <form className="grid gap-4">
          <label className="grid gap-2 text-sm font-bold">
            Email
            <input className="rounded-md border border-white/10 bg-black px-4 py-3 text-white" placeholder="you@example.com" type="email" />
          </label>
          <label className="grid gap-2 text-sm font-bold">
            Password
            <input className="rounded-md border border-white/10 bg-black px-4 py-3 text-white" placeholder="Password" type="password" />
          </label>
          <button className="rounded-md bg-ember px-4 py-3 font-black text-black" type="button">
            Sign in with Supabase
          </button>
          <p className="text-sm leading-6 text-white/62">
            Wire this form to `supabase.auth.signInWithPassword` after adding your Supabase URL and anon key to `.env.local`.
          </p>
        </form>
      </Panel>
    </PageFrame>
  );
}
