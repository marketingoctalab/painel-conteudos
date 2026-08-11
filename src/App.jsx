import React, { useState, useEffect, useRef, useMemo, useId } from "react";
import { supabase, supabaseReady } from "./supabase";
import { CONQUISTAS, CATEGORIAS, calcularConquistas } from "./conquistas.js";

// id único desta aba/sessão — usado para ignorar o próprio eco no realtime
const CLIENT_ID = Math.random().toString(36).slice(2);

/* ============================================================
   ESTÚDIO — painel de conteúdo, visual limpo e moderno
   Ref: pitch deck (branco + preto + acento amarelo, cantos suaves)
   ============================================================ */

// ---------- tokens ----------
const T = {
  bg: "#F2F2F0",        // fundo externo
  paper: "#FFFFFF",     // cartão/papel
  ink: "#111114",       // preto (texto)
  muted: "#7C7C85",
  line: "#E7E7E3",      // bordas suaves
  danger: "#E5484D",
  accent: "#E4FB55",    // amarelo de destaque
  accentInk: "#141608", // texto sobre o amarelo
  // mantidos com os mesmos nomes, agora no acento moderno
  holo: "linear-gradient(90deg,#E4FB55,#CFF24B)",
  holoSoft: "#FAFAF8",
};

const PRODUCTS = {
  octalab: { label: "Octalab", tag: "OC", color: "#8A6FE0" },
  ecosys: { label: "Ecosys AUTO", tag: "EC", color: "#4E8FD9" },
  juspilot: { label: "JusPilot", tag: "JP", color: "#3FA37A" },
  octagym: { label: "OctaGym", tag: "OG", color: "#D96757" },
  outro: { label: "Outro", tag: "—", color: "#9A9284" },
};

const NETWORKS = ["Instagram", "LinkedIn", "X", "YouTube", "WhatsApp"];

// ---------- trilha de desenvolvimento (mentoria) ----------
const APRENDIZ = "Clara";
const MENTORES = ["Firmino", "Admin"];
const TRILHA_PROFILES = [APRENDIZ, ...MENTORES];
const papelNaTrilha = (user) =>
  MENTORES.includes(user) ? "mentor" : user === APRENDIZ ? "aprendiz" : null;

// a competência é o que permite medir EM QUE ela evolui, não só quanto fez.
// A ordem é fixa: a cor de cada competência não muda com o tempo.
const COMPETENCIAS = {
  design: "Design",
  copy: "Copy",
  social: "Social",
  ferramentas: "Ferramentas",
  processo: "Processo",
};
const corCompetencia = (k) => {
  const i = Object.keys(COMPETENCIAS).indexOf(k);
  return i < 0 ? COR_NEUTRA_TEXTO : PALETA_TEXTO[i % PALETA_TEXTO.length];
};

const TRILHA_TIPO = { pratica: "Prática", estudo: "Estudo" };
const TRILHA_STATUS = {
  afazer: "A fazer",
  fazendo: "Fazendo",
  entregue: "Entregue",
  revisada: "Revisada",
};
// três níveis, de propósito: nota numérica sem critério vira ruído
const AVALIACAO = {
  refazer: { label: "Refazer", cor: "#C2453A" },
  ok: { label: "OK", cor: "#2C6B27" },
  acima: { label: "Acima do esperado", cor: "#1c5cab" },
};

const NOVA_MATERIA = () => ({
  id: uid(),
  ordem: 1,
  nome: "",
  criadoEm: Date.now(),
});

const NOVO_MODULO = () => ({
  id: uid(),
  materiaId: null,
  ordem: 1,
  titulo: "",
  objetivo: "",
  competencia: "design",
  recursos: [], // links de apoio: {id, titulo, url}
  // conteúdo do curso: {id, titulo, duracao, temas, visto}
  conteudo: [],
  criadoEm: Date.now(),
});

const NOVA_TAREFA = () => ({
  moduloId: null,
  id: uid(),
  titulo: "",
  descricao: "",
  tipo: "pratica",
  competencia: "design",
  prazo: "",
  status: "afazer",
  link: "",
  aprendizado: "",
  entregueEm: null,
  avaliacao: null,
  feedback: "",
  revisadaEm: null,
  revisoes: [], // append-only: {nivel, em}. É daqui que sai o retrabalho.
  criadaEm: Date.now(),
});

// ---------- planilha de orçamentos ----------
// quem fecha o pedido com a gráfica
const FECHA = {
  firmino: { label: "Firmino", short: "FIR" },
  superiores: { label: "Superiores", short: "SUP" },
  indefinido: { label: "A definir", short: "—" },
};
const ORC_STATUS = {
  cotando: { label: "Cotando", chip: "#8C8478" },
  aprovado: { label: "Aprovado", chip: "#3F6B4F" },
  fechado: { label: "Fechado", chip: "#1F5C8C" },
  recusado: { label: "Recusado", chip: "#C2453A" },
};
// prazo de produção: 1 a 7, em dias corridos (verde) ou dias úteis (vermelho)
const PRAZO_TIPO = {
  dias: { label: "dias", one: "dia" },
  uteis: { label: "dias úteis", one: "dia útil" },
};
const PRAZO_DIAS = [1, 2, 3, 4, 5, 6, 7];

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const money = (n) => BRL.format(Number(n) || 0);

const NEW_ORC_ITEM = () => ({
  id: uid(),
  nome: "",
  qtd: "",
  valor: 0,
  prazoDias: "",
  prazoTipo: "dias",
  fornecedor: "",
  fecha: "indefinido",
  status: "cotando",
  obs: "",
});

const CAL_STATUS = {
  ideia: { label: "Ideia" },
  producao: { label: "Produção" },
  aprovacao: { label: "Aprovação" },
  publicado: { label: "Publicado" },
};

const PRIORITIES = {
  nenhuma: { label: "Sem prioridade", chip: "#8C8478" },
  baixa: { label: "Baixa", chip: "#3F6B4F" },
  media: { label: "Média", chip: "#8A6A14" },
  alta: { label: "Alta", chip: "#B25E10" },
  urgente: { label: "Urgente", chip: "#C2453A" },
};

// ---------- login / perfis / admin ----------
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "octalab2026";
const AVATAR_DESIGNS = [
  { base: "#ff005b", blob: "#ffb238", transform: "translate(9 -5) rotate(219 18 18) scale(1)",   rx: 6,  face: "translate(4.5 -4) rotate(9 18 18)",  mouth: "M15 19c2 1 4 1 6 0",       open: false, eyes: [10, 24], color: "#000000" },
  { base: "#ff7d10", blob: "#0a0310", transform: "translate(5 -1) rotate(55 18 18) scale(1.1)",  rx: 6,  face: "translate(7 -6) rotate(-5 18 18)",  mouth: "M15 20c2 1 4 1 6 0",       open: false, eyes: [14, 20], color: "#FFFFFF" },
  { base: "#0a0310", blob: "#1e3a8a", transform: "translate(-3 7) rotate(227 18 18) scale(1.2)", rx: 36, face: "translate(-3 3.5) rotate(7 18 18)", mouth: "M13,21 a1,0.75 0 0,0 10,0", open: true,  eyes: [12, 22], color: "#FFFFFF" },
  { base: "#d8fcb3", blob: "#89fcb3", transform: "translate(9 -5) rotate(219 18 18) scale(1)",   rx: 6,  face: "translate(4.5 -4) rotate(9 18 18)",  mouth: "M15 19c2 1 4 1 6 0",       open: false, eyes: [10, 24], color: "#000000" },
  { base: "#6d28d9", blob: "#22d3ee", transform: "translate(-4 6) rotate(135 18 18) scale(1.15)", rx: 36, face: "translate(2 -3) rotate(-7 18 18)", mouth: "M15 19c2 1 4 1 6 0",        open: false, eyes: [11, 23], color: "#FFFFFF" },
];
const PROFILES = [
  { key: "marcos", name: "Marcos", avatar: 1 },
  { key: "silvio", name: "Silvio", avatar: 3 },
  { key: "thiago", name: "Thiago", avatar: 4 },
  { key: "firmino", name: "Firmino", avatar: 0 },
  { key: "clara", name: "Clara", avatar: 2 },
];
// o Quadro (tarefas) é privado destes perfis; os demais nem veem a aba
// nem os cartões vazando pelas outras telas
const QUADRO_PROFILES = ["Firmino", "Clara"];
// o Quadro é privado destes perfis. O Admin fica de fora de propósito:
// é conta de manutenção, não de trabalho no quadro de tarefas.
const canSeeQuadro = (user) => QUADRO_PROFILES.includes(user);
const profileByName = (name) => PROFILES.find((p) => p.name === name) || null;
const DELETE_PROFILES = ["Marcos", "Silvio", "Firmino"]; // além do admin

/* ---------- ícones do menu (SVG inline, sem dependência) ---------- */
function Ico({ children }) {
  return (
    <svg className="sb-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}
const IconHome = () => (
  <Ico><path d="M3 10.5 12 3l9 7.5" /><path d="M5.5 9.5V21h13V9.5" /></Ico>
);
const IconCalendar = () => (
  <Ico>
    <rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18" />
    <path d="M8 3v4M16 3v4" />
  </Ico>
);
const IconBoard = () => (
  <Ico>
    <rect x="3" y="4" width="5.5" height="16" rx="2" />
    <rect x="9.75" y="4" width="5.5" height="11" rx="2" />
    <rect x="16.5" y="4" width="4.5" height="14" rx="2" />
  </Ico>
);
const IconCheck = () => (
  <Ico><circle cx="12" cy="12" r="9" /><path d="M8 12.2l2.8 2.8L16 9.5" /></Ico>
);
const IconTrilha = () => (
  <Ico>
    <path d="M12 4 21 8.5 12 13 3 8.5 12 4z" />
    <path d="M6.5 10.6V16c0 1.7 2.5 3 5.5 3s5.5-1.3 5.5-3v-5.4" />
  </Ico>
);
const IconSheet = () => (
  <Ico>
    <rect x="3" y="4" width="18" height="16" rx="2.5" />
    <path d="M3 9.5h18M3 15h18M9 4v16M15 4v16" />
  </Ico>
);
const IconTrash = () => (
  <Ico><path d="M4 7h16" /><path d="M9 7V4.5h6V7" /><path d="M6.5 7l1 13h9l1-13" /></Ico>
);
const IconUser = () => (
  <Ico><circle cx="12" cy="8.5" r="3.8" /><path d="M4.5 20c1.3-3.8 4-5.6 7.5-5.6s6.2 1.8 7.5 5.6" /></Ico>
);
const IconExit = () => (
  <Ico><path d="M14 4.5H6.5v15H14" /><path d="M17.5 12H10" /><path d="M15 9l3 3-3 3" /></Ico>
);

function BoringAvatar({ index = 0, size = 40 }) {
  const raw = useId();
  const maskId = "bav" + raw.replace(/[^a-zA-Z0-9]/g, "");
  const d = AVATAR_DESIGNS[index] || AVATAR_DESIGNS[0];
  return (
    <svg viewBox="0 0 36 36" width={size} height={size} fill="none" role="img" xmlns="http://www.w3.org/2000/svg">
      <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="36" height="36">
        <rect width="36" height="36" rx="72" fill="#FFFFFF" />
      </mask>
      <g mask={`url(#${maskId})`}>
        <rect width="36" height="36" fill={d.base} />
        <rect x="0" y="0" width="36" height="36" transform={d.transform} fill={d.blob} rx={d.rx} />
        <g transform={d.face}>
          {d.open
            ? <path d={d.mouth} fill={d.color} />
            : <path d={d.mouth} stroke={d.color} fill="none" strokeLinecap="round" />}
          <rect x={d.eyes[0]} y="14" width="1.5" height="2" rx="1" fill={d.color} />
          <rect x={d.eyes[1]} y="14" width="1.5" height="2" rx="1" fill={d.color} />
        </g>
      </g>
    </svg>
  );
}

// ---------- slots do carrossel de entrada (6 posições) ----------
// para usar imagem real, preencha "img" com a URL; sem imagem, o tile usa o degradê
const SLOTS = [
  {
    key: "octalab",
    label: "Octalab",
    tag: "OC",
    grad: "linear-gradient(135deg,#8A6FE0,#D6B3F5,#A9D7EF)",
    manifesto:
      "A Octalab é uma casa de produtos nativos de IA. Construímos ferramentas que complementam o trabalho humano, encurtam distâncias entre ideia e execução e tratam tecnologia como ofício, não como promessa.",
    files: ["Logo pack (SVG + PNG)", "MIV completo", "Tipografia", "Paleta de cores", "Templates sociais"],
  },
  {
    key: "ecosys",
    label: "Ecosys AUTO",
    tag: "EC",
    grad: "linear-gradient(135deg,#4E8FD9,#A9D7EF,#DDF5E8)",
    manifesto:
      "O Ecosys AUTO é o assistente de vendas com IA para concessionárias. Ele responde rápido, qualifica melhor e devolve ao vendedor o tempo que importa: o da conversa que fecha negócio.",
    files: ["Logo pack (SVG + PNG)", "MIV completo", "Tipografia", "Paleta de cores", "Mockups de produto"],
  },
  {
    key: "juspilot",
    label: "JusPilot",
    tag: "JP",
    grad: "linear-gradient(135deg,#3FA37A,#BDEAD0,#FFF0CE)",
    manifesto:
      "O JusPilot é a plataforma de IA para o dia a dia jurídico. Pesquisa, redige e organiza com precisão, para que advogados dediquem energia ao que exige julgamento humano.",
    files: ["Logo pack (SVG + PNG)", "MIV completo", "Tipografia", "Paleta de cores", "Templates sociais"],
  },
  {
    key: "octagym",
    label: "OctaGym",
    tag: "OG",
    grad: "linear-gradient(135deg,#D96757,#FFB7C5,#FFE0A3)",
    manifesto:
      "O OctaGym é o sistema operacional de academias. Da recepção ao treino, tudo em um só lugar, com dados que ajudam donos e professores a cuidar melhor de cada aluno.",
    files: ["Logo pack (SVG + PNG)", "MIV completo", "Tipografia", "Paleta de cores", "Materiais de evento"],
  },
  {
    key: "slot5",
    label: "Em breve",
    tag: "+",
    grad: "linear-gradient(135deg,#E9E5DB,#D8D2C4)",
    manifesto: "Espaço reservado para o próximo produto da casa.",
    files: [],
  },
  {
    key: "slot6",
    label: "Em breve",
    tag: "+",
    grad: "linear-gradient(135deg,#D8D2C4,#E9E5DB)",
    manifesto: "Espaço reservado para o próximo produto da casa.",
    files: [],
  },
];

const TEMPLATES = {
  reel: {
    label: "Reel / Vídeo",
    items: ["Roteiro", "Captação / geração", "Edição", "Legenda + copy", "Aprovação", "Publicação"],
  },
  estatico: {
    label: "Post estático",
    items: ["Conceito", "Arte / imagem", "Copy", "Aprovação", "Publicação"],
  },
  carrossel: {
    label: "Carrossel",
    items: ["Pauta", "Textos por slide", "Design", "Revisão", "Aprovação", "Publicação"],
  },
  campanha: {
    label: "Campanha Ads",
    items: ["Briefing", "Criativos", "Copies", "Configurar campanha", "Revisão", "Publicar", "Acompanhar métricas"],
  },
};

const uid = () => Math.random().toString(36).slice(2, 10);
const dk = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
const todayKey = () => {
  const d = new Date();
  return dk(d.getFullYear(), d.getMonth(), d.getDate());
};

const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const DEFAULT_BOARD = () => ({
  columns: [
    { id: uid(), title: "Ideias", cardIds: [] },
    { id: uid(), title: "Em produção", cardIds: [] },
    { id: uid(), title: "Revisão / Aprovação", cardIds: [] },
    { id: uid(), title: "Publicado", cardIds: [] },
  ],
  cards: {},
});

// ---------- persistência (Supabase, com sync em tempo real entre o time) ----------
// requisição sem timeout fica pendurada para sempre quando o banco está
// fora do ar — foi o que deixou o painel num "carregando" eterno
const withTimeout = (p, ms = 9000) =>
  Promise.race([
    p,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Tempo esgotado ao falar com o banco")), ms)
    ),
  ]);

async function loadKey(key, fallback) {
  if (!supabaseReady) {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
    catch { return fallback; }
  }
  // Falha de conexão sobe como erro de propósito. Se engolíssemos e
  // devolvêssemos o fallback, o painel abriria vazio e a primeira edição
  // gravaria esse vazio por cima dos dados reais quando o banco voltasse.
  const { data, error } = await withTimeout(
    supabase.from("estudio_docs").select("value").eq("id", key).maybeSingle()
  );
  if (error) throw error;
  return data?.value ?? fallback; // linha ausente = documento ainda não criado
}
async function saveKey(key, value) {
  if (!supabaseReady) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
    return;
  }
  try {
    await supabase.from("estudio_docs").upsert({ id: key, value, client_id: CLIENT_ID, updated_at: new Date().toISOString() });
  } catch (e) {
    console.error("Falha ao salvar", e);
  }
}

