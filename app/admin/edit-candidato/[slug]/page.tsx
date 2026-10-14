"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type FormState = {
	nombre: string;
	cargo: string;
	partido: string;
	ubicacion: string;
	descripcion: string;
	links: string;
	tipo: string;
	avatar: string;
};

type Tema = {
	id: string | number;
	titulo: string;
};

type PropuestaState = {
	id?: string | number;
	tema_id: string;
	titulo: string;
	que_pasa: string;
	que_propone: string;
	que_cambia: string;
};

type ExperienciaState = {
	id?: string | number;
	historial: string;
};

const initialState: FormState = {
	nombre: "",
	cargo: "",
	partido: "",
	ubicacion: "",
	descripcion: "",
	links: "",
	tipo: "",
	avatar: "",
};

export default function AdminEditPage() {
	const params = useParams();
	const router = useRouter();
	const slug = params?.slug as string;
	const candidateId = parseInt(slug, 10);

	const [form, setForm] = useState<FormState>(initialState);
	const [temas, setTemas] = useState<Tema[]>([]);
	const [propuestas, setPropuestas] = useState<PropuestaState[]>([]);
	const [experiencias, setExperiencias] = useState<ExperienciaState[]>([]);
	const [trayectoria, setTrayectoria] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const savingRef = useRef(false);
	const [savingSection, setSavingSection] = useState<string | null>(null);
	const [sectionMessages, setSectionMessages] = useState<Record<string, { type: "success" | "error"; message: string }>>({});
	const [experienceReady, setExperienceReady] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [isCheckingRole, setIsCheckingRole] = useState(true);
	const [isLoading, setIsLoading] = useState(true);
	const [isAdmin, setIsAdmin] = useState(false);
	const [status, setStatus] = useState<
		| { type: "idle" }
		| { type: "success"; message: string }
		| { type: "error"; message: string }
	>({ type: "idle" });

	const avatarInputRef = useRef<HTMLInputElement>(null);

	// Check admin role
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
				setStatus({ type: "error", message: profileError.message });
				setIsAdmin(false);
				setIsCheckingRole(false);
				return;
			}

			setIsAdmin(profileData?.role === "admin");
			setIsCheckingRole(false);
		};

		void checkRole();
	}, []);

	// Load candidate data and temas
	useEffect(() => {
		const loadData = async () => {
			if (!isAdmin || !candidateId) return;

			const supabase = createClient();

			// Fetch candidate
			const { data: candidateData, error: candidateError } = await supabase
				.from("candidatos")
				.select()
				.eq("id", candidateId)
				.single();

			if (candidateError || !candidateData) {
				setStatus({
					type: "error",
					message: "No se pudo cargar el candidato.",
				});
				setIsLoading(false);
				return;
			}

			setForm({
				nombre: candidateData.nombre || "",
				cargo: candidateData.cargo || "",
				partido: candidateData.partido || "",
				ubicacion: candidateData.ubicacion || "",
				descripcion: candidateData.descripcion || "",
				links: candidateData.links || "",
				tipo: candidateData.tipo || "",
				avatar: candidateData.avatar || "",
			});

			// Fetch propuestas
			const { data: propuestasData, error: propuestasError } = await supabase
				.from("propuestas")
				.select()
				.eq("candidato_id", candidateId);

			if (!propuestasError && propuestasData) {
				setPropuestas(propuestasData as PropuestaState[]);
			}

			// Fetch experiencias
			const { data: experienciasData, error: experienciasError } = await supabase
				.from("experiencia")
				.select()
				.eq("candidato_id", candidateId).order("id", { ascending: true });

			if (!experienciasError && experienciasData) {
				setExperienceReady(true);
				setExperiencias(experienciasData as ExperienciaState[]);
				setTrayectoria((experienciasData as ExperienciaState[]).map(exp => exp.historial).join("\n"));
			}

			if (propuestasError || experienciasError) setStatus({ type: "error", message: propuestasError?.message ?? experienciasError?.message ?? "Error de carga" });
			// Fetch temas
			const { data: temasData, error: temasError } = await supabase
				.from("tema")
				.select("id,titulo")
				.order("titulo", { ascending: true });

			if (!temasError && temasData) {
				setTemas(temasData as Tema[]);
			}

			setIsLoading(false);
		};

		void loadData();
	}, [isAdmin, candidateId]);

	const handleChange = (
		event: ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		const { name, value } = event.target;
		setForm((prev) => ({ ...prev, [name]: value }));
	};

	const saveSection = async (key: string, action: () => Promise<void>) => {
        if (savingRef.current || isUploading || !isAdmin) return;
        savingRef.current = true;
        setIsSubmitting(true);
        setSavingSection(key);
        setSectionMessages(prev => { const next = { ...prev }; delete next[key]; return next; });
        try {
            await action();
            setSectionMessages(prev => ({ ...prev, [key]: { type: "success", message: "Cambios guardados." } }));
        } catch (error) {
            setSectionMessages(prev => ({ ...prev, [key]: { type: "error", message: error instanceof Error ? error.message : "No se pudo guardar." } }));
        } finally {
            savingRef.current = false;
            setIsSubmitting(false);
            setSavingSection(null);
        }
    };

    const saveBasic = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await saveSection("basic", async () => {
            if (["minister", "ministro", "ministra"].includes(form.tipo.trim().toLowerCase())) throw new Error("Registra y edita ministros desde Administración → Ministerios.");
            if (!form.nombre.trim() || !form.cargo.trim() || !form.partido.trim() || !form.ubicacion || !form.tipo.trim()) throw new Error("Completa los datos básicos obligatorios.");
            if (!form.avatar.trim()) throw new Error("Selecciona una foto o escribe su URL.");
            const payload = { nombre: form.nombre.trim(), cargo: form.cargo.trim(), partido: form.partido.trim(), ubicacion: form.ubicacion.trim(), links: form.links.trim(), tipo: form.tipo.trim(), avatar: form.avatar.trim() };
            const supabase = createClient();
            const { data, error } = await supabase.from("candidatos").update(payload).eq("id", candidateId).select("id").single();
            if (error || !data) throw new Error(error?.message ?? "No se pudo guardar el candidato.");
        });
    };

    const saveProfile = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await saveSection("profile", async () => {
            if (!candidateId || !experienceReady) throw new Error("Primero crea el candidato y espera a que cargue su experiencia.");
            const supabase = createClient();
            const { error: bioError } = await supabase.from("candidatos").update({ descripcion: form.descripcion.trim() }).eq("id", candidateId);
            if (bioError) throw new Error(bioError.message);
            const lines = trayectoria.split("\n").map(line => line.replace(/^\s*[-•]\s*/, "").trim()).filter(Boolean);
            // Track each successful insert immediately so a retry cannot duplicate it.
            const working = [...experiencias];
            for (let index = 0; index < lines.length; index++) {
                const existing = working[index];
                if (existing?.id != null) {
                    const { error } = await supabase.from("experiencia").update({ historial: lines[index] }).eq("id", existing.id).eq("candidato_id", candidateId);
                    if (error) throw new Error("La biografía se guardó; no se pudo completar la experiencia: " + error.message);
                    working[index] = { ...existing, historial: lines[index] };
                } else {
                    const { data, error } = await supabase.from("experiencia").insert({ candidato_id: candidateId, historial: lines[index] }).select("id,historial").single();
                    if (error || !data) throw new Error("La biografía se guardó; no se pudo completar la experiencia: " + (error?.message ?? "Sin respuesta"));
                    working[index] = data as ExperienciaState;
                }
                setExperiencias([...working]);
            }
            const removed = working.slice(lines.length).flatMap(item => item.id == null ? [] : [item.id]);
            if (removed.length) {
                const { error } = await supabase.from("experiencia").delete().eq("candidato_id", candidateId).in("id", removed);
                if (error) throw new Error("La biografía se guardó; no se pudieron quitar experiencias: " + error.message);
            }
            setExperiencias(working.slice(0, lines.length));
        });
    };

    const saveProposal = async (index: number, event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await saveSection(`proposal-${index}`, async () => {
            if (!candidateId) throw new Error("Primero crea el candidato.");
            const item = propuestas[index];
            const payload = { tema_id: String(item.tema_id).trim(), titulo: item.titulo.trim(), que_pasa: item.que_pasa.trim(), que_propone: item.que_propone.trim(), que_cambia: item.que_cambia.trim() };
            if (Object.values(payload).some(value => !value)) throw new Error("Completa los cinco campos de esta propuesta.");
            const supabase = createClient();
            if (item.id != null) {
                const { error } = await supabase.from("propuestas").update(payload).eq("id", item.id).eq("candidato_id", candidateId);
                if (error) throw new Error(error.message);
            } else {
                const { data, error } = await supabase.from("propuestas").insert({ ...payload, candidato_id: candidateId }).select("id").single();
                if (error || !data) throw new Error(error?.message ?? "No se pudo crear la propuesta.");
                setPropuestas(prev => prev.map((proposal, position) => position === index ? { ...proposal, id: data.id } : proposal));
            }
        });
    };

    const sectionFeedback = (key: string) => sectionMessages[key] ? (
        <p role="status" className={sectionMessages[key].type === "error" ? "text-sm text-red-600" : "text-sm text-emerald-600"}>{sectionMessages[key].message}</p>
    ) : null;

	const handlePropuestaChange = (
		index: number,
		field: keyof PropuestaState,
		value: string,
	) => {
		setPropuestas((prev) =>
			prev.map((item, itemIndex) =>
				itemIndex === index ? { ...item, [field]: value } : item,
			),
		);
	};

	const handleAddPropuesta = () => {
        setSectionMessages({});
		setPropuestas((prev) => [
			...prev,
			{
				tema_id: "",
				titulo: "",
				que_pasa: "",
				que_propone: "",
				que_cambia: "",
			},
		]);
	};

    const handleRemovePropuesta = async (index: number) => {
        if (propuestas[index].id != null && !window.confirm("¿Eliminar esta propuesta? Esta acción también la elimina de la base de datos.")) return;
        await saveSection(`delete-${index}`, async () => {
            const item = propuestas[index];
            if (item.id != null) {
                const { error } = await createClient().from("propuestas").delete().eq("id", item.id).eq("candidato_id", candidateId);
                if (error) throw new Error(error.message);
            }
            setPropuestas(prev => prev.filter((_, position) => position !== index));
            setSectionMessages({});
        });
    };

	const handleAvatarUpload = async (
		event: ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		const maxFileSize = 5 * 1024 * 1024;
		if (file.size > maxFileSize) {
			setStatus({
				type: "error",
				message: "La imagen supera 5MB. Usa un archivo más liviano.",
			});
			event.target.value = "";
			return;
		}

		setIsUploading(true);
		setStatus({ type: "idle" });

		const publicUrl = await uploadAvatarFile(file);
		if (publicUrl) {
			setForm((prev) => ({ ...prev, avatar: publicUrl }));
		}
	};

	async function uploadAvatarFile(file: File): Promise<string | null> {
		const maxFileSize = 5 * 1024 * 1024;
		if (file.size > maxFileSize) {
			setStatus({
				type: "error",
				message: "La imagen supera 5MB. Usa un archivo más liviano.",
			});
			return null;
		}

		setIsUploading(true);
		setStatus({ type: "idle" });

		const supabase = createClient();
		const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
		const filePath = `${Date.now()}-${safeName}`;

		const { error } = await supabase.storage
			.from("avatars")
			.upload(filePath, file, {
				cacheControl: "3600",
				upsert: false,
			});

		if (error) {
			setStatus({ type: "error", message: error.message });
			setIsUploading(false);
			return null;
		}

		const { data } = supabase.storage
			.from("avatars")
			.getPublicUrl(filePath);

		if (!data?.publicUrl) {
			setStatus({ type: "error", message: "No se pudo obtener la URL." });
			setIsUploading(false);
			return null;
		}

		setIsUploading(false);
		return data.publicUrl;
	}

	if (isCheckingRole) {
		return (
			<main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
				<p className="text-sm text-muted-foreground">
					Verificando permisos...
				</p>
			</main>
		);
	}

	if (!isAdmin) {
		return (
			<main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
				<h1 className="text-2xl font-semibold">Acceso restringido</h1>
				<p className="text-sm text-muted-foreground">
					Necesitas rol admin para ver esta página.
				</p>
			</main>
		);
	}

	if (isLoading) {
		return (
			<main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
				<p className="text-sm text-muted-foreground">
					Cargando datos del candidato...
				</p>
			</main>
		);
	}

	return (
		<main className="mx-auto w-full max-w-4xl px-4 py-10">
			<header className="mb-10 space-y-3">
				<h1 className="text-4xl font-bold text-foreground">Editar candidato</h1>
				<p className="text-base text-muted-foreground max-w-2xl">
					Guarda cada sección por separado. Puedes continuar editando aquí después de guardar.
				</p>
			</header>

                <div className="space-y-8">
                    <form onSubmit={saveBasic} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5"><fieldset disabled={isSubmitting || isUploading} className="space-y-5">
                    {/* Candidate Information Section */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
                        <div>
                            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                                <span className="w-1 h-6 bg-primary rounded"></span>
                                Información básica
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="nombre" className="font-semibold">Nombre *</Label>
                                <Input
                                    id="nombre"
                                    name="nombre"
                                    value={form.nombre}
                                    onChange={handleChange}
                                    placeholder="Nombre completo del candidato"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cargo" className="font-semibold">Cargo *</Label>
                                <Input
                                    id="cargo"
                                    name="cargo"
                                    value={form.cargo}
                                    onChange={handleChange}
                                    placeholder="P. ej. Alcalde, Concejal"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="partido" className="font-semibold">Partido *</Label>
                                <Input
                                    id="partido"
                                    name="partido"
                                    value={form.partido}
                                    onChange={handleChange}
                                    placeholder="Partido político"
                                    required
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="ubicacion" className="font-semibold">Departamento / Ubicación *</Label>
                                <select
                                    id="ubicacion"
                                    name="ubicacion"
                                    required
                                    value={form.ubicacion}
                                    onChange={handleChange}
                                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-foreground placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                >
                                    <option value="">Selecciona un departamento</option>
                                    <option value="Amazonas">Amazonas</option>
                                    <option value="Antioquia">Antioquia</option>
                                    <option value="Arauca">Arauca</option>
                                    <option value="Bolívar">Bolívar</option>
                                    <option value="Boyacá">Boyacá</option>
                                    <option value="Bogotá">Bogotá</option>
                                    <option value="Caldas">Caldas</option>
                                    <option value="Cauca">Cauca</option>
                                    <option value="Cesar">Cesar</option>
                                    <option value="Córdoba">Córdoba</option>
                                    <option value="Cundinamarca">Cundinamarca</option>
                                    <option value="Guaviare">Guaviare</option>
                                    <option value="Huila">Huila</option>
                                    <option value="La Guajira">La Guajira</option>
                                    <option value="Magdalena">Magdalena</option>
                                    <option value="Meta">Meta</option>
                                    <option value="Nariño">Nariño</option>
                                    <option value="Norte de Santander">Norte de Santander</option>
                                    <option value="Putumayo">Putumayo</option>
                                    <option value="Quindío">Quindío</option>
                                    <option value="Risaralda">Risaralda</option>
                                    <option value="Santander">Santander</option>
                                    <option value="Sucre">Sucre</option>
                                    <option value="Tolima">Tolima</option>
                                    <option value="Valle del Cauca">Valle del Cauca</option>
                                    <option value="Vaupés">Vaupés</option>
                                    <option value="Vichada">Vichada</option>
                                </select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="links" className="font-semibold">Enlaces / Redes Sociales *</Label>
                                <Input
                                    id="links"
                                    name="links"
                                    value={form.links}
                                    onChange={handleChange}
                                    placeholder="Separados por comas (ej: https://twitter.com/..., https://facebook.com/...)"
                                    required
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="tipo" className="font-semibold">Tipo de Candidato *</Label>
                                <Input
                                    id="tipo"
                                    name="tipo"
                                    value={form.tipo}
                                    onChange={handleChange}
                                    placeholder="Ej: Alcalde, Concejal, Gobernador"
                                    required
                                />
                            </div>

                            {/* Avatar Section */}
                            <div className="space-y-3 md:col-span-2 rounded-lg border border-dashed border-primary/20 bg-primary/5 p-4">
                                <Label htmlFor="avatar-url">URL de la foto</Label>
                                <Input id="avatar-url" name="avatar" type="url" value={form.avatar} onChange={handleChange} placeholder="https://..." />
                                <Label htmlFor="avatar" className="font-semibold text-base">Foto del Candidato</Label>
                                <p className="text-xs text-muted-foreground">Máximo 5MB. Formatos: JPG, PNG, WEBP</p>
                                <Input
                                    id="avatar"
                                    name="avatar"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    ref={avatarInputRef}
                                    disabled={isUploading || isSubmitting}
                                    className="cursor-pointer"
                                />
                                {form.avatar && (
                                    <p className="text-xs text-emerald-600">Foto actual cargada</p>
                                )}
                            </div>
                        </div>
                    </section>

<Button type="submit" disabled={isSubmitting || isUploading}>{savingSection === "basic" ? "Guardando…" : candidateId ? "Guardar datos y enlaces" : "Crear candidato"}</Button>
{sectionFeedback("basic")}
</fieldset></form>
<form onSubmit={saveProfile} className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
<fieldset disabled={!candidateId || isSubmitting || isUploading || !experienceReady} className="space-y-5">
<h2 className="text-xl font-semibold">Biografía y experiencia</h2>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="descripcion" className="font-semibold">Biografía</Label>
                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    value={form.descripcion}
                                    onChange={handleChange}
                                    placeholder="Información sobre el candidato, su trayectoria, propuestas principales, logros relevantes..."
                                    className="min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                />
                            </div>

<section className="space-y-3">
  <Label htmlFor="trayectoria" className="text-base font-semibold">Trayectoria</Label>
  <p id="trayectoria-ayuda" className="text-sm text-muted-foreground">Escribe una experiencia por línea. Incluye los años, el cargo y la institución.</p>
  <textarea
    id="trayectoria"
    value={trayectoria}
    onChange={(event) => setTrayectoria(event.target.value)}
    rows={8}
    aria-describedby="trayectoria-ayuda"
    placeholder={"- 2020–2022: Asesora en una entidad pública.\n- 2022–2025: Directora de un programa regional."}
    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-slate-400"  />
</section>
<Button type="submit">{savingSection === "profile" ? "Guardando…" : "Guardar biografía y experiencia"}</Button>
{sectionFeedback("profile")}
</fieldset></form>
                    {/* Propuestas Section */}
                    <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
                        <div>
                            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                                <span className="w-1 h-6 bg-primary rounded"></span>
                                Propuestas
                            </h2>
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-semibold">Propuestas políticas</Label>
                                    <p className="text-sm text-muted-foreground">Agregue propuestas políticas o plataformas</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleAddPropuesta}
                                    disabled={!candidateId || isSubmitting || isUploading}
                                    className="gap-1"
                                >
                                    + Agregar
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {propuestas.map((propuesta, index) => (
                                    <details
                                        key={propuesta.id != null ? `saved-${propuesta.id}` : `new-${index}`}
                                        className="rounded-lg border border-input bg-card p-4"
                                        open={index === 0}
                                    >
                                        <summary className="cursor-pointer list-none">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-medium">
                                                    Propuesta {index + 1}
                                                </h4>
                                                <span className="text-xs text-muted-foreground">Click para expandir/colapsar</span>
                                            </div>
                                        </summary>

                                        <form onSubmit={(event) => void saveProposal(index, event)} className="mt-4 space-y-3"><fieldset disabled={!candidateId || isSubmitting || isUploading} className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-muted-foreground">Detalles de la propuesta</p>
                                                {propuestas.length > 0 && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemovePropuesta(index)}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        ✕ Eliminar
                                                    </Button>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor={`propuesta-tema-${index}`} className="font-medium">
                                                    Tema *
                                                </Label>
                                                <select
                                                    id={`propuesta-tema-${index}`}
                                                    value={propuesta.tema_id}
                                                    onChange={(e) =>
                                                        handlePropuestaChange(index, "tema_id", e.target.value)
                                                    }
                                                    className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-foreground placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                                                    required
                                                >
                                                    <option value="">Selecciona un tema</option>
                                                    {temas.map((tema) => (
                                                        <option key={tema.id} value={tema.id}>
                                                            {tema.titulo}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor={`propuesta-titulo-${index}`} className="font-medium">
                                                    Título de la propuesta *
                                                </Label>
                                                <Input
                                                    id={`propuesta-titulo-${index}`}
                                                    value={propuesta.titulo}
                                                    onChange={(e) =>
                                                        handlePropuestaChange(index, "titulo", e.target.value)
                                                    }
                                                    placeholder="Título breve de la propuesta"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor={`propuesta-que_pasa-${index}`} className="font-medium">
                                                    ¿Qué pasa? *
                                                </Label>
                                                <textarea
                                                    id={`propuesta-que_pasa-${index}`}
                                                    value={propuesta.que_pasa}
                                                    onChange={(e) =>
                                                        handlePropuestaChange(index, "que_pasa", e.target.value)
                                                    }
                                                    placeholder="Describe el problema o situación actual..."
                                                    className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor={`propuesta-que_propone-${index}`} className="font-medium">
                                                    ¿Qué propone? *
                                                </Label>
                                                <textarea
                                                    id={`propuesta-que_propone-${index}`}
                                                    value={propuesta.que_propone}
                                                    onChange={(e) =>
                                                        handlePropuestaChange(index, "que_propone", e.target.value)
                                                    }
                                                    placeholder="Detalla tu propuesta o solución..."
                                                    className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor={`propuesta-que_cambia-${index}`} className="font-medium">
                                                    ¿Qué cambia? *
                                                </Label>
                                                <textarea
                                                    id={`propuesta-que_cambia-${index}`}
                                                    value={propuesta.que_cambia}
                                                    onChange={(e) =>
                                                        handlePropuestaChange(index, "que_cambia", e.target.value)
                                                    }
                                                    placeholder="Describe el resultado o cambio esperado..."
                                                    className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                    required
                                                />
                                            </div>
                                        <Button type="submit">{savingSection === `proposal-${index}` ? "Guardando…" : propuesta.id != null ? "Guardar propuesta" : "Agregar propuesta"}</Button>
                                        {sectionFeedback(`proposal-${index}`)}
                                        {sectionFeedback(`delete-${index}`)}
                                        </fieldset></form>
                                    </details>
                                ))}
                            </div>
                        </div>
                    </section>

                    {status.type === "error" && (
                        <p className="text-sm text-destructive">{status.message}</p>
                    )}
                    {status.type === "success" && (
                        <p className="text-sm text-emerald-600">{status.message}</p>
                    )}

                    {candidateId ? <Button type="button" variant="outline" onClick={() => router.push(`/candidatos/${candidateId}`)}>Ver perfil público</Button> : <p className="text-sm text-slate-500">Crea el candidato con sus datos básicos para habilitar biografía, experiencia y propuestas.</p>}
                </div>
            </main>
	);
}
