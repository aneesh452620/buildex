import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./dashboard.css";
import "./features.css";
import { ProjectsProvider } from "./components/projects-provider";
import { NewProjectProvider } from "./components/new-project-dialog";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Buildex — Your project workspace",
  description: "Manage your projects and keep your next big idea moving.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col"><ProjectsProvider><NewProjectProvider>{children}</NewProjectProvider></ProjectsProvider></body>
    </html>
  );
}
