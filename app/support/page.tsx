import { PageFrame, Panel } from "@/components/PageFrame";

export default function SupportPage() {
  return (
    <PageFrame eyebrow="Help" title="Support" description="Support, reporting, and reviewer contact details for Melanin Unity Clips.">
      <div className="grid gap-5 md:grid-cols-3">
        {[
          ["Contact", "support@example.com for account, upload, moderation, and deletion requests."],
          ["Report content", "Use the report button on any clip. Reports enter the admin review queue."],
          ["Common help", "Login, uploader approval, rejected videos, privacy requests, and app review demo account support."],
        ].map(([title, body]) => (
          <Panel key={title}>
            <h2 className="text-xl font-black">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-white/70">{body}</p>
          </Panel>
        ))}
      </div>
    </PageFrame>
  );
}
