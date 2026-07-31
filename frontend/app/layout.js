import { Inter } from "next/font/google";
import "./globals.css";
import ToastContainer from "./components/Toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "RxConnect – Smart Pharmacy Network",
  description:
    "Order medicines from nearby pharmacy branches, upload prescriptions, check real-time stock across branches, and receive medicines at your doorstep.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[var(--font-inter)]">
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
