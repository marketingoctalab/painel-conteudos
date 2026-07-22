import React, { useState, useEffect, useRef, useMemo } from "react";
import { supabase, supabaseReady } from "./supabase";

// id único desta aba/sessão — usado para ignorar o próprio eco no realtime
const CLIENT_ID = Math.random().toString(36).slice(2);

/* ============================================================
   ESTÚDIO — painel pessoal retrô pixel, paleta clara
   Ref: poster "Cyber Monday" (creme + marrom + holográfico)
   ============================================================ */

// ---------- tokens ----------
const T = {
  bg: "#E9E5DB",        // fundo externo
  paper: "#F5F2EA",     // cartão/papel
  ink: "#3B2E28",       // marrom escuro (texto e bordas)
  muted: "#8C8478",
  line: "#D8D2C4",
  danger: "#C2453A",
  holo: "linear-gradient(90deg,#FFB7C5,#FFE0A3,#BDEAD0,#A9D7EF,#D6B3F5)",
  holoSoft: "linear-gradient(135deg,#FFD9E2,#FFF0CE,#DDF5E8,#D3EBF9,#EBDDFB)",
};

const PRODUCTS = {
  octalab: { label: "Octalab", tag: "OC", color: "#8A6FE0" },
  ecosys: { label: "Ecosys AUTO", tag: "EC", color: "#4E8FD9" },
  juspilot: { label: "JusPilot", tag: "JP", color: "#3FA37A" },
  octagym: { label: "OctaGym", tag: "OG", color: "#D96757" },
  outro: { label: "Outro", tag: "—", color: "#9A9284" },
};

