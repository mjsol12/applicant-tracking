import * as React from "react";
import { cn } from "@/utils";

export type LabelProps = React.ComponentProps<"label"> & {
  hideLabel?: boolean;
};

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, hideLabel = false, ...props }, ref) => {
    return (
      <label
        ref={ref}
        className={cn(
          "mb-1 block text-sm font-medium text-foreground",
          hideLabel && "sr-only",
          className,
        )}
        {...props}
      />
    );
  },
);

Label.displayName = "Label";

export { Label };
