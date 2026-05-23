import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover-elevate active-elevate-2",
  {
    variants: {
      variant: {
        default:
          "bg-secondary text-secondary-foreground border border-secondary-border shadow-sm hover:bg-secondary/90 focus-visible:ring-2 focus-visible:ring-offset-2",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm border-destructive-border hover:bg-destructive/90 focus-visible:ring-2 focus-visible:ring-offset-2",
        outline:
          "border [border-color:var(--button-outline)] bg-background text-foreground shadow-xs active:shadow-none hover:bg-accent/10 focus-visible:ring-2 focus-visible:ring-offset-2",
        secondary:
          "border bg-secondary text-secondary-foreground border border-secondary-border hover:bg-secondary/80 focus-visible:ring-2 focus-visible:ring-offset-2",
        ghost: "border border-transparent text-foreground hover:bg-accent/10 focus-visible:ring-2 focus-visible:ring-offset-2",
        link: "text-primary underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:ring-offset-2",
        // Coaching-specific brand variants with light blue (#2196F3 / hsl(207, 90%, 54%)) as primary action
        coaching: "bg-secondary text-secondary-foreground border border-secondary-border shadow-sm hover:bg-secondary/90 focus-visible:ring-2 focus-visible:ring-offset-2",
        "coaching-outline": "border-2 border-secondary text-secondary bg-transparent hover:bg-secondary/10 focus-visible:ring-2 focus-visible:ring-offset-2",
      },
      size: {
        default: "min-h-9 px-4 py-2",
        sm: "min-h-8 rounded-md px-3 text-xs",
        lg: "min-h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "coaching",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }