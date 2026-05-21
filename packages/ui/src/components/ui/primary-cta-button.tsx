/**
 * Primary CTA Button Component
 * Reusable button matching navbar "Admissions" button design
 * Used for high-priority actions like course enrollment
 */

import { motion } from "framer-motion";
import { Button } from "./button";
import { WaveWrap } from "./wave-button";
import { ReactNode } from "react";
import { Link } from "wouter";

interface PrimaryCTAButtonProps {
  /** Button label/text */
  label: ReactNode;
  /** Link destination */
  href?: string;
  /** Click handler if not using href */
  onClick?: () => void;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Whether button should be full width */
  fullWidth?: boolean;
  /** Button type */
  type?: "button" | "submit" | "reset";
  /** Aria label for accessibility */
  ariaLabel?: string;
}

export function PrimaryCTAButton({
  label,
  href,
  onClick,
  disabled = false,
  className = "",
  fullWidth = false,
  type = "button",
  ariaLabel,
}: PrimaryCTAButtonProps) {
  const buttonContent = (
    <motion.div
      whileHover={!disabled ? { scale: 1.05 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`${fullWidth ? "w-full" : ""}`}
    >
      <WaveWrap variant="red" rounded="rounded-full">
        <Button
          type={type}
          disabled={disabled}
          onClick={onClick}
          aria-label={ariaLabel}
          className={`
            bg-destructive hover:bg-destructive/90 
            text-white 
            rounded-full 
            px-6 py-3
            font-semibold
            transition-all duration-300
            ${fullWidth ? "w-full" : ""}
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${className}
          `}
        >
          {label}
        </Button>
      </WaveWrap>
    </motion.div>
  );

  // If href is provided, wrap in Link
  if (href && !disabled) {
    return (
      <Link href={href} className={fullWidth ? "block" : ""}>
        {buttonContent}
      </Link>
    );
  }

  // Otherwise return button alone
  return buttonContent;
}

