import classNames from "classnames";
import Link from "next/link";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

type LinkProps = Parameters<typeof Link>[0];

export const baseClassName = classNames(
  "font-medium text-sm inline-flex items-center justify-center",
  "focus:ring-1.5 ring-secondary-500",
  "transition duration-150 ease-in-out",
  "rounded-md leading-5"
);

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={classNames(
          baseClassName,
          "py-2 px-3",
          "text-neutral-200",
          "border border-outline-enabled hover:border-outline-hover",
          "border-outline-enabled disabled:text-[#7F808B] disabled:hover:border-transparent",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

function getPrimaryClassNames(className?: string) {
  return classNames(
    baseClassName,
    "py-2 px-3",
    "bg-pink-500 hover:bg-pink-700 text-white shadow-lg shadow-pink-500/50 hover:shadow-pink-700/50",
    "transition-all",
    "disabled:hover:bg-neutral-400 disabled:bg-neutral-400 disabled:text-neutral-500 disabled:shadow-none",
    className
  );
}

export function Primary({ children, className, ...props }: Props) {
  return (
    <button className={getPrimaryClassNames(className)} {...props}>
      {children}
    </button>
  );
}

export function PrimaryLink({ children, className, ...props }: LinkProps) {
  return (
    <Link className={getPrimaryClassNames(className)} {...props}>
      {children}
    </Link>
  );
}

export const Secondary = forwardRef<HTMLButtonElement, Props>(
  ({ children, className, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={classNames(
          baseClassName,
          "py-2 px-3",
          "bg-blue-500 hover:bg-blue-700 text-white",
          "disabled:hover:bg-disabled-neutral disabled:bg-disabled-neutral disabled:text-disabled-filled",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Secondary.displayName = "Secondary";

function getGhostClassNames(className?: string) {
  return classNames(
    baseClassName,
    "py-2 px-3",
    "hover:bg-neutral-900 active:bg-neutral-800 text-white",
    "disabled:hover:bg-disabled-neutral disabled:bg-disabled-neutral disabled:text-disabled-filled",
    className
  );
}

export function Ghost({ children, className, disabled, ...props }: Props) {
  return (
    <button
      disabled={disabled}
      className={getGhostClassNames(className)}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostLink({ children, className, ...props }: LinkProps) {
  return (
    <Link className={getGhostClassNames(className)} {...props}>
      {children}
    </Link>
  );
}
