"use client"
import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, onChange, ...props }, ref) => (
    <div className="relative flex items-center">
      <input
        type="checkbox"
        ref={ref}
        className="sr-only peer"
        onChange={(e) => { onChange?.(e); onCheckedChange?.(e.target.checked) }}
        {...props}
      />
      <div className={cn(
        "h-4 w-4 rounded border-2 border-gray-300 bg-white transition-all peer-checked:bg-primary-600 peer-checked:border-primary-600 flex items-center justify-center cursor-pointer",
        className
      )}>
        <Check className="h-2.5 w-2.5 text-white opacity-0 peer-checked:opacity-100" />
      </div>
    </div>
  )
)
Checkbox.displayName = "Checkbox"
export { Checkbox }
