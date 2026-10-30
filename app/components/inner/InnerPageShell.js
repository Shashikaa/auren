import "../../styles/inner-pages.css";
import InnerMotion from "../motion/InnerMotion";
import { PrivacyDialog } from "../dialogs/Dialogs";
import {
  MainNavigation,
  PageProgress,
  SiteFooter,
  SiteHeader,
  SkipLink,
} from "../layout/SiteChrome";

export default function InnerPageShell({ page, children }) {
  return (
    <>
      <div className={`inner-page inner-page--${page}`}>
        <SkipLink />
        <SiteHeader />
        <MainNavigation />
        <main id="main" data-motion-page={page}>
          {children}
        </main>
        <SiteFooter />
        <PageProgress />
        <PrivacyDialog />
      </div>
      <InnerMotion />
    </>
  );
}
