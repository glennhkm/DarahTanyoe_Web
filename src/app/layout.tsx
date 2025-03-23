import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { DM_Sans } from "next/font/google";
import { SidebarProvider } from "@/context/sidebarContext";
import "./globals.css";
import { NotifProvider } from "@/context/notifContext";
import { Header } from "@/components/header/header";
import { Notif } from "@/components/notif/notif";
import { Sidebar } from "@/components/sidebar/sidebar";
import MainLayout from "@/components/layout/mainLayout";
import { AuthProvider } from "@/context/authContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <AuthProvider>
        <SidebarProvider>
          <NotifProvider>
            <body className={`${dmSans.className} antialiased bg-primary pr-8`}>
              <Header />
              <Notif />
              <Sidebar />
              <MainLayout>{children}</MainLayout>
            </body>
          </NotifProvider>
        </SidebarProvider>
      </AuthProvider>
    </html>
  );
}
