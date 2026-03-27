import "./globals.css";
import NavbarSwitcher from "@/components/NavbarSwitcher";
import { ToastProvider } from "@/components/ToastProvider";
import { ConfirmProvider } from "@/components/ConfirmProvider";

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
        <ToastProvider>
          <ConfirmProvider>
            <NavbarSwitcher />
            {children}
          </ConfirmProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
