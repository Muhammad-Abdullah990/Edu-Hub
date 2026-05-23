/**
 * WhatsApp Floating Button Component
 * Provides fixed floating WhatsApp button for easy contact
 * Pre-fills with inquiry message for admissions
 */

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { QUICK_INQUIRY_MESSAGE, buildWhatsAppUrl } from "../../lib/whatsapp-utils";

interface WhatsAppButtonProps {
  message?: string;
  className?: string;
}

export function WhatsAppButton({
  message = QUICK_INQUIRY_MESSAGE,
  className = "",
}: WhatsAppButtonProps) {
  const whatsappUrl = buildWhatsAppUrl(message);

  return (
    <motion.a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-24 right-6 z-50 md:bottom-6 ${className}`}
      whileHover={{ scale: 1.15 }}
      whileTap={{ scale: 0.92 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.3 }}
    >
      <div className="relative group">
        {/* Animated pulse background */}
        <motion.div 
          className="absolute inset-0 bg-[#25D366] rounded-full"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          style={{ opacity: 0.3 }}
        />
        
        {/* Main button */}
        <motion.div 
          className="relative w-16 h-16 bg-[#25D366] hover:bg-[#1ebe5d] rounded-full flex items-center justify-center shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
          whileHover={{ rotate: 12 }}
        >
          <MessageCircle 
            size={28} 
            className="text-white transition-transform group-hover:scale-125 group-hover:-rotate-6"
            strokeWidth={2.5}
          />
          
          {/* Tooltip */}
          <motion.div 
            className="absolute bottom-full right-0 mb-3 bg-slate-900 text-white text-sm font-semibold px-4 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            initial={{ y: 10, opacity: 0 }}
            whileHover={{ y: 0, opacity: 1 }}
          >
            💬 Quick Chat
            <div className="text-xs font-normal text-slate-300 mt-1">15-30 min response</div>
          </motion.div>
        </motion.div>
      </div>
    </motion.a>
  );
}


