import * as React from "react"
import { clsx } from "clsx"

export interface SectionWrapperProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const sizeVariants = {
  sm: "py-12 sm:py-16",
  md: "py-16 sm:py-20",
  lg: "py-20 sm:py-24",
  xl: "py-24 sm:py-32",
}

const SectionWrapper = React.forwardRef<HTMLDivElement, SectionWrapperProps>(
  ({ className, size = 'lg', ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={clsx(
          "relative w-full",
          sizeVariants[size],
          className
        )}
        {...props}
      />
    )
  }
)
SectionWrapper.displayName = "SectionWrapper"

export { SectionWrapper }