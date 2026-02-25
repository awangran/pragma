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
	id?: string;
	tema_id: string;
	titulo: string;
	que_pasa: string;
	que_propone: string;
	que_cambia: string;
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

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (isSubmitting || isUploading) return;

		let avatarUrl = form.avatar.trim();
		if (!avatarUrl) {
			const file = avatarInputRef.current?.files?.[0] ?? null;
			if (!file && !form.avatar) {
				setStatus({
					type: "error",
					message: "Debes seleccionar una foto válida.",
				});
				return;
			}

			if (file) {
				const publicUrl = await uploadAvatarFile(file);
				if (!publicUrl) {
					return;
				}
				avatarUrl = publicUrl;
			}
		}

		setIsSubmitting(true);
		setStatus({ type: "idle" });

		const supabase = createClient();

		// Update candidate
		const { error: updateError } = await supabase
			.from("candidatos")
			.update({
				nombre: form.nombre.trim(),
				cargo: form.cargo.trim(),
				partido: form.partido.trim(),
				ubicacion: form.ubicacion.trim(),
				descripcion: form.descripcion.trim(),
				links: form.links.trim(),
				tipo: form.tipo.trim(),
				avatar: avatarUrl,
			})
			.eq("id", candidateId);

		if (updateError) {
			setStatus({
				type: "error",
				message: updateError.message,
			});
			setIsSubmitting(false);
			return;
		}

		// Handle propuestas updates and inserts
		const propuestasLimpias = propuestas
			.map((propuesta) => ({
				...propuesta,
				tema_id: String(propuesta.tema_id).trim(),
				titulo: propuesta.titulo.trim(),
				que_pasa: propuesta.que_pasa.trim(),
				que_propone: propuesta.que_propone.trim(),
				que_cambia: propuesta.que_cambia.trim(),
			}))
			.filter(
				(item) =>
					item.tema_id &&
					item.titulo &&
					item.que_pasa &&
					item.que_propone &&
					item.que_cambia,
			);

		if (propuestasLimpias.length > 0) {
			// Separate new and existing propuestas
			const newPropuestas = propuestasLimpias.filter((p) => !p.id);
			const existingPropuestas = propuestasLimpias.filter((p) => p.id);

			// Insert new propuestas
			if (newPropuestas.length > 0) {
				const { error: insertError } = await supabase
					.from("propuestas")
					.insert(
						newPropuestas.map((propuesta) => ({
							candidato_id: candidateId,
							tema_id: propuesta.tema_id,
							titulo: propuesta.titulo,
							que_pasa: propuesta.que_pasa,
							que_propone: propuesta.que_propone,
							que_cambia: propuesta.que_cambia,
						})),
					);

				if (insertError) {
					setStatus({
						type: "error",
						message: insertError.message,
					});
					setIsSubmitting(false);
					return;
				}
			}

			// Update existing propuestas
			for (const propuesta of existingPropuestas) {
				const { error: updatePropError } = await supabase
					.from("propuestas")
					.update({
						tema_id: propuesta.tema_id,
						titulo: propuesta.titulo,
						que_pasa: propuesta.que_pasa,
						que_propone: propuesta.que_propone,
						que_cambia: propuesta.que_cambia,
					})
					.eq("id", propuesta.id);

				if (updatePropError) {
					setStatus({
						type: "error",
						message: updatePropError.message,
					});
					setIsSubmitting(false);
					return;
				}
			}
		}

		setStatus({ type: "success", message: "Candidato actualizado." });
		setIsSubmitting(false);
		setTimeout(() => router.push(`/candidatos/${candidateId}`), 1500);
	};

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
		const propuestaToRemove = propuestas[index];

		// If it's an existing propuesta with an ID, delete from DB
		if (propuestaToRemove.id) {
			const supabase = createClient();
			const { error } = await supabase
				.from("propuestas")
				.delete()
				.eq("id", propuestaToRemove.id);

			if (error) {
				setStatus({
					type: "error",
					message: "No se pudo eliminar la propuesta.",
				});
				return;
			}
		}

		setPropuestas((prev) =>
			prev.filter((_, itemIndex) => itemIndex !== index),
		);
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
					Actualiza la información del candidato. Todos los campos marcados son obligatorios.
				</p>
			</header>

                <form className="space-y-10" onSubmit={handleSubmit}>
                    {/* Candidate Information Section */}
                    <section className="space-y-5">
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
                                <Label htmlFor="descripcion" className="font-semibold">Descripción Detallada *</Label>
                                <textarea
                                    id="descripcion"
                                    name="descripcion"
                                    value={form.descripcion}
                                    onChange={handleChange}
                                    placeholder="Información sobre el candidato, su trayectoria, propuestas principales, logros relevantes..."
                                    className="min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                    required
                                />
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
                                <Label htmlFor="avatar" className="font-semibold text-base">Foto del Candidato</Label>
                                <p className="text-xs text-muted-foreground">Máximo 5MB. Formatos: JPG, PNG, WEBP</p>
                                <Input
                                    id="avatar"
                                    name="avatar"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarUpload}
                                    ref={avatarInputRef}
                                    disabled={isUploading}
                                    className="cursor-pointer"
                                />
                                {form.avatar && (
                                    <p className="text-xs text-emerald-600">Foto actual cargada</p>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Propuestas Section */}
                    <section className="space-y-5">
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
                                    className="gap-1"
                                >
                                    + Agregar
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {propuestas.map((propuesta, index) => (
                                    <details
                                        key={`propuesta-${index}`}
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

                                        <div className="mt-4 space-y-3">
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
                                                    required={index === 0}
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
                                                    required={index === 0}
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
                                                    required={index === 0}
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
                                                    required={index === 0}
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
                                                    required={index === 0}
                                                />
                                            </div>
                                        </div>
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

                    <div className="flex gap-3">
                        <Button type="submit" disabled={isSubmitting || isUploading}>
                            {isSubmitting ? "Guardando..." : "Guardar cambios"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push(`/candidatos/${candidateId}`)}
                        >
                            Cancelar
                        </Button>
                    </div>
                </form>
            </main>
	);
}
