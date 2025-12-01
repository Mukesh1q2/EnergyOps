import * as React from "react"
import { clsx } from "clsx"

const Progress = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: number }
>(({ className, value = 0, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx(
      "relative h-4 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800",
      className
    )}
    {...props}
  >
    <div
      className="h-full bg-blue-600 transition-all duration-300"
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
))
Progress.displayName = "Progress"

export { Progress }