const NETWORKS = ["Instagram", "LinkedIn", "X", "YouTube", "WhatsApp"];

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
function ItemMedia({ item, onPatch }) {
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
            <button className="img-del" onClick={() => onPatch({ images: images.filter((_, idx) => idx !== i) })}>×</button>
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
  const [openCard, setOpenCard] = useState(null);
  const [openDay, setOpenDay] = useState(null);
  const [calFilter, setCalFilter] = useState("todos");
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return { y: d.getFullYear(), m: d.getMonth() };
  });
  const saveTimer = useRef({});

  useEffect(() => {
    (async () => {
      const b = await loadKey("estudio:board", DEFAULT_BOARD());
      Object.values(b.cards).forEach((c) => {
        if (c.due === undefined) c.due = "";
        if (c.link === undefined) c.link = "";
        if (!c.checklist) c.checklist = [];
        if (!c.priority) c.priority = "nenhuma";
      });
      setBoard(b);
      setCalendar(await loadKey("estudio:calendar", { items: {} }));
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

  if (screen === "landing") {
    return (
      <div className="page center">
        <GlobalStyle />
        <Landing
          onEnter={() => setScreen("app")}
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
          onEnter={() => setScreen("app")}
        />
      </div>
    );
  }

  return (
    <div className="page">
      <GlobalStyle />
      <div className="poster">
        <button className="back-link px-label" onClick={() => setScreen("landing")}>← entrada</button>
        <div className="eyebrow">painel pessoal de conteúdo</div>
        <h1 className="hero">ESTÚDIO</h1>
        <div className="hero-sub">{dateStr}</div>

        <nav className="tabs">
          {[
            ["hoje", "Hoje"],
            ["kanban", "Quadro"],
            ["calendario", "Calendário"],
          ].map(([id, label]) => (
            <button
              key={id}
              className={`tab ${tab === id ? "active" : ""}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="marquee" aria-hidden="true">
          <div className="marquee-track">
            {Array.from({ length: 2 }).map((_, i) => (
              <span key={i} className="marquee-seg">
                organize → produza → aprove → publique → repita →&nbsp;
                organize → produza → aprove → publique → repita →&nbsp;
              </span>
            ))}
          </div>
        </div>

        {tab === "hoje" && (
          <TodayView board={board} calendar={calendar} setOpenCard={setOpenCard} setOpenDay={setOpenDay} />
        )}
        {tab === "kanban" && (
          <Kanban board={board} updateBoard={updateBoard} setOpenCard={setOpenCard} />
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

        <footer className="footer px-label">estúdio · feito para uso diário · dados salvos automaticamente</footer>
      </div>

      {openCard && board.cards[openCard] && (
        <CardModal
          card={board.cards[openCard]}
          board={board}
          updateBoard={updateBoard}
          updateCalendar={updateCalendar}
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
          close={() => setOpenDay(null)}
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
function Kanban({ board, updateBoard, setOpenCard }) {
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

function Column({ col, board, updateBoard, setOpenCard, drag, setDrag, isOver, setOverCol, moveCard }) {
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
    updateBoard((b) => {
      const c = b.columns.find((x) => x.id === col.id);
      c.cardIds.forEach((id) => delete b.cards[id]);
      b.columns = b.columns.filter((x) => x.id !== col.id);
      return b;
    });
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
        <button className="icon-btn" title="Excluir coluna" onClick={deleteCol}>×</button>
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
function CardModal({ card, board, updateBoard, updateCalendar, close }) {
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
    updateBoard((b) => {
      b.columns.forEach((c) => (c.cardIds = c.cardIds.filter((x) => x !== card.id)));
      delete b.cards[card.id];
      return b;
    });
    close();
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
          <button className="btn danger" onClick={deleteCard}>✕ excluir</button>
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
function DayModal({ dateKey: key, calendar, board, updateCalendar, setOpenCard, close }) {
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

  const removeItem = (id) =>
    updateCalendar((c) => {
      c.items[key] = c.items[key].filter((x) => x.id !== id);
      if (c.items[key].length === 0) delete c.items[key];
      return c;
    });

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
                <button className="icon-btn" onClick={() => removeItem(it.id)}>×</button>
              </div>
              <ItemMedia item={it} onPatch={(fields) => patchItem(it.id, fields)} />
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
  const [offset, setOffset] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf;
    let last = performance.now();
    const loop = (t) => {
      const dt = Math.min((t - last) / 1000, 0.1);
      last = t;
      if (!paused.current) setOffset((o) => (o + dt * 9) % 360); // volta completa em 40s
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="poster landing-poster">
      <div className="arc-stage">
        <div className="arc-clip">
          {SLOTS.map((s, i) => {
            const deg = (360 / n) * i + offset;
            const rad = (deg * Math.PI) / 180;
            const sin = Math.sin(rad).toFixed(4);
            const cos = Math.cos(rad).toFixed(4);
            return (
              <div
                key={s.key}
                className="arc-slot"
                style={{
                  left: `calc(50% + var(--R) * ${sin})`,
                  top: `calc(var(--cy) - var(--R) * ${cos})`,
                }}
              >
                <button
                  className="tile"
                  style={{ background: s.img ? undefined : s.grad }}
                  onClick={() => onProduct(s.key)}
                  onMouseEnter={() => (paused.current = true)}
                  onMouseLeave={() => (paused.current = false)}
                  aria-label={s.label}
                >
                  {s.img ? (
                    <img src={s.img} alt={s.label} className="tile-img" />
                  ) : (
                    <span className="tile-tag px-label">{s.tag}</span>
                  )}
                  <span className="tile-name px-label">{s.label}</span>
                </button>
              </div>
            );
          })}
        </div>

        <div className="arc-center">
          <div className="eyebrow">octalab · casa de produtos</div>
          <h1 className="hero arc-hero">ESTÚDIO</h1>
          <p className="orbit-sub">
            Passe o mouse pelos produtos para explorar.<br />
            Clique para ver o manifesto e os arquivos da marca.
          </p>
          <button className="btn" style={{ fontSize: 16, padding: "10px 26px" }} onClick={onEnter}>
            entrar no painel →
          </button>
        </div>
      </div>
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

// ---------- estilos ----------
function GlobalStyle() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;600;700&family=Inter:wght@400;500;600&display=swap');

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

      .poster {
        width: 100%;
        max-width: 1080px;
        background: ${T.paper};
        border-radius: 18px;
        box-shadow: 0 3px 0 ${T.ink}22, 0 18px 44px rgba(59,46,40,.14);
        padding: 36px 28px 28px;
        position: relative;
        overflow: hidden;
      }

      /* faixa holográfica no topo do poster */
      .poster::before {
        content: "";
        position: absolute; top: 0; left: 0; right: 0; height: 8px;
        background: ${T.holo};
      }

      .eyebrow {
        text-align: center;
        font-size: 12px;
        letter-spacing: 3px;
        text-transform: uppercase;
        font-weight: 600;
        color: ${T.muted};
      }
      .hero {
        margin: 8px 0 2px;
        text-align: center;
        font-family: 'Pixelify Sans', sans-serif;
        font-weight: 700;
        font-size: clamp(52px, 10vw, 96px);
        line-height: .95;
        letter-spacing: 2px;
        color: ${T.ink};
      }
      .hero-sub {
        text-align: center;
        color: ${T.muted};
        font-size: 15px;
        margin-bottom: 18px;
        text-transform: capitalize;
      }

      .px-label {
        font-family: 'Pixelify Sans', sans-serif;
        font-weight: 600;
        letter-spacing: .5px;
      }

      /* ---------- tabs ---------- */
      .tabs { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }
      .tab {
        font-family: 'Pixelify Sans', sans-serif;
        font-weight: 600;
        font-size: 16px;
        padding: 9px 22px;
        border-radius: 999px;
        border: 2px solid ${T.ink};
        background: ${T.paper};
        color: ${T.ink};
        cursor: pointer;
        transition: transform .12s ease;
      }
      .tab:hover { transform: translateY(-1px); }
      .tab.active {
        background: ${T.ink};
        color: ${T.paper};
        position: relative;
      }

      /* ---------- letreiro ---------- */
      .marquee {
        margin: 18px -28px 22px;
        border-top: 2px solid ${T.ink};
        border-bottom: 2px solid ${T.ink};
        overflow: hidden;
        background: ${T.holoSoft};
      }
      .marquee-track {
        display: flex;
        white-space: nowrap;
        animation: scroll 22s linear infinite;
      }
      .marquee-seg {
        font-family: 'Pixelify Sans', sans-serif;
        font-weight: 600;
        font-size: 14px;
        letter-spacing: 2px;
        text-transform: uppercase;
        padding: 7px 0;
        color: ${T.ink};
      }
      @keyframes scroll { to { transform: translateX(-50%); } }

      /* ---------- geral ---------- */
      .view { position: relative; }
      .sec {
        font-size: 17px;
        margin: 20px 0 10px;
        display: flex; align-items: center; gap: 8px;
      }
      .sec::after { content: ""; flex: 1; border-top: 2px dotted ${T.line}; }
      .sec.danger { color: ${T.danger}; }

      .empty {
        text-align: center;
        color: ${T.muted};
        border: 2px dashed ${T.line};
        border-radius: 12px;
        padding: 18px;
        font-size: 14px;
        margin: 6px 0;
      }

      .row {
        display: flex; align-items: center; gap: 10px;
        width: 100%; text-align: left;
        background: ${T.paper};
        border: 2px solid ${T.ink};
        border-radius: 12px;
        box-shadow: 3px 3px 0 ${T.ink};
        padding: 9px 12px;
        margin-bottom: 8px;
        font-family: 'Inter', sans-serif;
        font-size: 14px;
        color: ${T.ink};
        cursor: pointer;
        transition: transform .1s ease, box-shadow .1s ease;
      }
      .row:hover { transform: translate(1px,1px); box-shadow: 2px 2px 0 ${T.ink}; }
      .row.danger { border-color: ${T.danger}; box-shadow: 3px 3px 0 ${T.danger}; }
      .row.danger:hover { box-shadow: 2px 2px 0 ${T.danger}; }
      .row-title { flex: 1; font-weight: 500; }
      .row-end { color: ${T.muted}; font-size: 12.5px; white-space: nowrap; }
      .row.danger .row-end { color: ${T.danger}; font-weight: 600; }

      .prod-tag {
        font-family: 'Pixelify Sans', sans-serif;
        font-weight: 700;
        font-size: 11px;
        border: 2px solid;
        border-radius: 6px;
        padding: 1px 5px;
        flex-shrink: 0;
      }

      .net-grid { display: flex; gap: 10px; flex-wrap: wrap; }
      .net-box {
        flex: 1; min-width: 100px;
        background: ${T.paper};
        border: 2px solid ${T.ink};
        border-radius: 14px;
        box-shadow: 3px 3px 0 ${T.ink};
        padding: 12px 8px;
        text-align: center;
        position: relative;
        overflow: hidden;
      }
      .net-box::before {
        content: "";
        position: absolute; inset: 0;
        background: ${T.holoSoft};
        opacity: 0;
      }
      .net-box:not(.zero)::before { opacity: .45; }
      .net-num {
        position: relative;
        font-family: 'Pixelify Sans', sans-serif;
        font-weight: 700; font-size: 30px; line-height: 1;
      }
      .net-name { position: relative; font-size: 12.5px; color: ${T.muted}; margin-top: 4px; font-weight: 500; }
      .net-warn {
        position: relative;
        font-family: 'Pixelify Sans', sans-serif;
        font-size: 12px; color: ${T.danger}; margin-top: 2px; font-weight: 700;
      }

      /* ---------- kanban ---------- */
      .board-wrap { overflow-x: auto; padding: 4px 2px 10px; }
      .board { display: flex; gap: 14px; align-items: flex-start; min-height: 360px; }
      .column {
        background: ${T.bg};
        border: 2px solid ${T.ink};
        border-radius: 16px;
        box-shadow: 4px 4px 0 ${T.ink};
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
        border: 2px solid ${T.ink};
        border-radius: 12px;
        box-shadow: 3px 3px 0 ${T.ink};
        padding: 10px 11px;
        cursor: grab;
        transition: transform .1s ease, box-shadow .1s ease;
      }
      .card:hover { transform: translate(1px,1px); box-shadow: 2px 2px 0 ${T.ink}; }
      .card-top { display: flex; align-items: center; gap: 6px; margin-bottom: 5px; flex-wrap: wrap; }
      .card-prod { font-size: 11.5px; color: ${T.muted}; font-weight: 500; }
      .due-flag {
        margin-left: auto;
        font-family: 'Pixelify Sans', sans-serif;
        font-size: 12px; font-weight: 700;
      }
      .due-flag.danger { color: ${T.danger}; }
      .card-title { font-size: 14.5px; font-weight: 600; line-height: 1.3; }
      .card-due { font-size: 12px; color: ${T.muted}; margin-top: 3px; }
      .progress { display: flex; align-items: center; gap: 8px; margin-top: 8px; }
      .track {
        flex: 1; height: 10px;
        border: 2px solid ${T.ink};
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
        box-shadow: 3px 3px 0 #7E2B24;
        color: #FFF3EE;
      }
      .card.p-urgente:hover { box-shadow: 2px 2px 0 #7E2B24; }

      /* Alta: fundo laranja -> texto marrom bem escuro */
      .card.p-alta {
        background: #E58A3A;
        border-color: #8C4A16;
        box-shadow: 3px 3px 0 #8C4A16;
        color: #2E1A08;
      }
      .card.p-alta:hover { box-shadow: 2px 2px 0 #8C4A16; }

      /* Média: fundo amarelo -> texto marrom escuro */
      .card.p-media {
        background: #F2C94C;
        border-color: #8A6A14;
        box-shadow: 3px 3px 0 #8A6A14;
        color: #3B2A06;
      }
      .card.p-media:hover { box-shadow: 2px 2px 0 #8A6A14; }

      /* Baixa: fundo verde suave -> texto verde bem escuro */
      .card.p-baixa {
        background: #A9CFAF;
        border-color: #3F6B4F;
        box-shadow: 3px 3px 0 #3F6B4F;
        color: #142B1C;
      }
      .card.p-baixa:hover { box-shadow: 2px 2px 0 #3F6B4F; }

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
        font-family: 'Pixelify Sans', sans-serif;
        font-weight: 700;
        font-size: 11.5px;
        letter-spacing: .5px;
        text-transform: uppercase;
        border: 2px solid currentColor;
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
        border: 2px dashed ${T.muted};
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
        border: 2px solid ${T.ink};
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
        font-family: 'Pixelify Sans', sans-serif;
        font-weight: 600;
        font-size: 14.5px;
        padding: 8px 16px;
        border-radius: 999px;
        background: ${T.ink};
        color: ${T.paper};
        border: 2px solid ${T.ink};
        cursor: pointer;
        text-decoration: none;
        display: inline-flex; align-items: center;
        white-space: nowrap;
        transition: transform .1s ease;
      }
      .btn:hover { transform: translateY(-1px); }
      .btn:active { transform: translateY(1px); }
      .btn.ghost { background: transparent; color: ${T.ink}; }
      .btn.danger { background: ${T.danger}; border-color: ${T.danger}; }
      .btn.small { font-size: 13px; padding: 5px 12px; }
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
        border: 2px solid ${T.line};
        border-radius: 999px;
        padding: 4px 12px;
        cursor: pointer;
      }
      .chip.sel { border-color: ${T.ink}; color: ${T.ink}; font-weight: 600; background: #fff; }
      .chip.small { font-size: 12px; padding: 3px 10px; }
      .chip-row { display: flex; gap: 6px; flex-wrap: wrap; }

      /* ---------- modal ---------- */
      .overlay {
        position: fixed; inset: 0;
        background: rgba(59,46,40,.45);
        backdrop-filter: blur(2px);
        display: flex; align-items: center; justify-content: center;
        padding: 14px; z-index: 60;
      }
      .modal {
        background: ${T.paper};
        border: 2px solid ${T.ink};
        border-radius: 18px;
        box-shadow: 6px 6px 0 ${T.ink};
        padding: 20px;
        width: 100%; max-width: 620px;
        max-height: 88vh; overflow-y: auto;
        position: relative;
      }
      .modal::before {
        content: "";
        position: absolute; top: 0; left: 0; right: 0; height: 6px;
        background: ${T.holo};
        border-radius: 16px 16px 0 0;
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
        border: 2px solid ${T.ink};
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
        border: 2px solid ${T.ink};
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
        border: 2px solid ${T.line};
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
      .day.today {
        border-color: ${T.ink};
        box-shadow: 3px 3px 0 ${T.ink};
        background:
          linear-gradient(${T.paper}, ${T.paper}) padding-box;
        position: relative;
      }
      .day.today::after {
        content: "";
        position: absolute; inset: -2px;
        border-radius: 12px;
        padding: 2px;
        background: ${T.holo};
        -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        pointer-events: none;
      }
      .day-num { font-size: 14px; margin-bottom: 4px; }
      .day.today .day-num { font-weight: 700; }
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
        border: 2px solid ${T.ink};
        border-left-width: 8px;
        border-radius: 12px;
        background: #fff;
        box-shadow: 3px 3px 0 ${T.ink};
        padding: 10px 12px;
        margin-top: 10px;
      }
      .img-strip { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; }
      .img-thumb {
        position: relative; width: 66px; height: 66px;
        border: 2px solid ${T.ink}; border-radius: 10px;
        overflow: hidden; background: #fff;
      }
      .img-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; cursor: zoom-in; }
      .img-preview-wrap { position: relative; max-width: 92vw; max-height: 88vh; }
      .img-preview {
        display: block; max-width: 92vw; max-height: 88vh;
        object-fit: contain;
        border: 2px solid ${T.ink}; border-radius: 12px;
        box-shadow: 6px 6px 0 ${T.ink}; background: ${T.paper};
      }
      .img-preview-close {
        position: absolute; top: -14px; right: -14px;
        width: 36px; height: 36px;
        border: 2px solid ${T.ink}; border-radius: 50%;
        background: ${T.paper}; color: ${T.ink};
        font-size: 20px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 3px 3px 0 ${T.ink};
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
        border: 2px dashed ${T.muted}; border-radius: 10px;
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
        text-align: center;
        margin-top: 28px;
        font-size: 13px;
        color: ${T.muted};
      }

      /* ---------- tela de entrada: arco (meio círculo) ---------- */
      .landing-poster {
        align-self: center;
        padding: 30px 20px 34px;
      }
      .arc-stage {
        --R: clamp(220px, 33vw, 380px);
        --tile: clamp(72px, 11vw, 112px);
        /* centro do círculo: na base do palco */
        --cy: calc(var(--R) + var(--tile) / 2 + 24px);
        position: relative;
        width: 100%;
        height: calc(var(--R) + var(--tile) + 44px);
        margin: 0 auto;
      }
      /* camada recortada: só o arco de cima aparece, dissolvendo na base */
      .arc-clip {
        position: absolute;
        inset: 0;
        overflow: hidden;
        outline: none;
        border: 0;
        -webkit-mask-image: linear-gradient(to top, transparent 0, #000 130px);
        mask-image: linear-gradient(to top, transparent 0, #000 130px);
      }
      .landing-poster { user-select: none; -webkit-user-select: none; }

      /* cada slot é um ponto posicionado por cálculo; nada gira */
      .arc-slot {
        position: absolute;
        transform: translate(-50%, -50%);
        outline: none;
        border: 0;
      }

      .tile {
        position: relative;
        width: var(--tile);
        height: var(--tile);
        border: 2px solid ${T.ink}22;
        border-radius: 28%;
        box-shadow: 0 10px 22px ${T.ink}2E;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: visible;
        scale: 1;
        transition: scale .28s cubic-bezier(.34,1.4,.5,1), box-shadow .28s ease, border-color .28s ease;
        padding: 0;
      }
      /* hover: o tile cresce, os irmãos encolhem */
      .arc-clip:has(.tile:hover) .tile { scale: .84; }
      .arc-clip .tile:hover {
        scale: 1.26;
        border-color: ${T.ink};
        box-shadow: 0 16px 30px ${T.ink}44;
        z-index: 10;
      }
      .tile-img {
        width: 100%; height: 100%;
        object-fit: cover;
        border-radius: 22%;
      }
      .tile-tag {
        font-size: calc(var(--tile) * .3);
        font-weight: 700;
        color: ${T.ink};
        text-shadow: 2px 2px 0 rgba(255,255,255,.5);
      }
      /* nome do produto: sobreposto no centro do tile, sem risco de corte */
      .tile-name {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(.9);
        background: ${T.ink}E6;
        color: ${T.paper};
        font-size: 13px;
        padding: 4px 12px;
        border-radius: 999px;
        white-space: nowrap;
        opacity: 0;
        pointer-events: none;
        transition: opacity .2s ease, transform .2s ease;
      }
      .tile:hover .tile-name { opacity: 1; transform: translate(-50%, -50%) scale(1); }

      /* texto central sob o arco */
      .arc-center {
        position: absolute;
        left: 50%;
        bottom: 0;
        transform: translateX(-50%);
        z-index: 2;
        text-align: center;
        width: min(70%, 430px);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 7px;
      }
      .arc-hero { font-size: clamp(36px, 5.5vw, 60px); margin: 0; }
      .orbit-sub {
        color: ${T.muted};
        font-size: 14px;
        line-height: 1.55;
        margin: 0 0 8px;
      }

      @media (max-width: 560px) {
        .arc-stage { --R: clamp(140px, 42vw, 190px); --tile: 56px; }
        .arc-clip {
          -webkit-mask-image: linear-gradient(to top, transparent 0, #000 90px);
          mask-image: linear-gradient(to top, transparent 0, #000 90px);
        }
        .arc-center { width: 88%; }
        .arc-hero { font-size: 30px; }
        .orbit-sub { font-size: 12.5px; }
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
        border: 3px solid ${T.ink};
        border-radius: 26%;
        box-shadow: 5px 6px 0 ${T.ink}33;
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
        border: 2px solid ${T.ink};
        border-radius: 14px;
        box-shadow: 3px 3px 0 ${T.ink};
        padding: 14px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }
      .pp-file-icon {
        width: 34px; height: 34px;
        border: 2px solid ${T.ink};
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
        border: 3px solid ${T.ink};
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
