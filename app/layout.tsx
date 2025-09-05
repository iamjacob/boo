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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Read request headers on the server
  const headersList = await headers();
  const acceptLang = headersList.get("accept-language");
  console.log("Accept-Language:", acceptLang);
  

  // Extract the first language code (e.g. "en", "da", "de")
  const lang = acceptLang?.split(",")[0].split("-")[0] ?? "en";

  return (
    <html lang={lang}>
      <body
      className='h-[100dvh]
      '
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
