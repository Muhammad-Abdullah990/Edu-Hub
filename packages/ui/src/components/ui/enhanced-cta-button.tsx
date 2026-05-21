/**
 * Enhanced CTA Button with Glow & Ripple Effects
 * Premium micro-interactions for high-priority actions
 * Used for "Ask About Admissions" button
 */

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { Link } from "wouter";
import { Button } from "./button";

interface EnhancedCTAButtonProps {
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
  /** Aria label for accessibility */
  ariaLabel?: string;
}

export function EnhancedCTAButton({
  label,
  href,
  onClick,
  disabled = false,
  className = "",
  ariaLabel,
}: EnhancedCTAButtonProps) {
  // Ripple animation - expands from center then fades
  const rippleVariants = {
    initial: { scale: 0, opacity: 0.4 },
    animate: {
      scale: [0, 1.2],
      opacity: [0.4, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatDelay: 0.5,
      },
    },
    hover: {
      scale: 0,
      opacity: 0,
    },
  };

  // Glow pulse animation
  const glowVariants = {
    initial: { boxShadow: "0 0 15px rgba(251, 191, 36, 0.3)" },
    animate: {
      boxShadow: [
        "0 0 15px rgba(251, 191, 36, 0.3)",
        "0 0 25px rgba(251, 191, 36, 0.45)",
        "0 0 15px rgba(251, 191, 36, 0.3)",
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
      },
    },
    hover: {
      boxShadow: "0 0 25px rgba(251, 191, 36, 0.55)",
    },
  };

  const buttonContent = (
    <motion.div
      layout
      className="relative inline-block"
      variants={glowVariants}
      initial="initial"
      animate={!disabled ? "animate" : "initial"}
      whileHover={!disabled ? "hover" : {}}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Ripple effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow: "inset 0 0 0 2px rgba(220, 38, 38, 0.2)",
        }}
        variants={rippleVariants}
        initial="initial"
        animate={!disabled ? "animate" : "initial"}
        onHoverStart={(event, info) => {
          // On hover, stop ripple
        }}
      />

      {/* Button itself */}
      <Button
        disabled={disabled}
        onClick={onClick}
        aria-label={ariaLabel}
        className={`
          relative z-10
          h-14 px-8 rounded-full 
          bg-accent text-primary font-bold 
          hover:bg-accent/90 
          transition-all duration-300
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${className}
        `}
      >
        {label}
      </Button>
    </motion.div>
  );

  // If href provided, wrap in Link
  if (href && !disabled) {
    return <Link href={href}>{buttonContent}</Link>;
  }

  return buttonContent;
}

