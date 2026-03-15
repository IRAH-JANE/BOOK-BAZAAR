import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "BookBazaar",
  description: "Buy, sell, and trade books easily.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-[#F7F4EE] text-[#1F1F1F] antialiased">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
