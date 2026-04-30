"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:       "group toast bg-white text-gray-900 border border-gray-200 shadow-lg rounded-xl text-sm font-semibold",
          description: "text-gray-500 text-xs",
          actionButton:"bg-primary-600 text-white rounded-lg px-3 py-1 text-xs font-semibold",
          cancelButton:"bg-gray-100 text-gray-700 rounded-lg px-3 py-1 text-xs",
          success:     "border-l-[3px] border-l-green-500",
          error:       "border-l-[3px] border-l-red-500",
          info:        "border-l-[3px] border-l-blue-500",
          warning:     "border-l-[3px] border-l-amber-500",
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
