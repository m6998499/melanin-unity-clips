import { PageFrame } from "@/components/PageFrame";
import { Section } from "@/components/PolicyContent";

export default function TermsPage() {
  return (
    <PageFrame eyebrow="Legal" title="Terms of Service" description="Starter terms for user content, moderation, acceptable use, and platform operation. Have counsel review before release.">
      <Section title="User content">
        <p>You keep ownership of your videos, captions, and other content, but grant Melanin Unity Clips permission to host, display, distribute, and promote that content within the app.</p>
      </Section>
      <Section title="Acceptable use">
        <p>Users may not upload unlawful, hateful, harassing, sexually explicit, violent, dangerous, fraudulent, infringing, impersonating, or spam content.</p>
      </Section>
      <Section title="Moderation rights">
        <p>We may reject, remove, restrict, or delete content and accounts when needed to enforce these terms, protect users, satisfy legal requests, or maintain app store compliance.</p>
      </Section>
      <Section title="Disclaimers">
        <p>The app is provided as-is. We do not guarantee uninterrupted service, content availability, creator earnings, or that user content is accurate.</p>
      </Section>
    </PageFrame>
  );
}
