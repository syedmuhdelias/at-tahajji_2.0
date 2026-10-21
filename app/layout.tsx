import type { Metadata } from "next";
import "./globals.css";
import "./site.css";
export const metadata: Metadata = {
  title: "My Quran · Learn with aT-Tahajji",
  description:
    "Learn Quran reading with the aT-Tahajji method. Read all 114 surahs with authentic Mushaf typography, Malay translations and synchronized recitation.",
  icons: { icon: "/brand/logo.png" },
  metadataBase: new URL("https://my-quran-serumpun.steadyroot1.chatgpt.site"),
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
