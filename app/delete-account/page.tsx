import { PageFrame } from "@/components/PageFrame";
import { Section } from "@/components/PolicyContent";

export default function DeleteAccountPage() {
  return (
    <PageFrame eyebrow="Account" title="Account deletion instructions" description="Public instructions for users and app reviewers. Replace the placeholder email before submission.">
      <Section title="How to request deletion">
        <p>Email support@example.com from the email address connected to your account with the subject line Account Deletion Request.</p>
      </Section>
      <Section title="What may be deleted">
        <p>We will delete or anonymize account profile data and unpublished uploads when possible. Published videos can be removed on request after identity verification.</p>
      </Section>
      <Section title="What may be retained">
        <p>Reports, moderation logs, support tickets, transaction records, and security logs may be retained when required for legal, safety, fraud prevention, or dispute resolution reasons.</p>
      </Section>
    </PageFrame>
  );
}
