import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

const containerVariants = cva("mx-auto w-full", {
  variants: {
    size: {
      default: "max-w-7xl px-4 sm:px-6",
      sm: "max-w-screen-sm px-4 sm:px-6",
      md: "max-w-screen-md px-4 sm:px-6",
      lg: "max-w-screen-lg px-4 sm:px-6",
      xl: "max-w-screen-xl px-4 sm:px-6",
      "2xl": "max-w-[1400px] px-4 sm:px-6",
      full: "max-w-none px-4 sm:px-6",
      prose: "max-w-prose px-4 sm:px-6",
      flush: "max-w-none px-0",
    },
    /** Enables Tailwind container query context (`@lg:` etc. on descendants). */
    query: {
      true: "@container",
      false: "",
    },
  },
  defaultVariants: {
    size: "default",
    query: false,
  },
});

export type ContainerProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof containerVariants> & {
    asChild?: boolean;
  };

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size, query, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        ref={ref}
        className={cn(containerVariants({ size, query }), className)}
        {...props}
      />
    );
  },
);
Container.displayName = "Container";

export { Container, containerVariants };
