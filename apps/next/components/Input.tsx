import classNames from "classnames";
import { forwardRef, InputHTMLAttributes } from "react";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ className, ...props }, ref) => {
    return (
      <input
        className={classNames(
          className,
          "py-1.5 px-3 bg-transparent border border-neutral-600 rounded-md placeholder:text-neutral-700",
          "disabled:text-neutral-500 disabled:bg-neutral-800"
        )}
        {...props}
        ref={ref}
      />
    );
  }
);

Input.displayName = "Input";
