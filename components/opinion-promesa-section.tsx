import { createClient } from "@/lib/supabase/server";
import OpinionPromesa from "./opinion-promesa";
import { normalizarResumen } from "@/lib/opinion-promesa";

export default async function OpinionPromesaSection({ propuestaId }: { propuestaId:number }) {
 const db = await createClient();
 const [auth,resultado] = await Promise.all([
  db.auth.getUser(),
  db.rpc("resumen_opinion_promesa",{p_propuesta_id:propuestaId}),
 ]);
 return <OpinionPromesa propuestaId={propuestaId} initial={normalizarResumen(resultado.data)}
   conSesion={!auth.error && Boolean(auth.data.user)} errorInicial={Boolean(resultado.error)} />;
}
