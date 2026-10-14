"use client";

import {
  useState,
  type ComponentPropsWithoutRef,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type UpdatePasswordFormProps = ComponentPropsWithoutRef<"div"> & {
  embedded?: boolean;
};

export function UpdatePasswordForm({
  embedded = false,
  className,
  ...props
}: UpdatePasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState(false);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    setMessage("");
    setFailed(false);
    setDone(false);

    if (password.length < 8) {
      setFailed(true);
      setMessage("Usa al menos 8 caracteres.");
      return;
    }

    if (password !== confirm) {
      setFailed(true);
      setMessage("Las contraseñas no coinciden.");
      return;
    }

    setBusy(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        setFailed(true);
        setMessage(
          "Tu sesión no está disponible. Inicia sesión o solicita un nuevo enlace de recuperación.",
        );
        return;
      }

      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setFailed(true);
        setMessage(error.message);
        return;
      }

      setDone(true);
      setMessage("Tu contraseña quedó actualizada.");
      setPassword("");
      setConfirm("");
      router.refresh();
    } catch {
      setFailed(true);
      setMessage("No pudimos actualizar tu contraseña. Intenta nuevamente.");
    } finally {
      setBusy(false);
    }
  }

  const input =
    "mt-2 w-full rounded-xl border border-[#dce4f5] bg-white px-4 py-3 text-sm outline-none focus:border-[#5574ff]";

  return (
    <div
      {...props}
      className={cn(
        "text-[#111b3f]",
        embedded
          ? ""
          : "rounded-3xl border border-[#e2e9f8] bg-white p-6 sm:p-8",
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#7863bd]">
        Tu cuenta en Pragma Radar
      </p>

      <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em]">
        Cambiar contraseña.
      </h2>

      <p className="mt-3 text-sm leading-7 text-slate-600">
        Elige una contraseña nueva y escríbela de nuevo para confirmarla.
      </p>

      <form onSubmit={save} className="mt-7 space-y-5">
        <label
          htmlFor="nueva-password"
          className="block text-xs font-semibold"
        >
          Nueva contraseña
          <input
            id="nueva-password"
            className={input}
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={busy}
          />
        </label>

        <label
          htmlFor="confirm-password"
          className="block text-xs font-semibold"
        >
          Confirma tu contraseña
          <input
            id="confirm-password"
            className={input}
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            disabled={busy}
          />
        </label>

        {message && (
          <p
            role={failed ? "alert" : "status"}
            className={cn(
              "text-sm leading-6",
              failed ? "text-rose-700" : "text-emerald-700",
            )}
          >
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="border-b border-[#5574ff]/40 pb-1 text-sm font-medium text-[#5574ff] disabled:opacity-50"
        >
          {busy ? "Actualizando…" : "Guardar nueva contraseña"}
        </button>

        {!embedded && done && (
          <Link
            href="/perfil?seccion=seguridad"
            className="ml-5 text-sm text-[#5574ff] underline underline-offset-4"
          >
            Volver a mi perfil
          </Link>
        )}
      </form>

      {!embedded && (
        <div className="mt-6 flex flex-wrap gap-5 text-xs text-[#5574ff]">
          <Link
            href="/auth/forgot-password"
            className="underline underline-offset-4"
          >
            Solicitar otro enlace de recuperación
          </Link>

          <Link
            href="/auth/login"
            className="underline underline-offset-4"
          >
            Iniciar sesión
          </Link>
        </div>
      )}
    </div>
  );
}