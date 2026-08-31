import "./globals.css";

// NOTE: metadataBase tells Next.js what domain to use when building full
// links for share-preview images. Update this if your Vercel URL changes.
export const metadata = {
  metadataBase: new URL("https://kokeb-pied.vercel.app"),
  title: "Kokeb — Find your place to stay",
  description: "Book short-term rentals, guided by Kokeb.",
  openGraph: {
    title: "Kokeb — Find your place to stay",
    description: "Book short-term rentals, guided by Kokeb.",
    siteName: "Kokeb",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kokeb — Find your place to stay",
    description: "Book short-term rentals, guided by Kokeb.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
