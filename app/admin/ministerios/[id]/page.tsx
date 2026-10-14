"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  ExternalLink,
  FileText,
  ImageIcon,
  Link2,
  Loader2,
  Plus,
  Save,
  Trash2,
  UserRound,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/* ============================================================
   TIPOS
============================================================ */

type Status =
  | { type: "idle" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

type Ministerio = {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string | null;
  sitio_web: string | null;
  logo: string | null;
};

type Funcionario = {
  id: number;
  ministerio_id: number;
  nombre: string | null;
  avatar: string | null;
  cargo: string;
  bio: string | null;
  trayectoria: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  activo: boolean;
};

type LinkFuncionario = {
  id: number;
  funcionario_id: number;
  titulo: string;
  url: string;
  tipo: string | null;
};

type Actividad = {
  id: number;
  ministerio_id: number;
  titulo: string;
  resumen: string;
  tipo: string | null;
  fecha: string | null;
  url_oficial: string | null;
  imagen_url: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
};

type FuenteActividad = {
  id: number;
  actividad_id: number;
  titulo: string;
  url: string;
  tipo: string | null;
  fecha_fuente: string | null;
};

type MinisterioForm = {
  nombre: string;
  descripcion: string;
  sitio_web: string;
  logo: string;
};

type FuncionarioForm = {
  nombre: string;
  avatar: string;
  cargo: string;
  bio: string;
  trayectoria: string;
  fecha_inicio: string;
  fecha_fin: string;
};

type LinkForm = {
  titulo: string;
  url: string;
  tipo: string;
};

type ActividadForm = {
  titulo: string;
  resumen: string;
  tipo: string;
  fecha: string;
  url_oficial: string;
  imagen_url: string;
  fecha_inicio: string;
  fecha_fin: string;
};

type FuenteForm = {
  titulo: string;
  url: string;
  tipo: string;
  fecha_fuente: string;
};

/* ============================================================
   CONSTANTES
============================================================ */

const INITIAL_LINK: LinkForm = {
  titulo: "",
  url: "",
  tipo: "oficial",
};

const INITIAL_ACTIVIDAD: ActividadForm = {
  imagen_url: "", fecha_inicio: "", fecha_fin: "",
  titulo: "",
  resumen: "",
  tipo: "",
  fecha: "",
  url_oficial: "",
};

const INITIAL_FUENTE: FuenteForm = {
  titulo: "",
  url: "",
  tipo: "documento_oficial",
  fecha_fuente: "",
};


const TIPOS_FUENTE = [
  { value: "documento_oficial", label: "Documento oficial" },
  { value: "datos_publicos", label: "Datos públicos" },
  { value: "declaracion_funcionario", label: "Declaración del funcionario" },
  { value: "contrato", label: "Contrato" },
  { value: "informe", label: "Informe" },
  { value: "medio", label: "Medio de comunicación" },
  { value: "otra", label: "Otra fuente" },
];

/* ============================================================
   HELPERS
============================================================ */

function formatDate(fecha: string | null) {
  if (!fecha) return "Sin fecha";

  return new Date(`${fecha}T12:00:00`).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}


// Valida la imagen de la actividad. Vacío es válido (usa imagen automática).
// Acepta https:// o rutas locales que empiecen por "/" (no "//").
function validarImagenUrl(valor: string): string | null {
  const v = valor.trim();

  if (!v) return null;
  if (v.startsWith("//")) return "La imagen no puede empezar por //.";
  if (v.startsWith("/")) return null;

  try {
    if (new URL(v).protocol === "https:") return null;
  } catch {
    // No es una URL válida: se devuelve el mensaje de abajo.
  }

  return "La imagen debe empezar por https:// o ser una ruta que empiece por /.";
}

/* ============================================================
   COMPONENTE
============================================================ */

function AdminMinisterioDetailContenido() {
  const params = useParams();
  const router = useRouter();

  const ministerioId = params?.id
    ? Number.parseInt(params.id as string, 10)
    : null;

  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [savingMinisterio, setSavingMinisterio] = useState(false);
  const [savingFuncionario, setSavingFuncionario] = useState(false);

  const [status, setStatus] = useState<Status>({ type: "idle" });

  const [ministerio, setMinisterio] = useState<Ministerio | null>(null);
  const [funcionario, setFuncionario] = useState<Funcionario | null>(null);

  const [links, setLinks] = useState<LinkFuncionario[]>([]);
  const [actividades, setActividades] = useState<Actividad[]>([]);


  const [fuentesActividad, setFuentesActividad] = useState<
    Record<number, FuenteActividad[]>
  >({});

  const [ministerioForm, setMinisterioForm] = useState<MinisterioForm>({
    nombre: "",
    descripcion: "",
    sitio_web: "",
    logo: "",
  });

  const [funcionarioForm, setFuncionarioForm] = useState<FuncionarioForm>({
    nombre: "",
    avatar: "",
    cargo: "",
    bio: "",
    trayectoria: "",
    fecha_inicio: "",
    fecha_fin: "",
  });

  const [linkForm, setLinkForm] = useState<LinkForm>(INITIAL_LINK);
  const [actividadForm, setActividadForm] =
    useState<ActividadForm>(INITIAL_ACTIVIDAD);


  const [actividadFuenteActiva, setActividadFuenteActiva] = useState<
    number | null
  >(null);


  const [fuenteActividadForm, setFuenteActividadForm] =
    useState<FuenteForm>(INITIAL_FUENTE);

  const [actividadEditando, setActividadEditando] = useState<number | null>(null);
  const [imagenEditando, setImagenEditando] = useState<{
    id: number;
    url: string;
  } | null>(null);

  /* ============================================================
     AUTH
  ============================================================ */

  useEffect(() => {
    const checkRole = async () => {
      const supabase = createClient();

      const { data: authData, error: authError } =
        await supabase.auth.getUser();

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
        setStatus({
          type: "error",
          message: profileError.message,
        });

        setIsAdmin(false);
        setIsCheckingRole(false);
        return;
      }

      setIsAdmin(profileData?.role === "admin");
      setIsCheckingRole(false);
    };

    void checkRole();
  }, []);

  /* ============================================================
     LOAD DATA
  ============================================================ */

  const loadData = useCallback(async () => {
    if (!ministerioId || !isAdmin) return;

    setIsLoading(true);
    setStatus({ type: "idle" });

    const supabase = createClient();

    const { data: ministerioData, error: ministerioError } = await supabase
      .from("ministerios")
      .select("*")
      .eq("id", ministerioId)
      .single();

    if (ministerioError || !ministerioData) {
      setStatus({
        type: "error",
        message:
          ministerioError?.message ?? "No se pudo cargar el ministerio.",
      });

      setIsLoading(false);
      return;
    }

    const currentMinisterio = ministerioData as Ministerio;

    setMinisterio(currentMinisterio);

    setMinisterioForm({
      nombre: currentMinisterio.nombre ?? "",
      descripcion: currentMinisterio.descripcion ?? "",
      sitio_web: currentMinisterio.sitio_web ?? "",
      logo: currentMinisterio.logo ?? "",
    });

    const { data: funcionarioData, error: funcionarioError } = await supabase
      .from("funcionarios_ministerio")
      .select(`
        id,
        ministerio_id,
        nombre,
        avatar,
        cargo,
        bio,
        trayectoria,
        fecha_inicio,
        fecha_fin,
        activo
      `)
      .eq("ministerio_id", ministerioId)
      .eq("activo", true)
      .maybeSingle();

    if (funcionarioError) {
      setStatus({
        type: "error",
        message: funcionarioError.message,
      });

      setIsLoading(false);
      return;
    }

    let funcionarioNormalizado: Funcionario | null = null;

    if (funcionarioData) {
      const raw = funcionarioData;

      funcionarioNormalizado = {
        id: raw.id,
        ministerio_id: raw.ministerio_id,
        nombre: raw.nombre,
        avatar: raw.avatar,
        cargo: raw.cargo,
        bio: raw.bio,
        trayectoria: raw.trayectoria,
        fecha_inicio: raw.fecha_inicio,
        fecha_fin: raw.fecha_fin,
        activo: raw.activo,
      };

      setFuncionario(funcionarioNormalizado);

      setFuncionarioForm({
        nombre: funcionarioNormalizado.nombre ?? "",
        avatar: funcionarioNormalizado.avatar ?? "",
        cargo: funcionarioNormalizado.cargo ?? "",
        bio: funcionarioNormalizado.bio ?? "",
        trayectoria: funcionarioNormalizado.trayectoria ?? "",
        fecha_inicio: funcionarioNormalizado.fecha_inicio ?? "",
        fecha_fin: funcionarioNormalizado.fecha_fin ?? "",
      });
    } else {
      setFuncionario(null);
    }

    if (funcionarioNormalizado) {
      const { data: linksData } = await supabase
        .from("links_funcionario")
        .select("*")
        .eq("funcionario_id", funcionarioNormalizado.id)
        .order("created_at", { ascending: false });

      setLinks((linksData ?? []) as LinkFuncionario[]);
    } else {
      setLinks([]);
    }

    const { data: actividadesData } = await supabase
      .from("actividad_ministerio")
      .select("*")
      .eq("ministerio_id", ministerioId)
      .order("fecha", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false });

    const actividadesNormalizadas = (actividadesData ?? []) as Actividad[];
    setActividades(actividadesNormalizadas);

    if (actividadesNormalizadas.length > 0) {
      const actividadIds = actividadesNormalizadas.map((item) => item.id);

      const { data: fuentesActividadData } = await supabase
        .from("fuentes_actividad")
        .select("*")
        .in("actividad_id", actividadIds)
        .order("created_at", { ascending: false });

      const grouped: Record<number, FuenteActividad[]> = {};

      for (const fuente of (fuentesActividadData ?? []) as FuenteActividad[]) {
        if (!grouped[fuente.actividad_id]) {
          grouped[fuente.actividad_id] = [];
        }

        grouped[fuente.actividad_id].push(fuente);
      }

      setFuentesActividad(grouped);
    } else {
      setFuentesActividad({});
    }

    setIsLoading(false);
  }, [ministerioId, isAdmin]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  /* ============================================================
     SAVE MINISTERIO
  ============================================================ */

  const handleMinisterioChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setMinisterioForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveMinisterio = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!ministerioId || savingMinisterio) return;

    if (!ministerioForm.nombre.trim()) {
      setStatus({
        type: "error",
        message: "El nombre del ministerio es obligatorio.",
      });
      return;
    }

    setSavingMinisterio(true);
    setStatus({ type: "idle" });

    const supabase = createClient();

    const { error } = await supabase
      .from("ministerios")
      .update({
        nombre: ministerioForm.nombre.trim(),
        descripcion: ministerioForm.descripcion.trim() || null,
        sitio_web: ministerioForm.sitio_web.trim() || null,
        logo: ministerioForm.logo.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", ministerioId);

    if (error) {
      setStatus({
        type: "error",
        message: error.message,
      });

      setSavingMinisterio(false);
      return;
    }

    setStatus({
      type: "success",
      message: "Información del ministerio actualizada.",
    });

    setSavingMinisterio(false);
    await loadData();
  };

  /* ============================================================
     SAVE FUNCIONARIO
  ============================================================ */

  const handleFuncionarioChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setFuncionarioForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const saveFuncionario = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!ministerioId || !isAdmin || savingFuncionario) return;
    if (!funcionarioForm.nombre.trim()) {
      setStatus({ type: "error", message: "El nombre del funcionario es obligatorio." });
      return;
    }

    setSavingFuncionario(true);
    setStatus({ type: "idle" });

    const supabase = createClient();

    const payload = {
      nombre: funcionarioForm.nombre.trim(),
      avatar: funcionarioForm.avatar.trim() || null,
      cargo: funcionarioForm.cargo.trim() || "Ministro/a",
      bio: funcionarioForm.bio.trim() || null,
      trayectoria: funcionarioForm.trayectoria.trim() || null,
      fecha_inicio: funcionarioForm.fecha_inicio || null,
      fecha_fin: funcionarioForm.fecha_fin || null,
      updated_at: new Date().toISOString(),
    };

    const { data: guardado, error: funcionarioError } = funcionario
      ? await supabase.from("funcionarios_ministerio")
          .update(payload)
          .eq("id", funcionario.id)
          .eq("ministerio_id", ministerioId)
          .select("id").single()
      : await supabase.from("funcionarios_ministerio")
          .insert({ ...payload, ministerio_id: ministerioId, activo: true })
          .select("id").single();

    if (funcionarioError || !guardado) {
      setStatus({
        type: "error",
        message: funcionarioError?.message ?? "No se pudo guardar el funcionario.",
      });

      setSavingFuncionario(false);
      return;
    }

    setStatus({
      type: "success",
      message: "Perfil del funcionario actualizado.",
    });

    setSavingFuncionario(false);
    await loadData();
  };

  /* ============================================================
     LINKS
  ============================================================ */

  const addLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!funcionario) return;

    if (!linkForm.titulo.trim() || !linkForm.url.trim()) {
      setStatus({
        type: "error",
        message: "El título y la URL del enlace son obligatorios.",
      });
      return;
    }

    const supabase = createClient();

    const { error } = await supabase.from("links_funcionario").insert([
      {
        funcionario_id: funcionario.id,
        titulo: linkForm.titulo.trim(),
        url: linkForm.url.trim(),
        tipo: linkForm.tipo.trim() || null,
      },
    ]);

    if (error) {
      setStatus({
        type: "error",
        message: error.message,
      });
      return;
    }

    setLinkForm(INITIAL_LINK);

    setStatus({
      type: "success",
      message: "Enlace agregado.",
    });

    await loadData();
  };

  const deleteLink = async (id: number) => {
    if (!confirm("¿Eliminar este enlace?")) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("links_funcionario")
      .delete()
      .eq("id", id);

    if (error) {
      setStatus({
        type: "error",
        message: error.message,
      });
      return;
    }

    await loadData();
  };

  /* ============================================================
     PROYECTOS
  ============================================================ */

  const saveImagenActividad = async (id: number) => {
    if (!imagenEditando || imagenEditando.id !== id) return;

    const errorImagen = validarImagenUrl(imagenEditando.url);

    if (errorImagen) {
      setStatus({ type: "error", message: errorImagen });
      return;
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("actividad_ministerio")
      .update({ imagen_url: imagenEditando.url.trim() || null })
      .eq("id", id);

    if (error) {
      setStatus({ type: "error", message: error.message });
      return;
    }

    setImagenEditando(null);

    setStatus({
      type: "success",
      message: "Imagen de la actividad actualizada.",
    });

    await loadData();
  };


  const addActividad = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!ministerioId) return;

    if (
      !actividadForm.titulo.trim() ||
      !actividadForm.resumen.trim()
    ) {
      setStatus({
        type: "error",
        message: "Título y resumen son obligatorios. La fecha debe corresponder al hecho, si se conoce.",
      });
      return;
    }

    const supabase = createClient();

    const errorImagen = validarImagenUrl(actividadForm.imagen_url);
    if (errorImagen) { setStatus({ type: "error", message: errorImagen }); return; }
    const payload = {
        ministerio_id: ministerioId,
        titulo: actividadForm.titulo.trim(),
        resumen: actividadForm.resumen.trim(),
        tipo: actividadForm.tipo.trim() || null,
        fecha: actividadForm.fecha || null,
        imagen_url: actividadForm.imagen_url.trim() || null,
        fecha_inicio: actividadForm.fecha_inicio || null,
        fecha_fin: actividadForm.fecha_fin || null,
        url_oficial: actividadForm.url_oficial.trim() || null,
      };
    const { error } = actividadEditando !== null
      ? await supabase.from("actividad_ministerio").update(payload).eq("id", actividadEditando).eq("ministerio_id", ministerioId)
      : await supabase.from("actividad_ministerio").insert([payload]);

    if (error) {
      setStatus({
        type: "error",
        message: error.message,
      });
      return;
    }

    setActividadForm(INITIAL_ACTIVIDAD);
    setActividadEditando(null);

    setStatus({
      type: "success",
      message: actividadEditando !== null ? "Actividad actualizada." : "Actividad agregada.",
    });

    await loadData();
  };

  const deleteActividad = async (id: number) => {
    if (
      !confirm(
        "¿Eliminar esta actividad? También se eliminarán sus fuentes asociadas.",
      )
    ) {
      return;
    }

    const supabase = createClient();

    const { error } = await supabase
      .from("actividad_ministerio")
      .delete()
      .eq("id", id);

    if (error) {
      setStatus({
        type: "error",
        message: error.message,
      });
      return;
    }

    await loadData();
  };

  const addFuenteActividad = async (
    event: FormEvent<HTMLFormElement>,
    actividadId: number,
  ) => {
    event.preventDefault();

    if (
      !fuenteActividadForm.titulo.trim() ||
      !fuenteActividadForm.url.trim()
    ) {
      setStatus({
        type: "error",
        message: "El título y la URL de la fuente son obligatorios.",
      });
      return;
    }

    const supabase = createClient();

    const { error } = await supabase.from("fuentes_actividad").insert([
      {
        actividad_id: actividadId,
        titulo: fuenteActividadForm.titulo.trim(),
        url: fuenteActividadForm.url.trim(),
        tipo: fuenteActividadForm.tipo || null,
        fecha_fuente: fuenteActividadForm.fecha_fuente || null,
      },
    ]);

    if (error) {
      setStatus({
        type: "error",
        message: error.message,
      });
      return;
    }

    setFuenteActividadForm(INITIAL_FUENTE);
    setActividadFuenteActiva(null);

    setStatus({
      type: "success",
      message: "Fuente agregada a la actividad.",
    });

    await loadData();
  };

  const deleteFuenteActividad = async (id: number) => {
    if (!confirm("¿Eliminar esta fuente?")) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("fuentes_actividad")
      .delete()
      .eq("id", id);

    if (error) {
      setStatus({
        type: "error",
        message: error.message,
      });
      return;
    }

    await loadData();
  };

  /* ============================================================
     LOADING / AUTH
  ============================================================ */

  if (isCheckingRole) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <p className="text-sm text-slate-500">Verificando permisos...</p>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-950">
          Acceso restringido
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Necesitas rol admin para acceder a esta página.
        </p>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="mx-auto flex w-full max-w-6xl items-center gap-3 px-4 py-10">
        <Loader2 className="h-5 w-5 animate-spin text-slate-500" />

        <p className="text-sm text-slate-500">
          Cargando ministerio...
        </p>
      </main>
    );
  }

  if (!ministerio) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-semibold text-slate-950">
          Ministerio no encontrado
        </h1>

        <Button
          variant="outline"
          className="mt-5"
          onClick={() => router.push("/admin/ministerios")}
        >
          Volver
        </Button>
      </main>
    );
  }

  /* ============================================================
     UI
  ============================================================ */

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:py-14">
      <button
        type="button"
        onClick={() => router.push("/admin/ministerios")}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-950"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a ministerios
      </button>

      {/* HERO */}

      <section className="relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 left-20 h-56 w-56 rounded-full bg-emerald-100/60 blur-3xl" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center">
          {funcionario?.avatar ? (
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-3xl border border-slate-200 bg-slate-100">
              <Image
                src={funcionario.avatar}
                alt={funcionario.nombre ?? "Funcionario"}
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl border border-slate-200 bg-slate-50">
              <UserRound className="h-10 w-10 text-slate-300" />
            </div>
          )}

          <div className="min-w-0">
            <div className="mb-3 inline-flex rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
              Administración del gabinete
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              {ministerio.nombre}
            </h1>

            <p className="mt-2 text-lg font-medium text-slate-700">
              {funcionario?.nombre ?? "Sin funcionario activo"}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {funcionario?.cargo ?? "Sin cargo registrado"}
            </p>
          </div>
        </div>
      </section>

      {/* STATUS */}

      {status.type !== "idle" && (
        <div
          className={`mt-6 rounded-2xl border px-5 py-4 ${
            status.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          }`}
        >
          <p className="text-sm font-medium">{status.message}</p>
        </div>
      )}

      {/* ======================================================
          MINISTERIO
      ====================================================== */}

      <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="mb-7 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
            <Building2 className="h-5 w-5 text-violet-700" />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              Información del ministerio
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Información institucional que aparecerá en la página pública.
            </p>
          </div>
        </div>

        <form onSubmit={saveMinisterio} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre</Label>

            <Input
              id="nombre"
              name="nombre"
              value={ministerioForm.nombre}
              onChange={handleMinisterioChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>

            <textarea
              id="descripcion"
              name="descripcion"
              value={ministerioForm.descripcion}
              onChange={handleMinisterioChange}
              rows={5}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-slate-400"
              placeholder="Descripción institucional..."
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="sitio_web">Sitio web oficial</Label>

              <Input
                id="sitio_web"
                name="sitio_web"
                type="url"
                value={ministerioForm.sitio_web}
                onChange={handleMinisterioChange}
                placeholder="https://..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo">URL del logo</Label>

              <Input
                id="logo"
                name="logo"
                type="url"
                value={ministerioForm.logo}
                onChange={handleMinisterioChange}
                placeholder="https://..."
              />
            </div>
          </div>

          <Button type="submit" disabled={savingMinisterio} className="gap-2">
            {savingMinisterio ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}

            Guardar ministerio
          </Button>
        </form>
      </section>

      {/* ======================================================
          FUNCIONARIO
      ====================================================== */}

      {ministerio && (
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="mb-7 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <UserRound className="h-5 w-5 text-emerald-700" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                {funcionario ? "Perfil del funcionario" : "Registrar funcionario"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Foto, biografía y trayectoria del ministro o ministra.
              </p>
            </div>
          </div>

          <form onSubmit={saveFuncionario} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="funcionario-nombre">Nombre</Label>

                <Input
                  id="funcionario-nombre"
                  name="nombre"
                  value={funcionarioForm.nombre}
                  onChange={handleFuncionarioChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cargo">Cargo</Label>

                <Input
                  id="cargo"
                  name="cargo"
                  value={funcionarioForm.cargo}
                  onChange={handleFuncionarioChange}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="avatar">URL de la foto</Label>

              <Input
                id="avatar"
                name="avatar"
                type="url"
                value={funcionarioForm.avatar}
                onChange={handleFuncionarioChange}
                placeholder="https://..."
              />

              <p className="text-xs text-slate-400">
                Después podemos cambiar este campo por carga directa de imagen
                desde tu computador.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografía corta</Label>

              <textarea
                id="bio"
                name="bio"
                value={funcionarioForm.bio}
                onChange={handleFuncionarioChange}
                rows={5}
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-slate-400"
                placeholder="Resumen biográfico..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="trayectoria">Trayectoria</Label>

              <textarea
                id="trayectoria"
                name="trayectoria"
                value={funcionarioForm.trayectoria}
                onChange={handleFuncionarioChange}
                rows={7}
                className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none transition focus:border-slate-400"
                placeholder="Experiencia profesional, cargos anteriores..."
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fecha_inicio">Inicio en el cargo</Label>

                <Input
                  id="fecha_inicio"
                  name="fecha_inicio"
                  type="date"
                  value={funcionarioForm.fecha_inicio}
                  onChange={handleFuncionarioChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_fin">Fin en el cargo</Label>

                <Input
                  id="fecha_fin"
                  name="fecha_fin"
                  type="date"
                  value={funcionarioForm.fecha_fin}
                  onChange={handleFuncionarioChange}
                />
              </div>
            </div>

            <Button type="submit" disabled={savingFuncionario} className="gap-2">
              {savingFuncionario ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}

              Guardar funcionario
            </Button>
          </form>
        </section>
      )}

      {/* ======================================================
          LINKS
      ====================================================== */}

      {funcionario && (
        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
          <div className="mb-6 flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <Link2 className="h-5 w-5 text-blue-700" />
            </div>

            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                Enlaces del funcionario
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Perfiles oficiales, hojas de vida u otras referencias.
              </p>
            </div>
          </div>

          {links.length > 0 && (
            <div className="mb-7 space-y-3">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex flex-col justify-between gap-3 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{link.titulo}</p>

                    <p className="mt-1 truncate text-sm text-slate-500">
                      {link.url}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Abrir
                    </a>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => void deleteLink(link.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form
            onSubmit={addLink}
            className="rounded-2xl bg-slate-50 p-5"
          >
            <h3 className="font-semibold text-slate-900">
              Agregar enlace
            </h3>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Input
                placeholder="Título"
                value={linkForm.titulo}
                onChange={(event) =>
                  setLinkForm((prev) => ({
                    ...prev,
                    titulo: event.target.value,
                  }))
                }
              />

              <Input
                type="url"
                placeholder="https://..."
                value={linkForm.url}
                onChange={(event) =>
                  setLinkForm((prev) => ({
                    ...prev,
                    url: event.target.value,
                  }))
                }
              />

              <Input
                placeholder="Tipo: oficial, LinkedIn..."
                value={linkForm.tipo}
                onChange={(event) =>
                  setLinkForm((prev) => ({
                    ...prev,
                    tipo: event.target.value,
                  }))
                }
              />
            </div>

            <Button type="submit" variant="outline" className="mt-4 gap-2">
              <Plus className="h-4 w-4" />
              Agregar enlace
            </Button>
          </form>
        </section>
      )}

      {/* ======================================================
          ACTIVIDAD
      ====================================================== */}

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="mb-7 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
            <CalendarDays className="h-5 w-5 text-blue-700" />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-slate-950">
              Actividad reciente
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Registra programas, anuncios, reuniones y avances en un único historial con imágenes y fuentes.
            </p>
          </div>
        </div>

        <form
          id="form-actividad"
          onSubmit={addActividad}
          className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"
        >
          <h3 className="font-semibold text-slate-950">
            {actividadEditando !== null ? "Editar actividad" : "Nueva actividad"}
          </h3>

          <div className="mt-5 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                placeholder="Título *"
                value={actividadForm.titulo}
                onChange={(event) =>
                  setActividadForm((prev) => ({
                    ...prev,
                    titulo: event.target.value,
                  }))
                }
              />

              <Input
                placeholder="Tipo"
                value={actividadForm.tipo}
                onChange={(event) =>
                  setActividadForm((prev) => ({
                    ...prev,
                    tipo: event.target.value,
                  }))
                }
              />
            </div>

            <textarea
              rows={4}
              placeholder="Resumen de la actividad *"
              value={actividadForm.resumen}
              onChange={(event) =>
                setActividadForm((prev) => ({
                  ...prev,
                  resumen: event.target.value,
                }))
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none focus:border-slate-400"
            />

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label className="text-xs text-slate-500">
                  Fecha del hecho (si se conoce)
                </Label>

                <Input
                  type="date"
                  className="mt-1"
                  value={actividadForm.fecha}
                  onChange={(event) =>
                    setActividadForm((prev) => ({
                      ...prev,
                      fecha: event.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label className="text-xs text-slate-500">
                  URL oficial
                </Label>

                <Input
                  type="url"
                  className="mt-1"
                  placeholder="https://..."
                  value={actividadForm.url_oficial}
                  onChange={(event) =>
                    setActividadForm((prev) => ({
                      ...prev,
                      url_oficial: event.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <ImagenActividadField value={actividadForm.imagen_url} onChange={(imagen_url) => setActividadForm(prev => ({ ...prev, imagen_url }))} />
            <div className="grid gap-4 md:grid-cols-3">
              <div><Label>Inicio (opcional)</Label><Input type="date" value={actividadForm.fecha_inicio} onChange={e => setActividadForm(prev => ({ ...prev, fecha_inicio: e.target.value }))} /></div>
              <div><Label>Fin (opcional)</Label><Input type="date" value={actividadForm.fecha_fin} onChange={e => setActividadForm(prev => ({ ...prev, fecha_fin: e.target.value }))} /></div>
            </div>
            <Button type="submit" className="gap-2">
              <Plus className="h-4 w-4" />
              {actividadEditando !== null ? "Guardar cambios" : "Agregar actividad"}
            </Button>
          </div>
        </form>

        {actividadEditando !== null && <Button className="mt-3" variant="outline" onClick={() => { setActividadEditando(null); setActividadForm(INITIAL_ACTIVIDAD); }}>Cancelar edición</Button>}
        <div className="mt-7 space-y-4">
          {actividades.length === 0 ? (
            <EmptyState text="Todavía no hay actividad registrada." />
          ) : (
            actividades.map((actividad) => (
              <div
                key={actividad.id}
                className="rounded-2xl border border-slate-200 p-5"
              >
                <Button variant="outline" size="sm" className="mb-4" onClick={() => {
                  setActividadEditando(actividad.id);
                  setActividadForm({ titulo: actividad.titulo, resumen: actividad.resumen ?? "", tipo: actividad.tipo ?? "", fecha: actividad.fecha ?? "", url_oficial: actividad.url_oficial ?? "", imagen_url: actividad.imagen_url ?? "", fecha_inicio: actividad.fecha_inicio ?? "", fecha_fin: actividad.fecha_fin ?? "" });
                  document.getElementById("form-actividad")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}>Editar registro</Button>
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-950">
                        {actividad.titulo}
                      </h3>

                      {actividad.tipo && (
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                          {actividad.tipo}
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-xs font-medium text-slate-400">
                      {actividad.fecha ? formatDate(actividad.fecha) : "Fecha no registrada"}
                    </p>

                    <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
                      {actividad.resumen}
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="self-start text-red-600"
                    onClick={() => void deleteActividad(actividad.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-5 border-t border-slate-100 pt-4">
                  {imagenEditando?.id === actividad.id ? (
                    <div className="space-y-3">
                      <ImagenActividadField
                        value={imagenEditando.url}
                        onChange={(url) =>
                          setImagenEditando({ id: actividad.id, url })
                        }
                      />

                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          className="gap-2"
                          onClick={() => void saveImagenActividad(actividad.id)}
                        >
                          <Save className="h-4 w-4" />
                          Guardar imagen
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => setImagenEditando(null)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-4">
                      {actividad.imagen_url ? (
                        <div className="relative h-16 w-28 overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
                          <Image
                            src={actividad.imagen_url}
                            alt=""
                            fill
                            unoptimized
                            sizes="112px"
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">
                          Imagen automática
                        </p>
                      )}

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() =>
                          setImagenEditando({
                            id: actividad.id,
                            url: actividad.imagen_url ?? "",
                          })
                        }
                      >
                        <ImageIcon className="h-4 w-4" />
                        Cambiar imagen
                      </Button>
                    </div>
                  )}
                </div>

                {(fuentesActividad[actividad.id] ?? []).length > 0 && (
                  <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
                    {(fuentesActividad[actividad.id] ?? []).map((fuente) => (
                      <FuenteRow
                        key={fuente.id}
                        titulo={fuente.titulo}
                        url={fuente.url}
                        onDelete={() =>
                          void deleteFuenteActividad(fuente.id)
                        }
                      />
                    ))}
                  </div>
                )}

                {actividadFuenteActiva === actividad.id ? (
                  <FuenteFormComponent
                    form={fuenteActividadForm}
                    setForm={setFuenteActividadForm}
                    onSubmit={(event) =>
                      void addFuenteActividad(event, actividad.id)
                    }
                    onCancel={() => {
                      setActividadFuenteActiva(null);
                      setFuenteActividadForm(INITIAL_FUENTE);
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setActividadFuenteActiva(actividad.id)}
                    className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-violet-700 hover:text-violet-900"
                  >
                    <Plus className="h-4 w-4" />
                    Agregar fuente
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

/* ============================================================
   SUBCOMPONENTES
============================================================ */

function ImagenActividadField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const error = validarImagenUrl(value);
  const mostrarPreview = value.trim() !== "" && !error;

  return (
    <div className="space-y-3">
      <Input
        type="text"
        placeholder="https://... o /ruta-local.jpg (vacío = imagen automática)"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />

      {error && <p className="text-xs text-red-600">{error}</p>}

      {mostrarPreview ? (
        <div className="relative h-32 w-full max-w-xs overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200">
          <Image
            src={value.trim()}
            alt="Vista previa de la imagen de la actividad"
            fill
            unoptimized
            sizes="320px"
            className="object-cover"
          />
        </div>
      ) : (
        !error && (
          <p className="text-xs text-slate-400">
            Se usará una imagen automática según el ministerio.
          </p>
        )
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-8 text-center">
      <FileText className="mx-auto h-7 w-7 text-slate-300" />

      <p className="mt-3 text-sm text-slate-500">{text}</p>
    </div>
  );
}

function FuenteRow({
  titulo,
  url,
  onDelete,
}: {
  titulo: string;
  url: string;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="min-w-0 flex-1 truncate text-sm font-medium text-blue-700 hover:underline"
      >
        {titulo}
      </a>

      <button
        type="button"
        onClick={onDelete}
        className="text-slate-400 transition hover:text-red-600"
        aria-label="Eliminar fuente"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

function FuenteFormComponent({
  form,
  setForm,
  onSubmit,
  onCancel,
}: {
  form: FuenteForm;
  setForm: React.Dispatch<React.SetStateAction<FuenteForm>>;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="mt-5 rounded-2xl border border-violet-100 bg-violet-50/50 p-4"
    >
      <p className="text-sm font-semibold text-slate-900">
        Nueva fuente
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Input
          placeholder="Título de la fuente *"
          value={form.titulo}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              titulo: event.target.value,
            }))
          }
        />

        <Input
          type="url"
          placeholder="https://... *"
          value={form.url}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              url: event.target.value,
            }))
          }
        />

        <select
          value={form.tipo}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              tipo: event.target.value,
            }))
          }
          className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
        >
          {TIPOS_FUENTE.map((tipo) => (
            <option key={tipo.value} value={tipo.value}>
              {tipo.label}
            </option>
          ))}
        </select>

        <Input
          type="date"
          value={form.fecha_fuente}
          onChange={(event) =>
            setForm((prev) => ({
              ...prev,
              fecha_fuente: event.target.value,
            }))
          }
        />
      </div>

      <div className="mt-4 flex gap-2">
        <Button type="submit" size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Guardar fuente
        </Button>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onCancel}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}

export default function AdminMinisterioDetailPage() {
  return (
    <Suspense fallback={<AdminMinisterioCargando />}>
      <AdminMinisterioDetailContenido />
    </Suspense>
  );
}

function AdminMinisterioCargando() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6">
      <div role="status" className="rounded-[28px] border border-[#e2e9f8] bg-[#f6f3fc] p-6 sm:p-8">
        <p className="text-sm font-medium text-[#7863bd]">Cargando la administración del ministerio…</p>
        <div aria-hidden="true" className="mt-5 space-y-4 motion-safe:animate-pulse">
          <div className="h-6 w-2/3 rounded bg-[#e7dff5]" />
          <div className="h-32 rounded-2xl bg-white/80" />
          <div className="h-32 rounded-2xl bg-white/80" />
        </div>
      </div>
    </main>
  );
}
