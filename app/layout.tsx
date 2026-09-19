import type { Metadata } from "next";
import "./globals.css";
import NavBar from "./ui/NavBar";
import Footer from "./ui/Footer";

export const metadata: Metadata = {
  title: "Building Energy Tracker",
  description: "Building Energy Tracker Application",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <NavBar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
