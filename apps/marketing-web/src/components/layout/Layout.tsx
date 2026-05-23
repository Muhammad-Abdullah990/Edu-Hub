import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { motion } from "framer-motion";
import { WhatsAppButton } from "@toppers/ui";
import { MobileCTABar } from "@toppers/ui";
import { ScrollToTop } from "@toppers/ui";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-slate-50 font-sans">
      <ScrollToTop />
      <Navbar />
      <motion.main 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="flex-grow pt-20 pb-24 md:pb-0"
      >
        {children}
      </motion.main>
      <Footer />
      
      {/* Global Floating Components */}
      <WhatsAppButton />
      <MobileCTABar />
    </div>
  );
}

