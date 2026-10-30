import InnerPageShell from "../components/inner/InnerPageShell";
import {
  BuildsHero,
  CommissionsGallery,
  BuildApproach,
} from "../components/builds/BuildsSections";

import InnerClose from "../components/inner/InnerClose";

export const metadata = {
  title: "Selected Commissions | Auren Automotive",
  description:
    "Individual automotive projects shaped by a different brief and a shared attention to detail.",
};

export default function BuildsPage() {
  return (
    <InnerPageShell page="builds">
      <BuildsHero />
      <CommissionsGallery />
      <BuildApproach />
      <InnerClose
        headingId="builds-close-title"
        imageAlt="A completed performance vehicle in a dark studio"
      />
    </InnerPageShell>
  );
}
