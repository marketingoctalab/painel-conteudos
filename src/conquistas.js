/* ---------- conquistas da trilha ----------
   Medem esforço, consistência e superação — não só acerto de primeira.
   Quem calcula é função pura sobre o documento estudio:trilha inteiro,
   então nada aqui precisa ser persistido: as conquistas são derivadas.

   A chave de semana vem por parâmetro de propósito: se esta função
   calculasse a semana do seu jeito, ela discordaria do relatório semanal
   do painel em toda virada de fuso. Uma fonte só para "que semana é esta".
*/

export const CONQUISTAS = [
  { id: "primeiro-passo", titulo: "Primeiro passo", descricao: "Marcou o primeiro conteúdo como visto.", categoria: "comecar" },
  { id: "primeira-entrega", titulo: "Primeira entrega", descricao: "Entregou a primeira tarefa.", categoria: "comecar" },

  { id: "tres-semanas-seguidas", titulo: "Três semanas seguidas", descricao: "Enviou o relatório da semana três vezes seguidas.", categoria: "consistencia" },
  { id: "um-mes-de-trilha", titulo: "Um mês de trilha", descricao: "Quatro relatórios enviados desde o começo.", categoria: "consistencia" },
  { id: "multi-materia", titulo: "Nas duas frentes", descricao: "Entregou tarefas de duas matérias na mesma semana.", categoria: "consistencia" },

  { id: "voltou-por-cima", titulo: "Voltou por cima", descricao: "Levou um refazer e entregou de novo até aprovar.", categoria: "superacao" },
  { id: "virou-a-chave", titulo: "Virou a chave", descricao: "Levou um refazer e a segunda entrega saiu acima do esperado.", categoria: "superacao" },

  { id: "passou-por-todas", titulo: "Passou por todas", descricao: "Uma entrega aprovada em cada uma das cinco competências.", categoria: "dominio" },
  { id: "materia-fechada", titulo: "Matéria fechada", descricao: "Concluiu todos os módulos de uma matéria.", categoria: "dominio" },
];

export const CATEGORIAS = {
  comecar: { label: "Começar", cor: "#1c5cab" },
  consistencia: { label: "Consistência", cor: "#0d6b49" },
  superacao: { label: "Superação", cor: "#a8420f" },
  dominio: { label: "Domínio", cor: "#7d5500" },
};

const APROVADA = (t) => t.avaliacao === "ok" || t.avaliacao === "acima";

/* Mesma lógica de portões do painel: o módulo fecha quando tudo o que ele
   TEM está satisfeito, e ele precisa ter pelo menos um portão. Sem essa
   última condição, um módulo vazio contaria como concluído. */
function moduloFechado(modulo, tarefas, provas) {
  const doModulo = tarefas.filter((t) => t.moduloId === modulo.id);
  const conteudo = modulo.conteudo || [];
  const temProva = (modulo.prova?.questoes || []).length > 0;

  const portoes = [];
  if (doModulo.length > 0) portoes.push(doModulo.every(APROVADA));
  if (conteudo.length > 0) portoes.push(conteudo.every((c) => c.visto));
  if (temProva) portoes.push(provas?.[modulo.id]?.status === "validada");

  return portoes.length > 0 && portoes.every(Boolean);
}

export function calcularConquistas(trilha, chaveSemana) {
  const {
    modulos = [],
    tarefas = [],
    relatorios = [],
    provas = {},
    materias = [],
  } = trilha || {};

  const ganhas = [];
  const marcar = (id, desde = null) => ganhas.push({ id, desde });

  // ---- começar ----
  const primeiroVisto = modulos
    .flatMap((m) => m.conteudo || [])
    .some((c) => c.visto);
  if (primeiroVisto) marcar("primeiro-passo");

  const entregues = tarefas
    .filter((t) => t.entregueEm)
    .sort((a, b) => a.entregueEm - b.entregueEm);
  if (entregues.length > 0) marcar("primeira-entrega", entregues[0].entregueEm);

  // ---- consistência ----
  // ordena por semana e usa o enviadoEm do quarto relatório de fato
  const relOrdenados = [...relatorios].sort((a, b) =>
    String(a.semana) < String(b.semana) ? -1 : 1
  );
  const semanas = [...new Set(relOrdenados.map((r) => r.semana))].sort();

  let seguidas = semanas.length > 0 ? 1 : 0;
  let melhor = seguidas;
  for (let i = 1; i < semanas.length; i++) {
    // as chaves são segundas-feiras: semanas seguidas distam exatamente 7 dias
    const [ay, am, ad] = semanas[i - 1].split("-").map(Number);
    const [by, bm, bd] = semanas[i].split("-").map(Number);
    const dias = Math.round(
      (new Date(by, bm - 1, bd) - new Date(ay, am - 1, ad)) / 86400000
    );
    seguidas = dias === 7 ? seguidas + 1 : 1;
    melhor = Math.max(melhor, seguidas);
  }
  if (melhor >= 3) marcar("tres-semanas-seguidas");
  if (relOrdenados.length >= 4) marcar("um-mes-de-trilha", relOrdenados[3].enviadoEm);

  const materiaDoModulo = Object.fromEntries(modulos.map((m) => [m.id, m.materiaId]));
  const materiasPorSemana = {};
  for (const t of entregues) {
    const mat = materiaDoModulo[t.moduloId];
    if (!mat) continue; // tarefa fora de módulo não conta
    const sem = chaveSemana(t.entregueEm);
    (materiasPorSemana[sem] ||= new Set()).add(mat);
  }
  const semanaMulti = Object.entries(materiasPorSemana).find(([, s]) => s.size >= 2);
  if (semanaMulti) marcar("multi-materia");

  // ---- superação ----
  const levaramRefazer = tarefas.filter((t) =>
    (t.revisoes || []).some((r) => r.nivel === "refazer")
  );
  const recuperada = levaramRefazer.find(APROVADA);
  if (recuperada) marcar("voltou-por-cima", recuperada.revisadaEm);
  const viradaDeChave = levaramRefazer.find((t) => t.avaliacao === "acima");
  if (viradaDeChave) marcar("virou-a-chave", viradaDeChave.revisadaEm);

  // ---- domínio ----
  const aprovadas = tarefas.filter(APROVADA);
  const competencias = new Set(aprovadas.map((t) => t.competencia));
  const TODAS = ["design", "copy", "social", "ferramentas", "processo"];
  if (TODAS.every((c) => competencias.has(c))) marcar("passou-por-todas");

  const fechada = materias.find((mt) => {
    const daMateria = modulos.filter((m) => m.materiaId === mt.id);
    return daMateria.length > 0 && daMateria.every((m) => moduloFechado(m, tarefas, provas));
  });
  if (fechada) marcar("materia-fechada");

  return ganhas;
}
