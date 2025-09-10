// metadata/general.ts
export const generalMetadata = {
   metadataBase: new URL(
     process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  
  title: "Boooks",
  description: "Where we evolve",
  creator: "Boooks Team",
  publisher: "Boooks Inc.",
  authors: [{ name: "Boooks Team", url: "https://boooks.io" }],
  keywords: [
    "Boooks",
    "Books",
    "Reading",
  ],
  icons: {
    icon: "/favicon/favicon.ico",
    shortcut: "/favicon/favicon-32x32.png",
    apple: "/favicon/apple-touch-icon.png",
  },
  manifest: "/manifest.json",

};

