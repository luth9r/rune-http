import * as React from "react";
import { sharedStyles } from "styles/shared";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "icon"
    | "ghost-danger"
    | "link"
    | "tab";
  size?: "default" | "sm" | "lg" | "icon";
  active?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      active,
      style,
      ...props
    },
    ref,
  ) => {
    // Mapping variants to sharedStyles JS objects
    const variantStyles: Record<string, React.CSSProperties> = {
      default: sharedStyles.primaryButton,
      destructive: {
        ...sharedStyles.primaryButton,
        background: "var(--eos-error)",
      },
      outline: {
        ...sharedStyles.input,
        cursor: "pointer",
        textAlign: "center" as const,
      },
      secondary: {
        ...sharedStyles.primaryButton,
        background: "var(--eos-surface-2)",
        color: "var(--eos-text)",
      },
      ghost: {
        ...sharedStyles.actionIconButton,
        padding: "8px 16px",
        height: "auto",
      },
      icon: sharedStyles.actionIconButton,
      "ghost-danger": {
        ...sharedStyles.actionIconButton,
        color: "var(--eos-muted)",
      },
      tab: {
        background: "transparent",
        border: "none",
        borderRadius: 0,
        padding: "8px 12px",
        height: "auto",
        color: active ? "var(--eos-text)" : "var(--eos-muted)",
      },
      link: {
        background: "none",
        border: "none",
        color: "var(--eos-accent)",
        textDecoration: "underline",
        padding: 0,
      },
    };

    const sizeStyles: Record<string, React.CSSProperties> = {
      sm: { padding: "4px 10px", fontSize: "11px", height: "28px" },
      lg: { padding: "12px 24px", fontSize: "15px", height: "48px" },
      icon: { width: 32, height: 32, padding: 0 },
      default: {},
    };

    const combinedStyle: React.CSSProperties = {
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...style,
    };

    const variantClasses: Record<string, string> = {
      default: "btn-primary",
      destructive: "btn-danger",
      outline: "btn-outline",
      secondary: "btn-secondary",
      ghost: "btn-ghost",
      icon: "btn-icon",
      "ghost-danger": "btn-ghost-danger",
      tab: "btn-tab-underline",
      link: "btn-link",
    };

    return (
      <button
        ref={ref}
        style={combinedStyle}
        className={cn(variantClasses[variant], { active }, className)}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button };
