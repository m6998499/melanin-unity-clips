import { AppShell } from "@/components/AppShell";
import { VideoFeed } from "@/components/VideoFeed";
import { sampleVideos } from "@/lib/videos";

export default function HomePage() {
  return (
    <AppShell feedMode>
      <VideoFeed clips={sampleVideos} />
    </AppShell>
  );
}
