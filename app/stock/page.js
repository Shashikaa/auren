import InnerPageShell from "../components/inner/InnerPageShell";
import {
  StockHero,
  VehicleShowcase,
  CollectionEditorial,
} from "../components/stock/StockSections";

import InnerClose from "../components/inner/InnerClose";

export const metadata = {
  title: "The Collection | Auren Automotive",
  description:
    "A curated collection of vehicles and the possibilities for making each one your own.",
};

export default function StockPage() {
  return (
    <InnerPageShell page="stock">
      <StockHero />
      <VehicleShowcase />
      <CollectionEditorial />
      <InnerClose
        headingId="stock-close-title"
        imageAlt="A tailored performance vehicle in a dark studio"
        eyebrow="Your Next Chapter"
      />
    </InnerPageShell>
  );
}
