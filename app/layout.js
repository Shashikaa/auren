import "./globals.css";
export const metadata = {
  title: "Auren Automotive — Crafted Around You",
  description: "Individual automotive design and craftsmanship.",
  icons: { icon: "/assets/auren.svg" },
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
