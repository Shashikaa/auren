export function ContactDialog() {
  return (
    <dialog id="contact-dialog">
      <button className="dialog-close" aria-label="Close dialog">×</button>
      <p className="micro">Your ideas. Our attention to detail.</p>
      <h2>Begin Your Build</h2>
      <p>Tell us about your vehicle and the build you have in mind.</p>
      <form id="project-form">
        <label>Your name<input name="name" autoComplete="name" required /></label>
        <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
        <label>Your vehicle<input name="vehicle" placeholder="Make, model and year" required /></label>
        <label>Your vision<textarea name="vision" rows="3" required></textarea></label>
        <button className="button" type="submit">Prepare Enquiry <span>↗</span></button>
        <p className="form-note">This preview prepares a downloadable enquiry for your client. No information is sent.</p>
      </form>
    </dialog>
  );
}

export function CollectionDialog() {
  return (
    <dialog id="collection-dialog">
      <button className="dialog-close" aria-label="Close dialog">×</button>
      <p className="micro">The Collection</p>
      <h2>Selected Commissions</h2>
      <div className="collection-grid"></div>
    </dialog>
  );
}

export function PrivacyDialog() {
  return (
    <dialog id="privacy-dialog">
      <button className="dialog-close" aria-label="Close dialog">×</button>
      <h2>Cookie Preferences</h2>
      <p>Auren remembers your entrance preference on this device. This preview does not use advertising or analytics trackers.</p>
      <button className="button" id="reset-preference">Reset Entrance Preference</button>
    </dialog>
  );
}

export default function Dialogs() {
  return (
    <>
      <ContactDialog />
      <CollectionDialog />
      <PrivacyDialog />
    </>
  );
}
