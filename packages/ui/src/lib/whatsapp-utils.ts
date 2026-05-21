/**
 * WhatsApp Utility Functions
 * Centralized WhatsApp message building and integration
 */

export const WHATSAPP_PHONE = "923263987552"; // Toppers Coaching Center
export const WHATSAPP_PHONE_FORMATTED = "+92 326 3987 552";

/**
 * Format inquiry data into WhatsApp message
 */
export const formatInquiryMessage = (inquiry: {
  name: string;
  phone: string;
  class: string;
  message: string;
}): string => {
  const classLabel = {
    montessori: "Montessori",
    primary: "Primary (Class 1-5)",
    middle: "Middle (Class 6-8)",
    matric: "Matric (Class 9-10)",
  }[inquiry.class] || inquiry.class;

  return `📚 *Inquiry from New Student*\n\n` +
         `*Name:* ${inquiry.name}\n` +
         `*Phone:* ${inquiry.phone}\n` +
         `*Class/Level:* ${classLabel}\n\n` +
         `*Message:*\n${inquiry.message}\n\n` +
         `---\nSent via Toppers Coaching Website`;
};

/**
 * Build WhatsApp URL with pre-filled message
 */
export const buildWhatsAppUrl = (message: string): string => {
  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
};

/**
 * Open WhatsApp in new tab with message
 */
export const openWhatsApp = (message: string, target: "_blank" | "_self" = "_blank"): void => {
  const url = buildWhatsAppUrl(message);
  window.open(url, target);
};

/**
 * Quick inquiry message (for floating button and quick CTAs)
 */
export const QUICK_INQUIRY_MESSAGE = 
  "Hi! I want to inquire about admissions for my child. Can you provide more information?";

/**
 * Get WhatsApp status message
 */
export const WHATSAPP_STATUS_MESSAGE = 
  "We respond to WhatsApp inquiries within 15-30 minutes during school hours (5 PM - 12 AM daily)";

