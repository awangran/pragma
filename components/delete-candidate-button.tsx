"use client";

import type { ReactNode } from "react";

type DeleteCandidateButtonProps = {
  action: (formData: FormData) => void | Promise<void>;
  confirmMessage?: string;
  className?: string;
  children: ReactNode;
};

export function DeleteCandidateButton({
  action,
  confirmMessage = "¿Seguro que quieres eliminar este candidato? Esta acción no se puede deshacer.",
  className,
  children,
}: DeleteCandidateButtonProps) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(confirmMessage)) {
          event.preventDefault();
        }
      }}
    >
      <button type="submit" className={className}>
        {children}
      </button>
    </form>
  );
}
