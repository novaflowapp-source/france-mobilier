"use client";

import { useState, type ComponentProps } from "react";
import { IconEye, IconEyeOff } from "@/components/icons";

type PasswordInputProps = Omit<ComponentProps<"input">, "type">;

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={`input input-with-trailing-icon ${className ?? ""}`.trim()}
      />
      <button
        type="button"
        onClick={() => setVisible((open) => !open)}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted hover:text-navy"
        aria-label={visible ? "Hide password" : "Show password"}
        aria-pressed={visible}
      >
        {visible ? <IconEyeOff className="h-5 w-5" /> : <IconEye className="h-5 w-5" />}
      </button>
    </div>
  );
}
