import type React from "react";
import { cn } from "@/lib/utils";
import "./logo.css";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  style?: React.CSSProperties;
}

export function Logo({ size = "md", className, style }: LogoProps) {
  return (
    <div
      className={cn("logo-container", `logo-size-${size}`, className)}
      style={style}
    >
      <span className="logo-rune">ᚱ</span>
      <span className="logo-text">
        Rune <span className="logo-subtext">HTTP</span>
      </span>
    </div>
  );
}
