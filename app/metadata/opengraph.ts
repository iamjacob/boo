import { generalMetadata } from "./general";

export const openGraphMetadata = {
  openGraph: {
    title: generalMetadata.title,
    description: generalMetadata.description,
    url: "https://boooks.com",
    siteName: "Boooks",
    images: [
      {
        url: "/file.svg",
        width: 1200,
        height: 630,
        alt: "Boooks - Where we evolve",
      },
    ],
    locale: "en_US",
    type: "website",
  },
};
