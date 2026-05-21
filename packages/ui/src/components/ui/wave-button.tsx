import { ReactNode } from "react";
import { cn } from "../../lib/utils";

type WaveVariant = "red" | "blue" | "gold" | "green";

interface WaveButtonProps {
  children: ReactNode;
  variant?: WaveVariant;
  className?: string;
  rounded?: string;
}

export function WaveWrap({
  children,
  variant = "red",
  className,
  rounded = "rounded-full",
}: WaveButtonProps) {
  return (
    <div className={cn("wave-btn-wrap", `wave-${variant}`, rounded, className)}>
      <span className={cn("wave-ring", rounded)} aria-hidden="true" />
      {children}
    </div>
  );
}

