"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
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

export default function AdminAddPage() {
	const [form, setForm] = useState<FormState>(initialState);
	const [experiencias, setExperiencias] = useState<string[]>([""]);
	const [temas, setTemas] = useState<Tema[]>([]);
	const [propuestas, setPropuestas] = useState<PropuestaState[]>([
		{
			tema_id: "",
			titulo: "",
			que_pasa: "",
			que_propone: "",
			que_cambia: "",
		},
	]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [isCheckingRole, setIsCheckingRole] = useState(true);
	const [isAdmin, setIsAdmin] = useState(false);
	const [status, setStatus] = useState<
		| { type: "idle" }
		| { type: "success"; message: string }
		| { type: "error"; message: string }
	>({ type: "idle" });

	const avatarInputRef = useRef<HTMLInputElement>(null);

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

	useEffect(() => {
		const loadTemas = async () => {
			const supabase = createClient();
			const { data, error } = await supabase
				.from("tema")
				.select("id,titulo")
				.order("titulo", { ascending: true });

			if (error) {
				setStatus({ type: "error", message: error.message });
				return;
			}

			setTemas((data ?? []) as Tema[]);
		};

		void loadTemas();
	}, []);

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

		const lastSubmitAt = Number(
			localStorage.getItem("lastCandidateSubmitAt") ?? 0,
		);
		const now = Date.now();
		if (now - lastSubmitAt < 30_000) {
			setStatus({
				type: "error",
				message: "Espera 30 segundos antes de guardar otro candidato.",
			});
			return;
		}


		// Ensure we have an avatar URL ready for insert
		let avatarUrl = form.avatar.trim();
		if (!avatarUrl) {
			const file = avatarInputRef.current?.files?.[0] ?? null;
			if (!file) {
				setStatus({
					type: "error",
					message: "Debes seleccionar y subir una foto válida.",
				});
				return;
			}

			const publicUrl = await uploadAvatarFile(file);
			if (!publicUrl) {
				// uploadAvatarFile already set status with error
				return;
			}

			avatarUrl = publicUrl;
			setForm((prev) => ({ ...prev, avatar: publicUrl }));
		}
		setIsSubmitting(true);
		setStatus({ type: "idle" });

		const supabase = createClient();
		const nombreLimpio = form.nombre.trim();
		const { data: candidatoExistente, error: existeError } = await supabase
			.from("candidatos")
			.select("id")
			.eq("nombre", nombreLimpio)
			.maybeSingle();

		if (existeError) {
			setStatus({ type: "error", message: existeError.message });
			setIsSubmitting(false);
			return;
		}

		if (candidatoExistente?.id) {
			setStatus({
				type: "error",
				message: "Ya existe un candidato con ese nombre.",
			});
			setIsSubmitting(false);
			return;
		}

		const { data, error } = await supabase
			.from("candidatos")
			.insert([
				{
					nombre: nombreLimpio,
					cargo: form.cargo.trim(),
					partido: form.partido.trim(),
					ubicacion: form.ubicacion.trim(),
					descripcion: form.descripcion.trim(),
					links: form.links.trim(),
					tipo: form.tipo.trim(),
					avatar: avatarUrl,
				},
			])
			.select("id")
			.single();

		if (error || !data?.id) {
			setStatus({
				type: "error",
				message: error?.message ?? "No se pudo crear el candidato.",
			});
			setIsSubmitting(false);
			return;
		}

		const experienciasLimpias = experiencias
			.map((item) => item.trim())
			.filter(Boolean);

		if (experienciasLimpias.length > 0) {
			const { error: experienciasError } = await supabase
				.from("experiencia")
				.insert(
					experienciasLimpias.map((historial) => ({
						historial,
						candidato_id: data.id,
					})),
				);

			if (experienciasError) {
				setStatus({
					type: "error",
					message: experienciasError.message,
				});
				setIsSubmitting(false);
				return;
			}
		}

		const propuestasLimpias = propuestas
			.map((propuesta) => ({
				...propuesta,
				tema_id: propuesta.tema_id.trim(),
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
			const { error: propuestasError } = await supabase
				.from("propuestas")
				.insert(
					propuestasLimpias.map((propuesta) => ({
						candidato_id: data.id,
						tema_id: propuesta.tema_id,
						titulo: propuesta.titulo,
						que_pasa: propuesta.que_pasa,
						que_propone: propuesta.que_propone,
						que_cambia: propuesta.que_cambia,
					})),
				);

			if (propuestasError) {
				setStatus({
					type: "error",
					message: propuestasError.message,
				});
				setIsSubmitting(false);
				return;
			}
		}

		setStatus({ type: "success", message: "Candidato guardado." });
		localStorage.setItem("lastCandidateSubmitAt", String(Date.now()));
		setForm(initialState);
		setExperiencias([""]);
		setPropuestas([
			{
				tema_id: "",
				titulo: "",
				que_pasa: "",
				que_propone: "",
				que_cambia: "",
			},
		]);
		setIsSubmitting(false);
	};

	const handleExperienciaChange = (index: number, value: string) => {
		setExperiencias((prev) =>
			prev.map((item, itemIndex) =>
				itemIndex === index ? value : item,
			),
		);
	};

	const handleAddExperiencia = () => {
		setExperiencias((prev) => [...prev, ""]);
	};

	const handleRemoveExperiencia = (index: number) => {
		setExperiencias((prev) =>
			prev.filter((_, itemIndex) => itemIndex !== index),
		);
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

	const handleRemovePropuesta = (index: number) => {
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

	return (
		<main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-10">
			<header className="space-y-2">
				<h1 className="text-2xl font-semibold">Agregar candidato</h1>
				<p className="text-sm text-muted-foreground">
					Completa la información requerida y guarda el candidato.
				</p>
			</header>

			<form className="space-y-5" onSubmit={handleSubmit}>
				<div className="space-y-2">
					<Label htmlFor="nombre">Nombre</Label>
					<Input
						id="nombre"
						name="nombre"
						value={form.nombre}
						onChange={handleChange}
						placeholder="Nombre completo"
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="cargo">Cargo</Label>
					<Input
						id="cargo"
						name="cargo"
						value={form.cargo}
						onChange={handleChange}
						placeholder="Cargo"
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="partido">Partido</Label>
					<Input
						id="partido"
						name="partido"
						value={form.partido}
						onChange={handleChange}
						placeholder="Partido"
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="ubicacion">Ubicación</Label>
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

				<div className="space-y-2">
					<Label htmlFor="descripcion">Descripción</Label>
					<textarea
						id="descripcion"
						name="descripcion"
						value={form.descripcion}
						onChange={handleChange}
						placeholder="Descripción"
						className="min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="links">Links</Label>
					<Input
						id="links"
						name="links"
						value={form.links}
						onChange={handleChange}
						placeholder="Separados por comas!"
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="tipo">Tipo</Label>
					<Input
						id="tipo"
						name="tipo"
						value={form.tipo}
						onChange={handleChange}
						placeholder="Tipo"
						required
					/>
				</div>

				<div className="space-y-2">
					<Label htmlFor="avatar">Foto</Label>
					<Input
						id="avatar"
						name="avatar"
						type="file"
						accept="image/*"
						onChange={handleAvatarUpload}
						ref={avatarInputRef}
						required
						disabled={isUploading}
					/>
					{form.avatar && (
						<p className="text-xs text-muted-foreground">
							URL guardada: {form.avatar}
						</p>
					)}
					{isUploading && (
						<p className="text-xs text-muted-foreground">
							Subiendo imagen...
						</p>
					)}
				</div>

				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<Label>Experiencias</Label>
						<Button
							type="button"
							variant="outline"
							onClick={handleAddExperiencia}
						>
							Agregar experiencia
						</Button>
					</div>

					<div className="space-y-3">
						{experiencias.map((experiencia, index) => (
							<div key={`experiencia-${index}`} className="space-y-2">
								<Label htmlFor={`experiencia-${index}`}>
									Experiencia {index + 1}
								</Label>
								<textarea
									id={`experiencia-${index}`}
									value={experiencia}
									onChange={(event) =>
										handleExperienciaChange(index, event.target.value)
									}
									placeholder="Describe la experiencia"
									className="min-h-[90px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
									required={index === 0}
								/>
								{experiencias.length > 1 && (
									<Button
										type="button"
										variant="ghost"
										onClick={() => handleRemoveExperiencia(index)}
									>
										Quitar
									</Button>
								)}
							</div>
						))}
					</div>
				</div>

				<div className="space-y-3">
					<div className="flex items-center justify-between">
						<Label>Propuestas</Label>
						<Button
							type="button"
							variant="outline"
							onClick={handleAddPropuesta}
						>
							Agregar propuesta
						</Button>
					</div>

					<div className="space-y-4">
						{propuestas.map((propuesta, index) => (
							<div key={`propuesta-${index}`} className="space-y-3">
								<div className="space-y-2">
									<Label htmlFor={`propuesta-tema-${index}`}>
										Tema
									</Label>
									<select
										id={`propuesta-tema-${index}`}
										value={propuesta.tema_id}
										onChange={(event) =>
											handlePropuestaChange(
												index,
												"tema_id",
												event.target.value,
											)
										}
										className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
										required={index === 0}
									>
										<option value="">Selecciona un tema</option>
										{temas.map((tema) => (
											<option key={tema.id} value={String(tema.id)}>
												{tema.titulo}
											</option>
										))}
									</select>
								</div>

								<div className="space-y-2">
									<Label htmlFor={`propuesta-titulo-${index}`}>
										Título
									</Label>
									<Input
										id={`propuesta-titulo-${index}`}
										value={propuesta.titulo}
										onChange={(event) =>
											handlePropuestaChange(
												index,
												"titulo",
												event.target.value,
											)
										}
										placeholder="Título de la propuesta"
										required={index === 0}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor={`propuesta-que_pasa-${index}`}>
										Qué pasa
									</Label>
									<textarea
										id={`propuesta-que_pasa-${index}`}
										value={propuesta.que_pasa}
										onChange={(event) =>
											handlePropuestaChange(
												index,
												"que_pasa",
												event.target.value,
											)
										}
										placeholder="Qué pasa"
										className="min-h-[90px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
										required={index === 0}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor={`propuesta-que_propone-${index}`}>
										Qué propone
									</Label>
									<textarea
										id={`propuesta-que_propone-${index}`}
										value={propuesta.que_propone}
										onChange={(event) =>
											handlePropuestaChange(
												index,
												"que_propone",
												event.target.value,
											)
										}
										placeholder="Qué propone"
										className="min-h-[90px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
										required={index === 0}
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor={`propuesta-que_cambia-${index}`}>
										Qué cambia
									</Label>
									<textarea
										id={`propuesta-que_cambia-${index}`}
										value={propuesta.que_cambia}
										onChange={(event) =>
											handlePropuestaChange(
												index,
												"que_cambia",
												event.target.value,
											)
										}
										placeholder="Qué cambia"
										className="min-h-[90px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
										required={index === 0}
									/>
								</div>

								{propuestas.length > 1 && (
									<Button
										type="button"
										variant="ghost"
										onClick={() => handleRemovePropuesta(index)}
									>
										Quitar
									</Button>
								)}
							</div>
						))}
					</div>
				</div>

				{status.type === "error" && (
					<p className="text-sm text-destructive">{status.message}</p>
				)}
				{status.type === "success" && (
					<p className="text-sm text-emerald-600">{status.message}</p>
				)}

				<Button type="submit" disabled={isSubmitting || isUploading}>
					{isSubmitting ? "Guardando..." : "Guardar candidato"}
				</Button>
			</form>
		</main>
	);
}
