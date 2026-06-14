"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type FormState = {
  titulo: string;
  resumen: string;
  descripcion: string;
  categoria: string;
  fecha_evento: string;
  hora: string;
  lugar: string;
  ciudad: string;
  candidato_nombre: string;
  partido: string;
  inscripcion_url: string;
  foto: string;
};

const CATEGORIAS = [
  "Debate",
  "Mitin",
  "Foro",
  "Lanzamiento",
  "Rueda de prensa",
];

const initialState: FormState = {
  titulo: "",
  resumen: "",
  descripcion: "",
  categoria: "",
  fecha_evento: "",
  hora: "",
  lugar: "",
  ciudad: "",
  candidato_nombre: "",
  partido: "",
  inscripcion_url: "",
  foto: "",
};

export default function AdminEditEventoPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const eventoId = parseInt(slug, 10);

  const [form, setForm] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [status, setStatus] = useState<
    | { type: "idle" }
    | { type: "success"; message: string }
    | { type: "error"; message: string }
  >({ type: "idle" });

  const fotoInputRef = useRef<HTMLInputElement>(null);

  // Check admin role
  useEffect(() => {
    const checkRole = async () => {
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData?.user) {
        setIsAdmin(false);
        setIsCheckingRole(false);
        return;
      }
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();
      if (profileError) {
        setIsAdmin(false);
        setIsCheckingRole(false);
        return;
      }
      setIsAdmin(profileData?.role === "admin");
      setIsCheckingRole(false);
    };
    void checkRole();
  }, []);

  // Load evento data
  useEffect(() => {
    const loadData = async () => {
      if (!isAdmin || !eventoId) return;
      const supabase = createClient();
      const { data: eventoData, error } = await supabase
        .from("eventos")
        .select()
        .eq("id", eventoId)
        .single();
      if (error || !eventoData) {
        setStatus({ type: "error", message: "No se pudo cargar el evento." });
        setIsLoading(false);
        return;
      }
      setForm({
        titulo: eventoData.titulo ?? "",
        resumen: eventoData.resumen ?? "",
        descripcion: eventoData.descripcion ?? "",
        categoria: eventoData.categoria ?? "",
        fecha_evento: eventoData.fecha_evento ?? "",
        hora: eventoData.hora ?? "",
        lugar: eventoData.lugar ?? "",
        ciudad: eventoData.ciudad ?? "",
        candidato_nombre: eventoData.candidato_nombre ?? "",
        partido: eventoData.partido ?? "",
        inscripcion_url: eventoData.inscripcion_url ?? "",
        foto: eventoData.foto ?? "",
      });
      setIsLoading(false);
    };
    void loadData();
  }, [isAdmin, eventoId]);

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  async function uploadFotoFile(file: File): Promise<string | null> {
    if (file.size > 5 * 1024 * 1024) {
      setStatus({ type: "error", message: "La imagen supera 5MB. Usa un archivo más liviano." });
      return null;
    }
    setIsUploading(true);
    setStatus({ type: "idle" });
    const supabase = createClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `eventos/${Date.now()}-${safeName}`;
    const { error } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { cacheControl: "3600", upsert: false });
    if (error) {
      setStatus({ type: "error", message: error.message });
      setIsUploading(false);
      return null;
    }
    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    if (!data?.publicUrl) {
      setStatus({ type: "error", message: "No se pudo obtener la URL de la imagen." });
      setIsUploading(false);
      return null;
    }
    setIsUploading(false);
    return data.publicUrl;
  }

  const handleFotoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setStatus({ type: "error", message: "La imagen supera 5MB. Usa un archivo más liviano." });
      event.target.value = "";
      return;
    }
    const publicUrl = await uploadFotoFile(file);
    if (publicUrl) setForm((prev) => ({ ...prev, foto: publicUrl }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting || isUploading) return;

    let fotoUrl = form.foto.trim();
    const file = fotoInputRef.current?.files?.[0] ?? null;
    if (file && !fotoUrl) {
      const publicUrl = await uploadFotoFile(file);
      if (!publicUrl) return;
      fotoUrl = publicUrl;
    }

    setIsSubmitting(true);
    setStatus({ type: "idle" });

    const supabase = createClient();
    const { error } = await supabase
      .from("eventos")
      .update({
        titulo: form.titulo.trim(),
        resumen: form.resumen.trim(),
        descripcion: form.descripcion.trim() || null,
        categoria: form.categoria.trim(),
        fecha_evento: form.fecha_evento,
        hora: form.hora.trim() || null,
        lugar: form.lugar.trim() || null,
        ciudad: form.ciudad.trim() || null,
        candidato_nombre: form.candidato_nombre.trim() || null,
        partido: form.partido.trim() || null,
        inscripcion_url: form.inscripcion_url.trim() || null,
        foto: fotoUrl || null,
      })
      .eq("id", eventoId);

    if (error) {
      setStatus({ type: "error", message: error.message });
      setIsSubmitting(false);
      return;
    }

    setStatus({ type: "success", message: "Evento actualizado correctamente." });
    setIsSubmitting(false);
    setTimeout(() => router.push("/eventos"), 1500);
  };

  if (isCheckingRole) {
    return (
      <main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
        <p className="text-sm text-muted-foreground">Verificando permisos...</p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
        <h1 className="text-2xl font-semibold">Acceso restringido</h1>
        <p className="text-sm text-muted-foreground">Necesitas rol admin para ver esta página.</p>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
        <p className="text-sm text-muted-foreground">Cargando datos del evento...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10">
      <header className="mb-10 space-y-3">
        <h1 className="text-4xl font-bold text-foreground">Editar evento</h1>
        <p className="text-base text-muted-foreground max-w-2xl">
          Actualiza la información del evento. Los campos con * son obligatorios.
        </p>
      </header>

      <form className="space-y-10" onSubmit={handleSubmit}>
        {/* Información básica */}
        <section className="space-y-5">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded" />
            Información del evento
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="titulo" className="font-semibold">Título *</Label>
              <Input id="titulo" name="titulo" value={form.titulo} onChange={handleChange} placeholder="Nombre del evento" required />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="resumen" className="font-semibold">Resumen *</Label>
              <textarea
                id="resumen" name="resumen" value={form.resumen} onChange={handleChange}
                placeholder="1-2 oraciones para la tarjeta de preview"
                className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                required
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="descripcion" className="font-semibold">Descripción completa</Label>
              <textarea
                id="descripcion" name="descripcion" value={form.descripcion} onChange={handleChange}
                placeholder="Descripción detallada que aparecerá en el popup."
                className="min-h-[160px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria" className="font-semibold">Categoría *</Label>
              <select
                id="categoria" name="categoria" required value={form.categoria} onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring appearance-none"
              >
                <option value="">Selecciona una categoría</option>
                {CATEGORIAS.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fecha_evento" className="font-semibold">Fecha del evento *</Label>
              <Input id="fecha_evento" name="fecha_evento" type="date" value={form.fecha_evento} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora" className="font-semibold">Hora</Label>
              <Input id="hora" name="hora" value={form.hora} onChange={handleChange} placeholder="Ej: 10:00 AM – 2:00 PM" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ciudad" className="font-semibold">Ciudad</Label>
              <Input id="ciudad" name="ciudad" value={form.ciudad} onChange={handleChange} placeholder="Bogotá" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="lugar" className="font-semibold">Lugar / Dirección</Label>
              <Input id="lugar" name="lugar" value={form.lugar} onChange={handleChange} placeholder="Teatro Nacional, Calle 71" />
            </div>
          </div>
        </section>

        {/* Candidato / partido */}
        <section className="space-y-5">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded" />
            Candidato o partido
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="candidato_nombre" className="font-semibold">Candidato / Coalición</Label>
              <Input id="candidato_nombre" name="candidato_nombre" value={form.candidato_nombre} onChange={handleChange} placeholder="Nombre del candidato o coalición" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="partido" className="font-semibold">Partido político</Label>
              <Input id="partido" name="partido" value={form.partido} onChange={handleChange} placeholder="Nombre del partido" />
            </div>
          </div>
        </section>

        {/* Inscripción e imagen */}
        <section className="space-y-5">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <span className="w-1 h-6 bg-primary rounded" />
            Inscripción e imagen
          </h2>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="inscripcion_url" className="font-semibold">Link de inscripción</Label>
              <Input id="inscripcion_url" name="inscripcion_url" type="url" value={form.inscripcion_url} onChange={handleChange} placeholder="https://ejemplo.com/inscripcion" />
            </div>

            <div className="space-y-3 md:col-span-2 rounded-lg border border-dashed border-primary/20 bg-primary/5 p-4">
              <Label htmlFor="foto" className="font-semibold text-base">Imagen del evento</Label>
              <p className="text-sm text-muted-foreground">Máximo 5 MB. Formatos: JPG, PNG, WebP. Deja vacío para mantener la imagen actual.</p>
              <Input
                id="foto" name="foto" type="file" accept="image/*"
                onChange={handleFotoUpload} ref={fotoInputRef}
                disabled={isUploading} className="cursor-pointer"
              />
              {form.foto && (
                <div className="rounded-md bg-green-50 border border-green-200 p-2 text-xs text-green-700">
                  ✓ Imagen actual cargada
                </div>
              )}
              {isUploading && (
                <div className="rounded-md bg-blue-50 border border-blue-200 p-2 text-xs text-blue-700">
                  ⏳ Subiendo imagen...
                </div>
              )}
            </div>
          </div>
        </section>

        {status.type === "error" && <p className="text-sm text-destructive">{status.message}</p>}
        {status.type === "success" && <p className="text-sm text-emerald-600">{status.message}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting || isUploading}>
            {isSubmitting ? "Guardando..." : "Guardar cambios"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.push("/eventos")}>
            Cancelar
          </Button>
        </div>
      </form>
    </main>
  );
}
