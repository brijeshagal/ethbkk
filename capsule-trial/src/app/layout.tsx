import { CapsuleWrapper } from "@/components/CapsuleWrapper";
import Navbar from "@/components/navbar";
import "@fontsource/press-start-2p";
import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import "./globals.css";

const pressStart = Press_Start_2P({
  weight: "400", // Adjust the weight as needed
  subsets: ["latin"], // Ensure it includes the characters you need
});

export const metadata: Metadata = {
  title: "Everydae",
  description: "An everyday dex",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={pressStart.className}>
      <body className="w-screen h-screen overflow-y-scroll">
        <CapsuleWrapper>
          <Navbar />
          {children}
        </CapsuleWrapper>
      </body>
    </html>
  );
}
