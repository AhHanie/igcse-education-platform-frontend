import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                   Text                                     */
/* -------------------------------------------------------------------------- */

const textVariants = cva("text-foreground", {
  variants: {
    variant: {
      body: "text-sm leading-relaxed",
      bodyLg: "text-base leading-relaxed",
      muted: "text-sm text-muted-foreground",
      small: "text-xs text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});

const Text = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & VariantProps<typeof textVariants>
>(({ className, variant, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="text"
    className={cn(textVariants({ variant }), className)}
    {...props}
  />
));
Text.displayName = "Text";

/* -------------------------------------------------------------------------- */
/*                                  Heading                                   */
/* -------------------------------------------------------------------------- */

const headingVariants = cva("font-semibold tracking-tight text-foreground", {
  variants: {
    level: {
      h1: "text-4xl",
      h2: "text-3xl",
      h3: "text-2xl",
      h4: "text-xl",
      h5: "text-lg",
      h6: "text-base",
    },
  },
  defaultVariants: {
    level: "h2",
  },
});

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof headingVariants> & {
    as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  };

const Heading = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ className, level, as, ...props }, ref) => {
    const Comp = as ?? (level as HeadingProps["as"]) ?? "h2";

    return (
      <Comp
        ref={ref}
        data-slot="heading"
        className={cn(headingVariants({ level }), className)}
        {...props}
      />
    );
  }
);
Heading.displayName = "Heading";

/* -------------------------------------------------------------------------- */
/*                                   Label                                    */
/* -------------------------------------------------------------------------- */

const labelVariants = cva("text-sm font-medium leading-none text-foreground");

const TypographyLabel = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    data-slot="typography-label"
    className={cn(labelVariants(), className)}
    {...props}
  />
));
TypographyLabel.displayName = "TypographyLabel";

/* -------------------------------------------------------------------------- */
/*                                   Inline                                   */
/* -------------------------------------------------------------------------- */

const InlineCode = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => (
  <code
    ref={ref}
    data-slot="inline-code"
    className={cn(
      "relative rounded bg-muted px-[0.3rem] py-[0.15rem] font-mono text-sm",
      className
    )}
    {...props}
  />
));
InlineCode.displayName = "InlineCode";

/* -------------------------------------------------------------------------- */
/*                                   Quote                                    */
/* -------------------------------------------------------------------------- */

const Blockquote = React.forwardRef<
  HTMLQuoteElement,
  React.HTMLAttributes<HTMLQuoteElement>
>(({ className, ...props }, ref) => (
  <blockquote
    ref={ref}
    data-slot="blockquote"
    className={cn("border-l-2 pl-6 italic text-muted-foreground", className)}
    {...props}
  />
));
Blockquote.displayName = "Blockquote";

/* -------------------------------------------------------------------------- */
/*                                   Export                                   */
/* -------------------------------------------------------------------------- */

export { Text, Heading, TypographyLabel, InlineCode, Blockquote };
