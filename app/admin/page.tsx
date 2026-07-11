import { PageFrame, Panel } from "@/components/PageFrame";
import { sampleVideos } from "@/lib/videos";

export default function AdminPage() {
  const statuses = ["pending_review", "published", "rejected", "removed"];
  return (
    <PageFrame
      eyebrow="Moderation"
      title="Admin review dashboard."
      description="A focused moderation surface for publishing clips, handling reports, and managing approved uploaders."
    >
      <div className="grid gap-5">
        <div className="grid gap-3 sm:grid-cols-4">
          {statuses.map((status) => (
            <Panel key={status}>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/50">{status}</p>
              <p className="mt-2 text-3xl font-black">{sampleVideos.filter((video) => video.status === status).length}</p>
            </Panel>
          ))}
        </div>
        <Panel>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.16em] text-white/45">
                <tr>
                  <th className="py-3">Clip</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Reports</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {sampleVideos.map((video) => (
                  <tr key={video.id}>
                    <td className="py-4 font-bold">{video.title}</td>
                    <td>{video.category}</td>
                    <td>{video.status}</td>
                    <td>{video.report_count}</td>
                    <td>
                      <div className="flex gap-2">
                        {["Publish", "Reject", "Remove", "Delete"].map((action) => (
                          <button className="rounded-md border border-white/10 px-3 py-2 text-xs font-bold hover:bg-white/10" key={action}>
                            {action}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
        <Panel>
          <h2 className="text-xl font-black">Uploader permissions</h2>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input className="min-w-0 flex-1 rounded-md border border-white/10 bg-black px-4 py-3" placeholder="creator@example.com" />
            <button className="rounded-md bg-ember px-4 py-3 font-black text-black">Add uploader</button>
          </div>
        </Panel>
      </div>
    </PageFrame>
  );
}
