/**
 * Form Feedback Component
 * Displays success/error messages with appropriate styling and icons
 */

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertCircle, X } from "lucide-react";

interface FormFeedbackProps {
  type?: "success" | "error" | "info";
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  autoCloseDelay?: number;
}

export function FormFeedback({
  type = "success",
  message,
  onClose,
  autoClose = true,
  autoCloseDelay = 4000,
}: FormFeedbackProps) {
  const styles = {
    success: {
      bg: "bg-green-50",
      border: "border-green-200",
      icon: "text-green-600",
      text: "text-green-800",
      iconComponent: CheckCircle,
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      icon: "text-red-600",
      text: "text-red-800",
      iconComponent: AlertCircle,
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      icon: "text-blue-600",
      text: "text-blue-800",
      iconComponent: CheckCircle,
    },
  };

  const style = styles[type];
  const IconComponent = style.iconComponent;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`${style.bg} ${style.border} ${style.text} border rounded-lg p-4 flex items-start gap-3 mb-4`}
    >
      <IconComponent size={20} className={`${style.icon} shrink-0 mt-0.5`} />
      <div className="flex-1">
        <p className="font-medium text-sm">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 ml-2 text-current hover:opacity-70 transition-opacity"
          type="button"
        >
          <X size={18} />
        </button>
      )}
    </motion.div>
  );
}

/**
 * Form Validation Helper
 */
export const formValidation = {
  // Phone number validation for Pakistan
  validatePhone: (phone: string): { valid: boolean; error?: string } => {
    const cleanPhone = phone.replace(/\D/g, "");
    if (!cleanPhone) return { valid: false, error: "Phone number is required" };
    if (cleanPhone.length < 10) return { valid: false, error: "Phone number is too short" };
    if (cleanPhone.length > 15) return { valid: false, error: "Phone number is too long" };
    return { valid: true };
  },

  // Email validation
  validateEmail: (email: string): { valid: boolean; error?: string } => {
    if (!email) return { valid: false, error: "Email is required" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return { valid: false, error: "Please enter a valid email address" };
    return { valid: true };
  },

  // Name validation
  validateName: (name: string): { valid: boolean; error?: string } => {
    const cleanName = name.trim();
    if (!cleanName) return { valid: false, error: "Name is required" };
    if (cleanName.length < 2) return { valid: false, error: "Name must be at least 2 characters" };
    return { valid: true };
  },

  // Class/Grade validation
  validateClass: (classValue: string): { valid: boolean; error?: string } => {
    if (!classValue) return { valid: false, error: "Class/Grade is required" };
    return { valid: true };
  },
};

