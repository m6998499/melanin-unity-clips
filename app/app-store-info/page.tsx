import { PageFrame, Panel } from "@/components/PageFrame";
import { BulletList, Section } from "@/components/PolicyContent";

const appleKeywords = "short video,clips,creator,community,lifestyle,culture,motivation,education,wellness,local business";

export default function AppStoreInfoPage() {
  return (
    <PageFrame eyebrow="Internal" title="App store submission hub" description="Metadata, screenshot needs, privacy guidance, moderation explanation, and launch checklists for Apple and Google.">
      <div className="grid gap-5 lg:grid-cols-2">
        <Panel>
          <h2 className="text-2xl font-black">Store metadata</h2>
          <p className="mt-4 text-sm leading-7 text-white/72">
            Short description: A scroll-only video discovery app for creators, ideas, culture, lifestyle, and community-driven clips.
          </p>
          <p className="mt-3 text-sm leading-7 text-white/72">
            Full description: Melanin Unity Clips is a simple vertical video discovery app for watching short videos across education,
            motivation, lifestyle, entrepreneurship, culture, entertainment, wellness, local business, community, comedy, news commentary,
            and general creator content.
          </p>
          <p className="mt-3 text-sm leading-7 text-white/72">Apple keywords: {appleKeywords}</p>
        </Panel>
        <Panel>
          <h2 className="text-2xl font-black">Categories and ratings</h2>
          <p className="mt-4 text-sm leading-7 text-white/72">Apple primary: Entertainment. Apple secondary: Lifestyle or Social Networking.</p>
          <p className="mt-3 text-sm leading-7 text-white/72">Google Play primary: Entertainment. Tags: Video Players, Lifestyle, Social.</p>
          <p className="mt-3 text-sm leading-7 text-white/72">Age guidance: plan for Teen/12+ because user-uploaded video content and moderation are present.</p>
        </Panel>
      </div>
      <Section title="Screenshots needed">
        <BulletList
          items={[
            "iPhone 6.7 inch feed, upload, admin/reporting, support/privacy screens.",
            "iPhone 6.5 inch or 5.5 inch fallback if App Store Connect requests it.",
            "Android phone feed, upload, admin/reporting, support/privacy screens.",
            "iPad screenshots only if iPad support is enabled.",
          ]}
        />
      </Section>
      <Section title="Icon and splash checklist">
        <BulletList
          items={[
            "iOS App Store 1024x1024 PNG, no transparency.",
            "iOS app icons generated through Xcode asset catalog.",
            "Android adaptive icon foreground and background assets.",
            "PWA maskable icons at 192x192 and 512x512.",
            "Splash screens generated with Capacitor assets tooling.",
          ]}
        />
      </Section>
      <Section title="Privacy questionnaire guidance">
        <p>Disclose account identifiers, user-generated content, diagnostics, support data, reports, and analytics if enabled. Mark data as linked to the user when tied to authenticated accounts. Do not claim data is not collected if uploads, reports, or auth are enabled.</p>
      </Section>
      <Section title="Moderation explanation">
        <p>New uploads from approved non-admin uploaders enter pending review. Admins can publish, reject, remove, delete, and review reports. Public users only see published videos. Reports are reviewed in the admin dashboard.</p>
      </Section>
      <Section title="Demo account instructions">
        <p>Create a Supabase Auth user such as reviewer@example.com, add it to admin_roles, and include credentials plus steps to reach /admin and /upload in Apple and Google review notes.</p>
      </Section>
      <Section title="Submission checklists">
        <BulletList
          items={[
            "Apple: metadata, privacy labels, age rating, screenshots, demo account, support URL, privacy URL, signed iOS build.",
            "Google: store listing, data safety form, content rating, target audience, screenshots, privacy URL, signed Android App Bundle.",
            "Both: replace placeholder emails, connect production Supabase, verify account deletion path, test moderation workflow.",
          ]}
        />
      </Section>
    </PageFrame>
  );
}
