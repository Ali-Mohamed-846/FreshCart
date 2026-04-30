
import * as React from "react";
import { toast as rt } from "react-toastify";

const OPTS = {
  position: "bottom-right" as const,
  autoClose: 1500,
  hideProgressBar: true,
  closeButton: false,
  closeOnClick: true,
  pauseOnHover: false,
  pauseOnFocusLoss: false,
  draggable: false,
};

const toast = Object.assign(
  (msg: string, opts?: { icon?: React.ReactNode; id?: string }) =>
    rt(msg, {
      ...OPTS,
      ...(opts?.id ? { toastId: opts.id } : {}),
      ...(opts?.icon ? { icon: () => opts.icon } : {}),
    }),
  {
    success: (msg: string) => rt.success(msg, OPTS),
    error: (msg: string) => rt.error(msg, OPTS),
    dismiss: () => rt.dismiss(),
  }
);

export default toast;
