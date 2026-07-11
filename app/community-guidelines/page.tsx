import { PageFrame } from "@/components/PageFrame";
import { BulletList, Section } from "@/components/PolicyContent";

const rules = [
  "No harassment, bullying, threats, or targeted abuse.",
  "No hate content or dehumanizing attacks against protected groups.",
  "No nudity, sexual content, sexual exploitation, or grooming behavior.",
  "No graphic violence, violent threats, weapon misuse, or dangerous challenges.",
  "No illegal activity, regulated goods sales, scams, fraud, or phishing.",
  "No impersonation, misleading identity claims, spam, or platform manipulation.",
  "No copyright or trademark violations.",
  "No medical, financial, or legal misinformation that creates real-world harm.",
];

export default function GuidelinesPage() {
  return (
    <PageFrame eyebrow="Safety" title="Community Guidelines" description="Clear rules for a broad creator platform that welcomes many categories while protecting users and reviewers.">
      <Section title="Platform rules">
        <BulletList items={rules} />
      </Section>
      <Section title="Enforcement">
        <p>Content may be rejected before publishing, removed after publishing, age-restricted where supported, or escalated for account action. Reports are reviewed by admins.</p>
      </Section>
    </PageFrame>
  );
}
