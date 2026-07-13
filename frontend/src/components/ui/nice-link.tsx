import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import Link from "next/link";

const niceLinkVariants = cva(
  "group relative inline-flex items-center border border-black dark:border-white focus:outline-none w-fit hover:cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "text-primary-foreground",
        destructive:
          "text-destructive-foreground",
        outline:
          "border border-input",
        secondary:
          "text-secondary-foregroung",
        ghost: "",
        link: "text-primary underline-offset-4",
      },
      size: {
        default: "h-fit",
        sm: "h-8",
        lg: "h-10",
        xl: "h-fit",
        icon: "h-fit",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const spanVariants = cva(
  "inline-flex w-full transform items-center justify-center gap-x-2 self-stretch px-4 py-2 text-center font-mono text-white ring-1 ring-offset-1 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-focus:-translate-x-1 group-focus:-translate-y-1",
  {
    variants: {
      variant: {
        default:
          "text-primary-foreground bg-black dark:bg-white ring-0 ring-offset-0",
        destructive:
          "text-destructive-foreground",
        outline:
          "",
        secondary:
          "text-secondary-foreground ring-black dark:ring-white ring-offset-black dark:ring-offset-white bg-white dark:bg-black",
        ghost: "",
        link: "text-primary underline-offset-4",
      },
      size: {
        default: "h-9",
        sm: "h-8",
        lg: "h-10",
        xl: "h-12",
        icon: "h-9 w-9 p-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface NiceLinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
  VariantProps<typeof niceLinkVariants> {
  asChild?: boolean;
}

const NiceLink = React.forwardRef<HTMLAnchorElement, NiceLinkProps>(
  ({ className, variant, size, href, ...props }, ref) => {
    return (
      <Link
        className={cn(niceLinkVariants({ variant, size, className }))}
        ref={ref}
        href={href ?? "bleh"}
      >
        <span className={cn(spanVariants({ variant, size, className }))} {...props} />
      </Link>
    );
  },
);
NiceLink.displayName = "NiceLink";

export { NiceLink, niceLinkVariants as niceLinkVariants };