// ---------- upload de imagem (Supabase Storage, bucket "creatives") ----------
async function uploadEstudioImage(file) {
  if (!file || !supabaseReady) return null;
  const ext = (file.name.split(".").pop() || "png").toLowerCase();
  const path = `estudio/${uid()}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("creatives").upload(path, file, { upsert: true, contentType: file.type });
  if (error) {
    console.error("Falha no upload", error);
    return null;
  }
  const { data } = supabase.storage.from("creatives").getPublicUrl(path);
  return data?.publicUrl || null;
}

// descrição + imagens de um item do calendário
function ItemMedia({ item, onPatch, canDelete }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const images = item.images || [];

  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith("image/"));
    if (!files.length) return;
    setUploading(true);
    const urls = [];
    for (const f of files) {
      const u = await uploadEstudioImage(f);
      if (u) urls.push(u);
    }
    if (urls.length) onPatch({ images: [...images, ...urls] });
    setUploading(false);
  };

  return (
    <>
      <textarea
        className="input"
        style={{ marginTop: 10, minHeight: 54, resize: "vertical" }}
        placeholder="Descreva a ideia do conteúdo…"
        value={item.desc || ""}
        onChange={(e) => onPatch({ desc: e.target.value })}
      />
      <div className="img-strip">
        {images.map((u, i) => (
          <div key={i} className="img-thumb">
            <img src={u} alt="" onClick={() => setPreview(u)} title="Clique para ver em tamanho grande" />
            {canDelete && <button className="img-del" onClick={() => onPatch({ images: images.filter((_, idx) => idx !== i) })}>×</button>}
          </div>
        ))}
        <label
          className={`img-add px-label ${dragOver ? "drop" : ""}`}
          title="Clique ou arraste imagens aqui"
          onDragOver={(e) => { e.preventDefault(); if (!uploading) setDragOver(true); }}
          onDragEnter={(e) => { e.preventDefault(); if (!uploading) setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); if (!uploading) uploadFiles(e.dataTransfer.files); }}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            style={{ display: "none" }}
            onChange={(e) => { uploadFiles(e.target.files); e.target.value = ""; }}
            disabled={uploading}
          />
          {uploading ? "…" : "＋"}
        </label>
      </div>

      {preview && (
        <Overlay close={() => setPreview(null)}>
          <div className="img-preview-wrap" onClick={(e) => e.stopPropagation()}>
            <button className="img-preview-close" onClick={() => setPreview(null)}>×</button>
            <img className="img-preview" src={preview} alt="" />
          </div>
        </Overlay>
      )}
    </>
  );
}

// ---------- app ----------
export default function App() {
  const [screen, setScreen] = useState("landing"); // landing | app | product:<key>
  const [tab, setTab] = useState("hoje");
  const [board, setBoard] = useState(null);
  const [calendar, setCalendar] = useState(null);
  const [orcamentos, setOrcamentos] = useState({ events: [] });
  const [trilha, setTrilha] = useState({ tarefas: [] });
  const [openCard, setOpenCard] = useState(null);
  const [openDay, setOpenDay] = useState(null);
  const [calFilter, setCalFilter] = useState("todos");
  const [trash, setTrash] = useState({ items: [] });
  const [showTrash, setShowTrash] = useState(false);
  const [confirmState, setConfirmState] = useState(null); // { message, onOk }
  const [currentUser, setCurrentUser] = useState(() => {
    try { return localStorage.getItem("estudio-user") || null; } catch { return null; }
  });
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const [loadError, setLoadError] = useState(null);
  const saveTimer = useRef({});

  const carregarTudo = async () => {
    setLoadError(null);
    try {
      // as quatro leituras vão juntas: em série eram 4 idas ao Supabase
      const [b, cal, tr, orc, tri] = await Promise.all([
        loadKey("estudio:board", DEFAULT_BOARD()),
        loadKey("estudio:calendar", { items: {} }),
        loadKey("estudio:trash", { items: [] }),
        loadKey("estudio:orcamentos", { events: [] }),
        loadKey("estudio:trilha", { tarefas: [] }),
      ]);
      Object.values(b.cards || {}).forEach((c) => {
        if (c.due === undefined) c.due = "";
        if (c.link === undefined) c.link = "";
        if (!c.checklist) c.checklist = [];
        if (!c.priority) c.priority = "nenhuma";
      });
      setBoard(b);
      setCalendar(cal);
      setTrash(tr);
      setOrcamentos(orc);
      setTrilha(tri);
    } catch (e) {
      console.error("[Estúdio] falha ao carregar", e);
      setLoadError(e?.message || "Não foi possível falar com o banco de dados.");
    }
  };

  useEffect(() => {
    carregarTudo();
  }, []);

  // deep link: ?u=Firmino&tab=trilha&mod=m13 — abre direto num perfil e aba
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search);
      const u = q.get("u");
      const t = q.get("tab");
      if (u) {
        setCurrentUser(u);
        setScreen("app");
      }
      if (t) setTab(t);
    } catch { /* sem querystring, segue o fluxo normal */ }
  }, []);

  // sincroniza em tempo real: aplica alterações feitas por outras pessoas
  useEffect(() => {
    if (!supabaseReady) return;
    const ch = supabase
      .channel("estudio-docs")
      .on("postgres_changes", { event: "*", schema: "public", table: "estudio_docs" }, (payload) => {
        const row = payload.new;
        if (!row || row.client_id === CLIENT_ID) return; // ignora o próprio eco
        if (row.id === "estudio:board" && row.value) setBoard(row.value);
        else if (row.id === "estudio:calendar" && row.value) setCalendar(row.value);
        else if (row.id === "estudio:trash" && row.value) setTrash(row.value);
        else if (row.id === "estudio:orcamentos" && row.value) setOrcamentos(row.value);
        else if (row.id === "estudio:trilha" && row.value) setTrilha(row.value);
      })
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, []);

  const persist = (key, value) => {
    clearTimeout(saveTimer.current[key]);
    saveTimer.current[key] = setTimeout(() => saveKey(key, value), 400);
  };

  const updateBoard = (fn) =>
    setBoard((b) => {
      const nb = fn(structuredClone(b));
      persist("estudio:board", nb);
      return nb;
    });

  const updateCalendar = (fn) =>
    setCalendar((c) => {
      const nc = fn(structuredClone(c));
      persist("estudio:calendar", nc);
      return nc;
    });

  const updateOrcamentos = (fn) =>
    setOrcamentos((o) => {
      const no = fn(structuredClone(o || { events: [] }));
      persist("estudio:orcamentos", no);
      return no;
    });

  const updateTrilha = (fn) =>
    setTrilha((t) => {
      const nt = fn(structuredClone(t || { tarefas: [] }));
      persist("estudio:trilha", nt);
      return nt;
    });

  const updateTrash = (fn) =>
    setTrash((t) => {
      const nt = fn(structuredClone(t || { items: [] }));
      persist("estudio:trash", nt);
      return nt;
    });

  // pede confirmação antes de excluir
  const askConfirm = (message, onOk) => setConfirmState({ message, onOk });

  // manda um item excluído para a lixeira
  const sendToTrash = (entry) =>
    updateTrash((t) => {
      t.items = [{ id: uid(), deletedAt: Date.now(), ...entry }, ...(t.items || [])].slice(0, 100);
      return t;
    });

  // restaura um item da lixeira de volta pro calendário/quadro
  const restoreFromTrash = (entryId) => {
    const entry = (trash.items || []).find((x) => x.id === entryId);
    if (!entry) return;
    if (entry.type === "calendar") {
      updateCalendar((c) => {
        if (!c.items[entry.dateKey]) c.items[entry.dateKey] = [];
        c.items[entry.dateKey].push(entry.item);
        return c;
      });
    } else if (entry.type === "card") {
      updateBoard((b) => {
        b.cards[entry.card.id] = entry.card;
        const col = b.columns.find((x) => x.id === entry.colId) || b.columns[0];
        if (col && !col.cardIds.includes(entry.card.id)) col.cardIds.push(entry.card.id);
        return b;
      });
    }
    updateTrash((t) => {
      t.items = t.items.filter((x) => x.id !== entryId);
      return t;
    });
  };

  const purgeFromTrash = (entryId) =>
    updateTrash((t) => {
      t.items = t.items.filter((x) => x.id !== entryId);
      return t;
    });

  const emptyTrash = () => updateTrash((t) => { t.items = []; return t; });

  // permissão de exclusão: admin + perfis autorizados
  const canDelete = currentUser === "Admin" || DELETE_PROFILES.includes(currentUser);
  const podeVerQuadro = canSeeQuadro(currentUser);
  const papelTrilha = papelNaTrilha(currentUser);

  // trocou para um perfil sem acesso enquanto estava no Quadro: volta pro Hoje
  useEffect(() => {
    if (!podeVerQuadro && tab === "kanban") setTab("hoje");
    if (!papelTrilha && tab === "trilha") setTab("hoje");
  }, [podeVerQuadro, papelTrilha, tab]);

  const chooseProfile = (name) => {
    setCurrentUser(name);
    try { localStorage.setItem("estudio-user", name); } catch { /* ignore */ }
    setScreen("app");
  };
  const enterAdmin = () => { setCurrentUser("Admin"); setScreen("app"); }; // admin não fica salvo

  if (screen === "identify") {
    return (
      <div className="page center">
        <GlobalStyle />
        <Identify
          onPick={chooseProfile}
          onAdmin={enterAdmin}
          onBack={() => setScreen("landing")}
        />
      </div>
    );
  }

  if (screen === "landing") {
    return (
      <div className="page bare">
        <GlobalStyle />
        <Landing
          onEnter={() => setScreen("identify")}
          onProduct={(k) => setScreen("product:" + k)}
        />
      </div>
    );
  }

  if (screen.startsWith("product:")) {
    const slot = SLOTS.find((s) => s.key === screen.slice(8)) || SLOTS[0];
    return (
      <div className="page">
        <GlobalStyle />
        <ProductPage
          slot={slot}
          onBack={() => setScreen("landing")}
          onEnter={() => setScreen("identify")}
        />
      </div>
    );
  }

  // o painel aparece inteiro na hora; só a área de conteúdo espera os
  // documentos do Supabase, sem tela de carregando cobrindo tudo
  const dadosProntos = Boolean(board && calendar);

  const dateStr = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  const navGeral = [
    ["hoje", "Hoje", IconHome],
    ["planilha", "Planilha", IconSheet],
    ["calendario", "Calendário", IconCalendar],
    ["kanban", "Quadro", IconBoard],
    ["trilha", "Trilha", IconTrilha],
    ["publicados", "Publicados", IconCheck],
  ].filter(
    ([id]) =>
      (id !== "kanban" || podeVerQuadro) && (id !== "trilha" || Boolean(papelTrilha))
  );
  const userLabel = currentUser === "Admin" ? "Admin" : currentUser || "visitante";

  return (
    <div className="app">
      <GlobalStyle />

      <aside className="sidebar">
        <div className="sb-brand">
          <span className="sb-brand-glyph">✳</span>
          <span className="sb-brand-name">Estúdio</span>
        </div>

        <div className="sb-group">
          <div className="sb-group-label">Geral</div>
          {navGeral.map(([id, label, Icon]) => (
            <button
              key={id}
              className={`sb-item ${tab === id ? "active" : ""}`}
              onClick={() => setTab(id)}
            >
              <Icon />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="sb-group">
          <div className="sb-group-label">Ferramentas</div>
          <button className="sb-item" onClick={() => setShowTrash(true)}>
            <IconTrash />
            <span>Lixeira</span>
            {trash.items?.length ? <span className="sb-count">{trash.items.length}</span> : null}
          </button>
          <button className="sb-item" onClick={() => setScreen("identify")}>
            <IconUser />
            <span>Trocar de perfil</span>
          </button>
        </div>

        <button className="sb-item sb-exit" onClick={() => setScreen("landing")}>
          <IconExit />
          <span>Sair para a entrada</span>
        </button>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="tb-eyebrow">Painel de conteúdo</div>
          <div className="tb-right">
            <span className="date-pill">{dateStr}</span>
            <div className="user-chip">
              {currentUser === "Admin" ? (
                <span className="user-badge">★</span>
              ) : (
                profileByName(currentUser) && (
                  <BoringAvatar index={profileByName(currentUser).avatar} size={26} />
                )
              )}
              <span>{userLabel}</span>
            </div>
          </div>
        </header>

        <div className="main-head">
          <h1 className="greet">
            Tudo em dia, <em>{userLabel}</em>
          </h1>
        </div>

        <div className="view-wrap">
          {loadError && (
            <div className="view-error">
              <div className="ve-title">Não foi possível carregar seus dados</div>
              <p className="ve-msg">{loadError}</p>
              <p className="ve-hint">
                O banco de dados não respondeu. Se o projeto do Supabase estiver
                pausado, é preciso restaurá-lo no painel da Supabase — projetos
                gratuitos pausam sozinhos após alguns dias sem uso.
              </p>
              <button className="btn" onClick={carregarTudo}>tentar de novo</button>
            </div>
          )}
          {!loadError && !dadosProntos && (
            <div className="view-loading">
              <span className="spin" aria-hidden="true" />
              carregando seus dados…
            </div>
          )}
          {dadosProntos && tab === "hoje" && (
            <TodayView board={board} calendar={calendar} setOpenCard={setOpenCard} setOpenDay={setOpenDay} podeVerQuadro={podeVerQuadro} />
          )}
          {dadosProntos && tab === "kanban" && podeVerQuadro && (
            <Kanban board={board} updateBoard={updateBoard} setOpenCard={setOpenCard} askConfirm={askConfirm} sendToTrash={sendToTrash} canDelete={canDelete} />
          )}
          {dadosProntos && tab === "calendario" && (
            <Calendar
              calendar={calendar}
              board={board}
              month={month}
              setMonth={setMonth}
              setOpenDay={setOpenDay}
              filter={calFilter}
              setFilter={setCalFilter}
            />
          )}
          {dadosProntos && tab === "trilha" && papelTrilha && (
            <Trilha
              trilha={trilha}
              updateTrilha={updateTrilha}
              papel={papelTrilha}
              askConfirm={askConfirm}
              canDelete={canDelete}
            />
          )}
          {dadosProntos && tab === "publicados" && (
            <PublishedView calendar={calendar} setOpenDay={setOpenDay} />
          )}
          {dadosProntos && tab === "planilha" && (
            <Planilha
              orcamentos={orcamentos}
              updateOrcamentos={updateOrcamentos}
              askConfirm={askConfirm}
              canDelete={canDelete}
            />
          )}
        </div>
      </main>

      {openCard && podeVerQuadro && board?.cards?.[openCard] && (
        <CardModal
          card={board.cards[openCard]}
          board={board}
          updateBoard={updateBoard}
          updateCalendar={updateCalendar}
          askConfirm={askConfirm}
          sendToTrash={sendToTrash}
          canDelete={canDelete}
          close={() => setOpenCard(null)}
        />
      )}
      {openDay && dadosProntos && (
        <DayModal
          dateKey={openDay}
          calendar={calendar}
          board={board}
          updateCalendar={updateCalendar}
          setOpenCard={setOpenCard}
          askConfirm={askConfirm}
          sendToTrash={sendToTrash}
          canDelete={canDelete}
          podeVerQuadro={podeVerQuadro}
          close={() => setOpenDay(null)}
        />
      )}
      {confirmState && (
        <ConfirmModal
          message={confirmState.message}
          onOk={() => { confirmState.onOk(); setConfirmState(null); }}
          onCancel={() => setConfirmState(null)}
        />
      )}
      {showTrash && (
        <TrashModal
          trash={trash}
          onRestore={restoreFromTrash}
          onPurge={purgeFromTrash}
          onEmpty={emptyTrash}
          canDelete={canDelete}
          close={() => setShowTrash(false)}
        />
      )}
    </div>
  );
}

// ---------- utilidades ----------
/* O quadro é um funil que termina em Publicado, então concluir é mover
   para a última coluna. Não inventei um campo "done" em paralelo: haveria
   duas verdades sobre o mesmo cartão, e dueState já trata a coluna de
   publicado como fora de prazo. */
function colunaFinal(board) {
  return (
    board.columns.find((c) => /publicad|conclu|final/i.test(c.title)) ||
    board.columns[board.columns.length - 1]
  );
}
function colunaDoCard(board, cardId) {
  return board.columns.find((c) => c.cardIds.includes(cardId));
}
function estaConcluido(board, cardId) {
  const fim = colunaFinal(board);
  return Boolean(fim && fim.cardIds.includes(cardId));
}

function dueState(card, board) {
  if (!card.due) return null;
  const col = board.columns.find((c) => c.cardIds.includes(card.id));
  const isPub = col && /publicado/i.test(col.title);
  if (isPub) return null;
  const t = todayKey();
  if (card.due < t) return "atrasado";
  if (card.due === t) return "hoje";
  return "futuro";
}

function weekRange() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay());
  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    days.push(dk(d.getFullYear(), d.getMonth(), d.getDate()));
  }
  return days;
}

const fmtShort = (iso) => iso.split("-").reverse().slice(0, 2).join("/");

// ---------- visão HOJE ----------
function TodayView({ board, calendar, setOpenCard, setOpenDay, podeVerQuadro }) {
  const tk = todayKey();
  const week = weekRange();
  const todayItems = calendar.items[tk] || [];
  const restOfWeek = week.filter((d) => d > tk); // dias da semana depois de hoje
  const cardsDueOn = (d) =>
    podeVerQuadro
      ? Object.values(board.cards).filter((c) => c.due === d && dueState(c, board) !== null)
      : [];

  const overdue = [];
  const dueToday = [];
  const pending = [];
  Object.values(podeVerQuadro ? board.cards : {}).forEach((card) => {
    const st = dueState(card, board);
    if (st === "atrasado") overdue.push(card);
    else if (st === "hoje") dueToday.push(card);
    const open = card.checklist.filter((i) => !i.done).length;
    if (open > 0 && st !== "atrasado" && st !== "hoje") pending.push({ card, open });
  });

  const netCount = {};
  NETWORKS.forEach((n) => (netCount[n] = 0));
  week.forEach((d) =>
    (calendar.items[d] || []).forEach((it) => {
      if (netCount[it.network] !== undefined) netCount[it.network]++;
    })
  );

  return (
    <div className="view">
      <div className="px-label sec">Semana por rede</div>
      <div className="net-grid">
        {NETWORKS.map((n) => (
          <div key={n} className={`net-box ${netCount[n] === 0 ? "zero" : ""}`}>
            <div className="net-num">{netCount[n]}</div>
            <div className="net-name">{n}</div>
            {netCount[n] === 0 && <div className="net-warn">vazio</div>}
          </div>
        ))}
      </div>

      {overdue.length > 0 && (
        <>
          <div className="px-label sec danger">Atrasados</div>
          {overdue.map((c) => (
            <button key={c.id} className="row danger" onClick={() => setOpenCard(c.id)}>
              <ProdTag k={c.product} />
              <span className="row-title">{c.title}</span>
              <span className="row-end">● {fmtShort(c.due)}</span>
            </button>
          ))}
        </>
      )}

      <div className="px-label sec">Entregas de hoje</div>
      {dueToday.length === 0 && todayItems.length === 0 && (
        <div className="empty">Nada marcado para hoje. Dia livre — ou calendário vazio?</div>
      )}
      {dueToday.map((c) => (
        <button key={c.id} className="row" onClick={() => setOpenCard(c.id)}>
          <ProdTag k={c.product} />
          <PrioDot k={c.priority} />
          <span className="row-title">{c.title}</span>
          <span className="row-end">entrega hoje</span>
        </button>
      ))}
      {todayItems.map((it) => (
        <button key={it.id} className="row" onClick={() => setOpenDay(tk)}>
          <ProdTag k={it.product} />
          <span className="row-title">{it.title}</span>
          <span className="row-end">{it.network} · {CAL_STATUS[it.status]?.label}</span>
        </button>
      ))}

      {restOfWeek.some((d) => (calendar.items[d] || []).length || cardsDueOn(d).length) && (
        <>
          <div className="px-label sec">Restante da semana</div>
          {restOfWeek.map((d) => {
            const cItems = calendar.items[d] || [];
            const cards = cardsDueOn(d);
            if (!cItems.length && !cards.length) return null;
            const [yy, mm, dd] = d.split("-").map(Number);
            const wd = WEEKDAYS[new Date(yy, mm - 1, dd).getDay()];
            return (
              <div key={d}>
                <div className="week-day-head px-label">{wd} · {fmtShort(d)}</div>
                {cards.map((c) => (
                  <button key={c.id} className="row" onClick={() => setOpenCard(c.id)}>
                    <ProdTag k={c.product} />
                    <PrioDot k={c.priority} />
                    <span className="row-title">{c.title}</span>
                    <span className="row-end">entrega</span>
                  </button>
                ))}
                {cItems.map((it) => (
                  <button key={it.id} className="row" onClick={() => setOpenDay(d)}>
                    <ProdTag k={it.product} />
                    <span className="row-title">{it.title}</span>
                    <span className="row-end">{it.network} · {CAL_STATUS[it.status]?.label}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </>
      )}

      {pending.length > 0 && (
        <>
          <div className="px-label sec">Checklists em aberto</div>
          {pending.slice(0, 8).map(({ card, open }) => (
            <button key={card.id} className="row" onClick={() => setOpenCard(card.id)}>
              <ProdTag k={card.product} />
              <PrioDot k={card.priority} />
              <span className="row-title">{card.title}</span>
              <span className="row-end">{open} item{open > 1 ? "s" : ""}</span>
            </button>
          ))}
        </>
      )}
    </div>
  );
}

// ---------- visão PUBLICADOS ----------
function PublishedView({ calendar, setOpenDay }) {
  const [filter, setFilter] = useState("todos");

  const all = [];
  Object.entries(calendar.items || {}).forEach(([date, items]) => {
    (items || []).forEach((it) => {
      if (it.status === "publicado") all.push({ ...it, date });
    });
  });

  const filtered = (filter === "todos" ? all : all.filter((it) => it.product === filter))
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const groups = {};
  filtered.forEach((it) => {
    const key = it.date.slice(0, 7); // YYYY-MM
    (groups[key] ||= []).push(it);
  });
  const monthKeys = Object.keys(groups).sort().reverse();

  return (
    <div className="view">
      <div className="px-label sec">Conteúdos publicados</div>

      <div className="chip-row" style={{ justifyContent: "center", marginBottom: 12 }}>
        <button className={`chip ${filter === "todos" ? "sel" : ""}`} onClick={() => setFilter("todos")}>
          Todos <b style={{ marginLeft: 4 }}>{all.length}</b>
        </button>
        {Object.entries(PRODUCTS).filter(([k]) => k !== "outro").map(([k, p]) => {
          const n = all.filter((it) => it.product === k).length;
          return (
            <button
              key={k}
              className={`chip ${filter === k ? "sel" : ""}`}
              style={filter === k ? { borderColor: p.color, color: p.color } : {}}
              onClick={() => setFilter(k)}
            >
              {p.label} <b style={{ marginLeft: 4 }}>{n}</b>
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          Nenhum conteúdo publicado ainda. No calendário, marque um item como <b>Publicado</b> que ele aparece aqui.
        </div>
      ) : (
        monthKeys.map((mk) => {
          const [y, m] = mk.split("-");
          return (
            <div key={mk}>
              <div className="week-day-head px-label">{MONTHS[Number(m) - 1]} {y} · {groups[mk].length}</div>
              {groups[mk].map((it) => {
                const p = PRODUCTS[it.product] || PRODUCTS.outro;
                return (
                  <button key={it.id} className="row" onClick={() => setOpenDay(it.date)}>
                    <ProdTag k={it.product} />
                    <span className="pub-check px-label" style={{ color: p.color }}>✓</span>
                    <span className="row-title">{it.title}</span>
                    <span className="row-end">{fmtShort(it.date)} · {it.network}</span>
                  </button>
                );
              })}
            </div>
          );
        })
      )}
    </div>
  );
}

function ProdTag({ k }) {
  const p = PRODUCTS[k] || PRODUCTS.outro;
  return (
    <span className="prod-tag" style={{ borderColor: p.color, color: p.color }}>
      {p.tag}
    </span>
  );
}

function PrioDot({ k }) {
  if (!k || k === "nenhuma") return null;
  const p = PRIORITIES[k];
  return <span className="prio-dot" style={{ background: p.chip }} title={p.label} />;
}

// ---------- kanban ----------
function Kanban({ board, updateBoard, setOpenCard, askConfirm, sendToTrash, canDelete }) {
  const [drag, setDrag] = useState(null);
  const [overCol, setOverCol] = useState(null);
  const [addingCol, setAddingCol] = useState(false);
  const [newColName, setNewColName] = useState("");

  const moveCard = (cardId, fromCol, toCol) => {
    if (fromCol === toCol) return;
    updateBoard((b) => {
      const from = b.columns.find((c) => c.id === fromCol);
      const to = b.columns.find((c) => c.id === toCol);
      if (!from || !to) return b;
      from.cardIds = from.cardIds.filter((id) => id !== cardId);
      to.cardIds.push(cardId);
      return b;
    });
  };

  const addColumn = () => {
    const name = newColName.trim();
    if (!name) return;
    updateBoard((b) => {
      b.columns.push({ id: uid(), title: name, cardIds: [] });
      return b;
    });
    setNewColName("");
    setAddingCol(false);
  };

  return (
    <div className="board-wrap">
      <div className="board">
        {board.columns.map((col) => (
          <Column
            key={col.id}
            col={col}
            board={board}
            updateBoard={updateBoard}
            setOpenCard={setOpenCard}
            drag={drag}
            setDrag={setDrag}
            isOver={overCol === col.id}
            setOverCol={setOverCol}
            moveCard={moveCard}
            askConfirm={askConfirm}
            sendToTrash={sendToTrash}
            canDelete={canDelete}
          />
        ))}
        <div style={{ minWidth: 240 }}>
          {addingCol ? (
            <div className="column" style={{ padding: 12 }}>
              <input
                autoFocus
                className="input"
                placeholder="Nome da coluna"
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addColumn()}
              />
              <div className="btn-row">
                <button className="btn" onClick={addColumn}>Criar</button>
                <button className="btn ghost" onClick={() => setAddingCol(false)}>Voltar</button>
              </div>
            </div>
          ) : (
            <button className="add-col px-label" onClick={() => setAddingCol(true)}>+ nova coluna</button>
          )}
        </div>
      </div>
    </div>
  );
}

function Column({ col, board, updateBoard, setOpenCard, drag, setDrag, isOver, setOverCol, moveCard, askConfirm, sendToTrash, canDelete }) {
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(col.title);

  const addCard = () => {
    const t = newTitle.trim();
    if (!t) return;
    updateBoard((b) => {
      const id = uid();
      b.cards[id] = { id, title: t, desc: "", product: "outro", checklist: [], due: "", link: "", priority: "nenhuma" };
      b.columns.find((c) => c.id === col.id).cardIds.push(id);
      return b;
    });
    setNewTitle("");
  };

  const renameCol = () => {
    const t = titleDraft.trim();
    if (t)
      updateBoard((b) => {
        b.columns.find((c) => c.id === col.id).title = t;
        return b;
      });
    setEditingTitle(false);
  };

  const deleteCol = () => {
    askConfirm(
      `Excluir a coluna "${col.title}"${col.cardIds.length ? ` e seus ${col.cardIds.length} cartão(ões)` : ""}?`,
      () => {
        col.cardIds.forEach((id) => {
          const cd = board.cards[id];
          if (cd) sendToTrash({ type: "card", label: cd.title, colId: col.id, card: structuredClone(cd) });
        });
        updateBoard((b) => {
          const c = b.columns.find((x) => x.id === col.id);
          c.cardIds.forEach((id) => delete b.cards[id]);
          b.columns = b.columns.filter((x) => x.id !== col.id);
          return b;
        });
      }
    );
  };

  return (
    <div
      className={`column ${isOver ? "over" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setOverCol(col.id);
      }}
      onDragLeave={() => setOverCol(null)}
      onDrop={(e) => {
        e.preventDefault();
        setOverCol(null);
        if (drag) moveCard(drag.cardId, drag.fromCol, col.id);
        setDrag(null);
      }}
    >
      <div className="col-header">
        {editingTitle ? (
          <input
            autoFocus
            className="input"
            value={titleDraft}
            onChange={(e) => setTitleDraft(e.target.value)}
            onBlur={renameCol}
            onKeyDown={(e) => e.key === "Enter" && renameCol()}
          />
        ) : (
          <div
            className="col-title px-label"
            onClick={() => {
              setTitleDraft(col.title);
              setEditingTitle(true);
            }}
            title="Clique para renomear"
          >
            {col.title} <span className="count">{col.cardIds.length}</span>
          </div>
        )}
        {canDelete && <button className="icon-btn" title="Excluir coluna" onClick={deleteCol}>×</button>}
      </div>

      <div className="card-list">
        {col.cardIds.map((id) => {
          const card = board.cards[id];
          if (!card) return null;
          const total = card.checklist.length;
          const done = card.checklist.filter((i) => i.done).length;
          const ds = dueState(card, board);
          return (
            <div
              key={id}
              draggable
              onDragStart={() => setDrag({ cardId: id, fromCol: col.id })}
              onDragEnd={() => setDrag(null)}
              onClick={() => setOpenCard(id)}
              className={`card ${
                card.priority && card.priority !== "nenhuma" ? `p-${card.priority}` : ""
              } ${estaConcluido(board, id) ? "concluido" : ""}`}
            >
              <div className="card-top">
                <ProdTag k={card.product} />
                <span className="card-prod">{(PRODUCTS[card.product] || PRODUCTS.outro).label}</span>
                {card.priority && card.priority !== "nenhuma" && (
                  <span className="prio-flag">{PRIORITIES[card.priority].label}</span>
                )}
                {ds === "atrasado" && <span className="due-flag danger">● atrasado</span>}
                {ds === "hoje" && <span className="due-flag">hoje</span>}
                <button
                  className={`card-ok ${estaConcluido(board, id) ? "feito" : ""}`}
                  title={estaConcluido(board, id) ? "Reabrir" : "Concluir"}
                  aria-label={estaConcluido(board, id) ? "Reabrir tarefa" : "Concluir tarefa"}
                  onClick={(e) => {
                    e.stopPropagation(); // não abre o cartão
                    const fim = colunaFinal(board);
                    if (!fim) return;
                    if (estaConcluido(board, id)) {
                      const anterior =
                        board.columns[Math.max(0, board.columns.indexOf(fim) - 1)];
                      moveCard(id, fim.id, anterior.id);
                    } else {
                      moveCard(id, col.id, fim.id);
                    }
                  }}
                >
                  ✓
                </button>
              </div>
              <div className={`card-title ${estaConcluido(board, id) ? "riscado" : ""}`}>
                {card.title}
              </div>
              {card.due && ds === "futuro" && (
                <div className="card-due">→ {card.due.split("-").reverse().join("/")}</div>
              )}
              {total > 0 && (
                <div className="progress">
                  <div className="track">
                    <div className="fill" style={{ width: `${(done / total) * 100}%` }} />
                  </div>
                  <span className="progress-num">{done}/{total}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {adding ? (
        <div style={{ marginTop: 8 }}>
          <input
            autoFocus
            className="input"
            placeholder="Título do cartão"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCard()}
          />
          <div className="btn-row">
            <button className="btn" onClick={addCard}>Adicionar</button>
            <button className="btn ghost" onClick={() => setAdding(false)}>Fechar</button>
          </div>
        </div>
      ) : (
        <button className="add-card px-label" onClick={() => setAdding(true)}>+ novo cartão</button>
      )}
    </div>
  );
}

// ---------- modal do cartão ----------
function CardModal({ card, board, updateBoard, updateCalendar, askConfirm, sendToTrash, canDelete, close }) {
  const [checkText, setCheckText] = useState("");
  const [tpl, setTpl] = useState("");
  const [schedDate, setSchedDate] = useState(card.due || todayKey());
  const [schedNet, setSchedNet] = useState("Instagram");
  const [schedMsg, setSchedMsg] = useState("");
  const colOf = board.columns.find((c) => c.cardIds.includes(card.id));
  const concluido = estaConcluido(board, card.id);

  // concluir move para a coluna final; reabrir devolve para a anterior
  const alternarConclusao = () =>
    updateBoard((b) => {
      const fim = colunaFinal(b);
      const atual = colunaDoCard(b, card.id);
      if (!fim || !atual) return b;
      const destino = concluido
        ? b.columns[Math.max(0, b.columns.indexOf(fim) - 1)]
        : fim;
      if (destino.id === atual.id) return b;
      atual.cardIds = atual.cardIds.filter((id) => id !== card.id);
      destino.cardIds.push(card.id);
      return b;
    });

  const patch = (fields) =>
    updateBoard((b) => {
      Object.assign(b.cards[card.id], fields);
      return b;
    });

  const addCheck = () => {
    const t = checkText.trim();
    if (!t) return;
    updateBoard((b) => {
      b.cards[card.id].checklist.push({ id: uid(), text: t, done: false });
      return b;
    });
    setCheckText("");
  };

  const applyTemplate = () => {
    if (!tpl || !TEMPLATES[tpl]) return;
    updateBoard((b) => {
      TEMPLATES[tpl].items.forEach((text) =>
        b.cards[card.id].checklist.push({ id: uid(), text, done: false })
      );
      return b;
    });
    setTpl("");
  };

  const moveTo = (colId) =>
    updateBoard((b) => {
      b.columns.forEach((c) => (c.cardIds = c.cardIds.filter((x) => x !== card.id)));
      b.columns.find((c) => c.id === colId).cardIds.push(card.id);
      return b;
    });

  const duplicateCard = () => {
    updateBoard((b) => {
      const nid = uid();
      const copy = structuredClone(b.cards[card.id]);
      copy.id = nid;
      copy.title = copy.title + " (cópia)";
      copy.checklist = copy.checklist.map((i) => ({ ...i, id: uid(), done: false }));
      b.cards[nid] = copy;
      const col = b.columns.find((c) => c.cardIds.includes(card.id)) || b.columns[0];
      col.cardIds.push(nid);
      return b;
    });
    close();
  };

  const deleteCard = () => {
    askConfirm(`Excluir o cartão "${card.title}"? Vai para a lixeira.`, () => {
      sendToTrash({ type: "card", label: card.title, colId: colOf?.id || null, card: structuredClone(card) });
      updateBoard((b) => {
        b.columns.forEach((c) => (c.cardIds = c.cardIds.filter((x) => x !== card.id)));
        delete b.cards[card.id];
        return b;
      });
      close();
    });
  };

  const scheduleToCalendar = () => {
    if (!schedDate) return;
    updateCalendar((c) => {
      if (!c.items[schedDate]) c.items[schedDate] = [];
      c.items[schedDate].push({
        id: uid(),
        title: card.title,
        product: card.product,
        network: schedNet,
        status: "producao",
        cardId: card.id,
      });
      return c;
    });
    setSchedMsg(`Agendado: ${schedDate.split("-").reverse().join("/")} · ${schedNet}`);
    setTimeout(() => setSchedMsg(""), 2500);
  };

  const total = card.checklist.length;
  const done = card.checklist.filter((i) => i.done).length;

  return (
    <Overlay close={close}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <input
            className="input title-input"
            value={card.title}
            onChange={(e) => patch({ title: e.target.value })}
          />
          <button className="icon-btn" onClick={close}>×</button>
        </div>

        <Field label="produto">
          <div className="chip-row">
            {Object.entries(PRODUCTS).map(([k, p]) => (
              <button
                key={k}
                onClick={() => patch({ product: k })}
                className={`chip ${card.product === k ? "sel" : ""}`}
                style={card.product === k ? { borderColor: p.color, color: p.color } : {}}
              >
                {p.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="prioridade">
          <div className="chip-row">
            {Object.entries(PRIORITIES).map(([k, p]) => (
              <button
                key={k}
                onClick={() => patch({ priority: k })}
                className={`chip ${card.priority === k ? "sel" : ""}`}
                style={
                  card.priority === k
                    ? { borderColor: p.chip, color: k === "nenhuma" ? T.ink : p.chip }
                    : {}
                }
              >
                {k !== "nenhuma" && <span className="prio-dot" style={{ background: p.chip }} />}
                {p.label}
              </button>
            ))}
          </div>
        </Field>

        <div className="two-col">
          <Field label="entrega">
            <input type="date" className="input" value={card.due} onChange={(e) => patch({ due: e.target.value })} />
          </Field>
          <Field label="link (drive, figma…)">
            <div style={{ display: "flex", gap: 6 }}>
              <input
                className="input"
                placeholder="https://…"
                value={card.link}
                onChange={(e) => patch({ link: e.target.value })}
              />
              {card.link && (
                <a className="btn" href={card.link} target="_blank" rel="noreferrer">abrir →</a>
              )}
            </div>
          </Field>
        </div>

        <Field label="descrição">
          <textarea
            className="input"
            style={{ minHeight: 64, resize: "vertical" }}
            placeholder="Contexto, referências…"
            value={card.desc}
            onChange={(e) => patch({ desc: e.target.value })}
          />
        </Field>

        <Field label={`checklist ${total > 0 ? `· ${done}/${total}` : ""}`}>
          <div className="tpl-row">
            <select className="input" value={tpl} onChange={(e) => setTpl(e.target.value)}>
              <option value="">— template de checklist —</option>
              {Object.entries(TEMPLATES).map(([k, t]) => (
                <option key={k} value={k}>{t.label}</option>
              ))}
            </select>
            <button className="btn" onClick={applyTemplate}>usar</button>
          </div>
          {total > 0 && (
            <div className="track" style={{ margin: "8px 0" }}>
              <div className="fill" style={{ width: `${(done / total) * 100}%` }} />
            </div>
          )}
          {card.checklist.map((item) => (
            <div key={item.id} className="check-row">
              <button
                className={`checkbox ${item.done ? "on" : ""}`}
                onClick={() =>
                  updateBoard((b) => {
                    const it = b.cards[card.id].checklist.find((x) => x.id === item.id);
                    it.done = !it.done;
                    return b;
                  })
                }
              >
                {item.done ? "✕" : ""}
              </button>
              <span className={`check-text ${item.done ? "done" : ""}`}>{item.text}</span>
              <button
                className="icon-btn"
                onClick={() =>
                  updateBoard((b) => {
                    b.cards[card.id].checklist = b.cards[card.id].checklist.filter((x) => x.id !== item.id);
                    return b;
                  })
                }
              >
                ×
              </button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <input
              className="input"
              placeholder="Novo item"
              value={checkText}
              onChange={(e) => setCheckText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCheck()}
            />
            <button className="btn" onClick={addCheck}>+</button>
          </div>
        </Field>

        <Field label="agendar no calendário">
          <div className="tpl-row">
            <input type="date" className="input" value={schedDate} onChange={(e) => setSchedDate(e.target.value)} />
            <select className="input" value={schedNet} onChange={(e) => setSchedNet(e.target.value)}>
              {NETWORKS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <button className="btn" onClick={scheduleToCalendar}>agendar →</button>
          </div>
          {schedMsg && <div className="sched-ok">✓ {schedMsg}</div>}
        </Field>

        <Field label="mover para">
          <div className="chip-row">
            {board.columns.map((c) => (
              <button
                key={c.id}
                onClick={() => moveTo(c.id)}
                className={`chip ${colOf?.id === c.id ? "sel" : ""}`}
              >
                {c.title}
              </button>
            ))}
          </div>
        </Field>

        <div className="modal-foot">
          <button className="btn accent" onClick={alternarConclusao}>
            {concluido ? "↩ reabrir" : "✓ concluir tarefa"}
          </button>
          <button className="btn ghost" onClick={duplicateCard}>⧉ duplicar</button>
          {canDelete && <button className="btn danger" onClick={deleteCard}>✕ excluir</button>}
        </div>
      </div>
    </Overlay>
  );
}

// ---------- calendário ----------
function Calendar({ calendar, board, month, setMonth, setOpenDay, filter, setFilter }) {
  const { y, m } = month;
  const first = new Date(y, m, 1).getDay();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const tk = todayKey();
  const week = weekRange();

  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const nav = (dir) => {
    let nm = m + dir, ny = y;
    if (nm < 0) { nm = 11; ny--; }
    if (nm > 11) { nm = 0; ny++; }
    setMonth({ y: ny, m: nm });
  };

  const netCount = useMemo(() => {
    const c = {};
    NETWORKS.forEach((n) => (c[n] = 0));
    week.forEach((d) =>
      (calendar.items[d] || []).forEach((it) => {
        if (filter !== "todos" && it.product !== filter) return;
        if (c[it.network] !== undefined) c[it.network]++;
      })
    );
    return c;
  }, [calendar, filter]);

  return (
    <div className="view">
      <div className="cal-nav">
        <button className="btn ghost" onClick={() => nav(-1)}>←</button>
        <div className="cal-month px-label">{MONTHS[m]} {y}</div>
        <button className="btn ghost" onClick={() => nav(1)}>→</button>
      </div>

      <div className="chip-row" style={{ justifyContent: "center", marginBottom: 10 }}>
        <button className={`chip ${filter === "todos" ? "sel" : ""}`} onClick={() => setFilter("todos")}>
          Todos
        </button>
        {Object.entries(PRODUCTS).filter(([k]) => k !== "outro").map(([k, p]) => (
          <button
            key={k}
            className={`chip ${filter === k ? "sel" : ""}`}
            style={filter === k ? { borderColor: p.color, color: p.color } : {}}
            onClick={() => setFilter(k)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="week-bar">
        <span className="px-label">esta semana</span>
        {NETWORKS.map((n) => (
          <span key={n} className={`week-net ${netCount[n] === 0 ? "zero" : ""}`}>
            {n} <b>{netCount[n]}</b>
          </span>
        ))}
      </div>

      <div className="week-row">
        {WEEKDAYS.map((w) => (
          <div key={w} className="weekday px-label">{w}</div>
        ))}
      </div>

      <div className="cal-grid">
        {cells.map((d, i) => {
          if (d === null) return <div key={`e${i}`} className="day blank" />;
          const key = dk(y, m, d);
          const all = calendar.items[key] || [];
          const items = filter === "todos" ? all : all.filter((it) => it.product === filter);
          const isToday = key === tk;
          return (
            <button key={key} className={`day ${isToday ? "today" : ""}`} onClick={() => setOpenDay(key)}>
              <div className="day-num px-label">{d}</div>
              <div className="day-items">
                {items.slice(0, 3).map((it) => {
                  const p = PRODUCTS[it.product] || PRODUCTS.outro;
                  return (
                    <div key={it.id} className={`cal-item ${it.status === "publicado" ? "pub" : ""}`}>
                      <span className="ci-dot" style={{ background: p.color }} />
                      <span className="ci-title">{it.title}</span>
                    </div>
                  );
                })}
                {items.length > 3 && <div className="more">+{items.length - 3}</div>}
              </div>
            </button>
          );
        })}
      </div>

      <div className="cal-legend">
        {Object.entries(PRODUCTS).filter(([k]) => k !== "outro").map(([k, p]) => (
          <span key={k}><span className="lg" style={{ background: p.color }} />{p.label}</span>
        ))}
      </div>
    </div>
  );
}

// ---------- modal do dia ----------
function DayModal({ dateKey: key, calendar, board, updateCalendar, setOpenCard, askConfirm, sendToTrash, canDelete, podeVerQuadro, close }) {
  const items = calendar.items[key] || [];
  const [form, setForm] = useState({ title: "", desc: "", product: "octalab", network: "Instagram", status: "ideia" });
  const [y, m, d] = key.split("-").map(Number);

  const addItem = () => {
    const t = form.title.trim();
    if (!t) return;
    updateCalendar((c) => {
      if (!c.items[key]) c.items[key] = [];
      c.items[key].push({ id: uid(), ...form, title: t, desc: form.desc.trim(), images: [] });
      return c;
    });
    setForm((f) => ({ ...f, title: "", desc: "" }));
  };

  const patchItem = (id, fields) =>
    updateCalendar((c) => {
      const it = c.items[key].find((x) => x.id === id);
      Object.assign(it, fields);
      return c;
    });

  const removeItem = (id) => {
    const it = (calendar.items[key] || []).find((x) => x.id === id);
    askConfirm(`Excluir "${it?.title || "este conteúdo"}"? Vai para a lixeira.`, () => {
      if (it) sendToTrash({ type: "calendar", label: it.title, dateKey: key, item: it });
      updateCalendar((c) => {
        c.items[key] = (c.items[key] || []).filter((x) => x.id !== id);
        if (c.items[key].length === 0) delete c.items[key];
        return c;
      });
    });
  };

  const duplicateItem = (id) =>
    updateCalendar((c) => {
      const it = c.items[key].find((x) => x.id === id);
      c.items[key].push({ ...structuredClone(it), id: uid(), title: it.title + " (cópia)" });
      return c;
    });

  return (
    <Overlay close={close}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title px-label">{String(d).padStart(2, "0")} de {MONTHS[m - 1]} · {y}</div>
          <button className="icon-btn" onClick={close}>×</button>
        </div>

        {items.length === 0 && (
          <div className="empty">Nenhum conteúdo neste dia ainda. Adicione o primeiro abaixo.</div>
        )}

        {items.map((it) => {
          const p = PRODUCTS[it.product] || PRODUCTS.outro;
          const linkedCard = it.cardId && board.cards[it.cardId];
          return (
            <div key={it.id} className="day-item" style={{ borderLeftColor: p.color }}>
              <div className="di-head">
                <div style={{ flex: 1 }}>
                  <div className="di-meta">
                    <ProdTag k={it.product} /> {p.label} ·{" "}
                    <select
                      className="input inline"
                      value={it.network}
                      onChange={(e) => patchItem(it.id, { network: e.target.value })}
                    >
                      {NETWORKS.map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div className="di-title">{it.title}</div>
                </div>
                {canDelete && <button className="icon-btn" onClick={() => removeItem(it.id)}>×</button>}
              </div>
              <ItemMedia item={it} onPatch={(fields) => patchItem(it.id, fields)} canDelete={canDelete} />
              <div className="chip-row" style={{ marginTop: 8 }}>
                {Object.entries(CAL_STATUS).map(([k, s]) => (
                  <button
                    key={k}
                    onClick={() => patchItem(it.id, { status: k })}
                    className={`chip small ${it.status === k ? "sel" : ""}`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="btn-row">
                <button className="btn ghost small" onClick={() => duplicateItem(it.id)}>⧉ duplicar</button>
                {linkedCard && podeVerQuadro && (
                  <button
                    className="btn small"
                    onClick={() => {
                      close();
                      setOpenCard(it.cardId);
                    }}
                  >
                    abrir cartão →
                  </button>
                )}
              </div>
            </div>
          );
        })}

        <Field label="novo conteúdo">
          <input
            className="input"
            placeholder="Título (ex: Reel bastidores)"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && addItem()}
          />
          <textarea
            className="input"
            style={{ marginTop: 8, minHeight: 48, resize: "vertical" }}
            placeholder="Descrição da ideia (opcional)"
            value={form.desc}
            onChange={(e) => setForm({ ...form, desc: e.target.value })}
          />
          <div className="tpl-row" style={{ marginTop: 8 }}>
            <select className="input" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })}>
              {Object.entries(PRODUCTS).map(([k, p]) => (
                <option key={k} value={k}>{p.label}</option>
              ))}
            </select>
            <select className="input" value={form.network} onChange={(e) => setForm({ ...form, network: e.target.value })}>
              {NETWORKS.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {Object.entries(CAL_STATUS).map(([k, s]) => (
                <option key={k} value={k}>{s.label}</option>
              ))}
            </select>
            <button className="btn" onClick={addItem}>adicionar</button>
          </div>
        </Field>
      </div>
    </Overlay>
  );
}

// ---------- tela de entrada: arco orbital (meio círculo) ----------
// Cada tile é posicionado por cálculo de ângulo. Não existe nenhuma
// caixa girando, então nenhum contorno de contêiner pode aparecer.
function Landing({ onEnter, onProduct }) {
  const n = SLOTS.length;

  return (
    <div className="lp">
      <header className="lp-nav">
        <button className="lp-mark" onClick={onEnter} aria-label="Octalab">
          <span className="lp-mark-glyph">✳</span>
          <span className="lp-mark-name">Octalab</span>
        </button>
        <nav className="lp-links">
          {SLOTS.filter((s) => s.files.length > 0).map((s) => (
            <button key={s.key} className="lp-link" onClick={() => onProduct(s.key)}>
              {s.label}
            </button>
          ))}
        </nav>
        <button className="lp-cta-pill" onClick={onEnter}>Entrar no painel</button>
      </header>

      <section className="lp-hero">
        <div className="lp-glow" aria-hidden="true" />

        {/* produtos flutuando em arco: o arco sobe no centro */}
        <div className="lp-orbit">
          {SLOTS.map((s, i) => {
            const t = n === 1 ? 0 : (i / (n - 1)) * 2 - 1;
            return (
              <button
                key={s.key}
                className="lp-chip"
                style={{
                  left: `calc(50% + ${(t * 38).toFixed(2)}%)`,
                  top: `${(t * t * 78).toFixed(1)}px`,
                  "--rot": `${(t * 11).toFixed(1)}deg`,
                  "--delay": `${(i * 0.6).toFixed(2)}s`,
                }}
                onClick={() => onProduct(s.key)}
                aria-label={s.label}
                title={s.label}
              >
                <span className="lp-chip-face">
                  {s.img ? (
                    <img src={s.img} alt="" className="lp-chip-img" />
                  ) : (
                    <span className="lp-chip-tag">{s.tag}</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        <div className="lp-copy">
          <div className="lp-badge">
            <span className="lp-badge-dot" />
            Casa de produtos nativos de IA
          </div>
          <h1 className="lp-title">
            A casa dos produtos
            <br />
            <em>nativos</em> de IA
          </h1>
          <p className="lp-sub">
            Manifesto, identidade e arquivos de marca de cada produto da casa —
            e o painel onde o time planeja e publica o conteúdo.
          </p>
          <div className="lp-actions">
            <button className="lp-btn" onClick={onEnter}>Entrar no painel</button>
            <button className="lp-btn-ghost" onClick={() => onProduct(SLOTS[0].key)}>
              Ver o manifesto
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- métricas da trilha ----------
   As semanas começam na segunda. O que importa aqui é TENDÊNCIA: a queda
   do retrabalho ao longo das semanas é o sinal honesto de aprendizado.
   Contagem pura de tarefas mede o que foi atribuído, não o que evoluiu. */
const chaveSemana = (ts) => {
  const d = new Date(ts);
  const dia = (d.getDay() + 6) % 7; // 0 = segunda
  d.setDate(d.getDate() - dia);
  return dk(d.getFullYear(), d.getMonth(), d.getDate());
};
const semanaAtual = () => chaveSemana(Date.now());
const diasDaSemana = (chave) => {
  const [y, m, d] = chave.split("-").map(Number);
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(y, m - 1, d + i);
    return dk(dt.getFullYear(), dt.getMonth(), dt.getDate());
  });
};
const corCompetenciaMarca = (k) => {
  const i = Object.keys(COMPETENCIAS).indexOf(k);
  return i < 0 ? COR_NEUTRA : PALETA[i % PALETA.length];
};

function analisarTrilha(tarefas, totalModulos = 0, modulosFeitos = 0) {
  const lista = tarefas || [];
  const revisadas = lista.filter((t) => t.status === "revisada");
  const entregues = lista.filter((t) => t.entregueEm);

  // autonomia: aprovada sem ter voltado para refazer nenhuma vez
  const primeiraVez = revisadas.filter(
    (t) => !(t.revisoes || []).some((r) => r.nivel === "refazer")
  ).length;
  const autonomia = revisadas.length ? Math.round((primeiraVez / revisadas.length) * 100) : null;

  // pontualidade: entregue até o prazo
  const comPrazo = entregues.filter((t) => t.prazo);
  const noPrazo = comPrazo.filter((t) => chaveDia(t.entregueEm) <= t.prazo).length;
  const pontualidade = comPrazo.length ? Math.round((noPrazo / comPrazo.length) * 100) : null;

  // retrabalho semana a semana, a partir do log de revisões
  const porSemana = new Map();
  lista.forEach((t) =>
    (t.revisoes || []).forEach((r) => {
      const k = chaveSemana(r.em);
      const at = porSemana.get(k) || { semana: k, refazer: 0, aprovadas: 0 };
      if (r.nivel === "refazer") at.refazer += 1;
      else at.aprovadas += 1;
      porSemana.set(k, at);
    })
  );
  const semanas = [...porSemana.values()]
    .sort((a, b) => (a.semana < b.semana ? -1 : 1))
    .slice(-8)
    .map((s) => {
      const total = s.refazer + s.aprovadas;
      return { ...s, total, taxa: total ? Math.round((s.refazer / total) * 100) : 0 };
    });

  // cobertura: quantas vezes cada competência já foi exercitada
  const cobertura = Object.keys(COMPETENCIAS).map((k) => ({
    chave: k,
    label: COMPETENCIAS[k],
    total: entregues.filter((t) => t.competencia === k).length,
  }));
  const maiorCobertura = Math.max(1, ...cobertura.map((c) => c.total));

  return {
    totalModulos,
    modulosFeitos,
    totalTarefas: lista.length,
    aguardandoRevisao: lista.filter((t) => t.status === "entregue").length,
    entregues: entregues.length,
    revisadas: revisadas.length,
    autonomia,
    pontualidade,
    semanas,
    cobertura,
    maiorCobertura,
  };
}
const chaveDia = (ts) => {
  const d = new Date(ts);
  return dk(d.getFullYear(), d.getMonth(), d.getDate());
};

/* Conquistas: derivadas do documento, nunca gravadas. As bloqueadas ficam
   visíveis de propósito — saber o que falta é parte do incentivo. */
function Conquistas({ trilha, papel }) {
  const ganhas = calcularConquistas(trilha, chaveSemana);
  const porId = Object.fromEntries(ganhas.map((g) => [g.id, g]));
  const total = CONQUISTAS.length;

  return (
    <div className="cq">
      <div className="cq-head">
        <div className="px-label sec" style={{ margin: 0 }}>
          {papel === "mentor" ? "Conquistas da Clara" : "Suas conquistas"}
        </div>
        <span className="cq-conta">{ganhas.length} de {total}</span>
      </div>
      <div className="cq-grid">
        {CONQUISTAS.map((c) => {
          const g = porId[c.id];
          const cat = CATEGORIAS[c.categoria] || {};
          return (
            <div key={c.id} className={`cq-item ${g ? "ganha" : ""}`} title={c.descricao}>
              <span
                className="cq-dot"
                style={{ background: g ? cat.cor : undefined }}
              />
              <div className="cq-txt">
                <div className="cq-tit">{c.titulo}</div>
                <div className="cq-desc">{c.descricao}</div>
                {g?.desde && (
                  <div className="cq-desde">
                    conquistada em {new Date(g.desde).toLocaleDateString("pt-BR")}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Painel do mentor: três tendências e a cobertura. Sem "horas
   trabalhadas" nem contagem pura de tarefas — a primeira mede presença,
   a segunda mede o que foi atribuído. */
function PainelMetricas({ m }) {
  const semDados = m.revisadas === 0 && m.entregues === 0 && m.totalModulos === 0;
  if (semDados) {
    return (
      <div className="empty">
        As métricas aparecem depois das primeiras entregas revisadas.
      </div>
    );
  }
  const ultima = m.semanas[m.semanas.length - 1];
  const anterior = m.semanas[m.semanas.length - 2];
  const tendencia =
    ultima && anterior ? ultima.taxa - anterior.taxa : null;

  return (
    <div className="pm">
      <div className="pm-tiles">
        {m.totalModulos > 0 && (
          <div className="pm-tile destaque">
            <div className="pm-num">
              {m.modulosFeitos}<span className="pm-de">/{m.totalModulos}</span>
            </div>
            <div className="pm-cap">módulos concluídos</div>
          </div>
        )}
        <div className="pm-tile">
          <div className="pm-num">{m.autonomia === null ? "—" : `${m.autonomia}%`}</div>
          <div className="pm-cap">
            aprovadas de primeira
            <span className="pm-hint" title="Revisadas sem nenhum retorno de 'refazer'. É a métrica que mais se aproxima de autonomia.">?</span>
          </div>
        </div>
        <div className="pm-tile">
          <div className="pm-num">{m.pontualidade === null ? "—" : `${m.pontualidade}%`}</div>
          <div className="pm-cap">entregues no prazo</div>
        </div>
        <div className="pm-tile">
          <div className="pm-num">{m.revisadas}</div>
          <div className="pm-cap">
            tarefas concluídas
            {m.aguardandoRevisao > 0 && (
              <span className="pm-pend">{m.aguardandoRevisao} a revisar</span>
            )}
          </div>
        </div>
      </div>

      {m.semanas.length > 0 && (
        <div className="pm-bloco">
          <div className="pm-bloco-head">
            <span className="pm-bloco-titulo">Retrabalho por semana</span>
            {tendencia !== null && (
              <span className={`pm-trend ${tendencia <= 0 ? "bom" : "ruim"}`}>
                {tendencia === 0
                  ? "estável"
                  : tendencia < 0
                  ? `caiu ${Math.abs(tendencia)} pontos`
                  : `subiu ${tendencia} pontos`}
              </span>
            )}
          </div>
          <div className="pm-barras">
            {m.semanas.map((s) => (
              <div key={s.semana} className="pm-col" title={`${s.refazer} de ${s.total} revisões voltaram para refazer`}>
                <div className="pm-col-valor">{s.taxa}%</div>
                <div className="pm-col-trilho">
                  <div
                    className="pm-col-fill"
                    style={{ height: `${Math.max(s.taxa, 2)}%` }}
                  />
                </div>
                <div className="pm-col-label">{fmtShort(s.semana)}</div>
              </div>
            ))}
          </div>
          <div className="pm-nota">
            Quanto menor, melhor. A queda ao longo das semanas é o sinal mais
            honesto de que ela está aprendendo.
          </div>
        </div>
      )}

      <div className="pm-bloco">
        <div className="pm-bloco-head">
          <span className="pm-bloco-titulo">Cobertura por competência</span>
        </div>
        <ul className="pm-cob">
          {m.cobertura.map((c) => (
            <li key={c.chave}>
              <span className="pm-cob-nome">{c.label}</span>
              <span className="pm-cob-trilho">
                <span
                  className="pm-cob-fill"
                  style={{
                    width: `${(c.total / m.maiorCobertura) * 100}%`,
                    background: corCompetenciaMarca(c.chave),
                  }}
                />
              </span>
              <span className="pm-cob-num">{c.total}</span>
            </li>
          ))}
        </ul>
        <div className="pm-nota">
          Áreas em zero são as que ainda não foram exercitadas.
        </div>
      </div>
    </div>
  );
}

/* Relatório da semana. Vem pré-preenchido com o que o sistema já sabe —
   é isso que faz ele ser escrito, em vez de virar folha em branco na
   sexta às 18h. */
function RelatorioSemana({ tarefas, relatorios, updateTrilha, papel }) {
  const semana = semanaAtual();
  const dias = diasDaSemana(semana);
  const jaEnviado = (relatorios || []).find((r) => r.semana === semana);

  const daSemana = (tarefas || []).filter(
    (t) => t.entregueEm && dias.includes(chaveDia(t.entregueEm))
  );
  const competencias = [...new Set(daSemana.map((t) => t.competencia))];
  const aprendizados = daSemana
    .filter((t) => (t.aprendizado || "").trim())
    .map((t) => ({ titulo: t.titulo, texto: t.aprendizado }));

  const [form, setForm] = useState({ importante: "", travou: "", proxima: "" });
  const [coment, setComent] = useState("");

  const enviar = () => {
    if (!form.importante.trim()) return;
    updateTrilha((t) => {
      t.relatorios = [
        ...(t.relatorios || []),
        {
          id: uid(),
          semana,
          enviadoEm: Date.now(),
          resumo: {
            entregues: daSemana.length,
            competencias,
            aprendizados,
          },
          ...form,
          comentario: "",
        },
      ];
      return t;
    });
  };

  const comentar = (id) =>
    updateTrilha((t) => {
      const r = (t.relatorios || []).find((x) => x.id === id);
      if (r) {
        r.comentario = coment.trim();
        r.comentadoEm = Date.now();
      }
      return t;
    });

  const periodo = `${fmtShort(dias[0])} – ${fmtShort(dias[6])}`;

  return (
    <div className="rel">
      <div className="rel-head">
        <span className="rel-titulo">Relatório da semana</span>
        <span className="rel-periodo">{periodo}</span>
      </div>

      {/* o que o sistema já sabe */}
      <div className="rel-resumo">
        <div className="rel-linha">
          <strong>{jaEnviado ? jaEnviado.resumo.entregues : daSemana.length}</strong>{" "}
          {(jaEnviado ? jaEnviado.resumo.entregues : daSemana.length) === 1
            ? "entrega"
            : "entregas"}{" "}
          nesta semana
        </div>
        <div className="rel-comps">
          {(jaEnviado ? jaEnviado.resumo.competencias : competencias).map((c) => (
            <span key={c} className="chip small" style={{ color: corCompetencia(c) }}>
              {COMPETENCIAS[c]}
            </span>
          ))}
          {(jaEnviado ? jaEnviado.resumo.competencias : competencias).length === 0 && (
            <span className="rel-nada">nenhuma competência registrada ainda</span>
          )}
        </div>
        {(jaEnviado ? jaEnviado.resumo.aprendizados : aprendizados).length > 0 && (
          <ul className="rel-aprend">
            {(jaEnviado ? jaEnviado.resumo.aprendizados : aprendizados).map((a, i) => (
              <li key={i}>
                <span className="ra-tit">{a.titulo || "sem título"}</span>
                <span className="ra-txt">{a.texto}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {jaEnviado ? (
        <div className="rel-enviado">
          <Campo titulo="O que aprendi de mais importante" texto={jaEnviado.importante} />
          <Campo titulo="O que travou" texto={jaEnviado.travou} />
          <Campo titulo="O que quero aprender na próxima" texto={jaEnviado.proxima} />

          {jaEnviado.comentario ? (
            <div className="rel-coment">
              <div className="px-label sec">Retorno do mentor</div>
              <p className="tr-desc">{jaEnviado.comentario}</p>
            </div>
          ) : papel === "mentor" ? (
            <div className="rel-coment">
              <Field label="Seu retorno sobre a semana">
                <textarea
                  className="input"
                  rows={3}
                  value={coment}
                  onChange={(e) => setComent(e.target.value)}
                />
              </Field>
              <button
                className="btn"
                onClick={() => comentar(jaEnviado.id)}
                disabled={!coment.trim()}
              >
                enviar retorno
              </button>
            </div>
          ) : (
            <div className="rel-aguardando">Enviado. Aguardando o retorno do mentor.</div>
          )}
        </div>
      ) : papel === "aprendiz" ? (
        <div className="rel-form">
          <Field label="O que aprendi de mais importante">
            <textarea
              className="input"
              rows={3}
              value={form.importante}
              placeholder="Uma coisa concreta que você não sabia na segunda."
              onChange={(e) => setForm({ ...form, importante: e.target.value })}
            />
          </Field>
          <Field label="O que travou">
            <textarea
              className="input"
              rows={2}
              value={form.travou}
              placeholder="Onde você perdeu tempo ou ficou sem saber como seguir."
              onChange={(e) => setForm({ ...form, travou: e.target.value })}
            />
          </Field>
          <Field label="O que quero aprender na próxima">
            <textarea
              className="input"
              rows={2}
              value={form.proxima}
              onChange={(e) => setForm({ ...form, proxima: e.target.value })}
            />
          </Field>
          <button className="btn accent" onClick={enviar} disabled={!form.importante.trim()}>
            enviar relatório
          </button>
          <div className="tr-aviso">
            Depois de enviar, o relatório congela como registro da semana.
          </div>
        </div>
      ) : (
        <div className="rel-aguardando">Ela ainda não enviou o relatório desta semana.</div>
      )}
    </div>
  );
}

function Campo({ titulo, texto }) {
  if (!(texto || "").trim()) return null;
  return (
    <div className="rel-campo">
      <div className="rel-campo-tit">{titulo}</div>
      <p className="tr-desc">{texto}</p>
    </div>
  );
}

/* ---------- prova do módulo ----------
   Múltipla escolha corrige sozinha; questão aberta precisa de gente. Como o
   objetivo é validar entendimento, o parecer do mentor é obrigatório para
   fechar — o número de acertos sozinho não diz se ela entendeu. */
function ProvaModulo({
  modulo: m,
  prova,
  papel,
  responder,
  enviar,
  validar,
  devolver,
  addQuestao,
  patchQuestao,
  removerQuestao,
}) {
  const ehMentor = papel === "mentor";
  const questoes = m.prova?.questoes || [];
  const status = prova?.status || "aberta";
  const respostas = prova?.respostas || {};

  const [validacao, setValidacao] = useState(prova?.validacao || {});
  const [parecer, setParecer] = useState(prova?.parecer || "");

  const multiplas = questoes.filter((q) => q.tipo === "multipla");
  const acertos = multiplas.filter((q) => respostas[q.id] === q.correta).length;
  const abertas = questoes.filter((q) => q.tipo === "aberta");
  const respondidas = questoes.filter(
    (q) => respostas[q.id] !== undefined && String(respostas[q.id]).trim() !== ""
  ).length;
  const completa = respondidas === questoes.length && questoes.length > 0;

  if (questoes.length === 0 && !ehMentor) return null;

  return (
    <div className="tl-secao pv">
      <div className="pv-head">
        <div className="px-label sec" style={{ margin: 0 }}>Prova do módulo</div>
        {questoes.length > 0 && (
          <span className={`pv-status st-${status}`}>
            {status === "aberta" && `${respondidas}/${questoes.length} respondidas`}
            {status === "enviada" && "aguardando validação"}
            {status === "validada" && "validada"}
          </span>
        )}
      </div>

      {questoes.length === 0 && ehMentor && (
        <div className="tl-vazio-txt">
          Nenhuma questão ainda. Enquanto não houver, o módulo fecha só com as tarefas.
        </div>
      )}

      <ol className="pv-lista">
        {questoes.map((q, i) => {
          const resp = respostas[q.id];
          const marcaMentor = validacao[q.id] || prova?.validacao?.[q.id];
          return (
            <li key={q.id} className="pv-q">
              {ehMentor && status === "aberta" ? (
                <div className="pv-edit">
                  <textarea
                    className="input"
                    rows={2}
                    value={q.enunciado}
                    placeholder={`Enunciado da questão ${i + 1}`}
                    onChange={(e) => patchQuestao(m, q.id, { enunciado: e.target.value })}
                  />
                  {q.tipo === "multipla" && (
                    <div className="pv-opcoes-edit">
                      {(q.opcoes || []).map((op, oi) => (
                        <label key={oi} className="pv-op-edit">
                          <input
                            type="radio"
                            name={`correta-${q.id}`}
                            checked={q.correta === oi}
                            onChange={() => patchQuestao(m, q.id, { correta: oi })}
                            title="Marcar como resposta correta"
                          />
                          <input
                            className="input"
                            value={op}
                            placeholder={`Alternativa ${oi + 1}`}
                            onChange={(e) => {
                              const opcoes = [...q.opcoes];
                              opcoes[oi] = e.target.value;
                              patchQuestao(m, q.id, { opcoes });
                            }}
                          />
                        </label>
                      ))}
                      <button
                        className="add-card"
                        onClick={() =>
                          patchQuestao(m, q.id, { opcoes: [...(q.opcoes || []), ""] })
                        }
                      >
                        + alternativa
                      </button>
                    </div>
                  )}
                  <div className="pv-edit-pe">
                    <span className="pv-tipo">
                      {q.tipo === "multipla" ? "múltipla escolha" : "resposta aberta"}
                    </span>
                    <button className="icon-btn" onClick={() => removerQuestao(m, q.id)}>×</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="pv-enunciado">{q.enunciado || "questão sem enunciado"}</div>

                  {q.tipo === "multipla" ? (
                    <div className="pv-opcoes">
                      {(q.opcoes || []).map((op, oi) => {
                        const escolhida = resp === oi;
                        const correta = q.correta === oi;
                        const revelar = status !== "aberta" || ehMentor;
                        return (
                          <label
                            key={oi}
                            className={`pv-op ${escolhida ? "escolhida" : ""} ${
                              revelar && correta ? "correta" : ""
                            } ${revelar && escolhida && !correta ? "errada" : ""}`}
                          >
                            <input
                              type="radio"
                              name={`q-${q.id}`}
                              checked={escolhida}
                              disabled={ehMentor || status !== "aberta"}
                              onChange={() => responder(m.id, q.id, oi)}
                            />
                            <span>{op || `alternativa ${oi + 1}`}</span>
                            {revelar && correta && <span className="pv-marca">correta</span>}
                          </label>
                        );
                      })}
                    </div>
                  ) : status === "aberta" && !ehMentor ? (
                    <textarea
                      className="input"
                      rows={3}
                      value={resp || ""}
                      placeholder="Sua resposta"
                      onChange={(e) => responder(m.id, q.id, e.target.value)}
                    />
                  ) : (
                    <div className="pv-resposta">
                      {String(resp || "").trim() || <em>sem resposta</em>}
                    </div>
                  )}

                  {/* validação por questão aberta */}
                  {q.tipo === "aberta" && ehMentor && status === "enviada" && (
                    <div className="pv-val">
                      {["ok", "refazer"].map((v) => (
                        <button
                          key={v}
                          className={`chip small ${validacao[q.id] === v ? "sel" : ""}`}
                          onClick={() => setValidacao({ ...validacao, [q.id]: v })}
                        >
                          {v === "ok" ? "aceita" : "refazer"}
                        </button>
                      ))}
                    </div>
                  )}
                  {q.tipo === "aberta" && status === "validada" && marcaMentor && (
                    <div className={`pv-veredito ${marcaMentor}`}>
                      {marcaMentor === "ok" ? "aceita" : "precisa refazer"}
                    </div>
                  )}
                </>
              )}
            </li>
          );
        })}
      </ol>

      {ehMentor && status === "aberta" && (
        <div className="btn-row">
          <button className="btn ghost small" onClick={() => addQuestao(m, "multipla")}>
            + múltipla escolha
          </button>
          <button className="btn ghost small" onClick={() => addQuestao(m, "aberta")}>
            + resposta aberta
          </button>
        </div>
      )}

      {/* placar das múltiplas, quando já dá para saber */}
      {multiplas.length > 0 && status !== "aberta" && (
        <div className="pv-placar">
          {acertos} de {multiplas.length} acertos nas de múltipla escolha
        </div>
      )}

      {/* enviar (aprendiz) */}
      {!ehMentor && status === "aberta" && questoes.length > 0 && (
        <div className="pv-pe">
          <button className="btn" onClick={() => enviar(m.id)} disabled={!completa}>
            enviar para validação
          </button>
          {!completa && (
            <span className="tr-aviso">Responda todas as questões para enviar.</span>
          )}
        </div>
      )}
      {!ehMentor && status === "enviada" && (
        <div className="rel-aguardando">Enviada. Aguardando a validação do mentor.</div>
      )}

      {/* validar (mentor) */}
      {ehMentor && status === "enviada" && (
        <div className="pv-pe-mentor">
          <Field label="Parecer sobre a prova">
            <textarea
              className="input"
              rows={3}
              value={parecer}
              placeholder="O que ela entendeu bem e o que ainda está raso."
              onChange={(e) => setParecer(e.target.value)}
            />
          </Field>
          <div className="btn-row">
            <button
              className="btn"
              onClick={() => validar(m.id, validacao, parecer)}
              disabled={
                !parecer.trim() || abertas.some((q) => !validacao[q.id])
              }
              title={
                abertas.some((q) => !validacao[q.id])
                  ? "Marque cada resposta aberta como aceita ou refazer"
                  : "Validar a prova"
              }
            >
              validar prova
            </button>
            <button
              className="btn ghost"
              onClick={() => devolver(m.id, validacao, parecer)}
              disabled={!parecer.trim()}
            >
              devolver para refazer
            </button>
          </div>
        </div>
      )}

      {status === "validada" && prova?.parecer && (
        <div className="pv-parecer">
          <div className="px-label sec">Parecer do mentor</div>
          <p className="tr-desc">{prova.parecer}</p>
        </div>
      )}
    </div>
  );
}

/* Mapa da trilha: nós circulares numerados sobre uma fita que serpenteia,
   alternando a curva para cima e para baixo. A fita é SVG (só o traço) e os
   nós são HTML por cima — assim o texto continua selecionável e os nós são
   botões de verdade, não formas dentro de um desenho. */
/* soma HH:MM:SS de uma lista de partes, para mostrar o peso do módulo */
function somaDuracao(itens) {
  const segs = (itens || []).reduce((tot, c) => {
    const p = String(c.duracao || "").split(":").map(Number);
    if (p.length !== 3 || p.some(isNaN)) return tot;
    return tot + p[0] * 3600 + p[1] * 60 + p[2];
  }, 0);
  if (!segs) return "";
  const h = Math.floor(segs / 3600);
  const mi = Math.round((segs % 3600) / 60);
  return h > 0 ? `${h}h${String(mi).padStart(2, "0")}` : `${mi}min`;
}

const MAPA = { passo: 158, raio: 34, curva: 40, linha: 228, margem: 46, porLinha: 6 };

/* Posição de cada nó: as linhas alternam de direção, como texto em
   boustrofédon. Com muitos módulos, uma linha só viraria uma rolagem
   horizontal enorme. */
function posicoesMapa(n) {
  const { passo, raio, linha, margem, porLinha } = MAPA;
  return Array.from({ length: n }, (_, k) => {
    const fila = Math.floor(k / porLinha);
    const dentro = k % porLinha;
    const col = fila % 2 === 0 ? dentro : porLinha - 1 - dentro;
    return {
      x: margem + raio + col * passo,
      y: margem + raio + fila * linha + linha * 0.28,
      fila,
    };
  });
}

function MapaTrilha({ modulos, statusModulo, progresso, selecionado, onSelecionar }) {
  const n = modulos.length;
  const { passo, raio, curva, linha, margem, porLinha } = MAPA;
  const pos = posicoesMapa(n);
  const filas = Math.max(1, Math.ceil(n / porLinha));
  const colsUsadas = Math.min(n, porLinha);
  const largura = margem * 2 + Math.max(0, colsUsadas - 1) * passo + raio * 2;
  const altura = margem + filas * linha + raio;

  return (
    <div className="mp-wrap">
      <div className="mp" style={{ width: largura, height: altura }}>
        <svg className="mp-fita" width={largura} height={altura} aria-hidden="true">
          {modulos.slice(0, -1).map((m, i) => {
            const a = pos[i];
            const b = pos[i + 1];
            let d;
            if (a.fila === b.fila) {
              // dentro da mesma linha: curva em S, alternando acima e abaixo
              const bojo = i % 2 === 0 ? -curva : curva;
              d = `M ${a.x} ${a.y} C ${a.x + (b.x - a.x) * 0.42} ${a.y + bojo}, ${
                b.x - (b.x - a.x) * 0.42
              } ${b.y + bojo} ${b.x} ${b.y}`;
            } else {
              // troca de linha: desce pela laterala e volta
              const meioY = (a.y + b.y) / 2;
              const fora = a.x > largura / 2 ? curva : -curva;
              d = `M ${a.x} ${a.y} C ${a.x + fora} ${meioY - 10}, ${
                b.x + fora
              } ${meioY + 10} ${b.x} ${b.y}`;
            }
            const percorrido = statusModulo(m.id) === "concluido";
            return <path key={m.id} d={d} className={`mp-seg ${percorrido ? "feito" : ""}`} />;
          })}
        </svg>

        {modulos.map((m, i) => {
          const st = statusModulo(m.id);
          const pr = progresso(m.id);
          // com o mapa em várias linhas, alternar o lado do rótulo fazia os
          // de uma linha baterem nos da linha seguinte. Rótulo sempre abaixo.
          const acima = false;
          return (
            <div
              key={m.id}
              className={`mp-no ${st} ${selecionado === m.id ? "sel" : ""} ${
                acima ? "rot-acima" : "rot-abaixo"
              }`}
              style={{
                left: pos[i].x - raio,
                top: pos[i].y - raio,
                width: raio * 2,
                height: raio * 2,
              }}
            >
              <button
                className="mp-circulo"
                onClick={() => onSelecionar(m.id)}
                aria-label={`Módulo ${i + 1}: ${m.titulo || "sem título"}`}
                title={m.titulo || "sem título"}
              >
                {st === "concluido" ? (
                  <span className="mp-check">✓</span>
                ) : pr.total > 0 ? (
                  <span className="mp-frac">
                    {pr.feitas}<span className="mp-de">/{pr.total}</span>
                  </span>
                ) : (
                  <span className="mp-vazio">—</span>
                )}
              </button>
              <span className="mp-selo">{i + 1}</span>
              <span className="mp-rotulo">
                {m.titulo || "sem título"}
                <span className="mp-comp" style={{ color: corCompetencia(m.competencia) }}>
                  {COMPETENCIAS[m.competencia] || ""}
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---------- trilha de desenvolvimento ----------
   Um caminho, não um quadro. Módulos ordenados: cada um tem um objetivo
   de aprendizado, material para estudar e as tarefas que provam que o
   assunto foi absorvido. O módulo fecha quando todas as tarefas dele
   foram aprovadas. */
function Trilha({ trilha, updateTrilha, papel, askConfirm, canDelete }) {
  const tarefas = trilha?.tarefas || [];
  const todosModulos = [...(trilha?.modulos || [])].sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
  const materias = [...(trilha?.materias || [])].sort((a, b) => (a.ordem || 0) - (b.ordem || 0));
  const [aberta, setAberta] = useState(null);
  const [expandido, setExpandido] = useState(null);
  const [materiaSel, setMateriaSel] = useState(null);
  // permite abrir um módulo específico via ?mod=<id>
  const [modInicial, matInicial] = (() => {
    try {
      const q = new URLSearchParams(window.location.search);
      return [q.get("mod"), q.get("mat")];
    } catch { return [null, null]; }
  })();
  const ehMentor = papel === "mentor";

  // matéria ativa: a escolhida, ou a primeira da lista
  const materiaAtiva = materiaSel ?? matInicial ?? materias[0]?.id ?? null;
  // módulos sem matéria caem na primeira, para nada desaparecer
  const modulos = materias.length
    ? todosModulos.filter(
        (m) => (m.materiaId || materias[0].id) === materiaAtiva
      )
    : todosModulos;

  const tarefasDo = (modId) => tarefas.filter((t) => (t.moduloId || null) === modId);
  // órfã é a tarefa sem módulo em nenhuma matéria. Comparar com a lista já
  // filtrada fazia as tarefas das outras matérias aparecerem como soltas.
  const semModulo = tarefas.filter(
    (t) => !t.moduloId || !todosModulos.some((m) => m.id === t.moduloId)
  );

  const progresso = (modId) => {
    const lista = tarefasDo(modId);
    const feitas = lista.filter((t) => t.status === "revisada").length;
    return { feitas, total: lista.length, pct: lista.length ? (feitas / lista.length) * 100 : 0 };
  };
  const provaDe = (modId) => (trilha?.provas || {})[modId] || null;
  const temProva = (mod) => ((mod?.prova?.questoes || []).length > 0);
  const provaOk = (mod) => !mod || !temProva(mod) || provaDe(mod.id)?.status === "validada";

  const statusModulo = (modId) => {
    const mod = todosModulos.find((m) => m.id === modId);
    const { feitas, total } = progresso(modId);
    const conteudo = mod?.conteudo || [];
    const pv = provaDe(modId);

    /* Um módulo pode ter tarefas, prova, conteúdo — ou só alguns deles.
       Cada um que existe é um portão; o módulo fecha quando todos os
       portões existentes estão satisfeitos. Exigir tarefa sempre deixava
       módulos só de leitura impossíveis de concluir. */
    const portoes = [];
    if (total > 0) portoes.push(feitas === total);
    if (temProva(mod)) portoes.push(pv?.status === "validada");
    if (conteudo.length > 0) portoes.push(conteudo.every((c) => c.visto));

    if (portoes.length > 0 && portoes.every(Boolean)) return "concluido";

    const mexeu =
      tarefasDo(modId).some((t) => t.status !== "afazer") ||
      Boolean(pv && pv.status !== "aberta") ||
      conteudo.some((c) => c.visto);
    return mexeu ? "emcurso" : "aseguir";
  };

  // o módulo atual é o primeiro que ainda não fechou: é onde ela está no caminho
  const atual = modulos.find((m) => statusModulo(m.id) !== "concluido");
  const concluidos = modulos.filter((m) => statusModulo(m.id) === "concluido").length;

  // abre o módulo atual por padrão
  const aberto = expandido ?? modInicial ?? atual?.id ?? modulos[0]?.id ?? null;

  const criarMateria = () =>
    updateTrilha((t) => {
      const ordem = Math.max(0, ...(t.materias || []).map((x) => x.ordem || 0)) + 1;
      t.materias = [...(t.materias || []), { ...NOVA_MATERIA(), ordem, nome: "Nova matéria" }];
      return t;
    });
  const patchMateria = (id, campos) =>
    updateTrilha((t) => {
      const x = (t.materias || []).find((y) => y.id === id);
      if (x) Object.assign(x, campos);
      return t;
    });
  const removerMateria = (mt) =>
    askConfirm(
      `Excluir a matéria "${mt.nome}"? Os módulos dela ficam sem matéria.`,
      () =>
        updateTrilha((t) => {
          t.materias = t.materias.filter((x) => x.id !== mt.id);
          (t.modulos || []).forEach((m) => {
            if (m.materiaId === mt.id) m.materiaId = null;
          });
          return t;
        })
    );

  const criarModulo = () =>
    updateTrilha((t) => {
      const ordem = Math.max(0, ...(t.modulos || []).map((m) => m.ordem || 0)) + 1;
      t.modulos = [...(t.modulos || []), { ...NOVO_MODULO(), ordem, materiaId: materiaAtiva }];
      return t;
    });

  const patchModulo = (id, campos) =>
    updateTrilha((t) => {
      const m = (t.modulos || []).find((x) => x.id === id);
      if (m) Object.assign(m, campos);
      return t;
    });

  const removerModulo = (m) =>
    askConfirm(
      `Excluir o módulo "${m.titulo || "sem título"}"? As tarefas dele ficam sem módulo.`,
      () =>
        updateTrilha((t) => {
          t.modulos = t.modulos.filter((x) => x.id !== m.id);
          (t.tarefas || []).forEach((tf) => {
            if (tf.moduloId === m.id) tf.moduloId = null;
          });
          return t;
        })
    );

  const criarTarefa = (moduloId, competencia) =>
    updateTrilha((t) => {
      t.tarefas = [...(t.tarefas || []), { ...NOVA_TAREFA(), moduloId, competencia }];
      return t;
    });

  const patchTarefa = (id, campos) =>
    updateTrilha((t) => {
      const tf = (t.tarefas || []).find((x) => x.id === id);
      if (tf) Object.assign(tf, campos);
      return t;
    });

  const removerTarefa = (tf) =>
    askConfirm(`Excluir a tarefa "${tf.titulo || "sem título"}"?`, () => {
      updateTrilha((t) => {
        t.tarefas = t.tarefas.filter((x) => x.id !== tf.id);
        return t;
      });
      setAberta(null);
    });

  // ---- prova do módulo ----
  const patchProva = (modId, campos) =>
    updateTrilha((t) => {
      t.provas = t.provas || {};
      t.provas[modId] = { ...(t.provas[modId] || {}), ...campos };
      return t;
    });

  const responder = (modId, qid, valor) =>
    updateTrilha((t) => {
      t.provas = t.provas || {};
      const pv = t.provas[modId] || { respostas: {}, status: "aberta" };
      pv.respostas = { ...(pv.respostas || {}), [qid]: valor };
      pv.status = pv.status === "validada" ? "validada" : "aberta";
      t.provas[modId] = pv;
      return t;
    });

  const enviarProva = (modId) =>
    patchProva(modId, { status: "enviada", enviadaEm: Date.now() });

  const validarProva = (modId, validacao, parecer) =>
    patchProva(modId, {
      status: "validada",
      validacao,
      parecer,
      validadaEm: Date.now(),
    });

  const devolverProva = (modId, validacao, parecer) =>
    patchProva(modId, {
      status: "aberta",
      validacao,
      parecer,
      devolvidaEm: Date.now(),
    });

  const addQuestao = (m, tipo) =>
    patchModulo(m.id, {
      prova: {
        questoes: [
          ...(m.prova?.questoes || []),
          tipo === "multipla"
            ? { id: uid(), tipo: "multipla", enunciado: "", opcoes: ["", "", ""], correta: 0 }
            : { id: uid(), tipo: "aberta", enunciado: "" },
        ],
      },
    });
  const patchQuestao = (m, qid, campos) =>
    patchModulo(m.id, {
      prova: {
        questoes: (m.prova?.questoes || []).map((q) =>
          q.id === qid ? { ...q, ...campos } : q
        ),
      },
    });
  const removerQuestao = (m, qid) =>
    patchModulo(m.id, {
      prova: { questoes: (m.prova?.questoes || []).filter((q) => q.id !== qid) },
    });

  // ---- conteúdo do curso (aulas e partes) ----
  const addConteudo = (m) =>
    patchModulo(m.id, {
      conteudo: [...(m.conteudo || []), { id: uid(), titulo: "", duracao: "", temas: "", visto: false }],
    });
  const patchConteudo = (m, cid, campos) =>
    patchModulo(m.id, {
      conteudo: (m.conteudo || []).map((c) => (c.id === cid ? { ...c, ...campos } : c)),
    });
  const removerConteudo = (m, cid) =>
    patchModulo(m.id, { conteudo: (m.conteudo || []).filter((c) => c.id !== cid) });

  const addRecurso = (m, comTexto = false) =>
    patchModulo(m.id, {
      recursos: [
        ...(m.recursos || []),
        comTexto
          ? { id: uid(), titulo: "", texto: "" }
          : { id: uid(), titulo: "", url: "" },
      ],
    });
  const patchRecurso = (m, rid, campos) =>
    patchModulo(m.id, {
      recursos: (m.recursos || []).map((r) => (r.id === rid ? { ...r, ...campos } : r)),
    });
  const removerRecurso = (m, rid) =>
    patchModulo(m.id, { recursos: (m.recursos || []).filter((r) => r.id !== rid) });

  const tarefaAberta = tarefas.find((t) => t.id === aberta) || null;
  const aRevisar = tarefas.filter((t) => t.status === "entregue");
  const provasEnviadas = modulos.filter((m) => provaDe(m.id)?.status === "enviada");

  return (
    <div className="view">
      <div className="tr-top">
        <div>
          <div className="tr-titulo">
            {ehMentor ? `Trilha da ${APRENDIZ}` : "Minha trilha"}
          </div>
          <div className="tr-sub">
            {ehMentor
              ? "Monte o caminho em módulos: objetivo, material de estudo e as tarefas que comprovam o aprendizado."
              : "Percorra os módulos na ordem. Estude o material, faça as tarefas e registre o que aprendeu."}
          </div>
        </div>
        {ehMentor && <button className="btn accent" onClick={criarModulo}>+ novo módulo</button>}
      </div>

      {(materias.length > 0 || ehMentor) && (
        <div className="mt-abas">
          {materias.map((mt) => {
            const doGrupo = todosModulos.filter(
              (m) => (m.materiaId || materias[0].id) === mt.id
            );
            const feitos = doGrupo.filter((m) => statusModulo(m.id) === "concluido").length;
            return (
              <button
                key={mt.id}
                className={`mt-aba ${materiaAtiva === mt.id ? "sel" : ""}`}
                onClick={() => { setMateriaSel(mt.id); setExpandido(null); }}
              >
                {mt.nome || "sem nome"}
                {doGrupo.length > 0 && (
                  <span className="mt-conta">{feitos}/{doGrupo.length}</span>
                )}
              </button>
            );
          })}
          {ehMentor && (
            <button className="mt-add" onClick={criarMateria} title="Nova matéria">
              + matéria
            </button>
          )}
        </div>
      )}

      {ehMentor && materiaAtiva && (
        <div className="mt-edit">
          <input
            className="input mt-nome"
            value={materias.find((x) => x.id === materiaAtiva)?.nome || ""}
            placeholder="Nome da matéria"
            onChange={(e) => patchMateria(materiaAtiva, { nome: e.target.value })}
          />
          {canDelete && (
            <button
              className="link-btn"
              onClick={() => removerMateria(materias.find((x) => x.id === materiaAtiva))}
            >
              excluir matéria
            </button>
          )}
        </div>
      )}

      {modulos.length > 0 && (
        <div className="tl-progresso">
          <div className="tl-prog-barra">
            <span
              className="tl-prog-fill"
              style={{ width: `${(concluidos / modulos.length) * 100}%` }}
            />
          </div>
          <div className="tl-prog-txt">
            {concluidos} de {modulos.length} módulos concluídos
            {atual && <> · você está em <strong>{atual.titulo || "módulo sem título"}</strong></>}
          </div>
        </div>
      )}

      <Conquistas trilha={trilha} papel={papel} />

      {ehMentor && (aRevisar.length > 0 || provasEnviadas.length > 0) && (
        <div className="tr-fila">
          <div className="px-label sec">Esperando sua validação</div>
          {provasEnviadas.map((m) => (
            <button key={m.id} className="row" onClick={() => setExpandido(m.id)}>
              <span className="prova-selo">prova</span>
              <span className="row-title">{m.titulo || "módulo sem título"}</span>
              <span className="row-end">validar →</span>
            </button>
          ))}
          {aRevisar.map((tf) => (
            <button key={tf.id} className="row" onClick={() => setAberta(tf.id)}>
              <span className="prova-selo tarefa">tarefa</span>
              <span className="row-title">{tf.titulo || "sem título"}</span>
              <span className="row-end">revisar →</span>
            </button>
          ))}
        </div>
      )}

      {modulos.length === 0 && (
        <div className="empty">
          {ehMentor
            ? "Nenhum módulo ainda. Crie o primeiro para desenhar o caminho dela."
            : "A trilha ainda está sendo montada."}
        </div>
      )}

      {/* ---- o caminho: mapa no desktop, tiras no celular ---- */}
      {modulos.length > 0 && (
        <>
          <MapaTrilha
            modulos={modulos}
            statusModulo={statusModulo}
            progresso={progresso}
            selecionado={aberto}
            onSelecionar={(id) => setExpandido(id)}
          />
          <div className="mp-tiras">
            {modulos.map((m, i) => (
              <button
                key={m.id}
                className={`mp-tira ${statusModulo(m.id)} ${aberto === m.id ? "sel" : ""}`}
                onClick={() => setExpandido(m.id)}
              >
                <span className="mp-tira-num">
                  {statusModulo(m.id) === "concluido" ? "✓" : i + 1}
                </span>
                <span className="mp-tira-tit">{m.titulo || "sem título"}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <ol className="tl">
        {modulos.filter((m) => m.id === aberto).map((m) => {
          const i = modulos.findIndex((x) => x.id === m.id);
          const st = statusModulo(m.id);
          const pr = progresso(m.id);
          const isAberto = true;
          const lista = tarefasDo(m.id);
          return (
            <li key={m.id} className={`tl-item ${st} ${isAberto ? "aberto" : ""}`}>
              <div className="tl-marco">
                <span className="tl-num">{st === "concluido" ? "✓" : i + 1}</span>
              </div>

              <div className="tl-card">
                <div className="tl-head">
                  <div className="tl-head-txt">
                    <div className="tl-mod-titulo">
                      {m.titulo || <span className="tr-vazio">módulo sem título</span>}
                    </div>
                    <div className="tl-meta">
                      <span
                        className="tr-comp"
                        style={{ color: corCompetencia(m.competencia) }}
                      >
                        {COMPETENCIAS[m.competencia] || "—"}
                      </span>
                      <span className="tl-sep">·</span>
                      <span className="tl-conta">
                        {pr.total === 0
                          ? "sem tarefas"
                          : `${pr.feitas}/${pr.total} tarefas`}
                      </span>
                      {st === "concluido" && <span className="tl-selo">concluído</span>}
                      {st === "emcurso" && <span className="tl-selo emcurso">em curso</span>}
                    </div>
                  </div>
                </div>

                {pr.total > 0 && (
                  <div className="tl-barra">
                    <span className="tl-barra-fill" style={{ width: `${pr.pct}%` }} />
                  </div>
                )}

                {isAberto && (
                  <div className="tl-corpo">
                    {/* objetivo do módulo */}
                    {ehMentor ? (
                      <>
                        <Field label="Título do módulo">
                          <input
                            className="input"
                            value={m.titulo}
                            placeholder="Ex.: Fundamentos de layout"
                            onChange={(e) => patchModulo(m.id, { titulo: e.target.value })}
                          />
                        </Field>
                        <div className="two-col">
                          <Field label="Competência">
                            <select
                              className="input"
                              value={m.competencia}
                              onChange={(e) => patchModulo(m.id, { competencia: e.target.value })}
                            >
                              {Object.entries(COMPETENCIAS).map(([k, v]) => (
                                <option key={k} value={k}>{v}</option>
                              ))}
                            </select>
                          </Field>
                          <Field label="Ordem no caminho">
                            <input
                              className="input"
                              type="number"
                              min="1"
                              value={m.ordem || 1}
                              onChange={(e) =>
                                patchModulo(m.id, { ordem: Number(e.target.value) || 1 })
                              }
                            />
                          </Field>
                        </div>
                        <Field label="O que ela vai aprender aqui">
                          <textarea
                            className="input"
                            rows={3}
                            value={m.objetivo}
                            placeholder="O objetivo de aprendizado do módulo, em uma ou duas frases."
                            onChange={(e) => patchModulo(m.id, { objetivo: e.target.value })}
                          />
                        </Field>
                      </>
                    ) : (
                      m.objetivo && (
                        <div className="tl-objetivo">
                          <div className="tl-obj-tit">O que você vai aprender</div>
                          <p className="tr-desc">{m.objetivo}</p>
                        </div>
                      )
                    )}

                    {/* conteúdo do curso: aulas e partes, com timestamps */}
                    {((m.conteudo || []).length > 0 || ehMentor) && (
                      <div className="tl-secao">
                        <div className="ct-head">
                          <div className="px-label sec" style={{ margin: 0 }}>Conteúdo do curso</div>
                          {(m.conteudo || []).length > 0 && (
                            <span className="ct-prog">
                              {(m.conteudo || []).filter((c) => c.visto).length}/
                              {(m.conteudo || []).length} vistos
                              {somaDuracao(m.conteudo) && <> · {somaDuracao(m.conteudo)}</>}
                            </span>
                          )}
                        </div>
                        {(m.conteudo || []).map((c) =>
                          ehMentor ? (
                            <div key={c.id} className="ct-edit">
                              <input
                                className="input"
                                value={c.titulo}
                                placeholder="Aula 02 · Parte 4"
                                onChange={(e) => patchConteudo(m, c.id, { titulo: e.target.value })}
                              />
                              <input
                                className="input ct-dur"
                                value={c.duracao}
                                placeholder="00:47:07"
                                onChange={(e) => patchConteudo(m, c.id, { duracao: e.target.value })}
                              />
                              <input
                                className="input"
                                value={c.temas}
                                placeholder="Estética (01:36); Princípios (22:17)"
                                onChange={(e) => patchConteudo(m, c.id, { temas: e.target.value })}
                              />
                              <button className="icon-btn" onClick={() => removerConteudo(m, c.id)}>×</button>
                            </div>
                          ) : (
                            <div key={c.id} className={`ct-item ${c.visto ? "visto" : ""}`}>
                              <button
                                className="ct-check"
                                onClick={() => patchConteudo(m, c.id, { visto: !c.visto })}
                                aria-label={c.visto ? "Marcar como não visto" : "Marcar como visto"}
                              >
                                {c.visto ? "✓" : ""}
                              </button>
                              <div className="ct-txt">
                                <div className="ct-tit">
                                  {c.titulo || "parte sem nome"}
                                  {c.duracao && <span className="ct-durtxt">{c.duracao}</span>}
                                </div>
                                {c.temas && <div className="ct-temas">{c.temas}</div>}
                              </div>
                            </div>
                          )
                        )}
                        {ehMentor && (
                          <button className="add-card" onClick={() => addConteudo(m)}>
                            + parte da aula
                          </button>
                        )}
                      </div>
                    )}

                    {/* material de apoio: link externo ou texto lido no painel */}
                    <div className="tl-secao">
                      <div className="px-label sec">Material de apoio</div>
                      {(m.recursos || []).length === 0 && !ehMentor && (
                        <div className="tl-vazio-txt">Nenhum material adicionado.</div>
                      )}
                      {(m.recursos || []).map((r) => {
                        const ehTexto = r.texto !== undefined;
                        if (ehMentor) {
                          return (
                            <div key={r.id} className={ehTexto ? "tl-rec-txt-edit" : "tl-rec-edit"}>
                              <input
                                className="input"
                                value={r.titulo}
                                placeholder={ehTexto ? "Título do material" : "Nome do material"}
                                onChange={(e) => patchRecurso(m, r.id, { titulo: e.target.value })}
                              />
                              {ehTexto ? (
                                <textarea
                                  className="input"
                                  rows={6}
                                  value={r.texto}
                                  placeholder="O conteúdo que ela vai ler aqui dentro"
                                  onChange={(e) => patchRecurso(m, r.id, { texto: e.target.value })}
                                />
                              ) : (
                                <input
                                  className="input"
                                  value={r.url}
                                  placeholder="https://…"
                                  onChange={(e) => patchRecurso(m, r.id, { url: e.target.value })}
                                />
                              )}
                              <button className="icon-btn" onClick={() => removerRecurso(m, r.id)}>×</button>
                            </div>
                          );
                        }
                        // material em texto abre no próprio painel, sem download
                        return ehTexto ? (
                          <details key={r.id} className="tl-leitura">
                            <summary>
                              <span className="tl-rec-ico">▸</span>
                              {r.titulo || "material de leitura"}
                            </summary>
                            <div className="tl-leitura-corpo">{r.texto}</div>
                          </details>
                        ) : (
                          <a key={r.id} className="tl-rec" href={r.url || "#"} target="_blank" rel="noreferrer">
                            <span className="tl-rec-ico">↗</span>
                            {r.titulo || r.url || "material"}
                          </a>
                        );
                      })}
                      {ehMentor && (
                        <div className="btn-row">
                          <button className="btn ghost small" onClick={() => addRecurso(m, true)}>
                            + material de leitura
                          </button>
                          <button className="btn ghost small" onClick={() => addRecurso(m)}>
                            + link externo
                          </button>
                        </div>
                      )}
                    </div>

                    <ProvaModulo
                      modulo={m}
                      prova={provaDe(m.id)}
                      papel={papel}
                      responder={responder}
                      enviar={enviarProva}
                      validar={validarProva}
                      devolver={devolverProva}
                      addQuestao={addQuestao}
                      patchQuestao={patchQuestao}
                      removerQuestao={removerQuestao}
                    />

                    {/* tarefas do módulo */}
                    <div className="tl-secao">
                      <div className="px-label sec">Tarefas</div>
                      {lista.length === 0 && (
                        <div className="tl-vazio-txt">
                          {ehMentor ? "Nenhuma tarefa neste módulo." : "Nenhuma tarefa por aqui ainda."}
                        </div>
                      )}
                      {lista.map((tf) => (
                        <button key={tf.id} className="tl-tarefa" onClick={() => setAberta(tf.id)}>
                          <span className={`tl-tag st-${tf.status || "afazer"}`}>
                            {TRILHA_STATUS[tf.status || "afazer"]}
                          </span>
                          <span className="tl-tarefa-tit">
                            {tf.titulo || <span className="tr-vazio">sem título</span>}
                          </span>
                          {tf.prazo && <span className="tr-prazo">{fmtShort(tf.prazo)}</span>}
                          {tf.avaliacao && (
                            <span className="tr-nota" style={{ color: AVALIACAO[tf.avaliacao].cor }}>
                              {AVALIACAO[tf.avaliacao].label}
                            </span>
                          )}
                        </button>
                      ))}
                      {ehMentor && (
                        <button
                          className="add-card"
                          onClick={() => criarTarefa(m.id, m.competencia)}
                        >
                          + tarefa neste módulo
                        </button>
                      )}
                    </div>

                    {ehMentor && canDelete && (
                      <div className="modal-foot">
                        <button className="btn danger small" onClick={() => removerModulo(m)}>
                          excluir módulo
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {semModulo.length > 0 && (
        <div className="tl-orfas">
          <div className="px-label sec">Fora dos módulos</div>
          {semModulo.map((tf) => (
            <button key={tf.id} className="tl-tarefa" onClick={() => setAberta(tf.id)}>
              <span className={`tl-tag st-${tf.status || "afazer"}`}>
                {TRILHA_STATUS[tf.status || "afazer"]}
              </span>
              <span className="tl-tarefa-tit">{tf.titulo || "sem título"}</span>
            </button>
          ))}
        </div>
      )}

      {ehMentor && <PainelMetricas m={analisarTrilha(tarefas, modulos.length, concluidos)} />}

      {tarefas.length > 0 && (
        <RelatorioSemana
          tarefas={tarefas}
          relatorios={trilha?.relatorios}
          updateTrilha={updateTrilha}
          papel={papel}
        />
      )}

      {tarefaAberta && (
        <TarefaModal
          tarefa={tarefaAberta}
          papel={papel}
          patch={(campos) => patchTarefa(tarefaAberta.id, campos)}
          remover={() => removerTarefa(tarefaAberta)}
          canDelete={canDelete && ehMentor}
          close={() => setAberta(null)}
        />
      )}
    </div>
  );
}
function TarefaModal({ tarefa: tf, papel, patch, remover, canDelete, close }) {
  const ehMentor = papel === "mentor";
  const ehAprendiz = papel === "aprendiz";
  const [entrega, setEntrega] = useState({
    link: tf.link || "",
    aprendizado: tf.aprendizado || "",
  });
  const [fb, setFb] = useState(tf.feedback || "");

  const podeEntregar = ehAprendiz && ["afazer", "fazendo"].includes(tf.status);
  const jaRevisada = tf.status === "revisada";

  const entregar = () => {
    if (!entrega.aprendizado.trim()) return; // o registro do aprendizado é o ponto
    patch({
      status: "entregue",
      link: entrega.link.trim(),
      aprendizado: entrega.aprendizado.trim(),
      entregueEm: Date.now(),
    });
    close();
  };

  const revisar = (nivel) => {
    patch({
      status: nivel === "refazer" ? "fazendo" : "revisada",
      avaliacao: nivel,
      feedback: fb.trim(),
      revisadaEm: Date.now(),
      // o histórico é acumulado: reavaliar não apaga o retrabalho anterior
      revisoes: [...(tf.revisoes || []), { nivel, em: Date.now() }],
    });
    close();
  };

  return (
    <Overlay close={close}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          {ehMentor && !jaRevisada ? (
            <input
              className="input title-input"
              value={tf.titulo}
              placeholder="Título da tarefa"
              onChange={(e) => patch({ titulo: e.target.value })}
            />
          ) : (
            <div className="modal-title">{tf.titulo || "sem título"}</div>
          )}
          <button className="icon-btn" onClick={close}>×</button>
        </div>

        {ehMentor && !jaRevisada ? (
          <>
            <div className="two-col">
              <Field label="Tipo">
                <select
                  className="input"
                  value={tf.tipo}
                  onChange={(e) => patch({ tipo: e.target.value })}
                >
                  {Object.entries(TRILHA_TIPO).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </Field>
              <Field label="Competência">
                <select
                  className="input"
                  value={tf.competencia}
                  onChange={(e) => patch({ competencia: e.target.value })}
                >
                  {Object.entries(COMPETENCIAS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Prazo">
              <input
                className="input"
                type="date"
                value={tf.prazo || ""}
                onChange={(e) => patch({ prazo: e.target.value })}
              />
            </Field>
            <Field label="O que precisa ser feito">
              <textarea
                className="input"
                rows={4}
                value={tf.descricao}
                placeholder="Contexto, referências, o que você espera de volta…"
                onChange={(e) => patch({ descricao: e.target.value })}
              />
            </Field>
          </>
        ) : (
          <>
            <div className="tr-chips">
              <span className="chip small sel">{TRILHA_TIPO[tf.tipo]}</span>
              <span
                className="chip small sel"
                style={{ color: corCompetencia(tf.competencia) }}
              >
                {COMPETENCIAS[tf.competencia]}
              </span>
              {tf.prazo && <span className="chip small">até {fmtShort(tf.prazo)}</span>}
            </div>
            {tf.descricao && <p className="tr-desc">{tf.descricao}</p>}
          </>
        )}

        {/* ---- entrega: a aprendiz preenche ---- */}
        {podeEntregar && (
          <div className="tr-bloco">
            <div className="px-label sec">Entregar</div>
            <Field label="Link da entrega (opcional)">
              <input
                className="input"
                value={entrega.link}
                placeholder="Drive, Figma, post…"
                onChange={(e) => setEntrega({ ...entrega, link: e.target.value })}
              />
            </Field>
            <Field label="O que você aprendeu aqui?">
              <textarea
                className="input"
                rows={4}
                value={entrega.aprendizado}
                placeholder="O que você não sabia antes e sabe agora. Vale o que deu errado também."
                onChange={(e) => setEntrega({ ...entrega, aprendizado: e.target.value })}
              />
            </Field>
            <div className="btn-row">
              {tf.status === "afazer" && (
                <button className="btn ghost" onClick={() => patch({ status: "fazendo" })}>
                  comecei a fazer
                </button>
              )}
              <button
                className="btn"
                onClick={entregar}
                disabled={!entrega.aprendizado.trim()}
                title={
                  entrega.aprendizado.trim()
                    ? "Enviar para revisão"
                    : "Registre o que aprendeu antes de entregar"
                }
              >
                entregar para revisão →
              </button>
            </div>
            {!entrega.aprendizado.trim() && (
              <div className="tr-aviso">
                O registro do aprendizado é obrigatório — é o que vai alimentar seu
                relatório no fim da semana.
              </div>
            )}
          </div>
        )}

        {/* ---- o que foi entregue ---- */}
        {["entregue", "revisada"].includes(tf.status) && (
          <div className="tr-bloco">
            <div className="px-label sec">Entrega</div>
            {tf.link && (
              <a className="tr-link" href={tf.link} target="_blank" rel="noreferrer">
                {tf.link}
              </a>
            )}
            <p className="tr-desc">{tf.aprendizado || "—"}</p>
          </div>
        )}

        {/* ---- revisão: o mentor avalia ---- */}
        {ehMentor && tf.status === "entregue" && (
          <div className="tr-bloco">
            <div className="px-label sec">Revisar</div>
            <Field label="Retorno para ela">
              <textarea
                className="input"
                rows={3}
                value={fb}
                placeholder="O que ficou bom, o que ajustar e por quê."
                onChange={(e) => setFb(e.target.value)}
              />
            </Field>
            <div className="btn-row">
              {Object.entries(AVALIACAO).map(([k, v]) => (
                <button
                  key={k}
                  className="btn ghost tr-aval"
                  style={{ borderColor: v.cor, color: v.cor }}
                  onClick={() => revisar(k)}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <div className="tr-aviso">
              "Refazer" devolve a tarefa para Fazendo e conta como retrabalho.
            </div>
          </div>
        )}

        {jaRevisada && (
          <div className="tr-bloco">
            <div className="px-label sec">Revisão</div>
            <div
              className="tr-nota grande"
              style={{ color: AVALIACAO[tf.avaliacao]?.cor }}
            >
              {AVALIACAO[tf.avaliacao]?.label}
            </div>
            {tf.feedback && <p className="tr-desc">{tf.feedback}</p>}
          </div>
        )}

        <div className="modal-foot">
          {canDelete && (
            <button className="btn danger" onClick={remover}>excluir</button>
          )}
          <button className="btn ghost" onClick={close}>fechar</button>
        </div>
      </div>
    </Overlay>
  );
}

/* ---------- leitura dos orçamentos ----------
   Duas cotações do MESMO item em gráficas diferentes são alternativas:
   você compra uma só. Somar as duas infla o total e não significa nada.
   Aqui os itens são agrupados pelo nome e, para cada um, vale a cotação
   mais barata — é isso que forma o total realista. */
// cores de MARCA: fatias da rosca, pontos e fios. Validadas para daltonismo.
const PALETA = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300"];
// mesmas matizes, escurecidas para servirem de TEXTO. As de marca têm
// contraste de ~2:1 sobre branco (o amarelo chega a 2.17) e seriam ilegíveis;
// estas ficam acima de 6:1, com folga sobre o mínimo de 4.5:1.
const PALETA_TEXTO = ["#1c5cab", "#a8420f", "#0d6b49", "#7d5500", "#a83a63", "#006100"];
const COR_NEUTRA = "#9A9A93"; // sem gráfica definida / agrupamento "Outras"
const COR_NEUTRA_TEXTO = "#6B6B64";

/* A cor identifica a gráfica, não a posição dela no ranking: é atribuída
   pela ordem em que a gráfica aparece nos itens e não muda se os valores
   mudarem. Sem isso, encarecer uma gráfica repintaria as outras. */
function coresDasGraficas(events) {
  const mapa = new Map();
  (events || []).forEach((ev) =>
    (ev.items || []).forEach((it) => {
      const chave = (it.fornecedor || "").trim().toLowerCase();
      if (!chave || mapa.has(chave)) return;
      mapa.set(chave, mapa.size % PALETA.length);
    })
  );
  return mapa;
}
const corDe = (cores, chave) => {
  const i = chave ? cores.get(chave) : undefined;
  return i === undefined ? COR_NEUTRA : PALETA[i];
};
const corTextoDe = (cores, chave) => {
  const i = chave ? cores.get(chave) : undefined;
  return i === undefined ? COR_NEUTRA_TEXTO : PALETA_TEXTO[i];
};


function analisarOrcamentos(events) {
  const linhas = [];
  (events || []).forEach((ev) => {
    const porNome = new Map();
    (ev.items || []).forEach((it) => {
      const chave = (it.nome || "").trim().toLowerCase();
      if (!chave) return; // item ainda sem nome não entra na conta
      if (!porNome.has(chave)) porNome.set(chave, { nome: (it.nome || "").trim(), cotacoes: [] });
      porNome.get(chave).cotacoes.push(it);
    });
    linhas.push(...porNome.values());
  });

  let melhorTotal = 0;
  let economia = 0;
  let semComparacao = 0;
  let totalCotacoes = 0;
  let maiorDiferenca = null;
  const porGrafica = new Map();

  linhas.forEach((l) => {
    const validas = l.cotacoes.filter((c) => Number(c.valor) > 0);
    totalCotacoes += validas.length;
    if (!validas.length) return;

    const ordenadas = [...validas].sort((a, b) => Number(a.valor) - Number(b.valor));
    const menor = ordenadas[0];
    const maior = ordenadas[ordenadas.length - 1];
    melhorTotal += Number(menor.valor);

    if (validas.length === 1) {
      semComparacao++;
    } else {
      const dif = Number(maior.valor) - Number(menor.valor);
      economia += dif;
      if (!maiorDiferenca || dif > maiorDiferenca.dif) {
        maiorDiferenca = { nome: l.nome, dif, menor, maior };
      }
    }

    const nomeG = (menor.fornecedor || "").trim();
    const g = nomeG || "Sem gráfica";
    const atual = porGrafica.get(g) || { nome: g, chave: nomeG.toLowerCase(), valor: 0, itens: 0 };
    atual.valor += Number(menor.valor);
    atual.itens += 1;
    porGrafica.set(g, atual);
  });

  // no máximo 6 fatias: acima disso as menores viram "Outras"
  let fatias = [...porGrafica.values()].sort((a, b) => b.valor - a.valor);
  if (fatias.length > 6) {
    const resto = fatias.slice(5);
    fatias = [
      ...fatias.slice(0, 5),
      {
        nome: "Outras",
        chave: "",
        valor: resto.reduce((s, f) => s + f.valor, 0),
        itens: resto.reduce((s, f) => s + f.itens, 0),
      },
    ];
  }

  const semResponsavel = (events || [])
    .flatMap((e) => e.items || [])
    .filter((i) => (i.fecha || "indefinido") === "indefinido").length;

  return {
    melhorTotal,
    economia,
    fatias,
    semComparacao,
    semResponsavel,
    totalItens: linhas.length,
    totalCotacoes,
    maiorDiferenca,
  };
}

/* Rosca: parte-do-todo num relance. Cada fatia é um arco com 2px de
   respiro, e a legenda traz nome e valor — cor nunca carrega sozinha. */
function Rosca({ fatias, total, cores }) {
  const R = 52;
  const C = 2 * Math.PI * R;
  let acumulado = 0;
  return (
    <svg className="rosca" viewBox="0 0 120 120" role="img"
      aria-label={`Divisão do orçamento entre ${fatias.length} gráficas`}>
      <circle cx="60" cy="60" r={R} className="rosca-trilho" />
      {fatias.map((f) => {
        const fracao = total > 0 ? f.valor / total : 0;
        const comp = Math.max(fracao * C - 2, 0); // 2px de respiro entre fatias
        const arco = (
          <circle
            key={f.nome}
            cx="60" cy="60" r={R}
            className="rosca-fatia"
            stroke={corDe(cores, f.chave)}
            strokeDasharray={`${comp} ${C - comp}`}
            strokeDashoffset={-acumulado}
          />
        );
        acumulado += fracao * C;
        return arco;
      })}
    </svg>
  );
}

/* nome do item: <input> nunca quebra linha, então nomes longos ficavam
   cortados. Textarea de uma linha que cresce conforme o texto. */
function NomeCell({ value, onChange }) {
  const ref = useRef(null);
  const ajustar = () => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };
  useEffect(ajustar, [value]);
  return (
    <textarea
      ref={ref}
      rows={1}
      className="cell cell-nome"
      value={value}
      placeholder="Folder, cartão de visita…"
      onChange={(e) => onChange(e.target.value)}
      onInput={ajustar}
    />
  );
}

/* célula "Orçado em": como o agrupamento depende deste valor, ele só é
   gravado ao sair do campo — senão a linha pularia de grupo a cada tecla */
function FornecedorCell({ value, listId, onCommit, className = "cell", placeholder = "Gráfica / fornecedor" }) {
  const [v, setV] = useState(value ?? "");
  const editando = useRef(false);
  useEffect(() => {
    if (!editando.current) setV(value ?? "");
  }, [value]);
  const commit = () => {
    editando.current = false;
    const limpo = v.trim();
    if (limpo !== (value ?? "")) onCommit(limpo);
  };
  return (
    <input
      className={className}
      value={v}
      list={listId}
      placeholder={placeholder}
      onFocus={() => (editando.current = true)}
      onChange={(e) => setV(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === "Enter") e.currentTarget.blur(); }}
    />
  );
}

/* ---------- planilha de orçamentos ----------
   Um evento agrupa os itens a cotar (folder, cartão de visita, etc.).
   Cada item guarda valor, data de produção, onde foi orçado e quem
   fecha o pedido com a gráfica. Edição é direta na célula. */
function Planilha({ orcamentos, updateOrcamentos, askConfirm, canDelete }) {
  const events = orcamentos?.events || [];
  // no celular o item abre resumido (nome, valor, prazo); o resto vem ao expandir
  const [abertos, setAbertos] = useState({});
  const alternarItem = (id) => setAbertos((a) => ({ ...a, [id]: !a[id] }));

  const addEvent = () =>
    updateOrcamentos((o) => {
      o.events = [
        ...(o.events || []),
        { id: uid(), name: "Novo evento", data: "", items: [NEW_ORC_ITEM()] },
      ];
      return o;
    });

  const patchEvent = (evId, patch) =>
    updateOrcamentos((o) => {
      const ev = o.events.find((e) => e.id === evId);
      if (ev) Object.assign(ev, patch);
      return o;
    });

  const removeEvent = (ev) =>
    askConfirm(`Excluir o evento "${ev.name}" e todos os seus itens?`, () =>
      updateOrcamentos((o) => {
        o.events = o.events.filter((e) => e.id !== ev.id);
        return o;
      })
    );

  const addItem = (evId, fornecedor = "") =>
    updateOrcamentos((o) => {
      const ev = o.events.find((e) => e.id === evId);
      if (ev) ev.items = [...(ev.items || []), { ...NEW_ORC_ITEM(), fornecedor }];
      return o;
    });

  // renomear o cabeçalho troca a gráfica de todos os itens daquele grupo;
  // apontar para uma gráfica que já existe funde os dois grupos
  const renameGrupo = (evId, chave, novoNome) =>
    updateOrcamentos((o) => {
      const ev = o.events.find((e) => e.id === evId);
      if (!ev) return o;
      (ev.items || []).forEach((it) => {
        if ((it.fornecedor || "").trim().toLowerCase() === chave) it.fornecedor = novoNome;
      });
      return o;
    });

  const patchItem = (evId, itemId, patch) =>
    updateOrcamentos((o) => {
      const ev = o.events.find((e) => e.id === evId);
      const it = ev?.items?.find((x) => x.id === itemId);
      if (it) Object.assign(it, patch);
      return o;
    });

  const removeItem = (evId, it) =>
    askConfirm(`Excluir o item "${it.nome || "sem nome"}"?`, () =>
      updateOrcamentos((o) => {
        const ev = o.events.find((e) => e.id === evId);
        if (ev) ev.items = ev.items.filter((x) => x.id !== it.id);
        return o;
      })
    );

  // agrupa os itens por onde foram orçados, mantendo tudo no mesmo evento.
  // A chave normaliza caixa/espaços; o rótulo usa a grafia da primeira aparição.
  const agruparPorFornecedor = (items) => {
    const grupos = [];
    const porChave = new Map();
    (items || []).forEach((it) => {
      const nome = (it.fornecedor || "").trim();
      const chave = nome.toLowerCase();
      if (!porChave.has(chave)) {
        const g = { chave, nome, items: [] };
        porChave.set(chave, g);
        grupos.push(g);
      }
      porChave.get(chave).items.push(it);
    });
    // os ainda sem fornecedor ficam por último
    return grupos.sort((a, b) => (a.chave === "" ? 1 : b.chave === "" ? -1 : 0));
  };
  const somaItems = (items) =>
    (items || []).reduce((sum, it) => sum + (Number(it.valor) || 0), 0);

  // total do evento pela mesma régua do resumo: a cotação mais barata de
  // cada item, e não a soma de cotações que competem entre si
  const evTotal = (ev) => analisarOrcamentos([ev]).melhorTotal;
  const resumo = analisarOrcamentos(events);
  const cores = coresDasGraficas(events);

  return (
    <div className="view">
      <div className="orc-top">
        <div className="orc-top-title">Resumo dos orçamentos</div>
        <button className="btn accent" onClick={addEvent}>+ novo evento</button>
      </div>

      {resumo.totalCotacoes > 0 && (
        <div className="dash">
          {resumo.fatias.length > 1 ? (
            <>
              <div className="rosca-wrap">
                <Rosca fatias={resumo.fatias} total={resumo.melhorTotal} cores={cores} />
                <div className="rosca-centro">
                  <div className="rosca-num">{money(resumo.melhorTotal)}</div>
                  <div
                    className="rosca-cap"
                    title="Soma da cotação mais barata de cada item. Cotações do mesmo item em gráficas diferentes são alternativas — não se somam."
                  >
                    melhor combinação
                  </div>
                </div>
              </div>
              <ul className="dash-legenda">
                {resumo.fatias.map((f) => (
                  <li key={f.nome}>
                    <span className="lg-cor" style={{ background: corDe(cores, f.chave) }} />
                    <span className="lg-nome">{f.nome}</span>
                    <span className="lg-valor">{money(f.valor)}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            /* uma gráfica só: rosca de fatia única não diz nada, o número basta */
            <div className="dash-solo">
              <div className="rosca-num grande">{money(resumo.melhorTotal)}</div>
              <div className="rosca-cap solo-cap" title="Soma da cotação mais barata de cada item.">
                <span className="solo-dot" style={{ background: corDe(cores, resumo.fatias[0]?.chave) }} />
                melhor combinação ·{" "}
                <strong style={{ color: corTextoDe(cores, resumo.fatias[0]?.chave) }}>
                  {resumo.fatias[0]?.nome}
                </strong>
              </div>
            </div>
          )}

          <div className="dash-rodape">
            {resumo.economia > 0 && (
              <span className="dr-ganho">economiza {money(resumo.economia)}</span>
            )}
            {resumo.semResponsavel > 0 && (
              <span className="dr-alerta">{resumo.semResponsavel} sem responsável</span>
            )}
          </div>
        </div>
      )}

      {events.length === 0 && (
        <div className="empty">
          Nenhum evento ainda. Crie um evento e comece a cotar os itens.
        </div>
      )}

      {events.map((ev) => (
        <section key={ev.id} className="orc-event">
          <header className="orc-event-head">
            <input
              className="input orc-event-name"
              value={ev.name}
              placeholder="Nome do evento"
              onChange={(e) => patchEvent(ev.id, { name: e.target.value })}
            />
            <input
              className="input orc-event-date"
              type="date"
              value={ev.data || ""}
              onChange={(e) => patchEvent(ev.id, { data: e.target.value })}
              title="Data do evento"
            />
            <div className="orc-event-total" title="Soma da cotação mais barata de cada item deste evento">{money(evTotal(ev))}</div>
            {canDelete && (
              <button className="icon-btn" title="Excluir evento" onClick={() => removeEvent(ev)}>
                ×
              </button>
            )}
          </header>

          <datalist id={`forn-${ev.id}`}>
            {agruparPorFornecedor(ev.items)
              .filter((g) => g.nome)
              .map((g) => (
                <option key={g.chave} value={g.nome} />
              ))}
          </datalist>

          <div className="orc-table-wrap">
            <table className="orc-table">
              <thead>
                <tr>
                  <th className="c-item">Item</th>
                  <th className="c-qtd">Qtd.</th>
                  <th className="c-valor">Valor</th>
                  <th className="c-data">Prazo de produção</th>
                  <th className="c-forn">Orçado em</th>
                  <th className="c-fecha">Quem fecha</th>
                  <th className="c-status">Status</th>
                  <th className="c-del" aria-label="ações" />
                </tr>
              </thead>
              {agruparPorFornecedor(ev.items).map((g) => (
              <tbody
                key={g.chave || "__sem__"}
                className="orc-group"
                style={{ "--cor-grafica": corDe(cores, g.chave) }}
              >
                {(agruparPorFornecedor(ev.items).length > 1 || g.nome) && (
                  <tr className="orc-group-head">
                    <td colSpan={8}>
                      <span className="ogh-dot" />
                      <FornecedorCell
                        className="ogh-name"
                        value={g.nome}
                        listId={`forn-${ev.id}`}
                        placeholder="Sem gráfica definida"
                        onCommit={(val) => renameGrupo(ev.id, g.chave, val)}
                      />
                      <span className="ogh-count">
                        {g.items.length} {g.items.length === 1 ? "item" : "itens"}
                      </span>
                      <button
                        className="ogh-add"
                        onClick={() => addItem(ev.id, g.nome)}
                        title={g.nome ? `Adicionar item em ${g.nome}` : "Adicionar item sem gráfica"}
                      >
                        + item
                      </button>
                      <span className="ogh-total">{money(somaItems(g.items))}</span>
                    </td>
                  </tr>
                )}
                {g.items.map((it) => {
                  const semResponsavel = (it.fecha || "indefinido") === "indefinido";
                  return (
                  <tr key={it.id} className={abertos[it.id] ? "aberto" : ""}>
                    <td data-label="Item">
                      <div className="item-head">
                        <NomeCell
                          value={it.nome}
                          onChange={(val) => patchItem(ev.id, it.id, { nome: val })}
                        />
                        <button
                          className="row-toggle"
                          onClick={() => alternarItem(it.id)}
                          aria-expanded={Boolean(abertos[it.id])}
                          aria-label={abertos[it.id] ? "Recolher item" : "Ver mais deste item"}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 9l6 6 6-6" />
                          </svg>
                        </button>
                      </div>
                      {semResponsavel && (
                        <div className="aviso-fecha">
                          <span className="aviso-dot" />
                          definir responsável para fechar
                        </div>
                      )}
                    </td>
                    <td data-label="Qtd.">
                      <input
                        className="cell"
                        value={it.qtd || ""}
                        placeholder="500"
                        onChange={(e) => patchItem(ev.id, it.id, { qtd: e.target.value })}
                      />
                    </td>
                    <td data-label="Valor">
                      <input
                        className="cell cell-num"
                        type="number"
                        step="0.01"
                        min="0"
                        value={it.valor ?? ""}
                        placeholder="0,00"
                        onChange={(e) => patchItem(ev.id, it.id, { valor: e.target.value })}
                      />
                    </td>
                    <td data-label="Prazo de produção">
                      <div className={`prazo prazo-${it.prazoTipo || "dias"} ${it.prazoDias ? "" : "vazio"}`}>
                        <select
                          className="prazo-num"
                          value={it.prazoDias || ""}
                          onChange={(e) => patchItem(ev.id, it.id, { prazoDias: e.target.value })}
                          aria-label="Prazo em dias"
                        >
                          <option value="">–</option>
                          {PRAZO_DIAS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                        <select
                          className="prazo-tipo"
                          value={it.prazoTipo || "dias"}
                          onChange={(e) => patchItem(ev.id, it.id, { prazoTipo: e.target.value })}
                          aria-label="Dias corridos ou úteis"
                        >
                          {Object.entries(PRAZO_TIPO).map(([k, v]) => (
                            <option key={k} value={k}>
                              {String(it.prazoDias) === "1" ? v.one : v.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td data-label="Orçado em">
                      <FornecedorCell
                        value={it.fornecedor}
                        listId={`forn-${ev.id}`}
                        onCommit={(val) => patchItem(ev.id, it.id, { fornecedor: val })}
                      />
                    </td>
                    <td data-label="Quem fecha">
                      <div className={`tag tag-fecha fecha-${it.fecha || "indefinido"}`}>
                        <select
                          value={it.fecha || "indefinido"}
                          onChange={(e) => patchItem(ev.id, it.id, { fecha: e.target.value })}
                          aria-label="Quem fecha o pedido"
                        >
                          {Object.entries(FECHA).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td data-label="Status">
                      <div className="tag tag-status">
                        <span
                          className="tag-dot"
                          style={{ background: (ORC_STATUS[it.status] || ORC_STATUS.cotando).chip }}
                        />
                        <select
                          value={it.status || "cotando"}
                          onChange={(e) => patchItem(ev.id, it.id, { status: e.target.value })}
                          aria-label="Status do orçamento"
                        >
                          {Object.entries(ORC_STATUS).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="c-del">
                      {canDelete && (
                        <button
                          className="icon-btn small"
                          title="Excluir item"
                          onClick={() => removeItem(ev.id, it)}
                        >
                          ×
                        </button>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
              ))}
            </table>
          </div>

          <button className="add-card" onClick={() => addItem(ev.id)}>+ item para cotar (sem gráfica)</button>
        </section>
      ))}
    </div>
  );
}

// ---------- página de produto (manifesto + arquivos) ----------
function ProductPage({ slot, onBack, onEnter }) {
  return (
    <div className="poster product-page">
      <div className="pp-nav">
        <button className="back-link px-label" onClick={onBack}>← voltar</button>
        <button className="btn ghost small" onClick={onEnter}>ir para o painel →</button>
      </div>

      <div className="pp-hero">
        <div className="pp-tile" style={{ background: slot.img ? undefined : slot.grad }}>
          {slot.img ? (
            <img src={slot.img} alt={slot.label} className="tile-img" />
          ) : (
            <span className="tile-tag px-label">{slot.tag}</span>
          )}
        </div>
        <div className="eyebrow">manifesto</div>
        <h1 className="hero" style={{ fontSize: "clamp(36px, 6vw, 64px)" }}>{slot.label}</h1>
      </div>

      <p className="pp-manifesto">{slot.manifesto}</p>

      <div className="px-label sec" style={{ marginTop: 30 }}>Arquivos da marca</div>
      {slot.files.length === 0 ? (
        <div className="empty">Este slot ainda não tem arquivos. Em breve.</div>
      ) : (
        <div className="pp-files">
          {slot.files.map((f) => (
            <div key={f} className="pp-file">
              <div className="pp-file-icon px-label">⬇</div>
              <div className="pp-file-name">{f}</div>
              <button className="btn small" disabled title="Os arquivos serão conectados em breve">
                baixar
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="pp-note">
        Estrutura inicial: os botões de download serão conectados aos arquivos reais
        (logos, MIV, tipografia) quando definirmos o layout final desta página.
      </p>
    </div>
  );
}

// ---------- compartilhados ----------
// ---------- tela de login (perfil ou admin) ----------
function Identify({ onPick, onAdmin, onBack }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const tryAdmin = () => {
    if (pw === ADMIN_PASSWORD) onAdmin();
    else { setErr(true); setPw(""); }
  };
  return (
    <div className="poster identify-poster">
      <button className="back-link px-label" onClick={onBack}>← entrada</button>
      <div className="eyebrow">quem está usando?</div>
      <h1 className="hero" style={{ fontSize: "clamp(38px, 7vw, 62px)" }}>Entrar</h1>
      <div className="hero-sub">escolha seu perfil</div>

      <div className="profiles">
        {PROFILES.map((p) => (
          <button key={p.key} className="profile-tile" onClick={() => onPick(p.name)}>
            <span className="profile-av"><BoringAvatar index={p.avatar} size={78} /></span>
            <span className="profile-name px-label">{p.name}</span>
          </button>
        ))}
      </div>

      <div className="admin-area">
        {adminOpen ? (
          <div className="admin-box">
            <input
              className="input"
              type="password"
              autoFocus
              placeholder="senha do admin"
              value={pw}
              onChange={(e) => { setPw(e.target.value); setErr(false); }}
              onKeyDown={(e) => e.key === "Enter" && tryAdmin()}
              style={{ maxWidth: 220 }}
            />
            <button className="btn" onClick={tryAdmin}>entrar</button>
            <button className="btn ghost" onClick={() => { setAdminOpen(false); setErr(false); setPw(""); }}>voltar</button>
            {err && <div className="admin-err">senha incorreta</div>}
          </div>
        ) : (
          <button className="link-btn px-label" onClick={() => setAdminOpen(true)}>★ entrar como admin</button>
        )}
      </div>
    </div>
  );
}

function Overlay({ children, close }) {
  return (
    <div className="overlay" onClick={close}>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="field">
      <label className="field-label px-label">{label}</label>
      {children}
    </div>
  );
}

function ConfirmModal({ message, onOk, onCancel }) {
  return (
    <Overlay close={onCancel}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title px-label">Confirmar exclusão</div>
          <button className="icon-btn" onClick={onCancel}>×</button>
        </div>
        <p style={{ fontSize: 15, lineHeight: 1.5, margin: "12px 0 0" }}>{message}</p>
        <div className="modal-foot">
          <button className="btn ghost" onClick={onCancel}>cancelar</button>
          <button className="btn danger" onClick={onOk}>excluir</button>
        </div>
      </div>
    </Overlay>
  );
}

function TrashModal({ trash, onRestore, onPurge, onEmpty, canDelete, close }) {
  const items = trash.items || [];
  return (
    <Overlay close={close}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div className="modal-title px-label">Lixeira</div>
          <button className="icon-btn" onClick={close}>×</button>
        </div>
        {items.length === 0 ? (
          <div className="empty">A lixeira está vazia.</div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: T.muted, margin: "8px 0 2px" }}>
              Itens excluídos — restaure o que precisar.
            </p>
            {items.map((e) => (
              <div key={e.id} className="trash-row">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="trash-type px-label">
                    {e.type === "calendar" ? "conteúdo" : "cartão"}
                    {e.type === "calendar" && e.dateKey ? ` · ${fmtShort(e.dateKey)}` : ""}
                  </div>
                  <div className="trash-title">{e.label || "(sem título)"}</div>
                </div>
                <button className="btn small" onClick={() => onRestore(e.id)}>restaurar</button>
                {canDelete && <button className="icon-btn" title="Apagar de vez" onClick={() => onPurge(e.id)}>×</button>}
              </div>
            ))}
            {canDelete && (
              <div className="modal-foot">
                <button className="btn ghost small" onClick={onEmpty}>esvaziar lixeira</button>
              </div>
            )}
          </>
        )}
      </div>
    </Overlay>
  );
}

// ---------- estilos ----------
function GlobalStyle() {
  return (
    <style>{`
      * { box-sizing: border-box; }
      body { margin: 0; background: ${T.bg}; }

      .page {
        min-height: 100vh;
        background: ${T.bg};
        display: flex;
        justify-content: center;
        padding: 28px 12px 60px;
        font-family: 'Inter', sans-serif;
        color: ${T.ink};
      }
      .page.center { align-items: center; }
      /* landing ocupa a tela inteira, sem o cartão .poster em volta */
      .page.bare { padding: 0; background: ${T.bg}; display: block; }

      .poster {
        width: 100%;
        max-width: 1140px;
        background: ${T.paper};
        border: 1px solid ${T.line};
        border-radius: 24px;
        box-shadow: 0 1px 2px rgba(17,17,20,.03), 0 12px 40px rgba(17,17,20,.06);
        padding: 34px 30px 30px;
        position: relative;
        overflow: hidden;
      }

      .eyebrow {
        text-align: center;
        font-size: 11.5px;
        letter-spacing: 1.4px;
        text-transform: uppercase;
        font-weight: 500;
        color: ${T.muted};
      }
      .hero {
        margin: 6px 0 2px;
        text-align: center;
        font-family: 'Instrument Serif', Georgia, serif;
        font-weight: 400;
        font-size: clamp(44px, 8vw, 78px);
        line-height: 1;
        letter-spacing: -1.5px;
        text-transform: none;
        color: ${T.ink};
      }
      .hero-sub {
        text-align: center;
        color: ${T.muted};
        font-size: 15px;
        margin-bottom: 18px;
        text-transform: capitalize;
      }

      /* ============================================================
         shell do painel — menu escuro fixo à esquerda, conteúdo à direita
         ============================================================ */
      .app {
        display: flex;
        gap: 18px;
        min-height: 100vh;
        padding: 16px;
        background: ${T.bg};
        font-family: 'Inter', sans-serif;
        color: ${T.ink};
      }

      /* ---------- menu lateral ---------- */
      .sidebar {
        width: 236px;
        flex-shrink: 0;
        background: #141416;
        border-radius: 26px;
        padding: 26px 16px 18px;
        display: flex;
        flex-direction: column;
        gap: 26px;
        position: sticky;
        top: 16px;
        height: calc(100vh - 32px);
      }
      .sb-brand {
        display: flex; align-items: center; gap: 10px;
        padding: 0 10px 4px;
        color: #fff;
      }
      .sb-brand-glyph { font-size: 18px; line-height: 1; color: ${T.accent}; }
      .sb-brand-name {
        font-family: 'Instrument Serif', Georgia, serif;
        font-size: 25px;
        letter-spacing: -.3px;
      }

      .sb-group { display: flex; flex-direction: column; gap: 2px; }
      .sb-group-label {
        font-size: 10.5px;
        text-transform: uppercase;
        letter-spacing: 1.6px;
        color: rgba(255,255,255,.34);
        padding: 0 10px 8px;
      }
      .sb-item {
        display: flex; align-items: center; gap: 11px;
        width: 100%;
        background: transparent;
        border: 0;
        border-radius: 12px;
        padding: 10px 11px;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        color: rgba(255,255,255,.66);
        cursor: pointer;
        text-align: left;
        transition: background .16s ease, color .16s ease;
      }
      .sb-item:hover { background: rgba(255,255,255,.07); color: #fff; }
      .sb-item.active {
        background: ${T.accent};
        color: ${T.accentInk};
        font-weight: 600;
      }
      .sb-ico { width: 18px; height: 18px; flex-shrink: 0; }
      .sb-count {
        margin-left: auto;
        font-size: 11px; font-weight: 600;
        background: rgba(255,255,255,.14);
        color: #fff;
        border-radius: 999px;
        padding: 1px 7px;
      }
      .sb-item.active .sb-count { background: rgba(0,0,0,.16); color: ${T.accentInk}; }
      .sb-exit { margin-top: auto; color: rgba(255,255,255,.46); }

      /* ---------- área principal ---------- */
      .main {
        flex: 1;
        min-width: 0;
        background: ${T.paper};
        border: 1px solid ${T.line};
        border-radius: 26px;
        padding: 22px clamp(18px, 2.6vw, 34px) 30px;
        overflow: hidden;
      }
      .topbar {
        display: flex; align-items: center; justify-content: space-between;
        gap: 16px; flex-wrap: wrap;
        padding-bottom: 18px;
        border-bottom: 1px solid ${T.line};
      }
      .tb-eyebrow {
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 1.6px;
        color: ${T.muted};
      }
      .tb-right { display: flex; align-items: center; gap: 10px; }
      .date-pill {
        font-size: 13px;
        color: ${T.muted};
        background: ${T.bg};
        border-radius: 999px;
        padding: 7px 15px;
        text-transform: capitalize;
      }
      .user-chip {
        display: flex; align-items: center; gap: 8px;
        background: ${T.bg};
        border-radius: 999px;
        padding: 5px 14px 5px 5px;
        font-size: 13.5px;
        color: ${T.ink};
      }
      .user-chip svg { border-radius: 50%; }
      .user-badge {
        width: 26px; height: 26px; border-radius: 50%;
        background: ${T.accent}; color: ${T.accentInk};
        display: flex; align-items: center; justify-content: center;
        font-size: 13px;
      }

      .main-head { padding: 24px 0 20px; }
      .greet {
        font-family: 'Instrument Serif', Georgia, serif;
        font-weight: 400;
        font-size: clamp(30px, 3.8vw, 46px);
        line-height: 1.1;
        letter-spacing: -1px;
        margin: 0;
        color: ${T.ink};
      }
      .greet em { font-style: italic; }

      .view-wrap { position: relative; }
      /* espera discreta, só na área de conteúdo — o painel já está na tela */
      .view-loading {
        display: flex; align-items: center; justify-content: center; gap: 10px;
        padding: 70px 20px;
        font-size: 14px;
        color: ${T.muted};
      }
      .spin {
        width: 16px; height: 16px;
        border: 2px solid ${T.line};
        border-top-color: ${T.ink};
        border-radius: 50%;
        animation: spin .7s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      /* falha de conexão: estado honesto, com saída, no lugar do spinner eterno */
      .view-error {
        max-width: 460px;
        margin: 56px auto;
        text-align: center;
        border: 1px solid ${T.line};
        border-radius: 18px;
        padding: 28px 24px;
        background: ${T.paper};
      }
      .ve-title { font-size: 16px; font-weight: 600; }
      .ve-msg {
        font-size: 13.5px; color: ${T.danger};
        margin: 8px 0 0;
      }
      .ve-hint {
        font-size: 13px; color: ${T.muted}; line-height: 1.6;
        margin: 12px 0 18px;
      }
      @media (prefers-reduced-motion: reduce) { .spin { animation: none; } }

      @media (max-width: 900px) {
        .app { flex-direction: column; padding: 12px; gap: 12px; }
        .sidebar {
          width: auto; height: auto; position: static;
          flex-direction: row; align-items: center; gap: 8px;
          overflow-x: auto; padding: 12px;
          border-radius: 20px;
        }
        .sb-brand, .sb-group-label { display: none; }
        .sb-group { flex-direction: row; gap: 6px; }
        .sb-item { width: auto; white-space: nowrap; padding: 9px 13px; }
        .sb-exit { margin-top: 0; }
        .main { border-radius: 20px; padding: 18px 14px 24px; }
      }

      /* ---------- login / perfil ---------- */
      .link-btn {
        background: transparent; border: none;
        color: ${T.muted}; font-size: 13px; cursor: pointer;
        text-decoration: underline; padding: 0;
      }
      .link-btn:hover { color: ${T.ink}; }

      .identify-poster { align-self: center; padding: 34px 24px 40px; }
      .profiles {
        display: flex; flex-wrap: wrap; gap: 22px; justify-content: center;
        margin: 26px 0 8px;
      }
      .profile-tile {
        background: transparent; border: none; cursor: pointer;
        display: flex; flex-direction: column; align-items: center; gap: 10px;
        padding: 8px; transition: transform .15s ease;
      }
      .profile-tile:hover { transform: translateY(-3px); }
      .profile-av {
        width: 96px; height: 96px;
        border: 1px solid ${T.line}; border-radius: 50%;
        box-shadow: 0 1px 2px rgba(17,17,20,.04), 0 6px 16px rgba(17,17,20,.06);
        overflow: hidden; display: flex; align-items: center; justify-content: center;
        background: #fff;
      }
      .profile-name { font-size: 16px; color: ${T.ink}; }
      .admin-area { text-align: center; margin-top: 22px; }
      .admin-box { display: flex; gap: 8px; justify-content: center; align-items: center; flex-wrap: wrap; }
      .admin-err { width: 100%; color: ${T.danger}; font-size: 13px; margin-top: 6px; }

      /* micro-rótulo moderno: caixa alta, discreto (era a fonte pixel) */
      .px-label {
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        letter-spacing: .2px;
      }

      /* ---------- tabs: nav em pílulas, ativa em amarelo ---------- */
      .tabs {
        display: flex; justify-content: center; gap: 4px; flex-wrap: wrap;
        background: ${T.bg};
        border-radius: 999px;
        padding: 5px;
        width: fit-content;
        margin: 0 auto;
      }
      .tab {
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        font-size: 14px;
        padding: 9px 20px;
        border-radius: 999px;
        border: 0;
        background: transparent;
        color: ${T.muted};
        cursor: pointer;
        transition: background .16s ease, color .16s ease;
      }
      .tab:hover { color: ${T.ink}; }
      .tab.active {
        background: ${T.accent};
        color: ${T.accentInk};
        font-weight: 600;
      }

      /* ---------- letreiro: discreto, só um fio de contexto ---------- */
      .marquee {
        margin: 20px -30px 24px;
        border-top: 1px solid ${T.line};
        border-bottom: 1px solid ${T.line};
        overflow: hidden;
        background: ${T.holoSoft};
      }
      .marquee-track {
        display: flex;
        white-space: nowrap;
        animation: scroll 34s linear infinite;
      }
      .marquee-seg {
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        font-size: 11.5px;
        letter-spacing: 1.6px;
        text-transform: uppercase;
        padding: 9px 0;
        color: ${T.muted};
      }
      @keyframes scroll { to { transform: translateX(-50%); } }

      /* ---------- geral ---------- */
      .view { position: relative; }
      .sec {
        font-size: 17px;
        margin: 20px 0 10px;
        display: flex; align-items: center; gap: 8px;
      }
      .sec::after { content: ""; flex: 1; border-top: 1px solid ${T.line}; }
      .sec.danger { color: ${T.danger}; }
      .week-day-head {
        font-size: 13px;
        color: ${T.muted};
        text-transform: uppercase;
        letter-spacing: 1px;
        margin: 12px 0 6px;
      }

      .empty {
        text-align: center;
        color: ${T.muted};
        border: 1px dashed ${T.line};
        border-radius: 12px;
        padding: 18px;
        font-size: 14px;
        margin: 6px 0;
      }

      .row {
        display: flex; align-items: center; gap: 10px;
        width: 100%; text-align: left;
        background: ${T.paper};
        border: 1px solid ${T.line};
        border-radius: 12px;
        box-shadow: 0 1px 2px rgba(17,17,20,.04), 0 6px 16px rgba(17,17,20,.06);
        padding: 9px 12px;
        margin-bottom: 8px;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        color: ${T.ink};
        cursor: pointer;
        transition: transform .1s ease, box-shadow .1s ease;
      }
      .row:hover { transform: translate(1px,1px); box-shadow: 0 1px 2px rgba(17,17,20,.04), 0 6px 16px rgba(17,17,20,.06); }
      .row.danger { border-color: ${T.danger}; box-shadow: 0 1px 2px rgba(17,17,20,.04), 0 6px 16px rgba(17,17,20,.06); }
      .row.danger:hover { box-shadow: 0 1px 2px rgba(17,17,20,.04), 0 6px 16px rgba(17,17,20,.06); }
      .row-title { flex: 1; font-weight: 500; }
      .row-end { color: ${T.muted}; font-size: 12.5px; white-space: nowrap; }
      .row.danger .row-end { color: ${T.danger}; font-weight: 600; }

      .prod-tag {
        font-family: 'Inter', sans-serif;
        font-weight: 700;
        font-size: 11px;
        border: 1px solid;
        border-radius: 6px;
        padding: 1px 5px;
        flex-shrink: 0;
      }
      .pub-check { font-size: 15px; font-weight: 700; flex-shrink: 0; }

      .net-grid { display: flex; gap: 10px; flex-wrap: wrap; }
      .net-box {
        flex: 1; min-width: 100px;
        background: ${T.paper};
        border: 1px solid ${T.line};
        border-radius: 14px;
        box-shadow: 0 1px 2px rgba(17,17,20,.04), 0 6px 16px rgba(17,17,20,.06);
        padding: 12px 8px;
        text-align: center;
        position: relative;
        overflow: hidden;
      }
      /* rede com conteúdo ganha faixa de acento no topo */
      .net-box::before {
        content: "";
        position: absolute; top: 0; left: 0; right: 0; height: 4px;
        background: ${T.accent};
        opacity: 0;
      }
      .net-box:not(.zero)::before { opacity: 1; }
      .net-num {
        position: relative;
        font-family: 'Inter', sans-serif;
        font-weight: 600; font-size: 30px; line-height: 1;
        letter-spacing: -1px;
      }
      .net-name { position: relative; font-size: 12.5px; color: ${T.muted}; margin-top: 4px; font-weight: 500; }
      .net-warn {
        position: relative;
        font-family: 'Inter', sans-serif;
        font-size: 12px; color: ${T.danger}; margin-top: 2px; font-weight: 700;
      }

      /* ---------- kanban ---------- */
      .board-wrap { overflow-x: auto; padding: 4px 2px 10px; }
      .board { display: flex; gap: 14px; align-items: flex-start; min-height: 360px; }
      .column {
        background: ${T.bg};
        border: 1px solid ${T.line};
        border-radius: 16px;
        box-shadow: 0 1px 2px rgba(17,17,20,.04), 0 6px 16px rgba(17,17,20,.06);
        padding: 12px;
        min-width: 265px; max-width: 285px; flex-shrink: 0;
      }
      .column.over { background: #fff; border-style: dashed; }
      .col-header { display: flex; justify-content: space-between; align-items: center; gap: 6px; margin-bottom: 10px; }
      .col-title { font-size: 17px; cursor: text; display: flex; align-items: center; gap: 8px; }
      .count {
        font-family: 'Inter', sans-serif;
        font-size: 11.5px; font-weight: 600;
        background: ${T.ink}; color: ${T.paper};
        border-radius: 999px; padding: 1px 8px;
      }
      .card-list { display: flex; flex-direction: column; gap: 9px; min-height: 4px; }
      .card {
        background: ${T.paper};
        border: 1px solid ${T.line};
        border-radius: 12px;
        box-shadow: 0 1px 2px rgba(17,17,20,.04), 0 6px 16px rgba(17,17,20,.06);
        padding: 10px 11px;
        cursor: grab;
        transition: transform .1s ease, box-shadow .1s ease;
      }
      .card:hover { transform: translate(1px,1px); box-shadow: 0 1px 2px rgba(17,17,20,.04), 0 6px 16px rgba(17,17,20,.06); }
      .card-top { display: flex; align-items: center; gap: 6px; margin-bottom: 5px; flex-wrap: wrap; }
      .card-prod { font-size: 11.5px; color: ${T.muted}; font-weight: 500; }
      .due-flag {
        margin-left: auto;
        font-family: 'Inter', sans-serif;
        font-size: 12px; font-weight: 700;
      }
      .due-flag.danger { color: ${T.danger}; }
      .card-title { font-size: 14.5px; font-weight: 600; line-height: 1.3; }
      .card-due { font-size: 12px; color: ${T.muted}; margin-top: 3px; }
      .progress { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
      .track {
        flex: 1; height: 10px;
        border: 1px solid ${T.line};
        border-radius: 999px;
        background: ${T.paper};
        overflow: hidden;
      }
      .fill { height: 100%; background: ${T.holo}; }
      .progress-num { font-size: 12px; color: ${T.muted}; font-weight: 500; }


      /* botão de concluir no cartão do quadro */
      .card-ok {
        margin-left: auto;
        width: 22px; height: 22px;
        flex-shrink: 0;
        border: 1px solid ${T.line};
        border-radius: 50%;
        background: ${T.paper};
        color: ${T.muted};
        font-size: 11px; font-weight: 700;
        cursor: pointer; padding: 0;
        display: flex; align-items: center; justify-content: center;
        transition: background .16s ease, color .16s ease, border-color .16s ease;
      }
      .card-ok:hover { border-color: ${T.ink}; color: ${T.ink}; }
      .card-ok.feito {
        background: ${T.accent};
        border-color: ${T.accent};
        color: ${T.accentInk};
      }
      /* nos cartões coloridos por prioridade o botão herda o contraste */
      .card[class*="p-"] .card-ok {
        border-color: currentColor;
        background: rgba(255,255,255,.35);
        color: inherit;
      }
      .card-title.riscado { text-decoration: line-through; opacity: .6; }
      /* o due-flag deixa de empurrar o botão para fora */
      .card-top .due-flag { margin-left: 0; }

      /* ---------- prioridades: o cartão assume a cor da tag ---------- */
      /* Urgente: fundo vermelho escuro -> texto claro */
      .card.p-urgente {
        background: #C2453A;
        border-color: #7E2B24;
        box-shadow: 0 1px 2px rgba(17,17,20,.04), 0 6px 16px rgba(17,17,20,.06);
        color: #FFF3EE;
      }
      .card.p-urgente:hover { box-shadow: 0 1px 2px rgba(17,17,20,.04), 0 6px 16px rgba(17,17,20,.06); }

      /* Alta: fundo laranja -> texto marrom bem escuro */
      .card.p-alta {
        background: #E58A3A;
        border-color: #8C4A16;
        box-shadow: 0 1px 2px rgba(17,17,20,.04), 0 6px 16px rgba(17,17,20,.06);
        color: #2E1A08;
      }
      .card.p-alta:hover { box-shadow: 0 1px 2px rgba(17,17,20,.04), 0 6px 16px rgba(17,17,20,.06); }

      /* Média: fundo amarelo -> texto marrom escuro */
      .card.p-media {
        background: #F2C94C;
        border-color: #8A6A14;
        box-shadow: 0 1px 2px rgba(17,17,20,.04), 0 6px 16px rgba(17,17,20,.06);
        color: #3B2A06;
      }
      .card.p-media:hover { box-shadow: 0 1px 2px rgba(17,17,20,.04), 0 6px 16px rgba(17,17,20,.06); }

      /* Baixa: fundo verde suave -> texto verde bem escuro */
      .card.p-baixa {
        background: #A9CFAF;
        border-color: #3F6B4F;
        box-shadow: 0 1px 2px rgba(17,17,20,.04), 0 6px 16px rgba(17,17,20,.06);
        color: #142B1C;
      }
      .card.p-baixa:hover { box-shadow: 0 1px 2px rgba(17,17,20,.04), 0 6px 16px rgba(17,17,20,.06); }

      /* concluído vence a cor de prioridade: o cartão inteiro fica verde.
         Precisa vir depois das regras .card.p-* para ganhar no empate de
         especificidade — as duas têm duas classes. */
      .card.concluido {
        background: #E4F7DC;
        border-color: #BFE6B0;
        color: #245C21;
      }
      .card.concluido:hover {
        box-shadow: 0 1px 2px rgba(17,17,20,.04), 0 6px 16px rgba(36,92,33,.14);
      }
      .card.concluido .card-prod,
      .card.concluido .card-due,
      .card.concluido .progress-num { color: #245C21; opacity: .75; }
      .card.concluido .prio-flag,
      .card.concluido .prod-tag {
        border-color: currentColor !important;
        color: currentColor !important;
      }
      .card.concluido .due-flag,
      .card.concluido .due-flag.danger { color: #245C21; opacity: .7; }
      .card.concluido .track {
        border-color: #BFE6B0;
        background: rgba(255,255,255,.6);
      }
      .card.concluido .fill { background: #2C6B27; }
      .card.concluido .card-ok,
      .card.concluido .card-ok.feito {
        background: #2C6B27;
        border-color: #2C6B27;
        color: #fff;
      }

      /* elementos internos herdam a cor de contraste do fundo */
      .card[class*="p-"] .card-prod,
      .card[class*="p-"] .card-due,
      .card[class*="p-"] .progress-num { color: inherit; opacity: .82; }
      .card[class*="p-"] .prod-tag {
        border-color: currentColor !important;
        color: currentColor !important;
      }
      .card[class*="p-"] .due-flag,
      .card[class*="p-"] .due-flag.danger { color: inherit; }
      .card.p-urgente .due-flag.danger { text-decoration: underline; }
      .card[class*="p-"] .track {
        border-color: currentColor;
        background: rgba(255,255,255,.4);
      }
      .card.p-urgente .track { background: rgba(0,0,0,.22); }

      .prio-flag {
        margin-left: auto;
        font-family: 'Inter', sans-serif;
        font-weight: 700;
        font-size: 11.5px;
        letter-spacing: .5px;
        text-transform: uppercase;
        border: 1px solid currentColor;
        border-radius: 6px;
        padding: 1px 6px;
      }
      .prio-flag + .due-flag { margin-left: 6px; }

      .prio-dot {
        width: 10px; height: 10px;
        border-radius: 3px;
        display: inline-block;
        flex-shrink: 0;
      }

      .add-card, .add-col {
        width: 100%;
        margin-top: 9px;
        font-size: 14px;
        padding: 10px;
        background: transparent;
        color: ${T.muted};
        border: 1px dashed ${T.line};
        border-radius: 12px;
        cursor: pointer;
      }
      .add-col { margin-top: 0; padding: 18px; background: ${T.bg}; }
      .add-card:hover, .add-col:hover { color: ${T.ink}; border-color: ${T.ink}; }

      /* ---------- inputs / botões ---------- */
      .input {
        width: 100%;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        background: #fff;
        color: ${T.ink};
        border: 1px solid ${T.line};
        border-radius: 10px;
        padding: 7px 10px;
      }
      .input::placeholder { color: ${T.muted}; }
      .input:focus { outline: 2px solid ${T.ink}; outline-offset: 1px; }
      button:focus { outline: none; }
      button:focus-visible { outline: 3px solid ${T.ink}; outline-offset: 2px; }
      a:focus-visible { outline: 3px solid ${T.ink}; outline-offset: 2px; }
      select.input { cursor: pointer; }
      .input.inline { width: auto; font-size: 12.5px; padding: 1px 6px; border-radius: 7px; border-width: 1.5px; }

      .btn {
        font-family: 'Inter', sans-serif;
        font-weight: 500;
        font-size: 14px;
        padding: 10px 20px;
        border-radius: 999px;
        background: ${T.ink};
        color: #fff;
        border: 1px solid ${T.ink};
        cursor: pointer;
        text-decoration: none;
        display: inline-flex; align-items: center;
        white-space: nowrap;
        transition: transform .16s ease, opacity .16s ease;
      }
      .btn:hover { transform: translateY(-1px); opacity: .88; }
      .btn:active { transform: translateY(0); }
      .btn.ghost {
        background: transparent; color: ${T.ink};
        border-color: ${T.line};
      }
      .btn.ghost:hover { border-color: ${T.ink}; opacity: 1; }
      .btn.accent { background: ${T.accent}; border-color: ${T.accent}; color: ${T.accentInk}; }
      .btn.danger { background: ${T.danger}; border-color: ${T.danger}; color: #fff; }
      .btn.small { font-size: 13px; padding: 6px 14px; }
      .btn-row { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }

      .icon-btn {
        background: transparent; border: none;
        color: ${T.muted}; font-size: 24px; line-height: 1;
        padding: 0 6px; cursor: pointer;
      }
      .icon-btn:hover { color: ${T.ink}; }

      .chip {
        font-family: 'Inter', sans-serif;
        font-size: 12.5px; font-weight: 500;
        display: inline-flex; align-items: center; gap: 5px;
        background: transparent;
        color: ${T.muted};
        border: 1px solid ${T.line};
        border-radius: 999px;
        padding: 4px 12px;
        cursor: pointer;
      }
      .chip.sel { border-color: ${T.ink}; color: ${T.ink}; font-weight: 600; background: #fff; }
      .chip.small { font-size: 12px; padding: 3px 10px; }
      .chip-row { display: flex; gap: 6px; flex-wrap: wrap; }




      /* ---------- conquistas ---------- */
      .cq { margin: 18px 0 22px; }
      .cq-head {
        display: flex; align-items: center; justify-content: space-between;
        gap: 10px; flex-wrap: wrap; margin-bottom: 10px;
      }
      .cq-conta {
        font-size: 11.5px; font-weight: 600;
        background: ${T.accent}; color: ${T.accentInk};
        border-radius: 999px; padding: 3px 11px;
      }
      .cq-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(215px, 1fr));
        gap: 8px;
      }
      .cq-item {
        display: flex; align-items: flex-start; gap: 9px;
        border: 1px solid ${T.line};
        border-radius: 12px;
        padding: 10px 12px;
        background: ${T.paper};
      }
      /* bloqueada fica visível, mas apagada: saber o que falta faz parte */
      .cq-item:not(.ganha) { background: ${T.holoSoft}; }
      .cq-item:not(.ganha) .cq-tit { color: ${T.muted}; }
      .cq-dot {
        width: 10px; height: 10px; border-radius: 50%;
        background: ${T.line};
        flex-shrink: 0; margin-top: 4px;
      }
      .cq-txt { min-width: 0; }
      .cq-tit { font-size: 13px; font-weight: 600; line-height: 1.3; }
      .cq-desc { font-size: 11.5px; color: ${T.muted}; line-height: 1.45; margin-top: 2px; }
      .cq-desde {
        font-size: 10.5px; font-weight: 600; color: #2C6B27; margin-top: 4px;
      }

      /* ---------- painel de métricas da trilha ---------- */
      .pm { margin-bottom: 22px; }
      .pm-tiles { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 14px; }
      .pm-tile {
        flex: 1 1 150px; min-width: 0;
        border: 1px solid ${T.line};
        border-radius: 16px;
        padding: 14px 16px;
        background: ${T.paper};
      }
      .pm-tile.destaque {
        background: ${T.accent};
        border-color: ${T.accent};
        color: ${T.accentInk};
      }
      .pm-num {
        font-size: 26px; font-weight: 700; letter-spacing: -1px;
        font-variant-numeric: tabular-nums; line-height: 1.1;
      }
      .pm-cap {
        font-size: 11px; text-transform: uppercase; letter-spacing: 1px;
        color: ${T.muted}; margin-top: 5px;
        display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
      }
      .pm-tile.destaque .pm-cap { color: rgba(20,22,8,.7); }
      .pm-hint {
        width: 14px; height: 14px; border-radius: 50%;
        border: 1px solid currentColor;
        display: inline-flex; align-items: center; justify-content: center;
        font-size: 9px; cursor: help; flex-shrink: 0;
      }
      .pm-pend {
        background: ${T.accent}; color: ${T.accentInk};
        border-radius: 999px; padding: 2px 8px;
        font-size: 10px; letter-spacing: .6px;
      }

      .pm-bloco {
        border: 1px solid ${T.line};
        border-radius: 16px;
        padding: 14px 16px;
        margin-bottom: 12px;
        background: ${T.paper};
      }
      .pm-bloco-head {
        display: flex; align-items: center; justify-content: space-between;
        gap: 10px; flex-wrap: wrap; margin-bottom: 12px;
      }
      .pm-bloco-titulo {
        font-size: 11.5px; text-transform: uppercase; letter-spacing: 1.1px;
        font-weight: 600; color: ${T.muted};
      }
      .pm-trend { font-size: 12px; font-weight: 600; }
      .pm-trend.bom { color: #2C6B27; }
      .pm-trend.ruim { color: #A83228; }

      /* barras do retrabalho: finas, base ancorada, ponta arredondada */
      .pm-barras {
        display: flex; align-items: flex-end; gap: 10px;
        height: 118px;
      }
      .pm-col {
        flex: 1; min-width: 0;
        display: flex; flex-direction: column; align-items: center;
        height: 100%;
      }
      .pm-col-valor {
        font-size: 11px; color: ${T.muted};
        font-variant-numeric: tabular-nums; margin-bottom: 4px;
      }
      .pm-col-trilho {
        flex: 1; width: 100%; max-width: 26px;
        display: flex; align-items: flex-end;
        background: ${T.bg};
        border-radius: 5px;
        overflow: hidden;
      }
      .pm-col-fill {
        width: 100%;
        background: #eb6834;
        border-radius: 4px 4px 0 0;
      }
      .pm-col-label {
        font-size: 10px; color: ${T.muted}; margin-top: 6px;
        white-space: nowrap;
      }
      .pm-nota {
        font-size: 11.5px; color: ${T.muted}; line-height: 1.5;
        margin-top: 10px;
      }

      .pm-cob { list-style: none; margin: 0; padding: 0; }
      .pm-cob li {
        display: flex; align-items: center; gap: 10px;
        padding: 5px 0;
        font-size: 13px;
      }
      .pm-cob-nome { width: 92px; flex-shrink: 0; }
      .pm-cob-trilho {
        flex: 1; min-width: 0; height: 8px;
        background: ${T.bg};
        border-radius: 999px;
        overflow: hidden;
      }
      .pm-cob-fill { display: block; height: 100%; border-radius: 999px; }
      .pm-cob-num {
        width: 24px; text-align: right; flex-shrink: 0;
        font-variant-numeric: tabular-nums; font-weight: 600;
      }

      /* ---------- relatório da semana ---------- */
      .rel {
        border: 1px solid ${T.line};
        border-radius: 18px;
        padding: 16px 18px;
        margin-bottom: 22px;
        background: ${T.paper};
      }
      .rel-head {
        display: flex; align-items: baseline; justify-content: space-between;
        gap: 10px; flex-wrap: wrap; margin-bottom: 12px;
      }
      .rel-titulo {
        font-family: 'Instrument Serif', Georgia, serif;
        font-size: 21px; letter-spacing: -.4px;
      }
      .rel-periodo { font-size: 12px; color: ${T.muted}; }

      .rel-resumo {
        background: ${T.holoSoft};
        border-radius: 12px;
        padding: 12px 14px;
        margin-bottom: 14px;
      }
      .rel-linha { font-size: 13.5px; }
      .rel-comps { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 8px; }
      .rel-nada { font-size: 12px; color: ${T.muted}; font-style: italic; }
      .rel-aprend { list-style: none; margin: 12px 0 0; padding: 0; }
      .rel-aprend li {
        border-top: 1px solid ${T.line};
        padding: 9px 0 0; margin-top: 9px;
      }
      .ra-tit {
        display: block; font-size: 12px; font-weight: 600;
        color: ${T.muted}; margin-bottom: 3px;
      }
      .ra-txt { font-size: 13px; line-height: 1.55; white-space: pre-wrap; }

      .rel-campo { margin-top: 14px; }
      .rel-campo-tit {
        font-size: 11px; text-transform: uppercase; letter-spacing: 1px;
        color: ${T.muted};
      }
      .rel-coment { margin-top: 18px; border-top: 1px solid ${T.line}; padding-top: 6px; }
      .rel-aguardando {
        font-size: 13px; color: ${T.muted}; font-style: italic;
        padding: 6px 0;
      }
      .rel-form .btn { margin-top: 16px; }

      @media (max-width: 560px) {
        .pm-cob-nome { width: 74px; font-size: 12px; }
        .pm-barras { gap: 6px; height: 100px; }
        .pm-col-label { font-size: 9px; }
      }





      /* ---------- matérias: nível acima dos módulos ---------- */
      .mt-abas {
        display: flex; gap: 6px; flex-wrap: wrap; align-items: center;
        margin-bottom: 14px;
      }
      .mt-aba {
        display: inline-flex; align-items: center; gap: 8px;
        background: ${T.paper};
        border: 1px solid ${T.line};
        border-radius: 999px;
        padding: 9px 16px;
        font-family: 'Inter', sans-serif;
        font-size: 13.5px;
        color: ${T.muted};
        cursor: pointer;
        transition: border-color .16s ease, color .16s ease;
      }
      .mt-aba:hover { color: ${T.ink}; }
      .mt-aba.sel {
        background: ${T.ink}; border-color: ${T.ink}; color: #fff; font-weight: 600;
      }
      .mt-conta {
        font-size: 11px;
        background: ${T.bg}; color: ${T.muted};
        border-radius: 999px; padding: 1px 7px;
      }
      .mt-aba.sel .mt-conta { background: rgba(255,255,255,.2); color: #fff; }
      .mt-add {
        background: transparent;
        border: 1px dashed ${T.line};
        border-radius: 999px;
        padding: 9px 14px;
        font-family: 'Inter', sans-serif;
        font-size: 12.5px;
        color: ${T.muted};
        cursor: pointer;
      }
      .mt-add:hover { border-color: ${T.ink}; color: ${T.ink}; }
      .mt-edit {
        display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
        margin-bottom: 16px;
      }
      .mt-nome { max-width: 280px; font-weight: 600; }

      /* ---------- conteúdo do curso: aulas e partes ---------- */
      .ct-head {
        display: flex; align-items: center; justify-content: space-between;
        gap: 10px; flex-wrap: wrap; margin: 16px 0 8px;
      }
      .ct-prog {
        font-size: 11.5px; color: ${T.muted};
        background: ${T.bg}; border-radius: 999px; padding: 3px 10px;
      }
      .ct-item {
        display: flex; align-items: flex-start; gap: 10px;
        border: 1px solid ${T.line};
        border-radius: 11px;
        padding: 10px 12px;
        margin-bottom: 7px;
      }
      .ct-item.visto { background: ${T.holoSoft}; border-color: ${T.line}; }
      .ct-check {
        width: 20px; height: 20px; flex-shrink: 0;
        border: 1px solid ${T.line};
        border-radius: 6px;
        background: ${T.paper};
        color: ${T.accentInk};
        font-size: 12px; font-weight: 700;
        cursor: pointer; padding: 0;
        display: flex; align-items: center; justify-content: center;
        margin-top: 1px;
      }
      .ct-item.visto .ct-check { background: ${T.accent}; border-color: ${T.accent}; }
      .ct-txt { min-width: 0; flex: 1; }
      .ct-tit {
        font-size: 13.5px; font-weight: 600;
        display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap;
      }
      .ct-item.visto .ct-tit { color: ${T.muted}; }
      .ct-durtxt {
        font-size: 11px; font-weight: 500; color: ${T.muted};
        font-variant-numeric: tabular-nums;
      }
      .ct-temas {
        font-size: 12px; color: ${T.muted}; line-height: 1.5;
        margin-top: 3px;
      }
      .ct-edit {
        display: grid;
        grid-template-columns: 150px 96px 1fr 28px;
        gap: 6px; align-items: center;
        margin-bottom: 7px;
      }
      .ct-dur { font-variant-numeric: tabular-nums; }
      @media (max-width: 700px) {
        .ct-edit { grid-template-columns: 1fr 1fr; }
      }

      /* ---------- prova do módulo ---------- */
      .pv-head {
        display: flex; align-items: center; justify-content: space-between;
        gap: 10px; flex-wrap: wrap; margin: 16px 0 4px;
      }
      .pv-status {
        font-size: 11px; text-transform: uppercase; letter-spacing: .8px;
        border-radius: 999px; padding: 3px 10px;
        background: ${T.bg}; color: ${T.muted};
      }
      .pv-status.st-enviada { background: ${T.accent}; color: ${T.accentInk}; font-weight: 600; }
      .pv-status.st-validada { background: #E4F7DC; color: #2C6B27; font-weight: 600; }

      .pv-lista { list-style: none; margin: 8px 0 0; padding: 0; counter-reset: q; }
      .pv-q {
        counter-increment: q;
        border: 1px solid ${T.line};
        border-radius: 12px;
        padding: 12px 14px;
        margin-bottom: 9px;
      }
      .pv-enunciado {
        font-size: 14px; font-weight: 500; line-height: 1.45;
        margin-bottom: 9px;
      }
      .pv-enunciado::before {
        content: counter(q) ". ";
        color: ${T.muted}; font-weight: 600;
      }
      .pv-opcoes { display: flex; flex-direction: column; gap: 6px; }
      .pv-op {
        display: flex; align-items: center; gap: 9px;
        border: 1px solid ${T.line};
        border-radius: 10px;
        padding: 8px 11px;
        font-size: 13.5px;
        cursor: pointer;
      }
      .pv-op input { accent-color: ${T.ink}; flex-shrink: 0; }
      .pv-op:hover { border-color: ${T.ink}; }
      .pv-op.escolhida { border-color: ${T.ink}; background: ${T.holoSoft}; }
      /* depois de enviada, a correta e o erro ficam explícitos */
      .pv-op.correta { border-color: #BFE6B0; background: #E4F7DC; }
      .pv-op.errada { border-color: #F2BDB8; background: #FCE4E2; }
      .pv-marca {
        margin-left: auto; font-size: 10px; text-transform: uppercase;
        letter-spacing: .7px; color: #2C6B27; font-weight: 600;
      }

      .pv-resposta {
        font-size: 13.5px; line-height: 1.6;
        background: ${T.holoSoft};
        border-radius: 10px;
        padding: 10px 12px;
        white-space: pre-wrap;
      }
      .pv-resposta em { color: ${T.muted}; }

      .pv-val { display: flex; gap: 6px; margin-top: 9px; }
      .pv-veredito {
        margin-top: 8px; font-size: 12px; font-weight: 600;
      }
      .pv-veredito.ok { color: #2C6B27; }
      .pv-veredito.refazer { color: #A83228; }

      .pv-edit { display: flex; flex-direction: column; gap: 8px; }
      .pv-opcoes-edit { display: flex; flex-direction: column; gap: 6px; }
      .pv-op-edit { display: flex; align-items: center; gap: 9px; }
      .pv-op-edit input[type="radio"] { accent-color: #2C6B27; flex-shrink: 0; }
      .pv-edit-pe {
        display: flex; align-items: center; justify-content: space-between;
        gap: 8px;
      }
      .pv-tipo {
        font-size: 10.5px; text-transform: uppercase; letter-spacing: .8px;
        color: ${T.muted};
      }

      .pv-placar {
        font-size: 13px; font-weight: 600;
        background: ${T.bg};
        border-radius: 10px;
        padding: 9px 12px;
        margin-top: 10px;
      }
      .pv-pe { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-top: 12px; }
      .pv-pe .tr-aviso { margin-top: 0; }
      .pv-pe-mentor { margin-top: 12px; }
      .pv-parecer { margin-top: 14px; border-top: 1px solid ${T.line}; padding-top: 4px; }

      .prova-selo {
        font-size: 10px; text-transform: uppercase; letter-spacing: .8px;
        font-weight: 600;
        background: ${T.accent}; color: ${T.accentInk};
        border-radius: 999px; padding: 3px 9px;
        flex-shrink: 0;
      }
      .prova-selo.tarefa { background: ${T.bg}; color: ${T.muted}; }

      /* ---------- mapa da trilha: fita serpenteante com nós ---------- */
      .mp-wrap {
        overflow-x: auto;
        overflow-y: hidden;
        padding: 4px 0 6px;
        margin-bottom: 8px;
      }
      .mp { position: relative; margin: 0 auto; }
      .mp-fita { position: absolute; inset: 0; }
      .mp-seg {
        fill: none;
        stroke: ${T.line};
        stroke-width: 14;
        stroke-linecap: round;
      }
      .mp-seg.feito { stroke: ${T.accent}; }

      .mp-no { position: absolute; }
      .mp-circulo {
        width: 100%; height: 100%;
        border-radius: 50%;
        background: ${T.paper};
        border: 2px solid ${T.line};
        cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        font-family: 'Inter', sans-serif;
        color: ${T.muted};
        padding: 0;
        transition: transform .2s cubic-bezier(.34,1.4,.5,1), box-shadow .2s ease;
        box-shadow: 0 2px 10px rgba(17,17,20,.06);
      }
      .mp-circulo:hover { transform: scale(1.07); }
      .mp-no.emcurso .mp-circulo {
        border-color: ${T.ink};
        color: ${T.ink};
      }
      .mp-no.concluido .mp-circulo {
        background: ${T.accent};
        border-color: ${T.accent};
        color: ${T.accentInk};
      }
      .mp-no.sel .mp-circulo {
        box-shadow: 0 0 0 4px rgba(17,17,20,.1), 0 4px 14px rgba(17,17,20,.12);
      }
      .mp-check { font-size: 22px; font-weight: 700; }
      .mp-frac { font-size: 15px; font-weight: 600; }
      .mp-de { font-size: 11px; font-weight: 500; opacity: .55; }
      .mp-vazio { font-size: 16px; opacity: .5; }

      /* o selo com o número do passo, alternando de lado */
      .mp-selo {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        width: 26px; height: 26px;
        border-radius: 50%;
        background: ${T.ink};
        color: #fff;
        font-size: 12px; font-weight: 600;
        display: flex; align-items: center; justify-content: center;
        border: 2px solid ${T.paper};
      }
      .mp-no.rot-acima .mp-selo { bottom: -13px; }
      .mp-no.rot-abaixo .mp-selo { top: -13px; left: auto; right: -6px; transform: none; }
      .mp-no.concluido .mp-selo { background: #2C6B27; }

      /* o rótulo fica do lado oposto ao selo */
      .mp-rotulo {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        width: 142px;
        text-align: center;
        font-size: 12.5px;
        font-weight: 600;
        line-height: 1.35;
        color: ${T.ink};
      }
      .mp-no.rot-acima .mp-rotulo { bottom: calc(100% + 22px); }
      .mp-no.rot-abaixo .mp-rotulo { top: calc(100% + 22px); }
      .mp-no.aseguir .mp-rotulo { color: ${T.muted}; font-weight: 500; }
      .mp-comp {
        display: block;
        font-size: 10.5px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: .7px;
        margin-top: 3px;
      }

      /* no celular a fita não cabe: vira uma tira de passos rolável */
      .mp-tiras { display: none; }
      @media (max-width: 780px) {
        .mp-wrap { display: none; }
        .mp-tiras {
          display: flex; gap: 8px;
          overflow-x: auto;
          padding: 2px 0 10px;
          margin-bottom: 6px;
        }
        .mp-tira {
          display: flex; align-items: center; gap: 8px;
          flex-shrink: 0;
          background: ${T.paper};
          border: 1px solid ${T.line};
          border-radius: 999px;
          padding: 8px 14px 8px 8px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          color: ${T.ink};
          cursor: pointer;
          max-width: 74vw;
        }
        .mp-tira-num {
          width: 22px; height: 22px; border-radius: 50%;
          background: ${T.bg}; color: ${T.muted};
          font-size: 11px; font-weight: 600;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .mp-tira-tit {
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .mp-tira.emcurso { border-color: ${T.ink}; }
        .mp-tira.emcurso .mp-tira-num { background: ${T.ink}; color: #fff; }
        .mp-tira.concluido .mp-tira-num { background: ${T.accent}; color: ${T.accentInk}; }
        .mp-tira.sel { box-shadow: 0 0 0 3px rgba(17,17,20,.09); }
      }

      /* ---------- o caminho: módulos ligados por uma linha ---------- */
      .tl-progresso { margin-bottom: 20px; }
      .tl-prog-barra {
        height: 8px; border-radius: 999px;
        background: ${T.bg};
        overflow: hidden;
      }
      .tl-prog-fill {
        display: block; height: 100%;
        background: ${T.accent};
        border-radius: 999px;
        transition: width .35s ease;
      }
      .tl-prog-txt { font-size: 12.5px; color: ${T.muted}; margin-top: 7px; }
      .tl-prog-txt strong { color: ${T.ink}; }

      .tr-fila { margin-bottom: 18px; }

      .tl { list-style: none; margin: 0; padding: 0; }
      .tl-item {
        display: grid;
        grid-template-columns: 34px 1fr;
        gap: 14px;
        position: relative;
        padding-bottom: 14px;
      }
      /* a linha que liga os marcos — é o que faz virar caminho */
      .tl-item:not(:last-child) .tl-marco::after {
        content: "";
        position: absolute;
        top: 34px; bottom: -14px; left: 50%;
        width: 2px;
        transform: translateX(-50%);
        background: ${T.line};
      }
      .tl-item.concluido:not(:last-child) .tl-marco::after { background: ${T.accent}; }

      .tl-marco { position: relative; display: flex; justify-content: center; }
      .tl-num {
        width: 30px; height: 30px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 13px; font-weight: 600;
        background: ${T.paper};
        border: 1px solid ${T.line};
        color: ${T.muted};
        z-index: 1;
      }
      .tl-item.emcurso .tl-num {
        background: ${T.ink}; border-color: ${T.ink}; color: #fff;
      }
      .tl-item.concluido .tl-num {
        background: ${T.accent}; border-color: ${T.accent}; color: ${T.accentInk};
      }

      .tl-card {
        border: 1px solid ${T.line};
        border-radius: 16px;
        background: ${T.paper};
        overflow: hidden;
      }
      .tl-item.emcurso .tl-card { border-color: ${T.ink}; }
      /* módulos ainda não iniciados ficam recuados: dá a leitura de "à frente" */
      .tl-item.aseguir .tl-card { background: ${T.holoSoft}; }
      .tl-item.aseguir .tl-mod-titulo { color: ${T.muted}; }

      .tl-head {
        display: flex; align-items: flex-start; justify-content: space-between;
        gap: 12px; width: 100%;
        background: transparent; border: 0;
        padding: 13px 15px;
        cursor: pointer;
        text-align: left;
        font-family: 'Inter', sans-serif;
        color: ${T.ink};
      }
      .tl-head-txt { min-width: 0; }
      .tl-mod-titulo { font-size: 15.5px; font-weight: 600; line-height: 1.3; }
      .tl-meta {
        display: flex; align-items: center; gap: 7px; flex-wrap: wrap;
        margin-top: 5px; font-size: 11.5px; color: ${T.muted};
      }
      .tl-sep { opacity: .5; }
      .tl-selo {
        background: ${T.accent}; color: ${T.accentInk};
        border-radius: 999px; padding: 2px 9px;
        font-size: 10px; font-weight: 600;
        text-transform: uppercase; letter-spacing: .7px;
      }
      .tl-selo.emcurso { background: ${T.ink}; color: #fff; }
      .tl-chevron {
        font-size: 18px; color: ${T.muted}; flex-shrink: 0;
        width: 20px; text-align: center;
      }

      .tl-barra { height: 3px; background: ${T.bg}; }
      .tl-barra-fill {
        display: block; height: 100%;
        background: ${T.accent};
        transition: width .35s ease;
      }

      .tl-corpo { padding: 4px 15px 15px; }
      .tl-objetivo { margin-top: 10px; }
      .tl-obj-tit {
        font-size: 11px; text-transform: uppercase; letter-spacing: 1px;
        color: ${T.muted};
      }
      .tl-secao { margin-top: 16px; }
      .tl-vazio-txt { font-size: 13px; color: ${T.muted}; font-style: italic; }

      .tl-rec {
        display: flex; align-items: center; gap: 8px;
        border: 1px solid ${T.line};
        border-radius: 10px;
        padding: 9px 12px;
        margin-bottom: 7px;
        font-size: 13.5px;
        color: ${T.ink};
        text-decoration: none;
      }
      .tl-rec:hover { border-color: ${T.ink}; }
      .tl-rec-ico { color: ${T.muted}; font-size: 12px; }
      .tl-rec-edit {
        display: flex; gap: 6px; align-items: center; margin-bottom: 7px;
      }
      .tl-rec-edit .input:first-child { flex: 0 0 38%; }


      /* material de leitura: abre dentro do painel, sem baixar nada */
      .tl-leitura {
        border: 1px solid ${T.line};
        border-radius: 11px;
        margin-bottom: 7px;
        background: ${T.paper};
      }
      .tl-leitura > summary {
        display: flex; align-items: center; gap: 8px;
        padding: 10px 12px;
        cursor: pointer;
        font-size: 13.5px; font-weight: 600;
        list-style: none;
      }
      .tl-leitura > summary::-webkit-details-marker { display: none; }
      .tl-leitura[open] > summary {
        border-bottom: 1px solid ${T.line};
        color: ${T.ink};
      }
      .tl-leitura[open] .tl-rec-ico { transform: rotate(90deg); }
      .tl-leitura .tl-rec-ico { transition: transform .16s ease; }
      .tl-leitura-corpo {
        padding: 12px 14px 14px;
        font-size: 13.5px;
        line-height: 1.65;
        color: ${T.ink};
        white-space: pre-wrap;
      }
      .tl-rec-txt-edit {
        display: grid;
        grid-template-columns: 1fr 28px;
        gap: 6px;
        margin-bottom: 9px;
      }
      .tl-rec-txt-edit .input:first-child { grid-column: 1 / -1; font-weight: 600; }

      .tl-tarefa {
        display: flex; align-items: center; gap: 10px;
        width: 100%; text-align: left;
        border: 1px solid ${T.line};
        border-radius: 10px;
        background: ${T.paper};
        padding: 9px 12px;
        margin-bottom: 7px;
        font-family: 'Inter', sans-serif;
        font-size: 13.5px;
        color: ${T.ink};
        cursor: pointer;
      }
      .tl-tarefa:hover { border-color: ${T.ink}; }
      .tl-tarefa-tit { flex: 1; min-width: 0; }
      .tl-tag {
        font-size: 10px; text-transform: uppercase; letter-spacing: .7px;
        border-radius: 999px; padding: 3px 9px;
        flex-shrink: 0;
        background: ${T.bg}; color: ${T.muted};
      }
      .tl-tag.st-fazendo { background: ${T.ink}; color: #fff; }
      .tl-tag.st-entregue { background: ${T.accent}; color: ${T.accentInk}; }
      .tl-tag.st-revisada { background: #E4F7DC; color: #2C6B27; }

      .tl-orfas { margin-top: 20px; }
      .pm-de { font-size: 16px; font-weight: 500; opacity: .55; }

      @media (max-width: 560px) {
        .tl-item { grid-template-columns: 26px 1fr; gap: 10px; }
        .tl-num { width: 24px; height: 24px; font-size: 11px; }
        .tl-item:not(:last-child) .tl-marco::after { top: 28px; }
        .tl-rec-edit { flex-wrap: wrap; }
        .tl-rec-edit .input:first-child { flex: 1 1 100%; }
      }

      /* ---------- trilha de desenvolvimento ---------- */
      .tr-top {
        display: flex; align-items: flex-start; justify-content: space-between;
        gap: 14px; flex-wrap: wrap;
        margin: 18px 0 20px;
      }
      .tr-titulo {
        font-family: 'Instrument Serif', Georgia, serif;
        font-size: 26px; letter-spacing: -.6px;
      }
      .tr-sub { font-size: 13px; color: ${T.muted}; margin-top: 3px; max-width: 520px; line-height: 1.5; }

      .tr-colunas {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
        align-items: start;
      }
      .tr-coluna {
        background: ${T.bg};
        border-radius: 16px;
        padding: 12px;
        min-width: 0;
      }
      .tr-col-head {
        display: flex; align-items: center; justify-content: space-between;
        gap: 8px; margin-bottom: 10px;
      }
      .tr-col-nome {
        font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px;
        font-weight: 600; color: ${T.muted};
      }
      .tr-lista { display: flex; flex-direction: column; gap: 8px; }
      .tr-vazio-col { text-align: center; color: ${T.line}; font-size: 18px; padding: 6px 0; }

      .tr-card {
        display: block; width: 100%; text-align: left;
        background: ${T.paper};
        border: 1px solid ${T.line};
        border-radius: 12px;
        padding: 10px 11px;
        cursor: pointer;
        font-family: 'Inter', sans-serif;
        color: ${T.ink};
        transition: transform .14s ease, box-shadow .14s ease;
      }
      .tr-card:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 16px rgba(17,17,20,.08);
      }
      .tr-card.atrasada { border-color: #F2BDB8; }
      .tr-card-top {
        display: flex; align-items: center; gap: 7px; flex-wrap: wrap;
        margin-bottom: 5px;
      }
      .tr-tipo {
        font-size: 10px; text-transform: uppercase; letter-spacing: .9px;
        background: ${T.bg}; border-radius: 999px; padding: 2px 8px;
        color: ${T.muted};
      }
      .tr-comp { font-size: 11px; font-weight: 600; }
      .tr-card-titulo { font-size: 14px; font-weight: 500; line-height: 1.35; }
      .tr-vazio { color: ${T.muted}; font-style: italic; font-weight: 400; }
      .tr-card-pe {
        display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
        margin-top: 7px; font-size: 11.5px;
      }
      .tr-prazo { color: ${T.muted}; }
      .tr-prazo.atraso { color: #A83228; font-weight: 600; }
      .tr-pendente {
        background: ${T.accent}; color: ${T.accentInk};
        border-radius: 999px; padding: 2px 9px;
        font-size: 10.5px; font-weight: 600;
        text-transform: uppercase; letter-spacing: .7px;
      }
      .tr-nota { font-weight: 600; }
      .tr-nota.grande { font-size: 16px; }

      .tr-bloco {
        margin-top: 18px;
        border-top: 1px solid ${T.line};
        padding-top: 6px;
      }
      .tr-chips { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 12px; }
      .tr-desc {
        font-size: 14px; line-height: 1.6; color: ${T.ink};
        white-space: pre-wrap;
        margin: 10px 0 0;
      }
      .tr-link {
        display: inline-block; font-size: 13px; color: #1c5cab;
        word-break: break-all; margin-top: 6px;
      }
      .tr-aviso {
        font-size: 12px; color: ${T.muted}; line-height: 1.5;
        margin-top: 8px;
      }
      .tr-aval { border-width: 1px; font-weight: 600; }
      .btn:disabled { opacity: .45; cursor: not-allowed; }
      .btn:disabled:hover { transform: none; }

      @media (max-width: 900px) {
        .tr-colunas { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
      @media (max-width: 560px) {
        .tr-colunas { grid-template-columns: 1fr; }
        .tr-titulo { font-size: 22px; }
      }

      /* ---------- planilha de orçamentos ---------- */

      /* ---------- a cor identifica a gráfica, do gráfico até a tabela ---------- */
      .ogh-dot {
        display: inline-block;
        width: 9px; height: 9px;
        border-radius: 3px;
        background: var(--cor-grafica, ${T.muted});
        margin-right: 8px;
        vertical-align: middle;
      }
      /* fio colorido na borda esquerda das linhas do grupo */
      .orc-group td:first-child {
        border-left: 3px solid var(--cor-grafica, transparent);
        padding-left: 9px;
      }
      .orc-group .orc-group-head td:first-child {
        border-left: 0;
        padding-left: 0;
      }

      .orc-top {
        display: flex; align-items: center; justify-content: space-between;
        gap: 14px; flex-wrap: wrap;
        margin: 18px 0 22px;
      }
      .orc-totals { display: flex; gap: 10px; flex-wrap: wrap; }
      .orc-total-box {
        background: ${T.ink};
        color: #fff;
        border-radius: 16px;
        padding: 14px 20px;
        min-width: 150px;
      }
      .orc-total-box.sub {
        background: ${T.paper};
        color: ${T.ink};
        border: 1px solid ${T.line};
      }
      .orc-total-num {
        font-size: 22px; font-weight: 600; letter-spacing: -.6px; line-height: 1.1;
      }
      .orc-total-name {
        font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px;
        opacity: .62; margin-top: 4px;
      }


      /* ---------- dashboard do orçamento: só o essencial ---------- */
      .orc-top-title { font-size: 15px; font-weight: 600; }

      .dash {
        display: flex;
        align-items: center;
        gap: 20px;
        flex-wrap: wrap;
        border: 0;
        border-radius: 20px;
        padding: 18px 22px;
        margin-bottom: 20px;
        background: ${T.accent};
        color: ${T.accentInk};
        box-shadow: 0 2px 10px rgba(17,17,20,.06);
      }

      .rosca-wrap { position: relative; width: 116px; height: 116px; flex-shrink: 0; }
      .rosca { width: 100%; height: 100%; transform: rotate(-90deg); }
      .rosca-trilho { fill: none; stroke: rgba(20,22,8,.14); stroke-width: 12; }
      .rosca-fatia { fill: none; stroke-width: 12; stroke-linecap: butt; }
      .rosca-centro {
        position: absolute; inset: 0;
        display: flex; flex-direction: column;
        align-items: center; justify-content: center;
        text-align: center;
        padding: 0 12px;
      }
      .rosca-num {
        font-size: 16px; font-weight: 700; letter-spacing: -.4px;
        font-variant-numeric: tabular-nums; line-height: 1.2;
        color: ${T.accentInk};
      }
      .rosca-num.grande { font-size: 32px; letter-spacing: -1.4px; }
      .solo-cap {
        display: inline-flex; align-items: center; gap: 7px;
        color: ${T.accentInk};
        margin-top: 8px;
      }
      .solo-cap strong { font-weight: 700; }
      .solo-dot {
        width: 9px; height: 9px; border-radius: 3px; flex-shrink: 0;
      }
      .rosca-cap {
        font-size: 9.5px; text-transform: uppercase; letter-spacing: .9px;
        color: rgba(20,22,8,.66); margin-top: 3px; line-height: 1.3;
      }

      .dash-solo { flex: 1; min-width: 0; }
      .dash-solo .rosca-cap { font-size: 11px; margin-top: 4px; }

      .dash-legenda { list-style: none; margin: 0; padding: 0; flex: 1; min-width: 170px; }
      .dash-legenda li {
        display: flex; align-items: center; gap: 9px;
        padding: 5px 0;
        font-size: 13px;
        color: ${T.accentInk};
      }
      .lg-cor { width: 9px; height: 9px; border-radius: 3px; flex-shrink: 0; }
      .lg-nome {
        flex: 1; min-width: 0;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .lg-valor { font-weight: 600; font-variant-numeric: tabular-nums; white-space: nowrap; }

      .dash-rodape {
        display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
        margin-left: auto;
        font-size: 12.5px;
      }
      .dr-ganho, .dr-alerta {
        background: rgba(255,255,255,.62);
        border-radius: 999px;
        padding: 5px 12px;
      }
      .dr-ganho { font-weight: 600; color: #2C6B27; }
      .dr-alerta { color: #8A5A14; }

      @media (max-width: 620px) {
        .dash { padding: 14px 16px; gap: 14px; }
        .dash-rodape { margin-left: 0; width: 100%; }
      }

      .orc-event {
        border: 1px solid ${T.line};
        border-radius: 18px;
        background: ${T.paper};
        padding: 14px 14px 12px;
        margin-bottom: 16px;
      }
      .orc-event-head {
        display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
        margin-bottom: 12px;
      }
      .orc-event-name {
        flex: 1; min-width: 180px;
        font-size: 16px; font-weight: 600;
        border-color: transparent;
        background: transparent;
        padding-left: 4px;
      }
      .orc-event-name:hover { border-color: ${T.line}; }
      .orc-event-date { width: auto; flex-shrink: 0; font-size: 13px; }
      .orc-event-total {
        font-size: 15px; font-weight: 600;
        background: ${T.accent};
        color: ${T.accentInk};
        border-radius: 999px;
        padding: 6px 14px;
        white-space: nowrap;
      }

      .orc-table-wrap { overflow-x: auto; }
      .orc-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 820px;
      }
      .orc-table th {
        text-align: left;
        font-size: 10.5px;
        text-transform: uppercase;
        letter-spacing: 1.2px;
        font-weight: 500;
        color: ${T.muted};
        padding: 0 8px 8px;
        border-bottom: 1px solid ${T.line};
        white-space: nowrap;
      }
      .orc-table td {
        padding: 3px 4px;
        border-bottom: 1px solid ${T.line};
        vertical-align: middle;
      }
      .orc-table tbody:last-child tr:last-child td { border-bottom: 0; }

      /* cabeçalho de gráfica: separa os orçamentos sem quebrar o evento */
      .orc-group-head td {
        padding: 16px 4px 7px;
        border-bottom: 1px solid ${T.line};
      }
      .orc-group + .orc-group .orc-group-head td { padding-top: 22px; }
      /* nome da gráfica: editável, mas sem cara de campo até o hover */
      .ogh-name {
        font-family: 'Inter', sans-serif;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1.1px;
        color: ${T.ink};
        background: transparent;
        border: 1px solid transparent;
        border-radius: 8px;
        padding: 5px 8px;
        width: 230px;
        max-width: 45%;
      }
      .ogh-name::placeholder { color: ${T.muted}; font-weight: 500; }
      .ogh-name:hover { border-color: ${T.line}; }
      .ogh-name:focus {
        outline: none;
        background: ${T.paper};
        border-color: ${T.ink};
      }
      .ogh-count {
        font-size: 11.5px;
        color: ${T.muted};
        margin-left: 4px;
      }
      .ogh-add {
        margin-left: 12px;
        background: transparent;
        border: 1px dashed ${T.line};
        border-radius: 999px;
        padding: 4px 12px;
        font-family: 'Inter', sans-serif;
        font-size: 11.5px;
        color: ${T.muted};
        cursor: pointer;
        transition: border-color .16s ease, color .16s ease;
      }
      .ogh-add:hover { border-color: ${T.ink}; color: ${T.ink}; }
      .ogh-total {
        float: right;
        font-size: 13px;
        font-weight: 600;
        background: ${T.bg};
        border-radius: 999px;
        padding: 3px 12px;
        font-variant-numeric: tabular-nums;
      }
      .orc-table .c-item { width: auto; min-width: 220px; }
      .orc-table .c-qtd { width: 68px; }
      .orc-table .c-valor { width: 106px; }
      .orc-table .c-data { width: 138px; }
      .orc-table .c-forn { width: 168px; }
      .orc-table .c-fecha { width: 148px; }
      .orc-table .c-status { width: 140px; }
      .orc-table .c-del { width: 34px; text-align: center; }

      /* o nome do item nunca é cortado: quebra em duas linhas se precisar */
      .cell-nome {
        white-space: normal;
        resize: none;
        overflow: hidden;
        line-height: 1.35;
        min-height: 34px;
        display: block;
      }

      /* célula editável: parece planilha, sem moldura até o foco */
      .cell {
        width: 100%;
        font-family: 'Inter', sans-serif;
        font-size: 13.5px;
        color: ${T.ink};
        background: transparent;
        border: 1px solid transparent;
        border-radius: 8px;
        padding: 8px 8px;
      }
      .cell::placeholder { color: ${T.muted}; opacity: .7; }
      .cell:hover { border-color: ${T.line}; }
      .cell:focus {
        outline: none;
        background: ${T.paper};
        border-color: ${T.ink};
      }
      .cell-num { text-align: right; font-variant-numeric: tabular-nums; }
      .cell-select { cursor: pointer; appearance: none; }
      .cell-select.fecha-firmino { color: #1F5C8C; font-weight: 600; }
      .cell-select.fecha-superiores { color: #8A5A14; font-weight: 600; }

      /* prazo de produção como tag: verde = dias corridos, vermelho = dias úteis */
      .prazo {
        display: inline-flex; align-items: center; gap: 2px;
        border-radius: 999px;
        padding: 5px 6px 5px 10px;
        border: 1px solid transparent;
        transition: filter .16s ease;
      }
      .prazo select {
        appearance: none;
        background: transparent;
        border: 0;
        font-family: 'Inter', sans-serif;
        font-size: 12.5px;
        font-weight: 600;
        color: inherit;
        cursor: pointer;
        padding: 0;
      }
      .prazo select:focus { outline: none; text-decoration: underline; }
      .prazo-num { text-align: right; }
      .prazo-tipo { padding-right: 2px; }
      .prazo:hover { filter: brightness(.97); }

      .prazo-dias {
        background: #E4F7DC;
        border-color: #BFE6B0;
        color: #2C6B27;
      }
      .prazo-uteis {
        background: #FCE4E2;
        border-color: #F2BDB8;
        color: #A83228;
      }
      /* sem prazo definido: neutro, até escolher */
      .prazo.vazio {
        background: ${T.bg};
        border-color: ${T.line};
        color: ${T.muted};
      }

      .icon-btn.small { font-size: 18px; }

      @media (max-width: 640px) {
        .orc-total-box { min-width: 0; padding: 12px 15px; }
        .orc-total-num { font-size: 18px; }
      }


      /* ---------- etiquetas de destaque (quem fecha / status) ---------- */
      .tag {
        display: inline-flex; align-items: center; gap: 6px;
        border-radius: 999px;
        border: 1px solid transparent;
        padding: 6px 10px;
        max-width: 100%;
      }
      .tag select {
        appearance: none;
        background: transparent;
        border: 0;
        font-family: 'Inter', sans-serif;
        font-size: 12.5px;
        font-weight: 600;
        color: inherit;
        cursor: pointer;
        padding: 0;
        max-width: 100%;
      }
      .tag select:focus { outline: none; text-decoration: underline; }
      .tag-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }

      /* quem fecha: cada responsável tem sua cor; "a definir" fica tracejado
         de propósito, para ler como pendência e não como decisão tomada */
      .tag-fecha.fecha-firmino { background: #E4EFFA; border-color: #BBD6EE; color: #1F5C8C; }
      .tag-fecha.fecha-superiores { background: #FBEFDB; border-color: #EFD6A8; color: #8A5A14; }
      .tag-fecha.fecha-indefinido {
        background: transparent;
        border-color: ${T.line};
        border-style: dashed;
        color: ${T.muted};
      }
      .tag-status { background: ${T.bg}; border-color: transparent; color: ${T.ink}; }


      /* aviso de pendência: discreto, mas com um pulso que puxa o olho */
      .aviso-fecha {
        display: inline-flex; align-items: center; gap: 7px;
        margin-top: 6px;
        font-size: 11.5px;
        font-weight: 500;
        letter-spacing: .2px;
        color: #8A5A14;
      }
      .aviso-dot {
        width: 7px; height: 7px; border-radius: 50%;
        background: #E8A33D;
        box-shadow: 0 0 0 0 rgba(232,163,61,.55);
        animation: aviso-pulse 2.4s ease-out infinite;
        flex-shrink: 0;
      }
      @keyframes aviso-pulse {
        0%   { box-shadow: 0 0 0 0 rgba(232,163,61,.55); }
        70%  { box-shadow: 0 0 0 7px rgba(232,163,61,0); }
        100% { box-shadow: 0 0 0 0 rgba(232,163,61,0); }
      }
      @media (prefers-reduced-motion: reduce) { .aviso-dot { animation: none; } }

      .item-head { display: flex; align-items: flex-start; gap: 8px; }
      .item-head > .cell-nome { flex: 1; min-width: 0; }
      /* a seta só existe no celular, onde o item abre resumido */
      .row-toggle { display: none; }

      /* ---------- celular: a tabela vira um cartão por item ----------
         Sem grid e sem overflow visível: cada campo é uma linha simples,
         e todo container ganha min-width:0 para poder encolher de verdade. */
      @media (max-width: 780px) {
        .orc-table-wrap { overflow-x: hidden; }
        .orc-table { min-width: 0; width: 100%; display: block; }
        .orc-table thead { display: none; }
        .orc-table tbody { display: block; }
        .orc-table colgroup { display: none; }

        .orc-table tbody tr {
          display: block;
          border: 1px solid ${T.line};
          border-left: 3px solid var(--cor-grafica, ${T.line});
          border-radius: 14px;
          padding: 12px;
          margin-bottom: 10px;
          background: ${T.paper};
        }

        .orc-table td {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          width: auto;
          min-width: 0;
          padding: 7px 0;
          border-bottom: 1px dashed ${T.line};
        }
        .orc-table td::before {
          content: attr(data-label);
          flex: 0 0 auto;
          max-width: 45%;
          font-size: 10.5px;
          text-transform: uppercase;
          letter-spacing: .8px;
          color: ${T.muted};
        }
        /* o valor do campo encolhe junto com a tela em vez de vazar */
        .orc-table td > * { min-width: 0; max-width: 100%; }
        .orc-table td .cell {
          flex: 1 1 auto;
          width: auto;
          min-width: 0;
          text-align: right;
          padding: 4px 6px;
        }

        /* nome do item: linha inteira, em destaque, sem rótulo */
        .orc-group td:first-child { border-left: 0; padding-left: 0; }
        .orc-table td[data-label="Item"] {
          display: block;
          padding: 0 0 10px;
          margin-bottom: 4px;
          border-bottom: 1px solid ${T.line};
        }
        .orc-table td[data-label="Item"]::before { display: none; }
        .orc-table td[data-label="Item"] .cell {
          width: 100%;
          text-align: left;
          font-size: 15px;
          font-weight: 600;
          padding: 0;
        }

        /* etiquetas alinhadas à direita, encolhendo se faltar espaço
           (.prazo tem a mesma estrutura, mas não compartilha a classe .tag) */
        .orc-table td .tag,
        .orc-table td .prazo { flex: 0 1 auto; min-width: 0; }
        .orc-table td .tag select,
        .orc-table td .prazo select { min-width: 0; }
        .orc-table td .prazo { white-space: nowrap; }


        /* resumo: só nome, valor e prazo. O resto aparece ao expandir. */
        .orc-table tbody tr:not(.aberto) td[data-label="Qtd."],
        .orc-table tbody tr:not(.aberto) td[data-label="Orçado em"],
        .orc-table tbody tr:not(.aberto) td[data-label="Quem fecha"],
        .orc-table tbody tr:not(.aberto) td[data-label="Status"],
        .orc-table tbody tr:not(.aberto) td.c-del { display: none; }
        /* sem nada abaixo, o prazo não precisa de linha divisória */
        .orc-table tbody tr:not(.aberto) td[data-label="Prazo de produção"] {
          border-bottom: 0;
          padding-bottom: 0;
        }

        .row-toggle {
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          width: 30px; height: 30px;
          margin-top: 1px;
          border: 1px solid ${T.line};
          border-radius: 50%;
          background: ${T.paper};
          color: ${T.ink};
          cursor: pointer;
          padding: 0;
        }
        .row-toggle svg { width: 15px; height: 15px; transition: transform .2s ease; }
        tr.aberto .row-toggle svg { transform: rotate(180deg); }
        tr.aberto .row-toggle { background: ${T.bg}; }

        .orc-table td.c-del {
          justify-content: flex-end;
          border-bottom: 0;
          padding: 6px 0 0;
        }
        .orc-table td.c-del::before { display: none; }

        /* cabeçalho de gráfica: nome em cima, contagem/total embaixo */
        .orc-table tbody tr.orc-group-head {
          display: block;
          border: 0;
          background: transparent;
          padding: 16px 2px 6px;
          margin: 0;
        }
        .orc-group-head td {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          padding: 0;
          border: 0;
        }
        .orc-group-head td::before { display: none; }
        .ogh-name {
          flex: 1 1 100%;
          width: auto;
          max-width: 100%;
          padding-left: 0;
        }
        .ogh-count { margin-left: 0; }
        .ogh-total { float: none; margin-left: auto; }

        /* cabeçalho do evento: nome ocupa a linha, data e total embaixo */
        .orc-event { padding: 12px 10px 10px; }
        .orc-event-head { gap: 8px; }
        .orc-event-name {
          flex: 1 1 100%;
          min-width: 0;
          font-size: 15px;
          padding-left: 0;
        }
        .orc-event-date { flex: 1 1 auto; min-width: 0; }
        .orc-event-total { margin-left: auto; }

        /* resumo do topo empilha em vez de espremer */
        .orc-top { margin: 14px 0 18px; }
        .orc-totals { width: 100%; }
        .orc-total-box { flex: 1 1 140px; min-width: 0; }
      }

      /* ---------- modal ---------- */
      .overlay {
        position: fixed; inset: 0;
        background: rgba(17,17,20,.42);
        -webkit-backdrop-filter: blur(6px);
        backdrop-filter: blur(6px);
        display: flex; align-items: center; justify-content: center;
        padding: 14px; z-index: 60;
      }
      .modal {
        background: ${T.paper};
        border: 1px solid ${T.line};
        border-radius: 22px;
        box-shadow: 0 8px 20px rgba(17,17,20,.08), 0 30px 70px rgba(17,17,20,.16);
        padding: 24px;
        width: 100%; max-width: 620px;
        max-height: 88vh; overflow-y: auto;
        position: relative;
      }
      .modal-head { display: flex; justify-content: space-between; gap: 10px; align-items: center; margin-top: 4px; }
      .modal-title { font-size: 19px; }
      .title-input { font-size: 17px; font-weight: 600; }
      .field { margin-top: 16px; }
      .field-label {
        display: block;
        font-size: 14px;
        color: ${T.ink};
        margin-bottom: 7px;
      }
      .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      @media (max-width: 540px) { .two-col { grid-template-columns: 1fr; } }
      .tpl-row { display: flex; gap: 6px; flex-wrap: wrap; }
      .tpl-row .input { flex: 1; min-width: 130px; width: auto; }

      .check-row { display: flex; align-items: center; gap: 10px; padding: 4px 0; }
      .checkbox {
        width: 22px; height: 22px; flex-shrink: 0;
        background: #fff;
        border: 1px solid ${T.line};
        border-radius: 7px;
        color: ${T.ink};
        font-size: 13px; font-weight: 700;
        display: flex; align-items: center; justify-content: center;
        padding: 0; cursor: pointer;
      }
      .checkbox.on { background: ${T.holo}; }
      .check-text { flex: 1; font-size: 14px; }
      .check-text.done { text-decoration: line-through; color: ${T.muted}; }
      .sched-ok { margin-top: 8px; font-size: 13.5px; color: #3FA37A; font-weight: 600; }
      .modal-foot { display: flex; justify-content: flex-end; gap: 8px; margin-top: 20px; }

      /* ---------- calendário ---------- */
      .cal-nav { display: flex; align-items: center; justify-content: center; gap: 16px; margin-bottom: 12px; }
      .cal-month { font-size: 22px; min-width: 210px; text-align: center; }
      .week-bar {
        display: flex; gap: 14px; flex-wrap: wrap; align-items: center; justify-content: center;
        border: 1px solid ${T.line};
        border-radius: 999px;
        background: ${T.holoSoft};
        padding: 7px 18px;
        margin-bottom: 14px;
        font-size: 13px;
      }
      .week-bar .px-label { font-size: 14px; }
      .week-net b { font-weight: 700; }
      .week-net.zero { color: ${T.danger}; font-weight: 600; }

      .week-row { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; margin-bottom: 6px; }
      .weekday { font-size: 13px; text-align: center; color: ${T.muted}; }
      .cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; }
      .day {
        text-align: left;
        background: ${T.paper};
        border: 1px solid ${T.line};
        border-radius: 12px;
        min-height: 88px;
        padding: 6px;
        cursor: pointer;
        font-family: 'Inter', sans-serif;
        color: ${T.ink};
        overflow: hidden;
        transition: border-color .12s ease;
      }
      .day:hover { border-color: ${T.ink}; }
      .day.blank { background: transparent; border-style: dotted; cursor: default; }
      /* hoje: anel escuro discreto + número em pílula amarela */
      .day.today {
        border-color: ${T.ink};
        box-shadow: 0 0 0 1px ${T.ink};
        position: relative;
      }
      .day-num { font-size: 14px; margin-bottom: 4px; }
      .day.today .day-num {
        font-weight: 600;
        background: ${T.accent};
        color: ${T.accentInk};
        border-radius: 999px;
        padding: 1px 8px;
        display: inline-block;
      }
      .day-items { display: flex; flex-direction: column; gap: 3px; }
      .cal-item { display: flex; align-items: center; gap: 4px; font-size: 11.5px; line-height: 1.2; }
      .cal-item.pub { opacity: .55; text-decoration: line-through; }
      .ci-dot { width: 7px; height: 7px; border-radius: 2px; flex-shrink: 0; }
      .ci-title { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .more { font-size: 11px; color: ${T.muted}; }
      .cal-legend {
        display: flex; gap: 16px; flex-wrap: wrap; justify-content: center;
        margin-top: 14px; font-size: 12.5px; color: ${T.muted};
      }
      .cal-legend .lg {
        display: inline-block; width: 10px; height: 10px; border-radius: 3px;
        margin-right: 5px; vertical-align: middle;
      }

      .day-item {
        border: 1px solid ${T.line};
        border-left-width: 8px;
        border-radius: 12px;
        background: #fff;
        box-shadow: 0 1px 2px rgba(17,17,20,.04), 0 6px 16px rgba(17,17,20,.06);
        padding: 10px 12px;
        margin-top: 10px;
      }
      .img-strip { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
      .img-thumb {
        position: relative; width: 66px; height: 66px;
        border: 1px solid ${T.line}; border-radius: 10px;
        overflow: hidden; background: #fff;
      }
      .img-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; cursor: zoom-in; }
      .img-preview-wrap { position: relative; max-width: 92vw; max-height: 88vh; }
      .img-preview {
        display: block; max-width: 92vw; max-height: 88vh;
        object-fit: contain;
        border: 1px solid ${T.line}; border-radius: 12px;
        box-shadow: 0 1px 2px rgba(17,17,20,.05), 0 10px 26px rgba(17,17,20,.09); background: ${T.paper};
      }
      .img-preview-close {
        position: absolute; top: -14px; right: -14px;
        width: 36px; height: 36px;
        border: 1px solid ${T.line}; border-radius: 50%;
        background: ${T.paper}; color: ${T.ink};
        font-size: 20px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 1px 2px rgba(17,17,20,.04), 0 6px 16px rgba(17,17,20,.06);
      }
      .img-del {
        position: absolute; top: 2px; right: 2px;
        width: 18px; height: 18px; border: none; border-radius: 6px;
        background: ${T.ink}; color: ${T.paper};
        font-size: 13px; line-height: 1; cursor: pointer;
        display: flex; align-items: center; justify-content: center; padding: 0;
      }
      .img-add {
        width: 66px; height: 66px;
        border: 1px dashed ${T.line}; border-radius: 10px;
        background: ${T.holoSoft}; color: ${T.ink};
        font-size: 26px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
      }
      .img-add:hover { border-color: ${T.ink}; }
      .img-add.drop {
        border-style: solid; border-color: ${T.ink};
        background: #fff; transform: scale(1.08);
      }

      .di-head { display: flex; justify-content: space-between; gap: 8px; }
      .di-meta { font-size: 12.5px; color: ${T.muted}; display: flex; align-items: center; gap: 5px; flex-wrap: wrap; }
      .di-title { font-size: 15px; font-weight: 600; margin-top: 3px; }

      .footer {
        display: flex; align-items: center; justify-content: center;
        gap: 14px; flex-wrap: wrap;
        margin-top: 28px;
        font-size: 13px;
        color: ${T.muted};
      }
      .trash-btn {
        background: transparent;
        border: 1px solid ${T.line};
        border-radius: 999px;
        padding: 5px 14px;
        color: ${T.ink};
        font-size: 13px;
        cursor: pointer;
      }
      .trash-btn:hover { border-color: ${T.ink}; }
      .trash-row {
        display: flex; align-items: center; gap: 10px;
        border: 1px solid ${T.line};
        border-radius: 12px;
        background: #fff;
        box-shadow: 0 1px 2px rgba(17,17,20,.04), 0 6px 16px rgba(17,17,20,.06);
        padding: 9px 12px;
        margin-top: 10px;
      }
      .trash-type { font-size: 11px; color: ${T.muted}; text-transform: uppercase; letter-spacing: .5px; }
      .trash-title { font-size: 14px; font-weight: 600; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

      /* ============================================================
         tela de entrada — mesma linguagem do painel:
         cinza-claro, cartões brancos, acento verde-limão
         ============================================================ */
      .lp {
        width: 100%;
        min-height: 100vh;
        background: ${T.bg};
        color: ${T.ink};
        font-family: 'Inter', sans-serif;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        user-select: none;
        -webkit-user-select: none;
      }

      /* ---------- nav ---------- */
      .lp-nav {
        position: relative;
        z-index: 6;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        padding: 20px clamp(18px, 4vw, 48px);
      }
      .lp-mark {
        display: flex; align-items: center; gap: 9px;
        background: none; border: 0; padding: 0; cursor: pointer;
        color: ${T.ink};
      }
      .lp-mark-glyph { font-size: 18px; line-height: 1; }
      .lp-mark-name { font-size: 17px; font-weight: 600; letter-spacing: -.2px; }

      /* links no mesmo trilho de pílulas das abas do painel */
      .lp-links {
        display: flex; align-items: center; gap: 4px;
        background: ${T.paper};
        border: 1px solid ${T.line};
        border-radius: 999px;
        padding: 5px;
      }
      .lp-link {
        background: transparent; border: 0; cursor: pointer;
        font-size: 13.5px; color: ${T.muted};
        padding: 8px 16px; border-radius: 999px;
        transition: background .16s ease, color .16s ease;
      }
      .lp-link:hover { background: ${T.bg}; color: ${T.ink}; }
      .lp-cta-pill {
        background: ${T.accent}; color: ${T.accentInk};
        border: 0; cursor: pointer;
        font-size: 14px; font-weight: 600;
        padding: 11px 22px; border-radius: 999px;
        transition: transform .18s ease, opacity .18s ease;
      }
      .lp-cta-pill:hover { transform: translateY(-1px); opacity: .9; }

      /* ---------- hero ---------- */
      .lp-hero {
        position: relative;
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: clamp(18px, 3.5vh, 46px) 20px clamp(30px, 6vh, 70px);
      }
      /* halo do acento atrás do título */
      .lp-glow {
        position: absolute;
        top: -8%;
        left: 50%;
        transform: translateX(-50%);
        width: min(760px, 92vw);
        aspect-ratio: 1 / 1;
        border-radius: 50%;
        background: radial-gradient(circle at 50% 45%,
          rgba(228,251,85,.5) 0%,
          rgba(228,251,85,.22) 34%,
          rgba(228,251,85,0) 66%);
        filter: blur(6px);
        pointer-events: none;
        z-index: 0;
      }

      /* ---------- cartões dos produtos, em arco ---------- */
      .lp-orbit {
        position: absolute;
        top: clamp(30px, 5vh, 70px);
        left: 0; right: 0;
        height: 180px;
        z-index: 3;
        pointer-events: none;
      }
      .lp-chip {
        position: absolute;
        transform: translateX(-50%);
        background: none; border: 0; padding: 0;
        cursor: pointer;
        pointer-events: auto;
        animation: lp-float 6.5s ease-in-out infinite;
        animation-delay: var(--delay);
      }
      .lp-chip-face {
        display: flex; align-items: center; justify-content: center;
        width: clamp(46px, 5.2vw, 60px);
        height: clamp(46px, 5.2vw, 60px);
        background: ${T.paper};
        border: 1px solid ${T.line};
        border-radius: 20px;
        box-shadow: 0 1px 2px rgba(17,17,20,.04), 0 10px 24px rgba(17,17,20,.08);
        transform: rotate(var(--rot));
        transition: transform .3s cubic-bezier(.34,1.4,.5,1), box-shadow .3s ease;
      }
      .lp-chip:hover .lp-chip-face {
        transform: rotate(0deg) scale(1.12);
        box-shadow: 0 16px 32px rgba(17,17,20,.16);
      }
      .lp-chip-img { width: 66%; height: 66%; object-fit: contain; }
      .lp-chip-tag {
        font-size: clamp(15px, 1.7vw, 18px);
        font-weight: 600;
        letter-spacing: -.5px;
        color: ${T.ink};
      }
      @keyframes lp-float {
        0%, 100% { translate: 0 0; }
        50%      { translate: 0 -10px; }
      }
      @media (prefers-reduced-motion: reduce) {
        .lp-chip { animation: none; }
      }

      /* ---------- texto central ---------- */
      .lp-copy {
        position: relative;
        z-index: 4;
        text-align: center;
        max-width: 700px;
        margin-top: clamp(84px, 13vh, 150px);
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .lp-badge {
        display: inline-flex; align-items: center; gap: 8px;
        background: ${T.paper};
        border: 1px solid ${T.line};
        border-radius: 999px;
        padding: 8px 18px;
        font-size: 13.5px;
        color: ${T.ink};
        margin-bottom: 22px;
      }
      .lp-badge-dot {
        width: 7px; height: 7px; border-radius: 50%;
        background: ${T.accent};
        box-shadow: 0 0 0 3px rgba(228,251,85,.35);
      }
      .lp-title {
        font-family: 'Instrument Serif', Georgia, serif;
        font-weight: 400;
        font-size: clamp(42px, 7.2vw, 88px);
        line-height: 1.03;
        letter-spacing: -1.5px;
        margin: 0;
        color: ${T.ink};
      }
      /* a palavra em itálico ganha o acento por trás, como marca-texto */
      .lp-title em {
        font-style: italic;
        position: relative;
        display: inline-block;
        padding: 0 .1em;
      }
      .lp-title em::before {
        content: "";
        position: absolute;
        left: 0; right: 0; bottom: .1em;
        height: .42em;
        background: ${T.accent};
        border-radius: 3px;
        z-index: -1;
      }
      .lp-sub {
        max-width: 500px;
        margin: 20px 0 0;
        font-size: clamp(14.5px, 1.5vw, 16.5px);
        line-height: 1.62;
        color: ${T.muted};
      }
      .lp-actions {
        display: flex; align-items: center; gap: 10px;
        margin-top: 28px; flex-wrap: wrap; justify-content: center;
      }
      .lp-btn {
        background: ${T.ink}; color: #fff; border: 1px solid ${T.ink};
        cursor: pointer;
        font-size: 14.5px; font-weight: 500;
        padding: 14px 28px; border-radius: 999px;
        transition: transform .18s ease, opacity .18s ease;
      }
      .lp-btn:hover { transform: translateY(-1px); opacity: .88; }
      .lp-btn-ghost {
        background: ${T.paper}; color: ${T.ink};
        border: 1px solid ${T.line};
        cursor: pointer;
        font-size: 14.5px; font-weight: 500;
        padding: 14px 24px; border-radius: 999px;
        transition: border-color .18s ease, transform .18s ease;
      }
      .lp-btn-ghost:hover { border-color: ${T.ink}; transform: translateY(-1px); }

      @media (max-width: 760px) {
        .lp-links { display: none; }
        .lp-orbit { height: 140px; top: 26px; }
        .lp-copy { margin-top: 104px; }
      }


      /* ---------- página de produto ---------- */
      .back-link {
        background: transparent;
        border: none;
        color: ${T.muted};
        font-size: 15px;
        cursor: pointer;
        padding: 0;
      }
      .back-link:hover { color: ${T.ink}; }
      .poster > .back-link { position: absolute; top: 20px; left: 24px; z-index: 3; }

      .product-page { padding-top: 24px; }
      .pp-nav {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
      }
      .pp-hero { text-align: center; margin-top: 6px; }
      .pp-tile {
        width: 110px; height: 110px;
        margin: 0 auto 16px;
        border: 1px solid ${T.line};
        border-radius: 26%;
        box-shadow: 0 1px 2px rgba(17,17,20,.04), 0 6px 16px rgba(17,17,20,.06);
        display: flex; align-items: center; justify-content: center;
        overflow: hidden;
      }
      .pp-tile .tile-tag { font-size: 34px; }
      .pp-manifesto {
        max-width: 620px;
        margin: 18px auto 0;
        text-align: center;
        font-size: 17px;
        line-height: 1.7;
        color: ${T.ink};
      }
      .pp-files {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 12px;
      }
      .pp-file {
        background: #fff;
        border: 1px solid ${T.line};
        border-radius: 14px;
        box-shadow: 0 1px 2px rgba(17,17,20,.04), 0 6px 16px rgba(17,17,20,.06);
        padding: 14px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }
      .pp-file-icon {
        width: 34px; height: 34px;
        border: 1px solid ${T.line};
        border-radius: 10px;
        background: ${T.holoSoft};
        display: flex; align-items: center; justify-content: center;
        font-size: 16px;
      }
      .pp-file-name { font-size: 14px; font-weight: 600; flex: 1; }
      .pp-file .btn[disabled] { opacity: .45; cursor: not-allowed; }
      .pp-note {
        margin-top: 18px;
        text-align: center;
        font-size: 12.5px;
        color: ${T.muted};
      }

      @media (prefers-reduced-motion: reduce) {
        .marquee-track { animation: none; }
        * { transition: none !important; }
      }
      .loading { text-align: center; }
      .loading-tv {
        width: 90px; height: 68px;
        margin: 0 auto 12px;
        border: 1px solid ${T.line};
        border-radius: 14px;
        background: ${T.holoSoft};
        font-size: 30px;
        display: flex; align-items: center; justify-content: center;
        color: ${T.ink};
      }
      .loading .px-label { font-size: 16px; color: ${T.muted}; }

      ::-webkit-scrollbar { height: 10px; width: 10px; }
      ::-webkit-scrollbar-thumb { background: ${T.line}; border-radius: 8px; }
      ::-webkit-scrollbar-track { background: transparent; }

      @media (prefers-reduced-motion: reduce) {
        .marquee-track { animation: none; }
        * { transition: none !important; }
      }
      @media (max-width: 640px) {
        .poster { padding: 26px 16px 20px; }
        .marquee { margin: 16px -16px 18px; }
        .net-box { min-width: 84px; }
      }
    `}</style>
  );
}
