"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Lightbulb,
  RefreshCw,
  ChevronDown,
  Ear,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Propuesta {
  id: string;
  titulo: string;
  tema_id: string | number | null;
  que_pasa: string | null;
  que_propone: string | null;
  que_cambia: string | null;
  tema?: { titulo?: string | null; tituloExtendido?: string | null } | null;
}

interface PropuestasPorTema {
  [key: string]: {
    tituloExtendido?: string | null;
    temaId: string;
    items: Propuesta[];
  };
}

interface PropuestasClientProps {
  propuestasPorTema: PropuestasPorTema;
  propuestasArray: Propuesta[];
  tipsMap?: Record<string, string | null>;
}

export function PropuestasClient({
  propuestasPorTema,
  propuestasArray,
  tipsMap = {},
}: PropuestasClientProps) {
  const [expandedTemas, setExpandedTemas] = useState<Set<string>>(
    new Set()
  );

  const toggleTema = (tema: string) => {
    const newExpanded = new Set(expandedTemas);
    if (newExpanded.has(tema)) {
      newExpanded.delete(tema);
    } else {
      newExpanded.add(tema);
    }
    setExpandedTemas(newExpanded);
  };

  return (
    <div className="flex flex-col gap-3 sm:gap-4">
      {Object.entries(propuestasPorTema).map(([temaTitulo, data]) => {
        const temaId = data.temaId;
        const isExpanded = expandedTemas.has(temaTitulo);
        // Get tema_id from first item to look up tip
        const firstItem = data.items[0];
        const tipTemaId = firstItem?.tema_id ? String(firstItem.tema_id) : null;
        const tipDescription = tipTemaId ? tipsMap[tipTemaId] : null;

        return (
          <div
            key={temaTitulo}
            id={temaId}
            className="rounded-lg border border-slate-200 scroll-mt-24"
          >
            <div className="flex items-center">
              <button
                onClick={() => toggleTema(temaTitulo)}
                className="flex-1 flex items-center justify-between gap-3 p-3 sm:p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1 text-left">
                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 break-words">
                    {temaTitulo}
                    
                  </h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center rounded-full bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 text-[11px]">
                    {data.items.length}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-500 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    aria-hidden
                  />
                </div>
              </button>

              {tipDescription && (
                <Dialog>
                  <DialogTrigger asChild>
                    <button
                      type="button"
                      className="p-2 sm:p-3 hover:bg-amber-50 transition-colors border-l border-slate-200"
                      aria-label="Ver consejo sobre este tema"
                    >
                      <Ear className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" aria-hidden />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2 text-amber-700">
                        <Ear className="h-5 w-5" aria-hidden />
                        No te dejes endulzar el oído
                      </DialogTitle>
                    </DialogHeader>
                    <div className="mt-2 text-sm text-slate-700 leading-relaxed">
                      {tipDescription}
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {isExpanded && (
              <div className="border-t border-slate-200 px-3 sm:px-4 py-3 sm:py-4 bg-white rounded-b-lg flex flex-col gap-3">
                {data.items.map((p, idx) => (
                  <div
                    key={p.id ?? `${temaTitulo}-${idx}`}
                    className="rounded-md border border-slate-200 bg-white p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-900">
                        {idx +1 + ". " + p.titulo}
                      </h4>
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px]">
                        {idx + 1}
                      </span>
                    </div>

                    <div className="flex flex-col gap-0">
                      {p.que_pasa && (
                        <div className="border-b border-slate-200 py-3 px-0">
                          <div className="flex items-center gap-2 mb-1">
                            <AlertTriangle
                              className="h-4 w-4 text-amber-600"
                              aria-hidden
                            />
                            <p className="text-[11px] sm:text-xs font-semibold text-slate-800">
                              ¿Qué pasa?
                            </p>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-700 break-words">
                            {p.que_pasa}
                          </p>
                        </div>
                      )}

                      {p.que_propone && (
                        <div className="border-b border-slate-200 py-3 px-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Lightbulb
                              className="h-4 w-4 text-emerald-600"
                              aria-hidden
                            />
                            <p className="text-[11px] sm:text-xs font-semibold text-slate-800">
                              ¿Qué propone?
                            </p>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-700 break-words">
                            {p.que_propone}
                          </p>
                        </div>
                      )}

                      {p.que_cambia && (
                        <div className="py-3 px-0">
                          <div className="flex items-center gap-2 mb-1">
                            <RefreshCw
                              className="h-4 w-4 text-blue-600"
                              aria-hidden
                            />
                            <p className="text-[11px] sm:text-xs font-semibold text-slate-800">
                              ¿Qué cambia?
                            </p>
                          </div>
                          <p className="text-xs sm:text-sm text-slate-700 break-words">
                            {p.que_cambia}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {propuestasArray.length === 0 && (
        <p className="text-xs sm:text-sm text-slate-600">
          Sin propuestas registradas.
        </p>
      )}
    </div>
  );
}
