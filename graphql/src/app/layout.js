// app/layout.js
import "./globals.css";
import { Orbitron, Rajdhani } from "next/font/google";

export const metadata = {
  title: "GraphQL",
  description: "Made by Alomar using Reboot's API",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

// set up fonts
const orbitron = Orbitron({
  weight: ["700", "900"],
  subsets: ["latin"],
  variable: "--font-orbitron", // custom CSS var
});
const rajdhani = Rajdhani({
  weight: ["400", "600"],
  subsets: ["latin"],
  variable: "--font-rajdhani",
});

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${orbitron.variable} ${rajdhani.variable}`}>
        {children}
      </body>
    </html>
  );
}
