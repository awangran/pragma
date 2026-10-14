export type ResumenOpinion = { si:number; no:number; total:number; mi_voto:boolean|null };
export function normalizarResumen(valor:unknown):ResumenOpinion {
 const r = valor && typeof valor === "object" ? valor as Record<string,unknown> : {};
 const cuenta = (v:unknown) => typeof v === "number" && Number.isSafeInteger(v) && v >= 0 ? v : 0;
 const si=cuenta(r.si),no=cuenta(r.no);
 return {si,no,total:si+no,mi_voto:typeof r.mi_voto==="boolean"?r.mi_voto:null};
}
