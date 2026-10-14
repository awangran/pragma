"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type TipoFavorito = "candidato" | "articulo" | "evento";

export async function guardarFavorito(tipo: TipoFavorito, recursoId: string, guardar: boolean) {
  if (!["candidato", "articulo", "evento"].includes(tipo) || !/^[0-9]+$/.test(recursoId)) {
    return { error: "Contenido no válido." };
  }
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { error: "Inicia sesión para guardar favoritos." };
  if (!guardar) {
    const { error } = await supabase.from("favoritos").delete()
      .eq("usuario_id", user.id).eq("tipo", tipo).eq("recurso_id", recursoId);
    if (error) return { error: "No pudimos quitar el favorito." };
  } else {
    const tabla = tipo === "candidato" ? "candidatos" : tipo === "articulo" ? "articulos" : "eventos";
    const { data, error: contenidoError } = await supabase.from(tabla).select("*").eq("id", recursoId).maybeSingle();
    if (contenidoError || !data) return { error: "Este contenido ya no está disponible." };
    const contenido = data as Record<string, unknown>;
    const texto = (v: unknown) => typeof v === "string" ? v : null;
    if (tipo === "candidato" && contenido.tipo === "Minister") {
      return { error: "Este perfil pertenece a Ministerios." };
    }
    const titulo = texto(contenido.nombre) ?? texto(contenido.titulo) ?? "Evento";
    const foto = texto(contenido.avatar) ?? texto(contenido.foto) ?? texto(contenido.imagen_url);
    const href = tipo === "candidato"
      ? ["14", "21"].includes(recursoId) ? "/seguimiento#gobierno" : "/candidatos/" + recursoId
      : tipo === "articulo" ? "/articulos/" + recursoId : "/eventos";
    const { error } = await supabase.from("favoritos").upsert({
      usuario_id: user.id, tipo, recurso_id: recursoId, titulo, foto, href,
    }, { onConflict: "usuario_id,tipo,recurso_id", ignoreDuplicates: true });
    if (error) return { error: "No pudimos guardar el favorito. Intenta nuevamente." };
  }
  revalidatePath("/perfil");
  return { error: null };
}
