import { PageFrame } from "@/components/PageFrame";
import { Section } from "@/components/PolicyContent";

export default function PrivacyPage() {
  return (
    <PageFrame eyebrow="Legal" title="Privacy Policy" description="Starter privacy language for the Melanin Unity Clips MVP. Replace placeholders with company details before launch.">
      <Section title="Information we collect">
        <p>We may collect account details, uploaded videos, captions, reports, moderation decisions, support requests, device data, and basic analytics needed to operate the app.</p>
      </Section>
      <Section title="How we use information">
        <p>We use information to provide the video feed, authenticate uploaders, review content, respond to reports, improve reliability, prevent abuse, and satisfy legal or app store obligations.</p>
      </Section>
      <Section title="Uploads and moderation">
        <p>Uploaded videos and metadata are stored in Supabase Storage and PostgreSQL. Reports may be retained to investigate safety issues, enforce guidelines, and document moderation decisions.</p>
      </Section>
      <Section title="Retention and deletion">
        <p>Users may request account deletion at support@example.com. Some records may be retained when needed for security, legal compliance, dispute resolution, or abuse prevention.</p>
      </Section>
      <Section title="Contact">
        <p>Privacy contact: privacy@example.com. Mailing address: add business address before launch.</p>
      </Section>
    </PageFrame>
  );
}
