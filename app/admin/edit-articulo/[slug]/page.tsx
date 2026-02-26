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
	categoria: string;
	cuerpo: string;
	fuentes: string;
	foto: string;
};

const CATEGORIAS = [
	"Elecciones Presidenciales",
	"Elecciones",
	"Guías",
	"Artículos",
	"Candidatos",
];

const initialState: FormState = {
	titulo: "",
	resumen: "",
	categoria: "",
	cuerpo: "",
	fuentes: "",
	foto: "",
};

export default function AdminEditArticuloPage() {
	const params = useParams();
	const router = useRouter();
	const slug = params?.slug as string;
	const articleId = parseInt(slug, 10);

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

	// Load article data
	useEffect(() => {
		const loadData = async () => {
			if (!isAdmin || !articleId) return;

			const supabase = createClient();

			// Fetch article
			const { data: articleData, error: articleError } = await supabase
				.from("articulos")
				.select()
				.eq("id", articleId)
				.single();

			if (articleError || !articleData) {
				setStatus({
					type: "error",
					message: "No se pudo cargar el artículo.",
				});
				setIsLoading(false);
				return;
			}

			setForm({
				titulo: articleData.titulo || "",
				resumen: articleData.resumen || "",
				categoria: articleData.categoria || "",
				cuerpo: articleData.cuerpo || "",
				fuentes: articleData.fuentes || "",
				foto: articleData.foto || "",
			});

			setIsLoading(false);
		};

		void loadData();
	}, [isAdmin, articleId]);

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

		let fotoUrl = form.foto.trim();
		if (!fotoUrl) {
			const file = fotoInputRef.current?.files?.[0] ?? null;
			if (!file && !form.foto) {
				setStatus({
					type: "error",
					message: "Debes seleccionar una foto válida.",
				});
				return;
			}

			if (file) {
				const publicUrl = await uploadFotoFile(file);
				if (!publicUrl) {
					return;
				}
				fotoUrl = publicUrl;
			}
		}

		setIsSubmitting(true);
		setStatus({ type: "idle" });

		const supabase = createClient();

		// Update article
		const { error: updateError } = await supabase
			.from("articulos")
			.update({
				titulo: form.titulo.trim(),
				resumen: form.resumen.trim(),
				categoria: form.categoria.trim(),
				cuerpo: form.cuerpo.trim(),
				fuentes: form.fuentes.trim(),
				foto: fotoUrl,
			})
			.eq("id", articleId);

		if (updateError) {
			setStatus({
				type: "error",
				message: updateError.message,
			});
			setIsSubmitting(false);
			return;
		}

		setStatus({ type: "success", message: "Artículo actualizado." });
		setIsSubmitting(false);
		setTimeout(() => router.push(`/articulos/${articleId}`), 1500);
	};

	const handleFotoUpload = async (
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

		const publicUrl = await uploadFotoFile(file);
		if (publicUrl) {
			setForm((prev) => ({ ...prev, foto: publicUrl }));
		}
	};

	async function uploadFotoFile(file: File): Promise<string | null> {
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
		const filePath = `articulos/${Date.now()}-${safeName}`;

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
					Cargando datos del artículo...
				</p>
			</main>
		);
	}

	return (
		<main className="mx-auto w-full max-w-4xl px-4 py-10">
			<header className="mb-10 space-y-3">
				<h1 className="text-4xl font-bold text-foreground">Editar artículo</h1>
				<p className="text-base text-muted-foreground max-w-2xl">
					Actualiza la información del artículo. Todos los campos marcados son obligatorios.
				</p>
			</header>

			<form className="space-y-10" onSubmit={handleSubmit}>
				{/* Article Information Section */}
				<section className="space-y-5">
					<div>
						<h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
							<span className="w-1 h-6 bg-primary rounded"></span>
							Información del artículo
						</h2>
					</div>
					<div className="grid grid-cols-1 gap-5 md:grid-cols-2">
						<div className="space-y-2 md:col-span-2">
							<Label htmlFor="titulo" className="font-semibold">Título *</Label>
							<Input
								id="titulo"
								name="titulo"
								value={form.titulo}
								onChange={handleChange}
								placeholder="Título del artículo"
								required
							/>
						</div>

						<div className="space-y-2 md:col-span-2">
							<Label htmlFor="resumen" className="font-semibold">Resumen *</Label>
							<textarea
								id="resumen"
								name="resumen"
								value={form.resumen}
								onChange={handleChange}
								placeholder="Breve descripción o resumen del artículo (aparecerá en la tarjeta de preview)"
								className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
								required
							/>
						</div>

						<div className="space-y-2 md:col-span-2">
							<Label htmlFor="categoria" className="font-semibold">Categoría *</Label>
							<select
								id="categoria"
								name="categoria"
								required
								value={form.categoria}
								onChange={handleChange}
								className="flex h-10 w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-foreground placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
							>
								<option value="">Selecciona una categoría</option>
								{CATEGORIAS.map((cat) => (
									<option key={cat} value={cat}>
										{cat}
									</option>
								))}
							</select>
						</div>

						<div className="space-y-2 md:col-span-2">
							<Label htmlFor="cuerpo" className="font-semibold">Contenido del artículo *</Label>
							<p className="text-xs text-muted-foreground mb-1">
								Separa los párrafos con líneas en blanco para mejor legibilidad.
							</p>
							<textarea
								id="cuerpo"
								name="cuerpo"
								value={form.cuerpo}
								onChange={handleChange}
								placeholder="Escribe el contenido completo del artículo aquí..."
								className="min-h-[300px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
								required
							/>
						</div>

						<div className="space-y-2 md:col-span-2">
							<Label htmlFor="fuentes" className="font-semibold">Fuentes y referencias</Label>
							<p className="text-xs text-muted-foreground mb-1">
								Separa las fuentes con comas.
							</p>
							<textarea
								id="fuentes"
								name="fuentes"
								value={form.fuentes}
								onChange={handleChange}
								placeholder="https://ejemplo.com/fuente1, https://ejemplo.com/fuente2, Libro: Título del libro"
								className="min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
							/>
						</div>

						{/* Photo Section */}
						<div className="space-y-3 md:col-span-2 rounded-lg border border-dashed border-primary/20 bg-primary/5 p-4">
							<Label htmlFor="foto" className="font-semibold text-base">Imagen destacada</Label>
							<p className="text-sm text-muted-foreground">Máximo 5 MB. Formatos: JPG, PNG, WebP. Proporción recomendada: 16:9</p>
							<Input
								id="foto"
								name="foto"
								type="file"
								accept="image/*"
								onChange={handleFotoUpload}
								ref={fotoInputRef}
								disabled={isUploading}
								className="cursor-pointer"
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
						onClick={() => router.push(`/articulos/${articleId}`)}
					>
						Cancelar
					</Button>
				</div>
			</form>
		</main>
	);
}
