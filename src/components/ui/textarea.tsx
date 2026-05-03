import * as React from "react";
import { cn } from "@/lib/utils";
import { inputClassName } from "./input";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(inputClassName, "min-h-[80px] resize-y", className)}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export { Textarea };
