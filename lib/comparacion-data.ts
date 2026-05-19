export type Position = "Sí" | "No" | "No sé";

export type CandidateMeta = {
  id: number;
  name: string;
};

export type Topic = {
  id: number;
  question: string;
  category: string;
  positions: Record<string, Position>;
};

export const CANDIDATES: CandidateMeta[] = [
  { id: 6,  name: "Roy Leonardo Barreras Montealegre" },
  { id: 8,  name: "Sergio Fajardo Valderrama" },
  { id: 9,  name: "Mauricio Lizcano Arango" },
  { id: 10, name: "Claudia López Hernández" },
  { id: 13, name: "Paloma Valencia Laserna" },
  { id: 14, name: "Abelardo Gabriel de la Espriella" },
  { id: 15, name: "Iván Cepeda Castro" },
  { id: 17, name: "Santiago Botero Jaramillo" },
  { id: 18, name: "Luis Gilberto Murillo" },
  { id: 19, name: "Carlos Eduardo Caicedo" },
];

export const CATEGORIES: string[] = [
  "Medio Ambiente",
  "Economía",
  "Seguridad y Política Exterior",
  "Derechos Sociales",
  "Institucional",
];

export const TOPICS: Topic[] = [
  {
    id: 1,
    question: "¿Permitirá el uso del fracking?",
    category: "Medio Ambiente",
    positions: { "6": "No sé", "8": "Sí", "9": "No sé", "10": "Sí", "13": "Sí", "14": "Sí", "15": "No", "17": "Sí", "18": "No", "19": "No" },
  },
  {
    id: 2,
    question: "¿Aumentará impuestos a exportaciones mineras?",
    category: "Medio Ambiente",
    positions: { "6": "No sé", "8": "No sé", "9": "No sé", "10": "No sé", "13": "No", "14": "No", "15": "Sí", "17": "No", "18": "No sé", "19": "Sí" },
  },
  {
    id: 3,
    question: "¿Apoya cierre progresivo de nuevas exploraciones de petróleo y gas?",
    category: "Medio Ambiente",
    positions: { "6": "Sí", "8": "No", "9": "No sé", "10": "No", "13": "No", "14": "No", "15": "Sí", "17": "No", "18": "Sí", "19": "Sí" },
  },
  {
    id: 4,
    question: "¿Apoya incentivos para energías renovables sobre hidrocarburos?",
    category: "Medio Ambiente",
    positions: { "6": "Sí", "8": "Sí", "9": "Sí", "10": "Sí", "13": "No sé", "14": "No sé", "15": "Sí", "17": "Sí", "18": "Sí", "19": "Sí" },
  },
  {
    id: 5,
    question: "¿Está de acuerdo con reducir el IVA?",
    category: "Economía",
    positions: { "6": "No sé", "8": "No sé", "9": "No sé", "10": "Sí", "13": "Sí", "14": "Sí", "15": "No", "17": "Sí", "18": "No sé", "19": "No" },
  },
  {
    id: 6,
    question: "¿Eliminaría completamente el 4x1000?",
    category: "Economía",
    positions: { "6": "No sé", "8": "No sé", "9": "No sé", "10": "Sí", "13": "Sí", "14": "No sé", "15": "No", "17": "No", "18": "No sé", "19": "No sé" },
  },
  {
    id: 7,
    question: "¿Aumentará impuestos a grandes empresas?",
    category: "Economía",
    positions: { "6": "Sí", "8": "No sé", "9": "No sé", "10": "No", "13": "No", "14": "No", "15": "Sí", "17": "Sí", "18": "No sé", "19": "Sí" },
  },
  {
    id: 8,
    question: "¿Eliminaría impuesto al patrimonio para todos?",
    category: "Economía",
    positions: { "6": "No sé", "8": "No sé", "9": "No sé", "10": "Sí", "13": "Sí", "14": "Sí", "15": "Sí", "17": "No sé", "18": "No sé", "19": "No" },
  },
  {
    id: 9,
    question: "¿Negociará con el ELN?",
    category: "Seguridad y Política Exterior",
    positions: { "6": "Sí", "8": "No sé", "9": "No", "10": "No", "13": "No", "14": "No", "15": "Sí", "17": "No", "18": "Sí", "19": "Sí" },
  },
  {
    id: 10,
    question: "¿Restablecerá relaciones plenas con Venezuela?",
    category: "Seguridad y Política Exterior",
    positions: { "6": "Sí", "8": "Sí", "9": "No sé", "10": "Sí", "13": "No sé", "14": "No sé", "15": "Sí", "17": "No sé", "18": "Sí", "19": "Sí" },
  },
  {
    id: 11,
    question: "¿Alianzas estratégicas con EE. UU.?",
    category: "Seguridad y Política Exterior",
    positions: { "6": "Sí", "8": "Sí", "9": "Sí", "10": "Sí", "13": "Sí", "14": "Sí", "15": "Sí", "17": "Sí", "18": "Sí", "19": "Sí" },
  },
  {
    id: 12,
    question: "¿Alianzas estratégicas con Israel?",
    category: "Seguridad y Política Exterior",
    positions: { "6": "No sé", "8": "No sé", "9": "No sé", "10": "No", "13": "Sí", "14": "Sí", "15": "No", "17": "Sí", "18": "No sé", "19": "No sé" },
  },
  {
    id: 13,
    question: "¿Legalizar marihuana recreativa?",
    category: "Derechos Sociales",
    positions: { "6": "Sí", "8": "No sé", "9": "No sé", "10": "No", "13": "No", "14": "No", "15": "Sí", "17": "No sé", "18": "Sí", "19": "Sí" },
  },
  {
    id: 14,
    question: "¿Aborto libre hasta semana 24?",
    category: "Derechos Sociales",
    positions: { "6": "Sí", "8": "Sí", "9": "No sé", "10": "Sí", "13": "No", "14": "No", "15": "Sí", "17": "No sé", "18": "Sí", "19": "Sí" },
  },
  {
    id: 15,
    question: "¿Aumentará edad de pensión?",
    category: "Economía",
    positions: { "6": "No", "8": "No sé", "9": "No sé", "10": "No", "13": "No sé", "14": "No sé", "15": "No", "17": "No sé", "18": "No sé", "19": "No" },
  },
  {
    id: 16,
    question: "¿Expandirá beneficios pensionales a informales?",
    category: "Economía",
    positions: { "6": "Sí", "8": "Sí", "9": "No sé", "10": "Sí", "13": "No sé", "14": "No sé", "15": "Sí", "17": "No sé", "18": "Sí", "19": "Sí" },
  },
  {
    id: 17,
    question: "¿Apoya reelección presidencial?",
    category: "Institucional",
    positions: { "6": "No", "8": "No", "9": "No", "10": "No", "13": "No", "14": "No", "15": "No", "17": "No sé", "18": "No", "19": "No" },
  },
  {
    id: 18,
    question: "¿Reducirá tamaño del Congreso?",
    category: "Institucional",
    positions: { "6": "No sé", "8": "No sé", "9": "No sé", "10": "No", "13": "No sé", "14": "No sé", "15": "No", "17": "No sé", "18": "No sé", "19": "Sí" },
  },
  {
    id: 19,
    question: "¿Propone Asamblea Constituyente?",
    category: "Institucional",
    positions: { "6": "Sí", "8": "No", "9": "No", "10": "No", "13": "No", "14": "No", "15": "Sí", "17": "No sé", "18": "No", "19": "Sí" },
  },
  {
    id: 20,
    question: "¿Apoya prohibición de corridas de toros?",
    category: "Derechos Sociales",
    positions: { "6": "Sí", "8": "Sí", "9": "No sé", "10": "Sí", "13": "No sé", "14": "No sé", "15": "Sí", "17": "No sé", "18": "Sí", "19": "Sí" },
  },
];
