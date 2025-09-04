import { generalMetadata } from "./general";
import { seoMetadata } from "./seo";
import { openGraphMetadata } from "./opengraph";
import { twitterMetadata } from "./twitter";
import type { Metadata } from "next";

export const metadata = (() => {
  return {
    ...generalMetadata,
    ...seoMetadata,
    ...openGraphMetadata,
    ...twitterMetadata,
  } as Metadata;
})();
