// import type { Metadata } from "next";
import { headers } from "next/headers"
export { metadata } from "./metadata";


// import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import "./splash.css";

import Loading from "./Loading";

import BoooksFull from './BoooksFull'

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

// export const metadata: Metadata = {
//   title: "Boooks",
//   description: "We evolve",

// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read request headers on the server
  const headersList = headers();
  const acceptLang = headersList.get("accept-language");

  // Extract the first language code (e.g. "en", "da", "de")
  const lang = acceptLang?.split(",")[0].split("-")[0] ?? "en";

  return (
    <html lang={lang}>
      <body
      // className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div id="splash">
          {/* <BoooksFull/> */}
          <Loading/>
        </div>
        
        {children}
      </body>
    </html>
  );
}
