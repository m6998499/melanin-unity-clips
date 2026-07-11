import { PageFrame, Panel } from "@/components/PageFrame";
import { categories } from "@/lib/videos";

export default function UploadPage() {
  return (
    <PageFrame
      eyebrow="Approved uploaders"
      title="Upload vertical clips for moderation."
      description="Validated video uploads go to Supabase Storage and start as pending review unless the uploader is an admin."
    >
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel>
          <form className="grid gap-4">
            <label className="grid gap-2 text-sm font-bold">
              Title
              <input className="rounded-md border border-white/10 bg-black px-4 py-3" placeholder="Clip title" />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Caption
              <textarea className="min-h-28 rounded-md border border-white/10 bg-black px-4 py-3" placeholder="Short caption" />
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Category
              <select className="rounded-md border border-white/10 bg-black px-4 py-3">
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Vertical video file
              <input accept="video/mp4,video/quicktime,video/webm" className="rounded-md border border-dashed border-ember/50 bg-black px-4 py-8" type="file" />
            </label>
            <button className="rounded-md bg-ember px-4 py-3 font-black text-black" type="button">
              Upload for review
            </button>
          </form>
        </Panel>
        <Panel>
          <h2 className="text-xl font-black">Upload rules</h2>
          <ul className="mt-4 grid gap-3 text-sm leading-6 text-white/72">
            <li>Accepted types: MP4, MOV, and WebM.</li>
            <li>Recommended format: 9:16 vertical, 720p or higher.</li>
            <li>Default maximum size: 250 MB before compression.</li>
            <li>Non-admin uploads default to `pending_review`.</li>
            <li>Supabase RLS prevents unapproved users from uploading metadata.</li>
          </ul>
        </Panel>
      </div>
    </PageFrame>
  );
}
