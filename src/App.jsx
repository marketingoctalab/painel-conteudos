import React, { useState, useEffect, useRef, useMemo, useId } from "react";
import { supabase, supabaseReady } from "./supabase";

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
];
const profileByName = (name) => PROFILES.find((p) => p.name === name) || null;
const DELETE_PROFILES = ["Marcos", "Silvio"]; // além do admin

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
async function loadKey(key, fallback) {
  if (!supabaseReady) {
    try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
    catch { return fallback; }
  }
  try {
    const { data, error } = await supabase.from("estudio_docs").select("value").eq("id", key).maybeSingle();
    if (error || !data) return fallback;
    return data.value ?? fallback;
  } catch {
    return fallback;
  }
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
  const saveTimer = useRef({});

  useEffect(() => {
    (async () => {
      // as quatro leituras vão juntas: em série eram 4 idas ao Supabase
      const [b, cal, tr, orc] = await Promise.all([
        loadKey("estudio:board", DEFAULT_BOARD()),
        loadKey("estudio:calendar", { items: {} }),
        loadKey("estudio:trash", { items: [] }),
        loadKey("estudio:orcamentos", { events: [] }),
      ]);
      Object.values(b.cards).forEach((c) => {
        if (c.due === undefined) c.due = "";
        if (c.link === undefined) c.link = "";
        if (!c.checklist) c.checklist = [];
        if (!c.priority) c.priority = "nenhuma";
      });
      setBoard(b);
      setCalendar(cal);
      setTrash(tr);
      setOrcamentos(orc);
    })();
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

  // só o painel depende dos documentos do Supabase; capa, login e
  // página de produto renderizam na hora, sem esperar a rede
  if (!board || !calendar) {
    return (
      <div className="page center">
        <GlobalStyle />
        <div className="loading">
          <div className="loading-tv">☺</div>
          <div className="px-label">carregando…</div>
        </div>
      </div>
    );
  }

  const dateStr = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });

  const navGeral = [
    ["hoje", "Hoje", IconHome],
    ["calendario", "Calendário", IconCalendar],
    ["kanban", "Quadro", IconBoard],
    ["publicados", "Publicados", IconCheck],
    ["planilha", "Planilha", IconSheet],
  ];
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
          {tab === "hoje" && (
            <TodayView board={board} calendar={calendar} setOpenCard={setOpenCard} setOpenDay={setOpenDay} />
          )}
          {tab === "kanban" && (
            <Kanban board={board} updateBoard={updateBoard} setOpenCard={setOpenCard} askConfirm={askConfirm} sendToTrash={sendToTrash} canDelete={canDelete} />
          )}
          {tab === "calendario" && (
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
          {tab === "publicados" && (
            <PublishedView calendar={calendar} setOpenDay={setOpenDay} />
          )}
          {tab === "planilha" && (
            <Planilha
              orcamentos={orcamentos}
              updateOrcamentos={updateOrcamentos}
              askConfirm={askConfirm}
              canDelete={canDelete}
            />
          )}
        </div>
      </main>

      {openCard && board.cards[openCard] && (
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
      {openDay && (
        <DayModal
          dateKey={openDay}
          calendar={calendar}
          board={board}
          updateCalendar={updateCalendar}
          setOpenCard={setOpenCard}
          askConfirm={askConfirm}
          sendToTrash={sendToTrash}
          canDelete={canDelete}
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
function TodayView({ board, calendar, setOpenCard, setOpenDay }) {
  const tk = todayKey();
  const week = weekRange();
  const todayItems = calendar.items[tk] || [];
  const restOfWeek = week.filter((d) => d > tk); // dias da semana depois de hoje
  const cardsDueOn = (d) =>
    Object.values(board.cards).filter((c) => c.due === d && dueState(c, board) !== null);

  const overdue = [];
  const dueToday = [];
  const pending = [];
  Object.values(board.cards).forEach((card) => {
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
              className={`card ${card.priority && card.priority !== "nenhuma" ? `p-${card.priority}` : ""}`}
            >
              <div className="card-top">
                <ProdTag k={card.product} />
                <span className="card-prod">{(PRODUCTS[card.product] || PRODUCTS.outro).label}</span>
                {card.priority && card.priority !== "nenhuma" && (
                  <span className="prio-flag">{PRIORITIES[card.priority].label}</span>
                )}
                {ds === "atrasado" && <span className="due-flag danger">● atrasado</span>}
                {ds === "hoje" && <span className="due-flag">hoje</span>}
              </div>
              <div className="card-title">{card.title}</div>
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
function DayModal({ dateKey: key, calendar, board, updateCalendar, setOpenCard, askConfirm, sendToTrash, canDelete, close }) {
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
                {linkedCard && (
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

/* ---------- planilha de orçamentos ----------
   Um evento agrupa os itens a cotar (folder, cartão de visita, etc.).
   Cada item guarda valor, data de produção, onde foi orçado e quem
   fecha o pedido com a gráfica. Edição é direta na célula. */
function Planilha({ orcamentos, updateOrcamentos, askConfirm, canDelete }) {
  const events = orcamentos?.events || [];

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

  const addItem = (evId) =>
    updateOrcamentos((o) => {
      const ev = o.events.find((e) => e.id === evId);
      if (ev) ev.items = [...(ev.items || []), NEW_ORC_ITEM()];
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

  const evTotal = (ev) =>
    (ev.items || []).reduce((sum, it) => sum + (Number(it.valor) || 0), 0);
  const grandTotal = events.reduce((sum, ev) => sum + evTotal(ev), 0);

  // quanto está sob responsabilidade de quem, para o resumo do topo
  const porResponsavel = events
    .flatMap((ev) => ev.items || [])
    .reduce((acc, it) => {
      const k = it.fecha || "indefinido";
      acc[k] = (acc[k] || 0) + (Number(it.valor) || 0);
      return acc;
    }, {});

  return (
    <div className="view">
      <div className="orc-top">
        <div className="orc-totals">
          <div className="orc-total-box">
            <div className="orc-total-num">{money(grandTotal)}</div>
            <div className="orc-total-name">Total orçado</div>
          </div>
          {Object.keys(FECHA).map((k) =>
            porResponsavel[k] ? (
              <div key={k} className="orc-total-box sub">
                <div className="orc-total-num">{money(porResponsavel[k])}</div>
                <div className="orc-total-name">Fecha: {FECHA[k].label}</div>
              </div>
            ) : null
          )}
        </div>
        <button className="btn accent" onClick={addEvent}>+ novo evento</button>
      </div>

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
            <div className="orc-event-total">{money(evTotal(ev))}</div>
            {canDelete && (
              <button className="icon-btn" title="Excluir evento" onClick={() => removeEvent(ev)}>
                ×
              </button>
            )}
          </header>

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
              <tbody>
                {(ev.items || []).map((it) => (
                  <tr key={it.id}>
                    <td>
                      <input
                        className="cell"
                        value={it.nome}
                        placeholder="Folder, cartão de visita…"
                        onChange={(e) => patchItem(ev.id, it.id, { nome: e.target.value })}
                      />
                    </td>
                    <td>
                      <input
                        className="cell"
                        value={it.qtd || ""}
                        placeholder="500"
                        onChange={(e) => patchItem(ev.id, it.id, { qtd: e.target.value })}
                      />
                    </td>
                    <td>
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
                    <td>
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
                    <td>
                      <input
                        className="cell"
                        value={it.fornecedor}
                        placeholder="Gráfica / fornecedor"
                        onChange={(e) => patchItem(ev.id, it.id, { fornecedor: e.target.value })}
                      />
                    </td>
                    <td>
                      <select
                        className={`cell cell-select fecha-${it.fecha || "indefinido"}`}
                        value={it.fecha || "indefinido"}
                        onChange={(e) => patchItem(ev.id, it.id, { fecha: e.target.value })}
                      >
                        {Object.entries(FECHA).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        className="cell cell-select"
                        value={it.status || "cotando"}
                        onChange={(e) => patchItem(ev.id, it.id, { status: e.target.value })}
                      >
                        {Object.entries(ORC_STATUS).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
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
                ))}
              </tbody>
            </table>
          </div>

          <button className="add-card" onClick={() => addItem(ev.id)}>+ item para cotar</button>
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

      /* ---------- planilha de orçamentos ---------- */
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
        min-width: 900px;
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
      .orc-table tr:last-child td { border-bottom: 0; }
      .orc-table .c-qtd { width: 78px; }
      .orc-table .c-valor { width: 118px; }
      .orc-table .c-data { width: 142px; }
      .orc-table .c-fecha { width: 130px; }
      .orc-table .c-status { width: 124px; }
      .orc-table .c-del { width: 34px; text-align: center; }

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
