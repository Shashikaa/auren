import MotionLoader from './MotionLoader';
import {
  Entrance,
  MainNavigation,
  PageProgress,
  SiteFooter,
  SiteHeader,
  SkipLink,
} from './components/SiteChrome';
import {
  CollectionSection,
  FinalCtaSection,
  HeroSection,
  OrdinarySection,
  PrinciplesSection,
  ServiceIntroSection,
  ServicesSection,
} from './components/HomeSections';
import Dialogs from './components/Dialogs';

export default function Home() {
  return (
    <>
      <div>
        <SkipLink />
        <SiteHeader />
        <Entrance />
        <MainNavigation />
        <main id="main">
          <HeroSection />
          <PrinciplesSection />
          <ServiceIntroSection />
          <ServicesSection />
          <OrdinarySection />
          <CollectionSection
            id="builds"
            imageClass="builds-image"
            title="Selected Commissions"
            description="Explore individual projects, each shaped by a different brief and a shared attention to detail."
            buttonLabel="View Commissions"
          />
          <CollectionSection
            id="stock"
            imageClass="stock-image"
            title="The Collection"
            description="Discover a curated selection of vehicles and the possibilities for making each one your own."
            buttonLabel="Explore The Collection"
          />
          <FinalCtaSection />
        </main>
        <SiteFooter />
        <PageProgress />
        <Dialogs />
      </div>
      <MotionLoader />
    </>
  );
}
