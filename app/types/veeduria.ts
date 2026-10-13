// ============================================================
// VEEDURÍA — TIPOS Y UTILIDADES
// ============================================================

export type EstadoVeeduria =
    | "cumplida"
    | "en_proceso"
    | "no_cumplida"
    | "sin_informacion";


    // ============================================================
    // PROPUESTA
    //
    // Las propuestas son la fuente única de los compromisos
    // electorales. No existe una tabla separada de "promesas".
    // ============================================================

    export interface Propuesta {
    id: number;
    candidato_id: number | null;
    tema_id: number | null;

    titulo: string | null;
    que_pasa: string | null;
    que_propone: string | null;
    que_cambia: string | null;

    created_at: string;
    }


    // ============================================================
    // TEMA
    // ============================================================

    export interface Tema {
    id: number;
    titulo: string | null;
    tituloExtendido: string | null;
    }


    // ============================================================
    // CANDIDATO
    // ============================================================

    export interface CandidatoBasico {
    id: number;
    nombre: string | null;
    partido?: string | null;
    avatar?: string | null;
    }


    // ============================================================
    // FUENTE
    // ============================================================

    export interface Fuente {
    id: number;
    seguimiento_id: number;

    titulo: string;
    url: string | null;
    tipo: string | null;
    fecha_fuente: string | null;

    created_at: string | null;
    }


    // ============================================================
    // SEGUIMIENTO
    // ============================================================

    export interface Seguimiento {
    id: number;
    propuesta_id: number;

    estado: EstadoVeeduria;
    porcentaje: number | null;

    que_cambio: string | null;
    evidencia: string;

    fecha_evidencia: string | null;

    created_at: string | null;
    updated_at: string | null;
    }


    // ============================================================
    // PROPUESTA CON RELACIONES
    // ============================================================

    export interface PropuestaConRelaciones extends Propuesta {
    tema?: Tema | null;
    candidato?: CandidatoBasico | null;
    }


    // ============================================================
    // SEGUIMIENTO CON FUENTES
    // ============================================================

    export interface SeguimientoConFuentes extends Seguimiento {
    fuentes: Fuente[];
    }


    // ============================================================
    // PROPUESTA CON SU ÚLTIMO SEGUIMIENTO
    // ============================================================

    export interface PropuestaConSeguimiento extends PropuestaConRelaciones {
    ultimo_seguimiento: Seguimiento | null;
    }


    // ============================================================
    // DETALLE COMPLETO DE UNA PROPUESTA
    // ============================================================

    export interface PropuestaDetalle extends PropuestaConRelaciones {
    seguimientos: SeguimientoConFuentes[];
    }


    // ============================================================
    // FORMULARIO DE SEGUIMIENTO
    // ============================================================

    export interface FormSeguimiento {
    propuesta_id: number;

    estado: EstadoVeeduria;

    porcentaje: number | null;

    que_cambio: string;

    evidencia: string;

    fecha_evidencia: string;
    }


    // ============================================================
    // FORMULARIO DE FUENTE
    // ============================================================

    export interface FormFuente {
    titulo: string;
    url: string;
    tipo: string;
    fecha_fuente: string;
    }


    // ============================================================
    // ESTADÍSTICAS
    // ============================================================

    export interface EstadisticasVeeduria {
    total: number;
    cumplidas: number;
    en_proceso: number;
    no_cumplidas: number;
    sin_informacion: number;
    }


    // ============================================================
    // CONFIGURACIÓN DE ESTADOS
    // ============================================================

    export const ESTADO_CONFIG: Record<
    EstadoVeeduria,
    {
        label: string;
        descripcion: string;
    }
    > = {
    cumplida: {
        label: "Cumplida",
        descripcion:
        "La evidencia disponible permite documentar que el compromiso fue ejecutado.",
    },

    en_proceso: {
        label: "En proceso",
        descripcion:
        "Existen acciones documentadas relacionadas con el cumplimiento del compromiso.",
    },

    no_cumplida: {
        label: "No cumplida",
        descripcion:
        "La evidencia disponible permite documentar que el compromiso no fue cumplido.",
    },

    sin_informacion: {
        label: "Sin información suficiente",
        descripcion:
        "No existe evidencia suficiente para determinar el estado del compromiso.",
    },
    };


    // ============================================================
    // HELPERS
    // ============================================================

    export function getEstadoLabel(
    estado: EstadoVeeduria
    ): string {
    return ESTADO_CONFIG[estado]?.label ?? "Sin información suficiente";
    }


    export function getEstadoDescripcion(
    estado: EstadoVeeduria
    ): string {
    return (
        ESTADO_CONFIG[estado]?.descripcion ??
        ESTADO_CONFIG.sin_informacion.descripcion
    );
    }


    export function normalizarEstado(
    estado?: string | null
    ): EstadoVeeduria {
    if (
        estado === "cumplida" ||
        estado === "en_proceso" ||
        estado === "no_cumplida" ||
        estado === "sin_informacion"
    ) {
        return estado;
    }

    return "sin_informacion";
    }


    export function obtenerUltimoSeguimiento(
    seguimientos: Seguimiento[]
    ): Seguimiento | null {
    if (!seguimientos.length) {
        return null;
    }

    return [...seguimientos].sort((a, b) => {
        const fechaA = new Date(
        a.fecha_evidencia ?? a.created_at ?? 0
        ).getTime();

        const fechaB = new Date(
        b.fecha_evidencia ?? b.created_at ?? 0
        ).getTime();

        return fechaB - fechaA;
    })[0];
}