"use server";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function votarOpinion(propuestaId: number, opinion: boolean | null) {
 if(!Number.isSafeInteger(propuestaId) || propuestaId <= 0 ||
   (opinion !== null && typeof opinion !== "boolean")) return { error: "Voto no válido." };
 const db = await createClient();
 const {data:{user},error:authError} = await db.auth.getUser();
 if(authError || !user) return {error:"Inicia sesión para participar."};
 // Verifica que la propuesta es accesible para esta sesión.
 const {data:propuesta,error:propuestaError} = await db.from("propuestas").select("id").eq("id",propuestaId).maybeSingle();
 if(propuestaError || !propuesta) return {error:"No pudimos encontrar esta promesa."};
 const resultado = opinion === null
  ? await db.from("votos_opinion_promesa").delete().eq("propuesta_id",propuestaId).eq("usuario_id",user.id)
  : await db.from("votos_opinion_promesa").upsert({
    propuesta_id:propuestaId,usuario_id:user.id,opinion,updated_at:new Date().toISOString(),
   },{onConflict:"propuesta_id,usuario_id"});
 if(resultado.error) return {error:"No pudimos guardar tu opinión. Intenta nuevamente."};
 revalidatePath("/seguimiento/"+propuestaId);
 const {data,error} = await db.rpc("resumen_opinion_promesa",{p_propuesta_id:propuestaId});
 if(error) return {error:"Tu voto se guardó, pero no pudimos actualizar los resultados. Recarga la página."};
 return {error:null,resumen:data};
}
