import { forwardRef, InputHTMLAttributes } from "react";

import { cn } from "~/utils/classnames";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={cn(
          className,
          "rounded-md border border-slate-600 bg-transparent px-3 py-1.5 placeholder:text-slate-700",
          "disabled:bg-slate-800 disabled:text-slate-500",
        )}
        {...props}
        ref={ref}
      />
    );
  },
);

Input.displayName = "Input";
