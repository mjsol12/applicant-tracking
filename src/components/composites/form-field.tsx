import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/utils";

type BaseProps = {
  id: string;
  label: string;
  className?: string;
  hideLabel?: boolean;
  hint?: string;
};

type FormFieldProps = BaseProps & {
  children: React.ReactNode;
};

export function FormField({
  id,
  label,
  className,
  hideLabel = false,
  hint,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1", className)}>
      <Label htmlFor={id} hideLabel={hideLabel}>
        {label}
      </Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
