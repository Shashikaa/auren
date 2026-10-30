import InnerPageShell from "../components/inner/InnerPageShell";
import {
  ContactHero,
  BuildEnquiry,
  ContactDetail,
} from "../components/contact/ContactSections";

export const metadata = {
  title: "Begin Your Build | Auren Automotive",
  description:
    "Tell Auren about your vehicle and the individual build you have in mind.",
};

export default function ContactPage() {
  return (
    <InnerPageShell page="contact">
      <ContactHero />
      <BuildEnquiry />
      <ContactDetail />
    </InnerPageShell>
  );
}
