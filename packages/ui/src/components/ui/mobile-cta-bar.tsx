/**
 * Mobile CTA Bar Component
 * Sticky bottom bar for mobile users with quick action buttons
 * Includes: Call, WhatsApp, Apply Now with enhanced hover states
 */

import { motion } from "framer-motion";
import { Phone, MessageCircle, Zap } from "lucide-react";
import { Link } from "wouter";

interface MobileCTABarProps {
  phoneNumber?: string;
  whatsappNumber?: string;
  whatsappMessage?: string;
}

export function MobileCTABar({
  phoneNumber = "+92 326 3987 552",
  whatsappNumber = "923263987552",
  whatsappMessage = "Hi! I want to inquire about admissions", 
}: MobileCTABarProps) {
  const phoneLink = `tel:${phoneNumber.replace(/\s+/g, "")}`;
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-slate-200 shadow-2xl"
    >
      <div className="grid grid-cols-3 gap-2 p-3">
        {/* Call Button */}
        <a
          href={phoneLink}
          className="flex flex-col items-center justify-center py-3 px-2 bg-blue-50 hover:bg-blue-100 hover:shadow-md hover:scale-105 rounded-xl transition-all duration-200 font-semibold text-xs text-blue-700 active:scale-95"
        >
          <motion.div
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            className="mb-1"
          >
            <Phone size={20} className="text-blue-600" strokeWidth={2.5} />
          </motion.div>
          Call Now
        </a>

        {/* WhatsApp Button */}
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-3 px-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 hover:shadow-md hover:scale-105 rounded-xl transition-all duration-200 font-semibold text-xs text-[#25D366] active:scale-95"
        >
          <motion.div
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            className="mb-1"
          >
            <MessageCircle size={20} className="text-[#25D366]" strokeWidth={2.5} />
          </motion.div>
          WhatsApp
        </a>

        {/* Apply Now Button */}
        <Link href="/contact">
          <div className="flex flex-col items-center justify-center py-3 px-2 bg-red-50 hover:bg-red-100 hover:shadow-md hover:scale-105 rounded-xl transition-all duration-200 font-semibold text-xs text-red-700 cursor-pointer active:scale-95">
            <motion.div
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              className="mb-1"
            >
              <Zap size={20} className="text-red-600" strokeWidth={2.5} />
            </motion.div>
            Apply Now
          </div>
        </Link>
      </div>

      {/* Safe area for devices with home indicators */}
      <div className="h-safe bg-white"></div>
    </motion.div>
  );
}

