import React, { useState, useEffect, useId, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Copy, Check, ArrowRight, Newspaper, Megaphone, Layers, X, Target, AlertTriangle, Lock, Plus, Trash2, Pencil, Video, Image as ImageIcon, Tag as TagIcon } from 'lucide-react';
import { supabase, supabaseReady } from './supabase';

// Senha do Painel Admin. Vem do .env (VITE_ADMIN_PASSWORD); se não houver, usa o padrão abaixo.
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'octalab2026';

// ============================================================
// ESTILOS LIQUID GLASS REUTILIZÁVEIS
// ============================================================
const glassLight = {
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(12px) saturate(180%)',
  WebkitBackdropFilter: 'blur(12px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.7)',
  boxShadow: '0 1px 2px rgba(0,0,0,0.05), inset 0 1px 1px rgba(255,255,255,0.85)'
};
const glassDark = {
  background: 'rgba(255,255,255,0.08)',
  backdropFilter: 'blur(12px) saturate(180%)',
  WebkitBackdropFilter: 'blur(12px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.16)',
  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.12)'
};
// Glass tingido por cor (ex.: verde/vermelho), em fundo claro
const glassTint = (rgb) => ({
  background: `rgba(${rgb},0.10)`,
  backdropFilter: 'blur(12px) saturate(180%)',
  WebkitBackdropFilter: 'blur(12px) saturate(180%)',
  border: `1px solid rgba(${rgb},0.28)`,
  boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4)'
});

// ============================================================
// DADOS — 3 MARCAS × 4 POSTS (3 estáticos + 1 carrossel)
// Tipos: 'noticia' (descobrimento) | 'comercial' (venda direta) | 'carrossel'
// ============================================================

const clients = {
  juspilot: {
    name: 'JusPilot',
    tagline: 'IA jurídica que lê os autos em segundos',
    accent: '#D97757',
    bg: '#101010',
    text: '#FFFEEE',
    link: 'juspilot.ai',
    posts: [
      // ───────── DIA 1 — SEXTA ─────────
      {
        day: 'Sexta',
        date: 'Sex • Semana 1',
        kind: 'noticia',
        theme: 'IA que alucina × IA que cita o que existe',
        format: 'Post estático — capa única',
        sourceLabel: 'Fonte: Conjur, abr/2026',
        sourceUrl: 'https://www.conjur.com.br/2026-abr-23/uso-de-ia-para-inventar-jurisprudencia-resulta-em-condenacao-por-litigancia-de-ma-fe/',
        slide: {
          image: '/juspilot/1-noticia.png',
          type: 'jp-news-cover',
          chip: 'EM ALTA NO JUDICIÁRIO',
          headline: 'Mais uma condenação por',
          highlight: 'jurisprudência inventada por IA.',
          subline: 'Agora foi advogada e executivo. Multa + ofício à OAB.',
          source: 'Conjur · abril de 2026',
          cta: 'LEIA A LEGENDA'
        },
        caption: `Uma juíza condenou advogada e executivo por litigância de má-fé após a petição inicial trazer jurisprudência fictícia e doutrina inexistente, geradas por IA generativa sem revisão humana. (Conjur, abr/2026)

A magistrada foi direta: "A utilização de ferramentas de IA generativa sem a devida revisão humana não exime o profissional de sua responsabilidade ética e processual — antes a agrava."

E não é caso isolado. Em 2026 já temos casos no TRT-2, TJ-SC, TJ-GO e Vara do Trabalho de Concórdia. Em todos eles, o problema foi o mesmo: a IA generalista não diferencia tribunal de blog jurídico. Ela completa a frase com o que parece plausível — não com o que existe nos autos.

Por isso o JusPilot opera diferente:

— Base curada de STF, STJ, TJDFT, TJSP.
— Cada citação vem com link direto para o acórdão.
— Você confere antes de submeter.

A IA jurídica que respeita o ônus argumentativo do advogado existe. Não é a do ChatGPT genérico.

Conheça em [inserir link]

#advocacia #ia #jurisprudencia #lawtech #juspilot`
      },

      // ───────── DIA 2 — SEGUNDA (CARROSSEL) ─────────
      {
        day: 'Segunda',
        date: 'Seg • Semana 1',
        kind: 'carrossel',
        theme: 'Os 80 milhões de processos parados (desdobramento de notícia)',
        format: 'Carrossel — 4 lâminas',
        sourceLabel: 'Fonte: CNJ Justiça em Números 2025 / Canaltech',
        sourceUrl: 'https://canaltech.com.br/colunas/por-que-a-produtividade-recorde-nao-e-suficiente-para-salvar-o-judiciario/',
        slides: [
          {
            image: '/juspilot/2-carrossel-1.png',
            type: 'jp-cover',
            chip: 'CNJ · JUSTIÇA EM NÚMEROS 2025',
            title: '80,6 milhões',
            subtitle: 'de processos parados.',
            body: 'O Judiciário brasileiro fechou 2024 baixando 44,8 milhões — e ainda assim acumulou estoque recorde. A conta não fecha sem IA.'
          },
          {
            image: '/juspilot/2-carrossel-2.png',
            type: 'jp-numbered',
            number: '01',
            title: 'O dado que ninguém comenta',
            body: 'Se a Justiça parasse de receber novas ações hoje, levaria quase 2 anos para limpar só o estoque atual. O esforço manual não dobra a curva. A matemática não permite.'
          },
          {
            image: '/juspilot/2-carrossel-3.png',
            type: 'jp-numbered',
            number: '02',
            title: 'O CNJ já abriu o caminho',
            body: 'A Resolução 615/2025 reconhece a IA como ferramenta auxiliar legítima para automação de serviços acessórios e suporte à decisão — desde que com supervisão humana qualificada.'
          },
          {
            image: '/juspilot/2-carrossel-4.png',
            type: 'jp-final',
            number: '03',
            title: 'O advogado também ganha tempo.',
            body: 'Enquanto os tribunais reorganizam o estoque com IA, o escritório que automatiza a leitura dos autos ganha 72 horas por processo. O JusPilot entrega Resumo Analítico, Linha do Tempo, Riscos e Jurisprudência Correlata em até 34 segundos.',
            cta: 'Leia o estudo do CNJ'
          }
        ],
        caption: `O CNJ divulgou os dados: 80,6 milhões de processos pendentes no Brasil. (Justiça em Números 2025)

Mesmo com produtividade recorde — 44,8 milhões de processos baixados em 2024 — o estoque continua crescendo. A conclusão da própria reportagem do Canaltech é direta: "a tecnologia é a única variável capaz de dobrar a curva do tempo."

A Resolução CNJ 615/2025 já permite o uso de IA como ferramenta auxiliar para automação e suporte à decisão. Os tribunais estão se mexendo.

E o escritório?

Cada processo manual exige 72 horas de leitura, marcação e estruturação. O JusPilot devolve esse tempo: 34 segundos para Resumo Analítico, Linha do Tempo, Pontos Controvertidos, Riscos da Demanda e Jurisprudência Correlata real dos tribunais.

Enquanto o Judiciário automatiza o que é repetitivo, o advogado automatiza o que é trabalhoso — e usa o tempo no que é insubstituível: a tese.

Conheça o JusPilot em [inserir link]

#advocacia #cnj #judiciario #ia #juspilot`
      },

      // ───────── DIA 3 — QUARTA ─────────
      {
        day: 'Quarta',
        date: 'Qua • Semana 1',
        kind: 'noticia',
        theme: 'A nova ética da IA no Direito',
        format: 'Post estático — capa única',
        sourceLabel: 'Fonte: Migalhas, jan/2026',
        sourceUrl: 'https://www.migalhas.com.br/quentes/433822/',
        slide: {
          image: '/juspilot/3-noticia.png',
          type: 'jp-news-cover',
          chip: 'OAB · RECOMENDAÇÃO 001/2024',
          headline: '20 salários-mínimos',
          highlight: 'de multa por confiar em IA sem checar.',
          subline: 'A Recomendação da OAB já existe há 2 anos. Os tribunais começaram a aplicar.',
          source: 'Migalhas · janeiro de 2026',
          cta: 'LEIA A LEGENDA'
        },
        caption: `Um advogado foi multado em 20 salários-mínimos (R$ 30,4 mil) pela 2ª Vara Federal de Londrina/PR por apresentar petições com artigos de lei inexistentes e jurisprudência inverídica, gerados por IA. (Migalhas, jan/2026)

O juiz aplicou duas multas — litigância de má-fé e ato atentatório à dignidade da Justiça — e oficiou a OAB-PR.

O ponto não é "a IA é o problema". O ponto é: a Recomendação 001/2024 do Conselho Federal da OAB já estabeleceu há quase 2 anos as diretrizes para uso de IA generativa na advocacia. Ela exige:

— Entendimento das limitações da ferramenta
— Verificação rigorosa das informações
— Transparência aos clientes e interlocutores
— Vedação à delegação de atos privativos sem supervisão

Em 2026, os tribunais começaram a aplicar com rigor. E o problema continua sendo o mesmo: IA generalista não distingue tribunal de blog jurídico.

O JusPilot foi construído com a Recomendação 001/2024 na cabeça: base curada dos tribunais, cada citação com link para o acórdão, supervisão humana pressuposta como regra — não como opcional.

A IA não te poupa do dever de checar. Ela te dá uma base para checar com segurança.

Conheça em [inserir link]

#advocacia #oab #ia #etica #juspilot`
      },

      // ───────── DIA 4 — SEXTA (COMERCIAL) ─────────
      {
        day: 'Sexta',
        date: 'Sex • Semana 2',
        kind: 'comercial',
        theme: 'Anúncio do produto — 72h × 34s',
        format: 'Post estático — capa única',
        slide: {
          image: '/juspilot/4-comercial.png',
          type: 'jp-comercial',
          eyebrow: 'JUSPILOT',
          title: '72 horas.',
          highlight: 'Ou 34 segundos.',
          subline: 'Anexe o processo. Receba Resumo Analítico, Linha do Tempo, Riscos da Demanda e Jurisprudência Correlata real dos tribunais.',
          cta: 'LEIA A LEGENDA'
        },
        caption: `72 horas é o tempo médio que um advogado leva para ler integralmente os autos, marcar trechos, organizar a linha do tempo e pesquisar jurisprudência aplicável de um processo complexo.

34 segundos é o tempo médio que o JusPilot leva para devolver:

→ Resumo Analítico da demanda
→ Linha do Tempo Processual
→ Identificação de Partes e Pedidos
→ Pontos Controvertidos e Riscos da Demanda
→ Movimentações Relevantes
→ Teses Jurídicas Aplicáveis
→ Jurisprudência Correlata real dos tribunais (com link para o acórdão)
→ Próximos Passos Estratégicos

Tudo estruturado. Tudo fundamentado. Tudo passível de conferência humana.

Advogados não deveriam perder tempo procurando informação. Deveriam usar tempo tomando decisões.

Agende uma demonstração de 15 minutos: [inserir link]

#juspilot #advocacia #produtividadejuridica #ia #lawtech`
      }
    ]
  },

  octalab: {
    name: 'Octalab',
    tagline: 'We build tomorrow\'s tech.',
    accent: '#F4EFE5',
    bg: '#0F0F13',
    text: '#F4EFE5',
    link: 'octalab.ai',
    posts: [
      // ───────── DIA 1 — SEXTA ─────────
      {
        day: 'Sexta',
        date: 'Sex • Semana 1',
        kind: 'noticia',
        theme: 'SaaSpocalipse — o medo da substituição do software tradicional',
        format: 'Post estático — capa única',
        sourceLabel: 'Fonte: Seu Dinheiro / TI Inside, fev/2026',
        sourceUrl: 'https://www.seudinheiro.com/2026/internacional/armageddon-da-ia-e-o-fim-das-empresas-de-software-como-servico-saas-ou-a-maior-promocao-de-acoes-do-setor-da-decada-ccgg/',
        slide: {
          image: '/octalab/1-noticia.png',
          type: 'oct-news',
          chip: '"SAASPOCALIPSE" · FEV/2026',
          title: 'Mercado de SaaS viveu',
          highlight: 'a maior queda em 30 anos.',
          subline: 'Investidores correram após o salto dos agentes autônomos de IA. O software tradicional virou pergunta.',
          source: 'Seu Dinheiro · fevereiro de 2026',
          cta: 'LEIA A LEGENDA'
        },
        caption: `Em fevereiro de 2026, o mercado batizou o evento de "SaaSpocalipse": ações de empresas de software como serviço despencaram, e cerca de US$ 285 bilhões evaporaram das avaliações em poucas horas. O termo foi cunhado por traders da Jefferies. O gatilho foi a maturação de agentes autônomos de IA capazes de executar fluxos de trabalho inteiros, não só conversar sobre eles. (Imprensa financeira, fev/2026)

O movimento tem base em projeções que já circulavam. A Deloitte estima que o mercado de agentes autônomos pode chegar a US$ 8,5 bilhões em 2026 e US$ 35 bilhões em 2030 (TI Inside, fev/2026). O Gartner, por outro lado, traz a dose de realismo: mais de 40% dos projetos de IA agêntica devem ser cancelados até 2027, por custos altos, valor de negócio incerto ou controles de risco frágeis (Gartner, jun/2025).

O recado do mercado, no entanto, é claro: software de prateleira que apenas espera por um clique virou commodity. O valor migra para sistemas que decidem e executam. Em 2026, a pergunta deixou de ser "vamos usar agentes?" e passou a ser "qual processo já está pronto?". Por isso a Octalab nasceu como casa de produtos AI-Native. Não é software com IA acoplada. É software onde IA é a base:

— Modelos multimodais por padrão
— Agentes com ferramentas just-in-time
— Embeddings e RAG em produção

Construímos, operamos e somos donos dos produtos: Octamind.ai, PlacaPay, JusPilot, Ecosys Auto, Sonar e mais.

We build tomorrow's tech.

🔗 Conheça em Octalab.ai`
      },

      // ───────── DIA 2 — SEGUNDA ─────────
      {
        day: 'Segunda',
        date: 'Seg • Semana 1',
        kind: 'noticia',
        theme: 'IA agêntica no chão da empresa — caso prático',
        format: 'Post estático — capa única',
        sourceLabel: 'Fonte: IT Forum, mai/2026',
        sourceUrl: 'https://itforum.com.br/noticias/zappts-cresce-33-substituir-softwares-agentes-ia',
        slide: {
          image: '/octalab/2-noticia.png',
          type: 'oct-news',
          chip: 'TRANSFORMAÇÃO AGÊNTICA',
          title: 'Empresa cresce 33%',
          highlight: 'trocando software passivo por agentes de IA.',
          subline: 'Time-to-market caiu mais de 50%. A Zappts virou caso real do que muita empresa ainda discute em comitê.',
          source: 'IT Forum · maio de 2026',
          cta: 'LEIA A LEGENDA'
        },
        caption: `A Zappts relata ter crescido 33% depois de substituir softwares passivos por agentes autônomos de IA na própria operação. O time-to-market dos projetos caiu mais de 50%. (IT Forum, mai/2026)

O CEO Pablo Augusto resumiu bem:

"Não se trata somente de automatizar tarefas, mas de delegar decisão e execução de processos críticos para agentes que operam com autonomia, governança e escalabilidade."

A diferença é categórica:

— Software passivo = espera instrução, executa, devolve.
— Agente autônomo = recebe objetivo, decide o caminho, executa de ponta a ponta.

O movimento, batizado de "Transformação Agêntica", começou em setembro de 2024 e a meta da empresa é dobrar a unidade de agentes inteligentes até o fim de 2026. Não é um piloto: é operação real, com governança montada em volta. Esse é o ponto que muita empresa ainda discute em comitê.`
      },

      // ───────── DIA 3 — QUARTA (CARROSSEL) ─────────
      {
        day: 'Quarta',
        date: 'Qua • Semana 1',
        kind: 'carrossel',
        theme: 'O que muda quando IA vira base, não feature (desdobramento)',
        format: 'Carrossel — 4 lâminas',
        sourceLabel: 'Fonte: IDC / Deloitte / IT Forum, 2026',
        sourceUrl: 'https://tiinside.com.br/25/02/2026/2026-sera-o-ano-da-consolidacao-da-ia-em-larga-escala-aponta-deloitte/',
        slides: [
          {
            image: '/octalab/3-carrossel-1.png',
            type: 'oct-manifesto',
            line1: 'IA não é',
            line2: 'feature.',
            line3: 'É base.'
          },
          {
            image: '/octalab/3-carrossel-2.png',
            type: 'oct-light-card',
            number: '01 / 03',
            title: 'O dado',
            body: 'Investimentos em IA no Brasil ultrapassam US$ 3,4 bilhões em 2026, crescendo +30% ao ano. 78% das empresas ampliarão investimentos. (IDC / IBM)\n\nE 47% dos profissionais já usam IA "por fora" — sem aprovação oficial. Shadow AI virou padrão. O mercado sabe que precisa.'
          },
          {
            image: '/octalab/3-carrossel-3.png',
            type: 'oct-dark-card',
            number: '02 / 03',
            title: 'O problema',
            body: 'A maioria ainda trata IA como camada. Plugin em CRM. Botão de "resumir" no editor. Chat lateral. Quando o agente autônomo aparece, vira retrabalho de arquitetura.\n\nSoftware passivo + IA acoplada = dívida técnica disfarçada.'
          },
          {
            image: '/octalab/3-carrossel-4.png',
            type: 'oct-signature',
            line1: 'AI-Native',
            line2: 'não é estilo.',
            line3: 'É arquitetura.',
            cta: 'Conheça nossas soluções'
          }
        ],
        caption: `Em 2026, os gastos com IA no Brasil — somando software, serviços e infraestrutura — devem ultrapassar US$ 3,4 bilhões, crescendo mais de 30% ao ano (IDC). No setor privado, 78% das empresas planejam ampliar os investimentos em IA (IBM).

Mas a maturidade não acompanha o apetite. Segundo pesquisa da Abiacom (com 200 profissionais, fim de 2025), 47% já usam IA sem aprovação formal — o chamado "Shadow AI" — e 59% das empresas ainda não têm diretrizes formais para o uso da tecnologia.

O mercado entendeu que precisa de IA. O que falta é fazer direito. Boa parte das empresas está apenas acoplando IA a softwares passivos e legados, e quando o agente autônomo entra em cena, esse arranjo vira retrabalho.

Por isso a Octalab opera como casa de produtos AI-Native. Cada produto nasce com:

→ Modelos multimodais por padrão
→ Agentes com ferramentas just-in-time
→ Embeddings e RAG em produção
→ Observabilidade nativa
→ RLS multi-tenant obrigatório
→ Roadmap guiado por dados

Não é "tem IA". É "é IA".

Nossas soluções: Octamind.ai, PlacaPay, Octagym.ai, Octalife.ai, Octalk.ai, Octabuild.ai, JusPilot, Ecosys Auto, Sonar.

We build tomorrow's tech. Conheça pelo link da bio.`
      }
    ]
  },

  ecosys: {
    name: 'Ecosys Auto',
    tagline: 'A IA que atende sua revenda 24/7',
    accent: '#22D3EE',
    bg: '#0A1628',
    text: '#FFFFFF',
    link: 'ecosysauto.com.br',
    posts: [
      // ───────── DIA 1 — SEXTA ─────────
      {
        day: 'Sexta',
        date: 'Sex • Semana 1',
        kind: 'noticia',
        theme: '68% dos brasileiros querem comprar carro em 2026',
        format: 'Post estático — capa única',
        sourceLabel: 'Fonte: Webmotors / Diário do Litoral, mar/2026',
        sourceUrl: 'https://www.diariodolitoral.com.br/variedades/automotor/quase-7-em-cada-10-brasileiros-querem-trocar-ou-comprar-carro-em-2026/216300/',
        slide: {
          type: 'eco-news-cover',
          chip: 'PESQUISA WEBMOTORS · 2026',
          data: '68%',
          headline: 'dos brasileiros',
          highlight: 'querem comprar um carro este ano.',
          subline: '45% planejam fechar no 1º semestre. A janela está aberta — e quem responde primeiro fica com o lead.',
          source: 'Webmotors · março de 2026',
          cta: 'LEIA A LEGENDA'
        },
        caption: `68% dos brasileiros pretendem comprar um carro em 2026. (Pesquisa Webmotors, mar/2026)

E mais: 45% planejam fechar no 1º semestre — um salto de 8 pontos percentuais em relação a 2025. A janela está aberta como nunca.

Mas tem um detalhe na pesquisa que pouca gente comenta: o comprador hoje está na era do imediatismo. Ele pesquisa em 3+ fontes, espera resposta no WhatsApp em minutos e fecha com quem responde primeiro. Se sua revenda demora, ele vai para o concorrente vizinho. Sem rancor, só lógica.

E a sua revenda, hoje:

— Responde lead à noite? Aos fins de semana?
— Tem número único da loja, ou cada vendedor com WhatsApp pessoal?
— Sabe quanto tempo leva para o primeiro "alô"?

O ecosys AUTO IA atende sua revenda 24/7. Responde em até 30 segundos. Qualifica, cria lead no CRM com histórico, sugere o próximo passo para o vendedor humano fechar.

A demanda existe. A pesquisa Webmotors prova. A pergunta é quem vai capturar.

Pare de perder venda de carro por demora.

Conheça em [inserir link]

powered by Octalab.ai

#revenda #seminovos #multimarca #vendadecarro #ecosysauto`
      },

      // ───────── DIA 2 — SEGUNDA (CARROSSEL) ─────────
      {
        day: 'Segunda',
        date: 'Seg • Semana 1',
        kind: 'carrossel',
        theme: 'Recorde Fenauto + a fila do WhatsApp (desdobramento)',
        format: 'Carrossel — 4 lâminas',
        sourceLabel: 'Fonte: Fenauto / O Tempo, abr/2026',
        sourceUrl: 'https://www.otempo.com.br/autotempo/2026/4/17/seminovos-batem-4-3-mi-de-vendas-no-brasil-no-1-trimestre-de-2026',
        slides: [
          {
            type: 'eco-data-cover',
            chip: 'FENAUTO · 1º TRIMESTRE 2026',
            data: '4,37 mi',
            title: 'de seminovos vendidos',
            highlight: 'só no 1º trimestre.',
            subline: '+12,7% sobre 2025. Recorde histórico. E o trimestre fechou em alta.'
          },
          {
            type: 'eco-numbered',
            number: '01',
            title: 'A demanda explodiu.',
            body: 'Foram 1,67 milhão de unidades só em março — alta de 22,8% sobre fevereiro. Mais de 1,4 milhão de carros trocaram de dono por mês no Brasil em 2026.'
          },
          {
            type: 'eco-numbered-dark',
            number: '02',
            title: 'Mas a operação não acompanhou.',
            body: 'Pesquisa Octadesk: 37% dos consumidores preferem WhatsApp como canal de atendimento na compra. E o tempo médio de resposta da revenda continua sendo de dezenas de minutos.\n\nLead que espera, lead que esfria.'
          },
          {
            type: 'eco-solution-final',
            title: 'A IA do ecosys AUTO',
            highlight: 'responde em até 30 segundos.',
            body: 'Número único da loja. IAs por caixa de entrada. Lead criado no CRM com histórico e próximo passo. 24/7.',
            cta: 'Pare de perder venda de carro por demora'
          }
        ],
        caption: `A Fenauto fechou o 1º trimestre de 2026 com recorde histórico: 4,37 milhões de seminovos vendidos no Brasil — alta de 12,7% sobre 2025. (Fenauto, abr/2026)

Só em março foram 1,67 milhão de unidades. Mais de 1,4 milhão de carros trocando de dono por mês.

A demanda está explodindo. A pergunta é: a sua operação está pronta?

A pesquisa Octadesk (E-commerce Trends 2026) mostra que 37% dos consumidores preferem o WhatsApp como canal de atendimento. E o comprador de carro tem um comportamento ainda mais agressivo: pesquisa em 3+ fontes, exige resposta imediata e fecha com quem responde primeiro.

Sua revenda perde venda no horário comercial por demora. Perde mais ainda fora dele.

O ecosys AUTO IA atende 24/7. Responde em até 30 segundos. Número único da loja, IAs configuráveis por caixa de entrada, conversa sincronizada no CRM, score de qualidade por atendimento.

Não é falta de mercado. Não é falta de produto. Em 2026, é falta de velocidade.

Pare de perder venda de carro por demora.

Conheça em [inserir link]

powered by Octalab.ai

#revenda #seminovos #fenauto #ecosysauto`
      },

      // ───────── DIA 3 — QUARTA ─────────
      {
        day: 'Quarta',
        date: 'Qua • Semana 1',
        kind: 'noticia',
        theme: '80% pesquisam carro online antes de pisar na loja',
        format: 'Post estático — capa única',
        sourceLabel: 'Fonte: Trakcar / pesquisas de mercado, 2026',
        sourceUrl: 'https://www.trakcar.com.br/comprar-carro-pela-internet-e-seguro-em-2026/',
        slide: {
          type: 'eco-news-cover',
          chip: 'COMPORTAMENTO DO COMPRADOR · 2026',
          data: '80%',
          headline: 'dos compradores',
          highlight: 'começam a pesquisa do carro online.',
          subline: 'Quando ele pisa na loja, já comparou 3 anúncios, 2 financiamentos e checou o seu Google. A venda começa no clique.',
          source: 'Setor automotivo · 2026',
          cta: 'LEIA A LEGENDA'
        },
        caption: `Mais de 80% das pessoas que vão comprar um veículo começam a pesquisa online. (Setor automotivo, 2026)

Quando o cliente entra na sua revenda, ele:

— Já comparou 3+ anúncios em portais
— Já consultou tabela FIPE
— Já leu reviews do modelo
— Já avaliou seu Google e suas avaliações
— Provavelmente já mandou mensagem no seu WhatsApp

A decisão de comprar começa muito antes da visita. E o anúncio mal escrito, a foto fora de ordem, a demora pra responder a primeira pergunta — tudo isso elimina sua revenda da disputa antes do test drive acontecer.

O ecosys AUTO opera nessa nova realidade:

→ Descrição de anúncio gerada com IA, no padrão dos portais
→ Fotos na ordem certa replicadas para WebMotors, OLX e similares
→ Construtor de site da loja incluído (menos dependência de marketplace)
→ WhatsApp governado: número único, IAs por caixa, score de qualidade
→ CRM com probabilidade de fechamento e próximo passo sugerido

A jornada do cliente é digital. Sua revenda precisa estar onde a decisão é tomada — não só onde o contrato é assinado.

Conheça em [inserir link]

powered by Octalab.ai

#revenda #marketingautomotivo #ecosysauto`
      },

      // ───────── DIA 4 — SEXTA (COMERCIAL) ─────────
      {
        day: 'Sexta',
        date: 'Sex • Semana 2',
        kind: 'comercial',
        theme: 'Anúncio comercial — 24/7 + 30 segundos',
        format: 'Post estático — capa única',
        slide: {
          type: 'eco-comercial',
          eyebrow: 'ECOSYS AUTO',
          title: 'A IA que atende',
          highlight: 'sua revenda 24/7.',
          subline: 'Responde em até 30 segundos. Vira lead no CRM. Sugere o próximo passo. Dorme nunca.',
          cta: 'LEIA A LEGENDA'
        },
        caption: `Uma plataforma. Uma operação. Uma IA.

O ecosys AUTO é a plataforma all-in-one para revendas de seminovos e multimarcas. Com IA nativa em todo o fluxo:

→ Gestão de estoque (Kanban, tarefas, FIPE, finanças por veículo)
→ CRM com probabilidade de fechamento
→ WhatsApp governado (número único, IAs por caixa, score de qualidade)
→ Anúncios integrados a portais
→ F&I com Credere + seguro integrado
→ Contratos e assinatura digital
→ DRE em tempo real, conciliação bancária
→ Construtor de site da loja incluso

E a IA do ecosys AUTO atende 24/7. Responde em até 30 segundos. Qualifica o lead. Cria no CRM com histórico e próximo passo sugerido para o vendedor humano fechar.

Lead frio é lead que esfriou esperando você.

Pare de perder venda de carro por demora.

Plano completo: R$ 499/mês. Implementação: R$ 1.000. Anual com 20% de desconto.

Agende uma demonstração: [inserir link]

powered by Octalab.ai

#ecosysauto #revenda #seminovos #multimarca`
      }
    ]
  },

  octagym: {
    name: 'Octagym',
    tagline: 'O sistema operacional da academia moderna',
    accent: '#EF0A36',
    bg: '#0F0F13',
    text: '#F4EFE5',
    link: 'octagym.ai',
    posts: [
      // ───────── POST 1 — ANÚNCIO ÂNCORA ─────────
      {
        day: 'Post 1',
        date: 'Lançamento',
        kind: 'comercial',
        theme: 'Anúncio âncora — Octagym + Ironberg Brasília',
        format: 'Post estático — capa única',
        slide: {
          type: 'ogy-launch',
          chip: 'LANÇAMENTO · BRASÍLIA-DF',
          line1: 'A maior academia',
          highlight: 'do mundo',
          line2: 'não vai ser operada',
          line3: 'como uma academia comum.',
          subline: '11.000 m². Ironberg chega ao Brasil. Octagym é o sistema por trás.',
          cta: 'LEIA A LEGENDA'
        },
        caption: `A maior academia do mundo não será operada como uma academia comum.

A Ironberg chega ao Brasil com uma operação histórica para o mercado fitness: 11.000 m² em Brasília-DF.

E a Octagym estará por trás dessa estrutura, conectando tecnologia, inteligência e escala em uma única plataforma.

Do anúncio ao aluno fiel.
Marketing. Vendas. Atendimento. Cobrança. Retenção.
Tudo conectado. Tudo no lugar.

O futuro da gestão de alta performance começou.

Conheça em [inserir link]

powered by Octalab.ai

#octagym #ironberg #academia #fitness #sistemaoperacional`
      },

      // ───────── POST 2 — PROVA DE POTÊNCIA COMERCIAL ─────────
      {
        day: 'Post 2',
        date: 'Prova de produto',
        kind: 'comercial',
        theme: '+R$ 150 mil na pré-venda sem time comercial',
        format: 'Post estático — capa única',
        slide: {
          type: 'ogy-proof',
          chip: 'PRÉ-VENDA IRONBERG · 2026',
          data: '+R$ 150 mil',
          label: 'vendidos na pré-venda',
          divider: 'sem',
          highlight: 'um único vendedor.',
          subline: 'Só o módulo financeiro do Octagym. Matrícula, pagamento e contrato — por dentro do sistema.',
          cta: 'LEIA A LEGENDA'
        },
        caption: `Mais de R$ 150 mil em matrículas vendidas na pré-venda da Ironberg Brasília.

Sem time comercial. Sem corretor. Sem ligação fria. Sem CRM externo.

Só o módulo financeiro do Octagym fazendo o trabalho: cliente entra, conhece o plano, paga e recebe o contrato — tudo por dentro do sistema.

A gente fala muito de "sistema completo". Esse é o teste real: receita acontecendo antes mesmo da academia abrir a porta.

Você vê o faturamento no celular antes do café.

O futuro da gestão de alta performance começou.

Conheça em [inserir link]

powered by Octalab.ai

#octagym #fitness #academia #vendas #financeiro`
      },

      // ───────── POST 3 — POSICIONAMENTO DE PRODUTO ─────────
      {
        day: 'Post 3',
        date: 'O que é o Octagym',
        kind: 'comercial',
        theme: 'Sistema operacional, não plataforma',
        format: 'Post estático — capa única',
        slide: {
          type: 'ogy-positioning',
          eyebrow: 'OCTAGYM.AI',
          title1: 'Do anúncio',
          title2: 'ao aluno fiel.',
          subline: 'Marketing, vendas, atendimento, cobrança e retenção conectados em uma única plataforma.',
          modules: ['Marketing', 'Vendas', 'Atendimento', 'Cobrança', 'Retenção'],
          cta: 'LEIA A LEGENDA'
        },
        caption: `Sua academia roda em 7 sistemas diferentes? Em planilhas que ninguém atualiza? Em WhatsApps individuais que perdem cliente todo dia?

Octagym não é um app de check-in. Não é só um CRM. Não é um gateway de pagamento.

É o sistema operacional da academia. O software que opera o negócio do começo ao fim.

→ Marketing — campanhas, captura de lead, atribuição
→ Vendas — matrícula, plano, contrato e pagamento por dentro
→ Atendimento — cada conversa amarrada ao aluno
→ Cobrança — recorrência, inadimplência, retentativa
→ Retenção — frequência, churn previsto, ação no tempo certo

Uma operação. Uma base de dados. Uma fonte da verdade.

Conheça em [inserir link]

powered by Octalab.ai

#octagym #fitness #academia #gestao`
      },

      // ───────── POST 4 — MANIFESTO DE CATEGORIA ─────────
      {
        day: 'Post 4',
        date: 'Manifesto',
        kind: 'comercial',
        theme: 'A academia moderna precisa de um SO',
        format: 'Post estático — capa única',
        slide: {
          type: 'ogy-manifesto',
          line1: 'A academia moderna',
          line2: 'precisa de',
          line3: 'inteligência.',
          line4: 'Automação.',
          line5: 'Controle.',
          line6: 'Escala.',
          divider: 'Ela precisa de um',
          highlight: 'sistema operacional.',
          cta: 'LEIA A LEGENDA'
        },
        caption: `Academia hoje não compete por equipamento. Compete por operação.

Quem retém mais aluno por mais tempo, ganha. Quem antecipa o churn, ganha. Quem responde lead em segundos, ganha. Quem cobra automático sem perder cliente, ganha.

Nada disso acontece em planilha. Nada disso acontece em 7 sistemas desconectados.

A academia moderna precisa de inteligência, automação, controle e escala em uma única plataforma.

Ela precisa de um sistema operacional.

Octagym.ai — construído para academias que não querem mais ser operadas como uma academia comum.

Conheça em [inserir link]

powered by Octalab.ai

#octagym #fitness #academia #gestao #tecnologia`
      }
    ]
  },

  juspilotTrafego: {
    name: 'JusPilot · Tráfego',
    tagline: 'Campanha de aquisição — 4 ângulos de tráfego',
    accent: '#D97757',
    bg: '#101010',
    text: '#FFFEEE',
    link: 'juspilot.ai',
    posts: [
      // ───────── AD 01 — VELOCIDADE ─────────
      {
        day: 'Ad 01',
        date: 'Velocidade',
        kind: 'campanha',
        theme: 'Velocidade & Contraste Temporal',
        format: 'Estático único 1:1 · Tráfego/Conversão · Funil topo–meio',
        slide: {
          type: 'ad-velocidade',
          eyebrow: 'JUSPILOT · IA JURÍDICA',
          title1: '72 horas.',
          title2: 'Ou 34 segundos.',
          subline: 'Leitura integral dos autos, Resumo Analítico, Linha do Tempo e Jurisprudência Correlata real. Em segundos.',
          cta: 'COMEÇAR AGORA'
        },
        caption: `Quanto tempo seu escritório perde lendo autos antes de chegar à tese?

O JusPilot lê o processo inteiro e devolve, em até 34 segundos:

→ Resumo Analítico da demanda
→ Linha do Tempo Processual
→ Pontos Controvertidos e Riscos da Demanda
→ Jurisprudência Correlata real dos tribunais

Crie sua conta gratuita e teste com um processo seu hoje. Sem cartão.

[inserir link]

— — — — META ADS — — — —
Headline: 72 horas viraram 34 segundos.
Description: IA jurídica que lê os autos e devolve análise estruturada. Trial gratuito.
Botão: Cadastre-se

Público: Sócios e gestores de operações · Médios escritórios (5–30 advogados)
Objetivo: Trial direto · Cadastro na plataforma
Ângulo: Velocidade
Gatilho: Contraste numérico extremo (72h × 34s)`
      },

      // ───────── AD 02 — ALUCINAÇÃO ─────────
      {
        day: 'Ad 02',
        date: 'Risco / Segurança',
        kind: 'campanha',
        theme: 'Alucinação de IA × Fundamentação Real',
        format: 'Estático único 1:1 · Tráfego/Conversão · Funil meio',
        slide: {
          type: 'ad-alucinacao',
          eyebrow: 'JUSPILOT · IA JURÍDICA',
          title1: 'Outra IA inventou',
          title2: 'jurisprudência?',
          title3: 'O JusPilot não.',
          subline: 'Base curada de STF, STJ, TJDFT, TJSP. Cada citação vem com link para o acórdão.',
          proof: '20 salários-mínimos · TRT-2 · OAB-SP. As multas começaram.',
          cta: 'TESTAR GRÁTIS'
        },
        caption: `Em 2026 já temos casos de multa por jurisprudência inventada por IA em todos esses tribunais: TRT-2, TJ-SC, TJ-GO, 2ª Vara Federal de Londrina. A Recomendação 001/2024 da OAB existe — e os juízes começaram a aplicar.

O problema não é "usar IA". É usar IA generalista que não diferencia tribunal de blog jurídico.

O JusPilot opera com base curada de STF, STJ, TJDFT, TJSP. Cada citação que aparece no Resumo vem com link direto para o acórdão. Você confere antes de submeter.

Crie sua conta gratuita e teste com um processo seu hoje.

[inserir link]

— — — — META ADS — — — —
Headline: A IA jurídica que respeita o ônus argumentativo.
Description: Base curada dos tribunais. Cada citação com link para o acórdão. Trial gratuito.
Botão: Cadastre-se

Público: Sócios e gestores de operações · Médios escritórios (5–30 advogados)
Objetivo: Trial direto · Cadastro na plataforma
Ângulo: Risco / Segurança jurídica
Gatilho: Notícia em alta (multas da OAB) + diferencial técnico`
      },

      // ───────── AD 03 — OUTPUTS ─────────
      {
        day: 'Ad 03',
        date: 'Outputs do produto',
        kind: 'campanha',
        theme: 'Outputs do produto — o que você recebe',
        format: 'Estático único 1:1 · Tráfego/Conversão · Funil meio–fundo',
        slide: {
          type: 'ad-outputs',
          eyebrow: 'JUSPILOT · IA JURÍDICA',
          title1: 'Anexe o processo.',
          title2: 'Receba 5 análises.',
          outputs: [
            '01 · Resumo Analítico',
            '02 · Linha do Tempo Processual',
            '03 · Pontos Controvertidos e Riscos',
            '04 · Jurisprudência Correlata',
            '05 · Próximos Passos Estratégicos'
          ],
          subline: 'Em até 34 segundos. Com fundamentação dos tribunais.',
          cta: 'CRIAR CONTA GRATUITA'
        },
        caption: `Você anexa o processo. O JusPilot devolve cinco análises estruturadas em até 34 segundos:

→ Resumo Analítico da demanda
→ Linha do Tempo Processual
→ Pontos Controvertidos e Riscos da Demanda
→ Jurisprudência Correlata real dos tribunais (com link para o acórdão)
→ Próximos Passos Estratégicos

Sua próxima petição começa com o trabalho braçal pronto.

Teste hoje, sem cartão.

[inserir link]

— — — — META ADS — — — —
Headline: 5 análises estruturadas. Em 34 segundos.
Description: Resumo, linha do tempo, riscos, jurisprudência e estratégia. Anexe o processo.
Botão: Experimentar

Público: Sócios e gestores de operações · Médios escritórios (5–30 advogados)
Objetivo: Trial direto · Cadastro na plataforma
Ângulo: Demonstração de valor concreto
Gatilho: Lista de entregáveis tangíveis · "o que recebo se assinar"`
      },

      // ───────── AD 04 — MANIFESTO ─────────
      {
        day: 'Ad 04',
        date: 'Manifesto',
        kind: 'campanha',
        theme: 'Manifesto — decidir × procurar',
        format: 'Estático único 1:1 · Tráfego/Conversão · Funil topo',
        slide: {
          type: 'ad-manifesto',
          eyebrow: 'JUSPILOT',
          line1: 'Advogados não deveriam',
          line2: 'perder tempo',
          line3: 'procurando informação.',
          divider: 'Deveriam usar tempo',
          highlight: 'tomando decisões.',
          cta: 'CONHECER'
        },
        caption: `O que define o trabalho do advogado sócio? A tese. A estratégia. A leitura fina do caso. A decisão.

E o que toma o tempo dele todo dia? Ler 800 páginas, marcar trecho, copiar para o Word, procurar jurisprudência em 4 bases.

O JusPilot devolve o tempo da tese. Lê os autos integralmente, estrutura a análise, entrega Jurisprudência Correlata real dos tribunais — em até 34 segundos.

Você decide com mais clareza. E mais rápido.

Crie sua conta. Sem cartão.

[inserir link]

— — — — META ADS — — — —
Headline: Decisão em vez de busca.
Description: O JusPilot lê os autos. Você decide a tese. Trial gratuito.
Botão: Cadastre-se

Público: Sócios e gestores de operações · Médios escritórios (5–30 advogados)
Objetivo: Trial direto · Cadastro na plataforma
Ângulo: Posicionamento / identitário
Gatilho: Frase-manifesto · identificação do sócio com o problema`
      }
    ]
  }
};

// ============================================================
// RENDERIZADORES — UM POR MARCA (capa única ou carrossel)
// ============================================================

// ─── JUSPILOT ───
function JusPilotRender({ slide }) {
  const base = {
    width: '100%',
    aspectRatio: '1 / 1',
    background: '#101010',
    color: '#FFFEEE',
    fontFamily: 'Geist, system-ui, sans-serif',
    borderRadius: '14px',
    padding: '38px 34px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden'
  };

  const logo = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, zIndex: 2, position: 'relative' }}>
      <div style={{
        width: '22px', height: '22px',
        background: '#D97757',
        borderRadius: '5px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '13px', fontWeight: 700, color: '#FFFEEE'
      }}>J</div>
      <span>Juspilot</span>
    </div>
  );

  // Capa de notícia
  if (slide.type === 'jp-news-cover') {
    return (
      <div style={{ ...base, background: 'linear-gradient(160deg, #101010 0%, #1f1410 100%)' }}>
        {/* Textura sutil */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(217,119,87,0.15) 0%, transparent 50%)'
        }}/>
        {logo}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignSelf: 'flex-start',
            border: '1px solid rgba(217,119,87,0.45)',
            background: 'rgba(217,119,87,0.08)',
            borderRadius: '999px', padding: '6px 12px',
            fontSize: '10px', letterSpacing: '0.15em', fontWeight: 600,
            color: '#D97757', marginBottom: '20px'
          }}>
            {slide.chip}
          </div>
          <h2 style={{ fontSize: '30px', fontWeight: 500, lineHeight: 1.15, margin: 0, letterSpacing: '-0.02em' }}>
            {slide.headline}
          </h2>
          <h1 style={{
            fontSize: '32px', fontWeight: 700, lineHeight: 1.1, margin: '4px 0 18px 0',
            letterSpacing: '-0.02em', color: '#D97757'
          }}>
            {slide.highlight}
          </h1>
          <p style={{ fontSize: '13px', lineHeight: 1.55, opacity: 0.8, margin: '0 0 18px 0', maxWidth: '95%' }}>
            {slide.subline}
          </p>
          <div style={{
            fontSize: '10px', letterSpacing: '0.1em',
            opacity: 0.55, textTransform: 'uppercase', fontWeight: 500
          }}>
            {slide.source}
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: '11px', zIndex: 1, position: 'relative'
        }}>
          <span style={{ opacity: 0.5 }}>juspilot.ai</span>
          <div style={{
            display: 'inline-flex',
            border: '1px solid #D97757', borderRadius: '999px',
            padding: '7px 13px', fontSize: '10px', fontWeight: 700,
            color: '#D97757', letterSpacing: '0.12em', alignItems: 'center', gap: '6px'
          }}>
            {slide.cta} <ArrowRight size={11} />
          </div>
        </div>
      </div>
    );
  }

  // Capa de carrossel
  if (slide.type === 'jp-cover') {
    return (
      <div style={base}>
        {logo}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          {slide.chip && (
            <div style={{
              fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase',
              color: '#D97757', marginBottom: '14px', fontWeight: 600
            }}>{slide.chip}</div>
          )}
          <h1 style={{ fontSize: '60px', fontWeight: 700, lineHeight: 0.98, margin: 0, letterSpacing: '-0.04em', color: '#D97757' }}>
            {slide.title}
          </h1>
          <h2 style={{ fontSize: '28px', fontWeight: 500, lineHeight: 1.1, margin: '6px 0 22px 0', letterSpacing: '-0.02em' }}>
            {slide.subtitle}
          </h2>
          <p style={{ fontSize: '14px', lineHeight: 1.55, opacity: 0.8, margin: 0, maxWidth: '92%' }}>
            {slide.body}
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', opacity: 0.5 }}>
          <span>juspilot.ai</span>
        </div>
      </div>
    );
  }

  // Card numerado
  if (slide.type === 'jp-numbered') {
    return (
      <div style={base}>
        {logo}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '64px', fontWeight: 700, color: '#D97757', lineHeight: 1, marginBottom: '14px', letterSpacing: '-0.04em' }}>
            {slide.number}
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 600, lineHeight: 1.15, margin: '0 0 14px 0', letterSpacing: '-0.02em' }}>
            {slide.title}
          </h2>
          <p style={{ fontSize: '14px', lineHeight: 1.55, opacity: 0.85, margin: 0, maxWidth: '95%' }}>
            {slide.body}
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', opacity: 0.5 }}>
          <span>juspilot.ai</span>
        </div>
      </div>
    );
  }

  // Card final com CTA
  if (slide.type === 'jp-final') {
    return (
      <div style={{ ...base, background: 'linear-gradient(135deg, #101010 0%, #2a1810 100%)' }}>
        {logo}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '40px', fontWeight: 700, color: '#D97757', lineHeight: 1, marginBottom: '14px', letterSpacing: '-0.04em' }}>
            {slide.number}
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 600, lineHeight: 1.15, margin: '0 0 14px 0', letterSpacing: '-0.02em' }}>
            {slide.title}
          </h2>
          <p style={{ fontSize: '13.5px', lineHeight: 1.55, opacity: 0.85, margin: '0 0 20px 0', maxWidth: '95%' }}>
            {slide.body}
          </p>
          <div style={{
            display: 'inline-flex', alignSelf: 'flex-start',
            border: '1px solid #D97757', borderRadius: '999px',
            padding: '10px 16px', fontSize: '11px', fontWeight: 600,
            color: '#FFFEEE', alignItems: 'center', gap: '8px'
          }}>
            {slide.cta} <ArrowRight size={12} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', opacity: 0.5 }}>
          <span>juspilot.ai</span>
        </div>
      </div>
    );
  }

  // AD 01 — VELOCIDADE
  if (slide.type === 'ad-velocidade') {
    return (
      <div style={{ ...base, background: 'radial-gradient(circle at 75% 25%, #2a1810 0%, #101010 65%)' }}>
        {logo}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.25em', color: '#D97757', marginBottom: '14px', fontWeight: 700 }}>
            {slide.eyebrow}
          </div>
          <h1 style={{ fontSize: '74px', fontWeight: 700, lineHeight: 0.92, margin: 0, letterSpacing: '-0.05em', color: '#FFFEEE', textShadow: '0 4px 30px rgba(217,119,87,0.15)' }}>
            {slide.title1}
          </h1>
          <h2 style={{ fontSize: '56px', fontWeight: 400, lineHeight: 0.98, margin: '6px 0 22px 0', letterSpacing: '-0.04em', color: '#D97757', fontStyle: 'italic' }}>
            {slide.title2}
          </h2>
          <p style={{ fontSize: '13.5px', lineHeight: 1.55, opacity: 0.85, margin: 0, maxWidth: '95%' }}>
            {slide.subline}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10.5px', opacity: 0.5 }}>juspilot.ai</span>
          <div style={{ background: '#D97757', color: '#101010', borderRadius: '6px', padding: '11px 16px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
            {slide.cta} <ArrowRight size={12} />
          </div>
        </div>
      </div>
    );
  }

  // AD 02 — ALUCINAÇÃO
  if (slide.type === 'ad-alucinacao') {
    return (
      <div style={{ ...base, background: '#101010' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(220,38,38,0.18) 0%, transparent 65%)', filter: 'blur(40px)' }} />
        {logo}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.25em', color: '#D97757', marginBottom: '14px', fontWeight: 700 }}>
            {slide.eyebrow}
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 500, lineHeight: 1.1, margin: 0, letterSpacing: '-0.02em', color: 'rgba(255,254,238,0.75)' }}>
            {slide.title1}
          </h2>
          <h2 style={{ fontSize: '40px', fontWeight: 700, lineHeight: 1.05, margin: '2px 0 4px 0', letterSpacing: '-0.03em', color: '#FCA5A5' }}>
            {slide.title2}
          </h2>
          <h1 style={{ fontSize: '34px', fontWeight: 600, lineHeight: 1.1, margin: '8px 0 18px 0', letterSpacing: '-0.02em', color: '#D97757' }}>
            {slide.title3}
          </h1>
          <p style={{ fontSize: '12.5px', lineHeight: 1.55, opacity: 0.85, margin: '0 0 14px 0', maxWidth: '95%' }}>
            {slide.subline}
          </p>
          <div style={{ display: 'inline-flex', alignSelf: 'flex-start', alignItems: 'center', gap: '8px', border: '1px solid rgba(252,165,165,0.3)', background: 'rgba(220,38,38,0.08)', borderRadius: '6px', padding: '8px 12px', fontSize: '11px', color: '#FCA5A5', fontWeight: 500 }}>
            <AlertTriangle size={12} /> {slide.proof}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1, position: 'relative' }}>
          <span style={{ fontSize: '10.5px', opacity: 0.5 }}>juspilot.ai</span>
          <div style={{ background: '#D97757', color: '#101010', borderRadius: '6px', padding: '11px 16px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em', display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
            {slide.cta} <ArrowRight size={12} />
          </div>
        </div>
      </div>
    );
  }

  // AD 03 — OUTPUTS
  if (slide.type === 'ad-outputs') {
    return (
      <div style={{ ...base, background: 'linear-gradient(160deg, #101010 0%, #1a0e09 100%)' }}>
        {logo}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.25em', color: '#D97757', marginBottom: '14px', fontWeight: 700 }}>
            {slide.eyebrow}
          </div>
          <h2 style={{ fontSize: '30px', fontWeight: 500, lineHeight: 1.1, margin: 0, letterSpacing: '-0.02em' }}>
            {slide.title1}
          </h2>
          <h1 style={{ fontSize: '38px', fontWeight: 700, lineHeight: 1.05, margin: '4px 0 18px 0', letterSpacing: '-0.03em', color: '#D97757' }}>
            {slide.title2}
          </h1>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px 0' }}>
            {slide.outputs.map((o, i) => (
              <li key={i} style={{ fontSize: '12px', padding: '7px 0', borderTop: i === 0 ? '1px solid rgba(217,119,87,0.25)' : 'none', borderBottom: '1px solid rgba(217,119,87,0.15)', display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '0.02em', fontWeight: 500 }}>
                <span style={{ color: '#D97757', fontWeight: 700, minWidth: '24px' }}>{o.split(' · ')[0]}</span>
                <span style={{ opacity: 0.9 }}>{o.split(' · ')[1]}</span>
              </li>
            ))}
          </ul>
          <p style={{ fontSize: '12px', lineHeight: 1.5, opacity: 0.75, margin: 0, fontStyle: 'italic' }}>
            {slide.subline}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10.5px', opacity: 0.5 }}>juspilot.ai</span>
          <div style={{ background: '#D97757', color: '#101010', borderRadius: '6px', padding: '11px 16px', fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.1em', display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
            {slide.cta} <ArrowRight size={12} />
          </div>
        </div>
      </div>
    );
  }

  // AD 04 — MANIFESTO
  if (slide.type === 'ad-manifesto') {
    return (
      <div style={{ ...base, background: '#101010' }}>
        <div style={{ position: 'absolute', top: '12%', bottom: '20%', left: '34px', width: '2px', background: 'linear-gradient(180deg, transparent, #D97757, transparent)', opacity: 0.5 }} />
        {logo}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: '14px' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.3em', color: '#D97757', marginBottom: '20px', fontWeight: 700 }}>
            {slide.eyebrow}
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 400, lineHeight: 1.2, margin: 0, letterSpacing: '-0.02em', opacity: 0.7 }}>{slide.line1}</h2>
          <h2 style={{ fontSize: '32px', fontWeight: 600, lineHeight: 1.15, margin: '2px 0', letterSpacing: '-0.02em', color: '#D97757' }}>{slide.line2}</h2>
          <h2 style={{ fontSize: '26px', fontWeight: 400, lineHeight: 1.2, margin: '0 0 18px 0', letterSpacing: '-0.02em', opacity: 0.7 }}>{slide.line3}</h2>
          <div style={{ height: '1px', width: '40px', background: '#D97757', marginBottom: '18px' }} />
          <h2 style={{ fontSize: '26px', fontWeight: 400, lineHeight: 1.2, margin: 0, letterSpacing: '-0.02em' }}>{slide.divider}</h2>
          <h1 style={{ fontSize: '34px', fontWeight: 700, lineHeight: 1.1, margin: '2px 0', letterSpacing: '-0.025em', color: '#D97757' }}>{slide.highlight}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '10.5px', opacity: 0.5 }}>juspilot.ai</span>
          <div style={{ border: '1px solid #D97757', color: '#D97757', borderRadius: '6px', padding: '10px 16px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
            {slide.cta} <ArrowRight size={12} />
          </div>
        </div>
      </div>
    );
  }

  // Comercial — capa única
  if (slide.type === 'jp-comercial') {
    return (
      <div style={{ ...base, background: 'radial-gradient(circle at 70% 30%, #2a1810 0%, #101010 70%)' }}>
        {logo}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{
            fontSize: '10px', letterSpacing: '0.25em',
            color: '#D97757', marginBottom: '16px', fontWeight: 600
          }}>
            {slide.eyebrow}
          </div>
          <h1 style={{ fontSize: '64px', fontWeight: 700, lineHeight: 0.95, margin: 0, letterSpacing: '-0.04em' }}>
            {slide.title}
          </h1>
          <h2 style={{ fontSize: '50px', fontWeight: 400, lineHeight: 0.98, margin: '6px 0 24px 0', letterSpacing: '-0.035em', color: '#D97757' }}>
            {slide.highlight}
          </h2>
          <p style={{ fontSize: '13.5px', lineHeight: 1.55, opacity: 0.85, margin: 0, maxWidth: '92%' }}>
            {slide.subline}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', opacity: 0.5 }}>juspilot.ai</span>
          <div style={{
            border: '1px solid #D97757', borderRadius: '999px',
            padding: '8px 14px', fontSize: '10px', fontWeight: 700,
            color: '#D97757', letterSpacing: '0.12em',
            display: 'inline-flex', alignItems: 'center', gap: '6px'
          }}>
            {slide.cta} <ArrowRight size={11} />
          </div>
        </div>
      </div>
    );
  }

  return <div style={base}>...</div>;
}

// ─── OCTALAB ───
function OctalabRender({ slide }) {
  const baseDark = {
    width: '100%',
    aspectRatio: '1 / 1',
    background: '#0F0F13',
    color: '#F4EFE5',
    fontFamily: 'Geist, system-ui, sans-serif',
    borderRadius: '14px',
    padding: '40px 34px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden'
  };
  const baseLight = { ...baseDark, background: '#F4EFE5', color: '#0F0F13' };

  const Octagon = ({ size = 18, color = '#F4EFE5' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M7 2L17 2L22 7L22 17L17 22L7 22L2 17L2 7L7 2Z" stroke={color} strokeWidth="1.5" fill="none"/>
      <path d="M9 5.5L15 5.5L18.5 9L18.5 15L15 18.5L9 18.5L5.5 15L5.5 9L9 5.5Z" stroke={color} strokeWidth="0.8" fill="none"/>
    </svg>
  );

  const logo = (isDark) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', position: 'relative', zIndex: 2 }}>
      <Octagon color={isDark ? '#F4EFE5' : '#0F0F13'} />
      <span><strong>Octalab</strong><span style={{ opacity: 0.6, fontWeight: 300 }}>.ai</span></span>
    </div>
  );

  const Graph = ({ opacity = 0.12 }) => (
    <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity }} viewBox="0 0 400 400">
      <circle cx="80" cy="100" r="22" fill="none" stroke="#F4EFE5" strokeWidth="1"/>
      <circle cx="320" cy="80" r="14" fill="none" stroke="#F4EFE5" strokeWidth="1"/>
      <circle cx="350" cy="280" r="28" fill="none" stroke="#F4EFE5" strokeWidth="1"/>
      <circle cx="60" cy="340" r="18" fill="none" stroke="#F4EFE5" strokeWidth="1"/>
      <circle cx="200" cy="380" r="10" fill="none" stroke="#F4EFE5" strokeWidth="1"/>
      <line x1="80" y1="100" x2="320" y2="80" stroke="#F4EFE5" strokeWidth="0.5"/>
      <line x1="320" y1="80" x2="350" y2="280" stroke="#F4EFE5" strokeWidth="0.5"/>
      <line x1="350" y1="280" x2="60" y2="340" stroke="#F4EFE5" strokeWidth="0.5"/>
      <line x1="60" y1="340" x2="80" y2="100" stroke="#F4EFE5" strokeWidth="0.5"/>
    </svg>
  );

  // Capa de notícia
  if (slide.type === 'oct-news') {
    return (
      <div style={baseDark}>
        <Graph opacity={0.1} />
        <div style={{ position: 'relative', zIndex: 1 }}>{logo(true)}</div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'inline-flex', alignSelf: 'flex-start',
            border: '1px solid rgba(244,239,229,0.25)',
            borderRadius: '999px', padding: '6px 12px',
            fontSize: '10px', letterSpacing: '0.15em', fontWeight: 500,
            marginBottom: '20px'
          }}>
            {slide.chip}
          </div>
          <h2 style={{ fontSize: '30px', fontWeight: 400, lineHeight: 1.15, margin: 0, letterSpacing: '-0.02em' }}>
            {slide.title}
          </h2>
          <h1 style={{
            fontSize: '32px', fontWeight: 600, lineHeight: 1.1, margin: '4px 0 18px 0',
            letterSpacing: '-0.02em'
          }}>
            {slide.highlight}
          </h1>
          <p style={{ fontSize: '13px', lineHeight: 1.55, opacity: 0.75, margin: '0 0 18px 0', maxWidth: '95%' }}>
            {slide.subline}
          </p>
          <div style={{
            fontSize: '10px', letterSpacing: '0.1em',
            opacity: 0.55, textTransform: 'uppercase', fontWeight: 500
          }}>
            {slide.source}
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: '11px', zIndex: 1, position: 'relative'
        }}>
          <span style={{ opacity: 0.5 }}>octalab.ai</span>
          <div style={{
            display: 'inline-flex',
            border: '1px solid #F4EFE5', borderRadius: '999px',
            padding: '7px 13px', fontSize: '10px', fontWeight: 600,
            letterSpacing: '0.12em', alignItems: 'center', gap: '6px'
          }}>
            {slide.cta} <ArrowRight size={11} />
          </div>
        </div>
      </div>
    );
  }

  // Manifesto (3 linhas)
  if (slide.type === 'oct-manifesto') {
    return (
      <div style={baseDark}>
        <Graph opacity={0.18} />
        <div style={{ position: 'relative', zIndex: 1 }}>{logo(true)}</div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '56px', fontWeight: 300, lineHeight: 1.05, margin: 0, letterSpacing: '-0.03em' }}>{slide.line1}</h1>
          <h1 style={{ fontSize: '56px', fontWeight: 600, lineHeight: 1.05, margin: 0, letterSpacing: '-0.03em' }}>{slide.line2}</h1>
          <h1 style={{ fontSize: '56px', fontWeight: 300, lineHeight: 1.05, margin: 0, letterSpacing: '-0.03em' }}>{slide.line3}</h1>
        </div>
      </div>
    );
  }

  // Card claro (carrossel)
  if (slide.type === 'oct-light-card') {
    return (
      <div style={baseLight}>
        {logo(false)}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.18em', opacity: 0.5, marginBottom: '14px', fontWeight: 600 }}>
            {slide.number}
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 500, lineHeight: 1.15, margin: '0 0 16px 0', letterSpacing: '-0.02em' }}>
            {slide.title}
          </h2>
          <p style={{ fontSize: '13.5px', lineHeight: 1.55, margin: 0, opacity: 0.8, maxWidth: '95%', whiteSpace: 'pre-line' }}>
            {slide.body}
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: '#0F0F13', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ArrowRight size={14} color="#F4EFE5" />
          </div>
        </div>
      </div>
    );
  }

  // Card escuro (carrossel)
  if (slide.type === 'oct-dark-card') {
    return (
      <div style={baseDark}>
        {logo(true)}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.18em', opacity: 0.5, marginBottom: '14px', fontWeight: 600 }}>
            {slide.number}
          </div>
          <h2 style={{ fontSize: '32px', fontWeight: 500, lineHeight: 1.15, margin: '0 0 16px 0', letterSpacing: '-0.02em' }}>
            {slide.title}
          </h2>
          <p style={{ fontSize: '13.5px', lineHeight: 1.55, margin: 0, opacity: 0.78, maxWidth: '95%', whiteSpace: 'pre-line' }}>
            {slide.body}
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #F4EFE5',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ArrowRight size={14} color="#F4EFE5" />
          </div>
        </div>
      </div>
    );
  }

  // Assinatura final (carrossel)
  if (slide.type === 'oct-signature') {
    return (
      <div style={baseDark}>
        <Graph opacity={0.18} />
        <div style={{ position: 'relative', zIndex: 1 }}>{logo(true)}</div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '54px', fontWeight: 600, lineHeight: 1.05, margin: 0, letterSpacing: '-0.03em' }}>{slide.line1}</h1>
          <h1 style={{ fontSize: '54px', fontWeight: 600, lineHeight: 1.05, margin: 0, letterSpacing: '-0.03em', opacity: 0.55 }}>{slide.line2}</h1>
          <h1 style={{ fontSize: '54px', fontWeight: 600, lineHeight: 1.05, margin: '0 0 24px 0', letterSpacing: '-0.03em' }}>{slide.line3}</h1>
          {slide.cta && (
            <div style={{
              display: 'inline-flex', alignSelf: 'flex-start',
              border: '1px solid #F4EFE5', borderRadius: '999px',
              padding: '10px 16px', fontSize: '11px', fontWeight: 600,
              letterSpacing: '0.05em', alignItems: 'center', gap: '8px'
            }}>
              {slide.cta} <ArrowRight size={12} />
            </div>
          )}
        </div>
      </div>
    );
  }

  // Comercial — capa única
  if (slide.type === 'oct-comercial') {
    return (
      <div style={baseDark}>
        <Graph opacity={0.15} />
        <div style={{ position: 'relative', zIndex: 1 }}>{logo(true)}</div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '34px', fontWeight: 400, lineHeight: 1.2, margin: 0, letterSpacing: '-0.02em' }}>{slide.line1}</h1>
          <h1 style={{ fontSize: '34px', fontWeight: 400, lineHeight: 1.2, margin: 0, letterSpacing: '-0.02em' }}>{slide.line2}</h1>
          <h1 style={{ fontSize: '34px', fontWeight: 400, lineHeight: 1.2, margin: '0 0 24px 0', letterSpacing: '-0.02em' }}>{slide.line3}</h1>
          <div style={{
            height: '1px', background: 'rgba(244,239,229,0.25)', width: '60px', marginBottom: '20px'
          }}/>
          <h2 style={{ fontSize: '38px', fontWeight: 700, lineHeight: 1, margin: 0, letterSpacing: '-0.03em' }}>
            {slide.divider}
          </h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 1, position: 'relative' }}>
          <span style={{ fontSize: '11px', opacity: 0.5 }}>We build tomorrow's tech.</span>
          <div style={{
            border: '1px solid #F4EFE5', borderRadius: '999px',
            padding: '8px 14px', fontSize: '10px', fontWeight: 700,
            letterSpacing: '0.12em', display: 'inline-flex', alignItems: 'center', gap: '6px'
          }}>
            {slide.cta} <ArrowRight size={11} />
          </div>
        </div>
      </div>
    );
  }

  return <div style={baseDark}>...</div>;
}

// ─── ECOSYS AUTO ───
function EcosysRender({ slide }) {
  const base = {
    width: '100%',
    aspectRatio: '1 / 1',
    background: 'linear-gradient(180deg, #0A1628 0%, #050B14 100%)',
    color: '#FFFFFF',
    fontFamily: 'Geist, system-ui, sans-serif',
    borderRadius: '14px',
    padding: '28px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden'
  };

  const logo = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative', zIndex: 2 }}>
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
        <rect x="2" y="2" width="9" height="9" fill="#22D3EE"/>
        <rect x="13" y="2" width="6" height="6" fill="#FFFFFF"/>
        <rect x="2" y="13" width="6" height="6" fill="#FFFFFF"/>
        <rect x="13" y="13" width="9" height="9" fill="#FFFFFF"/>
      </svg>
      <div style={{ lineHeight: 1 }}>
        <div style={{ fontSize: '12px', fontWeight: 500 }}>ecosys</div>
        <div style={{ fontSize: '8.5px', letterSpacing: '0.2em', opacity: 0.7 }}>AUTO</div>
      </div>
      <div style={{ marginLeft: 'auto', fontSize: '10px', opacity: 0.5 }}>2026</div>
    </div>
  );

  const footer = (
    <div style={{ display: 'flex', justifyContent: 'center', fontSize: '10px', opacity: 0.6, position: 'relative', zIndex: 2 }}>
      <span>powered by <strong style={{ color: '#FFFFFF' }}>Octalab.ai</strong></span>
    </div>
  );

  const NightScene = () => (
    <div style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
        background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)'
      }}/>
      <div style={{
        position: 'absolute', top: '20%', right: '10%', width: '180px', height: '180px',
        background: 'radial-gradient(circle, rgba(255,180,80,0.18) 0%, transparent 60%)',
        borderRadius: '50%', filter: 'blur(25px)'
      }}/>
      <div style={{
        position: 'absolute', bottom: '15%', left: '5%', width: '140px', height: '140px',
        background: 'radial-gradient(circle, rgba(34,211,238,0.15) 0%, transparent 60%)',
        borderRadius: '50%', filter: 'blur(20px)'
      }}/>
    </div>
  );

  // Capa de notícia — dado grande
  if (slide.type === 'eco-news-cover') {
    return (
      <div style={base}>
        <NightScene />
        {logo}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex', alignSelf: 'flex-start',
            border: '1px solid rgba(34,211,238,0.45)',
            background: 'rgba(34,211,238,0.1)',
            borderRadius: '999px', padding: '5px 11px',
            fontSize: '9.5px', letterSpacing: '0.15em', fontWeight: 600,
            color: '#22D3EE', marginBottom: '18px'
          }}>
            {slide.chip}
          </div>
          <div style={{
            fontSize: '72px', fontWeight: 700, lineHeight: 0.95, margin: 0,
            letterSpacing: '-0.04em', color: '#FFFFFF',
            textShadow: '0 4px 30px rgba(0,0,0,0.6)'
          }}>
            {slide.data}
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 500, lineHeight: 1.2, margin: '8px 0 0 0', letterSpacing: '-0.01em' }}>
            {slide.headline}
          </h2>
          <h2 style={{
            fontSize: '20px', fontWeight: 700, lineHeight: 1.2, margin: '2px 0 14px 0',
            letterSpacing: '-0.01em',
            background: 'linear-gradient(180deg, transparent 60%, rgba(34,211,238,0.55) 60%)',
            display: 'inline-block', width: 'fit-content', padding: '0 5px'
          }}>
            {slide.highlight}
          </h2>
          <p style={{ fontSize: '12px', lineHeight: 1.55, margin: '0 0 14px 0', opacity: 0.85, maxWidth: '92%' }}>
            {slide.subline}
          </p>
          <div style={{
            fontSize: '10px', letterSpacing: '0.1em',
            opacity: 0.6, textTransform: 'uppercase', fontWeight: 500
          }}>
            {slide.source}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
          <div style={{
            background: '#22D3EE', color: '#0A1628',
            borderRadius: '999px', padding: '8px 14px',
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em',
            display: 'inline-flex', alignItems: 'center', gap: '6px'
          }}>
            {slide.cta} <ArrowRight size={11} />
          </div>
          <span style={{ fontSize: '9px', opacity: 0.6 }}>powered by <strong style={{ color: '#FFFFFF' }}>Octalab.ai</strong></span>
        </div>
      </div>
    );
  }

  // Capa de carrossel (dado grande)
  if (slide.type === 'eco-data-cover') {
    return (
      <div style={base}>
        <NightScene />
        {logo}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex', alignSelf: 'flex-start',
            border: '1px solid rgba(34,211,238,0.4)',
            borderRadius: '999px', padding: '5px 11px',
            fontSize: '9.5px', letterSpacing: '0.15em', fontWeight: 600,
            color: '#22D3EE', marginBottom: '14px'
          }}>
            {slide.chip}
          </div>
          <div style={{
            fontSize: '70px', fontWeight: 700, lineHeight: 0.95, margin: 0,
            letterSpacing: '-0.04em'
          }}>
            {slide.data}
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 500, lineHeight: 1.2, margin: '8px 0 0 0' }}>
            {slide.title}
          </h2>
          <h2 style={{
            fontSize: '22px', fontWeight: 700, lineHeight: 1.2, margin: '4px 0 14px 0',
            background: 'linear-gradient(180deg, transparent 60%, rgba(34,211,238,0.55) 60%)',
            display: 'inline-block', width: 'fit-content', padding: '0 5px'
          }}>
            {slide.highlight}
          </h2>
          <p style={{ fontSize: '12px', lineHeight: 1.5, margin: 0, opacity: 0.85, maxWidth: '92%' }}>
            {slide.subline}
          </p>
        </div>
        {footer}
      </div>
    );
  }

  // Card numerado claro (alternância)
  if (slide.type === 'eco-numbered') {
    return (
      <div style={base}>
        {logo}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{
            fontSize: '56px', fontWeight: 700, lineHeight: 1, margin: 0,
            color: '#22D3EE', letterSpacing: '-0.04em'
          }}>
            {slide.number}
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 600, lineHeight: 1.2, margin: '12px 0 14px 0', letterSpacing: '-0.02em' }}>
            {slide.title}
          </h2>
          <p style={{ fontSize: '13px', lineHeight: 1.55, margin: 0, opacity: 0.85, maxWidth: '95%', whiteSpace: 'pre-line' }}>
            {slide.body}
          </p>
        </div>
        {footer}
      </div>
    );
  }

  // Card numerado mais denso (mostrando dor)
  if (slide.type === 'eco-numbered-dark') {
    return (
      <div style={{ ...base, background: 'linear-gradient(180deg, #0A1628 0%, #1a2a44 100%)' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.3 }}>
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at 80% 80%, rgba(220,38,38,0.2), transparent 60%)'
          }}/>
        </div>
        {logo}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{
            fontSize: '56px', fontWeight: 700, lineHeight: 1, margin: 0,
            color: '#FCA5A5', letterSpacing: '-0.04em'
          }}>
            {slide.number}
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 600, lineHeight: 1.2, margin: '12px 0 14px 0', letterSpacing: '-0.02em' }}>
            {slide.title}
          </h2>
          <p style={{ fontSize: '13px', lineHeight: 1.55, margin: 0, opacity: 0.9, maxWidth: '95%', whiteSpace: 'pre-line' }}>
            {slide.body}
          </p>
        </div>
        {footer}
      </div>
    );
  }

  // Card final do carrossel — solução
  if (slide.type === 'eco-solution-final') {
    return (
      <div style={base}>
        <NightScene />
        {logo}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
          <h2 style={{ fontSize: '26px', fontWeight: 600, lineHeight: 1.2, margin: 0, letterSpacing: '-0.02em' }}>
            {slide.title}
          </h2>
          <h2 style={{
            fontSize: '26px', fontWeight: 700, lineHeight: 1.2, margin: '4px 0 18px 0',
            background: 'linear-gradient(180deg, transparent 60%, rgba(34,211,238,0.55) 60%)',
            display: 'inline-block', width: 'fit-content', padding: '0 6px'
          }}>
            {slide.highlight}
          </h2>
          <p style={{ fontSize: '13px', lineHeight: 1.55, margin: '0 0 24px 0', opacity: 0.9, maxWidth: '95%' }}>
            {slide.body}
          </p>
          <div style={{
            display: 'inline-flex', alignSelf: 'flex-start',
            background: '#DC2626', color: '#FFFFFF',
            borderRadius: '8px', padding: '12px 18px',
            fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em',
            alignItems: 'center', gap: '8px'
          }}>
            {slide.cta} <ArrowRight size={12} />
          </div>
        </div>
        {footer}
      </div>
    );
  }

  // Comercial — capa única
  if (slide.type === 'eco-comercial') {
    return (
      <div style={base}>
        <NightScene />
        {logo}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{
            fontSize: '10px', letterSpacing: '0.25em',
            color: '#22D3EE', marginBottom: '14px', fontWeight: 700
          }}>
            {slide.eyebrow}
          </div>
          <h1 style={{ fontSize: '36px', fontWeight: 600, lineHeight: 1.1, margin: 0, letterSpacing: '-0.02em' }}>
            {slide.title}
          </h1>
          <h2 style={{
            fontSize: '36px', fontWeight: 700, lineHeight: 1.1, margin: '4px 0 18px 0',
            background: 'linear-gradient(180deg, transparent 60%, rgba(34,211,238,0.55) 60%)',
            display: 'inline-block', width: 'fit-content', padding: '0 6px'
          }}>
            {slide.highlight}
          </h2>
          <p style={{ fontSize: '13px', lineHeight: 1.55, margin: 0, opacity: 0.9, maxWidth: '92%' }}>
            {slide.subline}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
          <div style={{
            background: '#22D3EE', color: '#0A1628',
            borderRadius: '999px', padding: '8px 14px',
            fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em',
            display: 'inline-flex', alignItems: 'center', gap: '6px'
          }}>
            {slide.cta} <ArrowRight size={11} />
          </div>
          <span style={{ fontSize: '9px', opacity: 0.6 }}>powered by <strong style={{ color: '#FFFFFF' }}>Octalab.ai</strong></span>
        </div>
      </div>
    );
  }

  return <div style={base}>...</div>;
}

// ─── OCTAGYM ───
function OctagymRender({ slide }) {
  const base = {
    width: '100%',
    aspectRatio: '1 / 1',
    background: '#0F0F13',
    color: '#F4EFE5',
    fontFamily: 'Geist, system-ui, sans-serif',
    borderRadius: '14px',
    padding: '36px 32px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden'
  };

  const Octagon = ({ size = 18, color = '#EF0A36' }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path d="M7 2L17 2L22 7L22 17L17 22L7 22L2 17L2 7L7 2Z" stroke={color} strokeWidth="1.5" fill="none"/>
      <path d="M9 5.5L15 5.5L18.5 9L18.5 15L15 18.5L9 18.5L5.5 15L5.5 9L9 5.5Z" stroke={color} strokeWidth="0.8" fill="none"/>
    </svg>
  );

  const logo = (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', position: 'relative', zIndex: 2 }}>
      <Octagon />
      <span>
        <strong style={{ color: '#F4EFE5' }}>Octa</strong>
        <span style={{ color: '#EF0A36', fontWeight: 700 }}>gym</span>
        <span style={{ opacity: 0.55, fontWeight: 300 }}>.ai</span>
      </span>
    </div>
  );

  // Atmosfera "academia" — luz vermelha vinda de cima
  const GymAtmosphere = () => (
    <div style={{ position: 'absolute', inset: 0, opacity: 0.55 }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '35%', background: 'radial-gradient(ellipse at center top, rgba(239,10,54,0.35), transparent 70%)' }}/>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%', background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.7))' }}/>
      <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '30%', opacity: 0.3 }} viewBox="0 0 400 120">
        <line x1="0" y1="20" x2="400" y2="20" stroke="#EF0A36" strokeWidth="0.5"/>
        <line x1="0" y1="50" x2="400" y2="50" stroke="#EF0A36" strokeWidth="0.5"/>
        <line x1="80" y1="0" x2="80" y2="120" stroke="#EF0A36" strokeWidth="0.5"/>
        <line x1="200" y1="0" x2="200" y2="120" stroke="#EF0A36" strokeWidth="0.5"/>
        <line x1="320" y1="0" x2="320" y2="120" stroke="#EF0A36" strokeWidth="0.5"/>
      </svg>
    </div>
  );

  // POST 1 — LANÇAMENTO
  if (slide.type === 'ogy-launch') {
    return (
      <div style={base}>
        <GymAtmosphere />
        {logo}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignSelf: 'flex-start', border: '1px solid rgba(239,10,54,0.55)', background: 'rgba(239,10,54,0.1)', borderRadius: '999px', padding: '5px 12px', fontSize: '9.5px', letterSpacing: '0.18em', fontWeight: 700, color: '#EF0A36', marginBottom: '20px' }}>
            {slide.chip}
          </div>
          <h2 style={{ fontSize: '30px', fontWeight: 500, lineHeight: 1.1, margin: 0, letterSpacing: '-0.02em' }}>{slide.line1}</h2>
          <h1 style={{ fontSize: '46px', fontWeight: 700, lineHeight: 1, margin: '2px 0 4px 0', letterSpacing: '-0.03em', color: '#EF0A36' }}>{slide.highlight}</h1>
          <h2 style={{ fontSize: '24px', fontWeight: 500, lineHeight: 1.15, margin: '6px 0 0 0', letterSpacing: '-0.02em' }}>{slide.line2}</h2>
          <h2 style={{ fontSize: '24px', fontWeight: 700, lineHeight: 1.15, margin: '0 0 18px 0', letterSpacing: '-0.02em' }}>{slide.line3}</h2>
          <p style={{ fontSize: '13px', lineHeight: 1.55, margin: 0, opacity: 0.85, maxWidth: '95%' }}>{slide.subline}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
          <div style={{ background: '#EF0A36', color: '#F4EFE5', borderRadius: '6px', padding: '9px 14px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            {slide.cta} <ArrowRight size={11} />
          </div>
          <span style={{ fontSize: '9px', opacity: 0.55 }}>powered by <strong style={{ color: '#F4EFE5' }}>Octalab.ai</strong></span>
        </div>
      </div>
    );
  }

  // POST 2 — PROVA
  if (slide.type === 'ogy-proof') {
    return (
      <div style={{ ...base, background: 'linear-gradient(135deg, #0F0F13 0%, #1a0510 100%)' }}>
        <div style={{ position: 'absolute', top: '-15%', right: '-15%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(239,10,54,0.25) 0%, transparent 60%)', filter: 'blur(30px)', zIndex: 1 }}/>
        {logo}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignSelf: 'flex-start', border: '1px solid rgba(239,10,54,0.55)', background: 'rgba(239,10,54,0.1)', borderRadius: '999px', padding: '5px 12px', fontSize: '9.5px', letterSpacing: '0.18em', fontWeight: 700, color: '#EF0A36', marginBottom: '18px' }}>
            {slide.chip}
          </div>
          <div style={{ fontSize: '64px', fontWeight: 700, lineHeight: 0.95, margin: 0, letterSpacing: '-0.04em', color: '#F4EFE5', textShadow: '0 4px 30px rgba(239,10,54,0.25)' }}>
            {slide.data}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.85, margin: '6px 0 18px 0', fontWeight: 500 }}>{slide.label}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ height: '1px', flex: 1, background: 'rgba(239,10,54,0.4)' }}/>
            <div style={{ fontSize: '11px', letterSpacing: '0.2em', fontWeight: 700, color: '#EF0A36', textTransform: 'uppercase' }}>{slide.divider}</div>
            <div style={{ height: '1px', flex: 1, background: 'rgba(239,10,54,0.4)' }}/>
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 700, lineHeight: 1.05, margin: '0 0 18px 0', letterSpacing: '-0.03em', color: '#EF0A36' }}>{slide.highlight}</h2>
          <p style={{ fontSize: '12.5px', lineHeight: 1.55, margin: 0, opacity: 0.85, maxWidth: '95%' }}>{slide.subline}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
          <div style={{ background: '#EF0A36', color: '#F4EFE5', borderRadius: '6px', padding: '9px 14px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            {slide.cta} <ArrowRight size={11} />
          </div>
          <span style={{ fontSize: '9px', opacity: 0.55 }}>powered by <strong style={{ color: '#F4EFE5' }}>Octalab.ai</strong></span>
        </div>
      </div>
    );
  }

  // POST 3 — POSICIONAMENTO
  if (slide.type === 'ogy-positioning') {
    return (
      <div style={{ ...base, background: '#F4EFE5', color: '#0F0F13' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', position: 'relative', zIndex: 2 }}>
          <Octagon color="#EF0A36" />
          <span>
            <strong style={{ color: '#0F0F13' }}>Octa</strong>
            <span style={{ color: '#EF0A36', fontWeight: 700 }}>gym</span>
            <span style={{ opacity: 0.45, fontWeight: 300 }}>.ai</span>
          </span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.25em', color: '#EF0A36', marginBottom: '16px', fontWeight: 700 }}>{slide.eyebrow}</div>
          <h1 style={{ fontSize: '44px', fontWeight: 600, lineHeight: 1, margin: 0, letterSpacing: '-0.03em', color: '#0F0F13' }}>{slide.title1}</h1>
          <h1 style={{ fontSize: '44px', fontWeight: 700, lineHeight: 1, margin: '2px 0 18px 0', letterSpacing: '-0.03em', color: '#EF0A36' }}>{slide.title2}</h1>
          <p style={{ fontSize: '13px', lineHeight: 1.55, margin: '0 0 20px 0', opacity: 0.78, maxWidth: '92%' }}>{slide.subline}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {slide.modules.map((m, i) => (
              <div key={i} style={{ background: i % 2 === 0 ? '#0F0F13' : '#EF0A36', color: '#F4EFE5', borderRadius: '999px', padding: '6px 12px', fontSize: '11px', fontWeight: 600, letterSpacing: '0.02em' }}>{m}</div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
          <div style={{ background: '#0F0F13', color: '#F4EFE5', borderRadius: '6px', padding: '9px 14px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            {slide.cta} <ArrowRight size={11} />
          </div>
          <span style={{ fontSize: '9px', opacity: 0.55 }}>powered by <strong style={{ color: '#0F0F13' }}>Octalab.ai</strong></span>
        </div>
      </div>
    );
  }

  // POST 4 — MANIFESTO
  if (slide.type === 'ogy-manifesto') {
    return (
      <div style={{ ...base, background: '#EF0A36', color: '#F4EFE5' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', position: 'relative', zIndex: 2 }}>
          <Octagon color="#F4EFE5" />
          <span>
            <strong style={{ color: '#F4EFE5' }}>Octa</strong>
            <span style={{ color: '#F4EFE5', fontWeight: 700, opacity: 0.75 }}>gym</span>
            <span style={{ opacity: 0.55, fontWeight: 300 }}>.ai</span>
          </span>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
          <h2 style={{ fontSize: '24px', fontWeight: 400, lineHeight: 1.15, margin: 0, letterSpacing: '-0.02em', opacity: 0.85 }}>{slide.line1}</h2>
          <h2 style={{ fontSize: '24px', fontWeight: 400, lineHeight: 1.15, margin: '0 0 14px 0', letterSpacing: '-0.02em', opacity: 0.85 }}>{slide.line2}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '18px' }}>
            <h1 style={{ fontSize: '34px', fontWeight: 700, lineHeight: 1.05, margin: 0, letterSpacing: '-0.03em' }}>{slide.line3}</h1>
            <h1 style={{ fontSize: '34px', fontWeight: 700, lineHeight: 1.05, margin: 0, letterSpacing: '-0.03em' }}>{slide.line4}</h1>
            <h1 style={{ fontSize: '34px', fontWeight: 700, lineHeight: 1.05, margin: 0, letterSpacing: '-0.03em' }}>{slide.line5}</h1>
            <h1 style={{ fontSize: '34px', fontWeight: 700, lineHeight: 1.05, margin: 0, letterSpacing: '-0.03em' }}>{slide.line6}</h1>
          </div>
          <div style={{ height: '1px', width: '50px', background: '#F4EFE5', opacity: 0.5, marginBottom: '14px' }}/>
          <h2 style={{ fontSize: '22px', fontWeight: 400, lineHeight: 1.2, margin: 0, letterSpacing: '-0.02em', opacity: 0.85 }}>{slide.divider}</h2>
          <h1 style={{ fontSize: '34px', fontWeight: 700, lineHeight: 1.05, margin: '2px 0', letterSpacing: '-0.03em', color: '#0F0F13' }}>{slide.highlight}</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 2 }}>
          <div style={{ background: '#0F0F13', color: '#F4EFE5', borderRadius: '6px', padding: '9px 14px', fontSize: '10px', fontWeight: 800, letterSpacing: '0.12em', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            {slide.cta} <ArrowRight size={11} />
          </div>
          <span style={{ fontSize: '9px', opacity: 0.6 }}>powered by <strong style={{ color: '#F4EFE5' }}>Octalab.ai</strong></span>
        </div>
      </div>
    );
  }

  return <div style={base}>...</div>;
}

// ============================================================
// ROTEADORES E COMPONENTES VISUAIS
// ============================================================

// Exibe um criativo pronto (imagem) na proporção natural — nunca corta ou distorce
function SlideImage({ src, portrait }) {
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      style={portrait
        ? { display: 'block', width: '100%', height: '100%', objectFit: 'contain', background: '#101010' }
        : { display: 'block', width: '100%', height: 'auto', borderRadius: '14px', background: '#101010' }}
    />
  );
}

function renderSlide(slide, brand, portrait) {
  if (slide.image) return <SlideImage src={slide.image} portrait={portrait} />;
  if (brand === 'juspilot' || brand === 'juspilotTrafego') return <JusPilotRender slide={slide} />;
  if (brand === 'octalab') return <OctalabRender slide={slide} />;
  if (brand === 'ecosys') return <EcosysRender slide={slide} />;
  if (brand === 'octagym') return <OctagymRender slide={slide} />;
}

function Carousel({ slides, brand, portrait }) {
  const [index, setIndex] = useState(0);
  const total = slides.length;
  return (
    <div>
      <div style={{ position: 'relative', maxWidth: portrait ? '360px' : '460px', margin: '0 auto' }}>
        {portrait ? (
          <div style={{ aspectRatio: '3 / 4', borderRadius: '14px', overflow: 'hidden', background: '#101010' }}>
            {renderSlide(slides[index], brand, true)}
          </div>
        ) : renderSlide(slides[index], brand)}
        <button
          onClick={() => setIndex((index - 1 + total) % total)}
          style={{
            ...glassLight,
            position: 'absolute', left: '-18px', top: '50%', transform: 'translateY(-50%)',
            width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12), inset 0 1px 1px rgba(255,255,255,0.85)'
          }}
        >
          <ChevronLeft size={16} color="#0a0a0a" />
        </button>
        <button
          onClick={() => setIndex((index + 1) % total)}
          style={{
            ...glassLight,
            position: 'absolute', right: '-18px', top: '50%', transform: 'translateY(-50%)',
            width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(0,0,0,0.12), inset 0 1px 1px rgba(255,255,255,0.85)'
          }}
        >
          <ChevronRight size={16} color="#0a0a0a" />
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '14px' }}>
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            style={{
              width: i === index ? '24px' : '6px', height: '6px',
              borderRadius: '3px',
              background: i === index ? '#000' : 'rgba(0,0,0,0.25)',
              border: 'none', cursor: 'pointer', transition: 'all 0.25s'
            }}
          />
        ))}
      </div>
      <div style={{ textAlign: 'center', fontSize: '11px', color: 'rgba(0,0,0,0.5)', marginTop: '6px' }}>
        Lâmina {index + 1} de {total}
      </div>
    </div>
  );
}

function KindBadge({ kind }) {
  const map = {
    noticia: { label: 'NOTÍCIA · DESCOBERTA', icon: <Newspaper size={11} />, rgb: '10,10,10' },
    comercial: { label: 'COMERCIAL · ANÚNCIO', icon: <Megaphone size={11} />, rgb: '22,163,74' },
    carrossel: { label: 'CARROSSEL', icon: <Layers size={11} />, rgb: '124,58,237' },
    campanha: { label: 'CAMPANHA · TRÁFEGO', icon: <Target size={11} />, rgb: '217,119,87' },
    video: { label: 'VÍDEO', icon: <Video size={11} />, rgb: '37,99,235' },
    estatico: { label: 'POST ESTÁTICO', icon: <ImageIcon size={11} />, rgb: '15,118,110' }
  };
  const v = map[kind] || { label: String(kind || '').toUpperCase(), icon: <TagIcon size={11} />, rgb: '100,116,139' };
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      background: `rgba(${v.rgb},0.07)`, color: `rgb(${v.rgb})`,
      border: `1px solid rgba(${v.rgb},0.18)`,
      padding: '4px 9px', borderRadius: '999px',
      fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.07em'
    }}>
      {v.icon} {v.label}
    </div>
  );
}

// Chips das tags livres de um post
function TagChips({ tags, dark }) {
  if (!tags || !tags.length) return null;
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
      {tags.map((t, i) => (
        <span key={i} style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
          color: dark ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.6)',
          border: '1px solid ' + (dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)'),
          borderRadius: '999px', padding: '3px 9px', fontSize: '10.5px', fontWeight: 600
        }}>
          <TagIcon size={9} /> {t}
        </span>
      ))}
    </div>
  );
}

// Renderiza o criativo do post. Só mostra imagem real quando o admin subiu
// um criativo do computador (customSlides). Sem upload → placeholder "criativo a subir".
function PostCreative({ post, brand, customSlides, portrait }) {
  const custom = customSlides && customSlides.length ? customSlides.map(u => ({ image: u })) : null;

  if (custom) {
    if (custom.length > 1) {  // vários uploads = carrossel
      return portrait
        ? <div style={{ width: '100%', maxWidth: '400px' }}><Carousel slides={custom} brand={brand} portrait /></div>
        : <Carousel slides={custom} brand={brand} />;
    }
    return portrait    // 1 upload = capa única
      ? <div style={{ width: '100%', maxWidth: '320px', aspectRatio: '3 / 4', borderRadius: '14px', overflow: 'hidden', background: '#101010' }}>{renderSlide(custom[0], brand, true)}</div>
      : <div style={{ maxWidth: '460px', margin: '0 auto' }}>{renderSlide(custom[0], brand)}</div>;
  }

  // Sem criativo anexado: pré-visualização padrão com headline/subtítulo
  const box = portrait
    ? { width: '100%', maxWidth: '320px', aspectRatio: '3 / 4' }
    : { width: '100%', maxWidth: '460px', margin: '0 auto', aspectRatio: '4 / 5' };
  return (
    <div style={{ ...box, borderRadius: '14px', background: 'linear-gradient(150deg, #1a1a1a, #0a0a0a)', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px', gap: '10px' }}>
      <ImageIcon size={26} color="rgba(255,255,255,0.35)" />
      <div style={{ fontSize: portrait ? '17px' : '20px', fontWeight: 600, letterSpacing: '-0.02em', lineHeight: 1.25 }}>{post.headline || post.theme}</div>
      {post.subtitle && <div style={{ fontSize: '13px', opacity: 0.6, lineHeight: 1.4 }}>{post.subtitle}</div>}
      <div style={{ marginTop: '6px', fontSize: '10.5px', opacity: 0.4, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Criativo a subir</div>
    </div>
  );
}

function PostCard({ post, brand, brandData, review, onReview, customSlides }) {
  const [showCaption, setShowCaption] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showReproveBox, setShowReproveBox] = useState(false);
  const [draft, setDraft] = useState('');
  const status = review?.status || 'pending'; // 'pending' | 'approved' | 'reproved'
  const suggestion = review?.suggestion || '';
  const copy = () => {
    navigator.clipboard.writeText(post.caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{
      background: '#FFFFFF',
      borderRadius: '18px',
      padding: '28px 26px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.05)',
      border: '1px solid rgba(0,0,0,0.06)'
    }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '5px',
            background: 'rgba(0,0,0,0.05)', color: 'rgba(0,0,0,0.6)',
            border: '1px solid rgba(0,0,0,0.08)',
            padding: '4px 10px', borderRadius: '999px',
            fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.03em'
          }}>
            <Calendar size={10} /> {post.date}
          </div>
          <KindBadge kind={post.kind} />
        </div>
        <h3 style={{ fontSize: '17px', fontWeight: 600, margin: '0 0 4px 0', color: '#0a0a0a', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
          {post.theme}
        </h3>
        {post.subtitle && (
          <div style={{ fontSize: '13px', color: 'rgba(0,0,0,0.6)', margin: '0 0 4px 0', lineHeight: 1.4 }}>{post.subtitle}</div>
        )}
        <div style={{ fontSize: '11.5px', color: 'rgba(0,0,0,0.5)' }}>
          {post.format}{post.sourceLabel ? ` · ${post.sourceLabel}` : ''}
        </div>
        <TagChips tags={post.tags} />
      </div>

      <PostCreative post={post} brand={brand} customSlides={customSlides} />

      <div style={{ marginTop: '22px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.5)' }}>
            Legenda
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setShowCaption(!showCaption)}
              style={{
                ...glassLight,
                borderRadius: '999px', padding: '6px 12px',
                fontSize: '11px', fontWeight: 600, cursor: 'pointer', color: 'rgba(0,0,0,0.7)'
              }}
            >
              {showCaption ? 'Esconder' : 'Ver completa'}
            </button>
            <button
              onClick={copy}
              style={{
                ...(copied ? glassTint('16,185,129') : glassLight),
                color: copied ? '#047857' : 'rgba(0,0,0,0.7)',
                borderRadius: '999px', padding: '6px 12px',
                fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px'
              }}
            >
              {copied ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar</>}
            </button>
          </div>
        </div>
        <div style={{
          fontSize: '13px', lineHeight: 1.6, color: 'rgba(0,0,0,0.78)',
          whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontFamily: 'system-ui, sans-serif',
          maxHeight: showCaption ? 'none' : '90px',
          overflow: 'hidden', position: 'relative'
        }}>
          {post.caption}
          {!showCaption && (
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, height: '50px',
              background: 'linear-gradient(transparent, #FFFFFF)'
            }}/>
          )}
        </div>
        {post.sourceUrl && (
          <a
            href={post.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              marginTop: '12px', fontSize: '11px',
              color: '#2563eb', textDecoration: 'none'
            }}
          >
            <Newspaper size={11} /> Ver notícia original →
          </a>
        )}
      </div>

      {/* APROVAR / REPROVAR */}
      <div style={{ marginTop: '18px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '18px' }}>
        {status === 'approved' ? (
          <div style={{
            ...glassTint('22,163,74'),
            display: 'flex', alignItems: 'center', gap: '8px',
            color: '#047857',
            borderRadius: '12px', padding: '12px 14px',
            fontSize: '13px', fontWeight: 600
          }}>
            <Check size={15} /> Conteúdo aprovado
            <button
              onClick={() => onReview({ status: 'pending', suggestion: '' })}
              style={{
                marginLeft: 'auto', background: 'none', border: 'none',
                color: '#047857', fontSize: '11px', cursor: 'pointer',
                textDecoration: 'underline', opacity: 0.7
              }}
            >desfazer</button>
          </div>
        ) : status === 'reproved' ? (
          <div style={{
            ...glassTint('220,38,38'), color: '#b91c1c',
            borderRadius: '12px', padding: '12px 14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
              <X size={15} /> Conteúdo reprovado
              <button
                onClick={() => onReview({ status: 'pending', suggestion: '' })}
                style={{
                  marginLeft: 'auto', background: 'none', border: 'none',
                  color: '#b91c1c', fontSize: '11px', cursor: 'pointer',
                  textDecoration: 'underline', opacity: 0.7
                }}
              >desfazer</button>
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.6)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
              <strong style={{ color: '#b91c1c' }}>Sugestão:</strong> {suggestion}
            </div>
          </div>
        ) : showReproveBox ? (
          <div>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(0,0,0,0.6)', display: 'block', marginBottom: '8px' }}>
              Sugestão de melhoria
            </label>
            <textarea
              value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="Descreva o que precisa melhorar neste conteúdo..."
              rows={3}
              autoFocus
              style={{
                width: '100%', boxSizing: 'border-box',
                border: '1px solid rgba(0,0,0,0.15)', borderRadius: '8px',
                padding: '10px 12px', fontSize: '13px', lineHeight: 1.5,
                fontFamily: 'inherit', resize: 'vertical', outline: 'none'
              }}
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setShowReproveBox(false); setDraft(''); }}
                style={{
                  ...glassLight,
                  borderRadius: '999px', padding: '9px 18px',
                  fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', color: 'rgba(0,0,0,0.7)'
                }}
              >Cancelar</button>
              <button
                onClick={() => { onReview({ status: 'reproved', suggestion: draft.trim() }); setShowReproveBox(false); setDraft(''); }}
                disabled={draft.trim() === ''}
                style={{
                  ...glassTint('220,38,38'),
                  opacity: draft.trim() === '' ? 0.4 : 1,
                  color: '#dc2626',
                  borderRadius: '999px', padding: '9px 18px',
                  fontSize: '12.5px', fontWeight: 600,
                  cursor: draft.trim() === '' ? 'not-allowed' : 'pointer'
                }}
              >Enviar sugestão</button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => onReview({ status: 'approved', suggestion: '' })}
              style={{
                ...glassTint('22,163,74'), color: '#15803d',
                flex: 1, borderRadius: '12px', padding: '12px',
                fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px'
              }}
            >
              <Check size={15} /> Aprovar
            </button>
            <button
              onClick={() => setShowReproveBox(true)}
              style={{
                ...glassTint('220,38,38'), color: '#dc2626',
                flex: 1, borderRadius: '12px', padding: '12px',
                fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px'
              }}
            >
              <X size={15} /> Reprovar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Card horizontal: criativo à esquerda, textos + aprovar/reprovar à direita. Usado no detalhe do dia.
function PostCardWide({ post, brand, brandData, review, onReview, customSlides, posting }) {
  const [showCaption, setShowCaption] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showReproveBox, setShowReproveBox] = useState(false);
  const [draft, setDraft] = useState('');
  const status = review?.status || 'pending';
  const suggestion = review?.suggestion || '';
  const copy = () => {
    navigator.clipboard.writeText(post.caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div style={{
      background: '#FFFFFF', borderRadius: '18px', overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.05)',
      border: '1px solid rgba(0,0,0,0.06)',
      display: 'flex', flexWrap: 'wrap', alignItems: 'stretch'
    }}>
      {/* ESQUERDA: criativo */}
      <div style={{
        flex: '1 1 380px', minWidth: '300px',
        background: '#f3f3f1', borderRight: '1px solid rgba(0,0,0,0.06)',
        padding: '30px 34px', display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <PostCreative post={post} brand={brand} customSlides={customSlides} portrait />
      </div>

      {/* DIREITA: textos + ações */}
      <div style={{ flex: '1 1 360px', minWidth: '300px', padding: '26px', display: 'flex', flexDirection: 'column' }}>
        {/* Cabeçalho */}
        <div style={{ marginBottom: '14px' }}>
          {brandData && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'rgba(0,0,0,0.6)', marginBottom: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: brandData.accent }} /> {brandData.name}
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              background: 'rgba(0,0,0,0.05)', color: 'rgba(0,0,0,0.6)', border: '1px solid rgba(0,0,0,0.08)',
              padding: '4px 10px', borderRadius: '999px', fontSize: '10.5px', fontWeight: 600, letterSpacing: '0.03em'
            }}>
              <Calendar size={10} /> {post.date}
            </div>
            <KindBadge kind={post.kind} />
            {posting && <PostingBadge status={posting} />}
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 600, margin: '0 0 4px 0', color: '#0a0a0a', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
            {post.theme}
          </h3>
          {post.subtitle && (
            <div style={{ fontSize: '13px', color: 'rgba(0,0,0,0.6)', margin: '0 0 4px 0', lineHeight: 1.4 }}>{post.subtitle}</div>
          )}
          <div style={{ fontSize: '11.5px', color: 'rgba(0,0,0,0.5)' }}>
            {post.format}{post.sourceLabel ? ` · ${post.sourceLabel}` : ''}
          </div>
          <TagChips tags={post.tags} />
        </div>

        {/* Legenda */}
        <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.5)' }}>
              Legenda
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => setShowCaption(!showCaption)} style={{ ...glassLight, borderRadius: '999px', padding: '6px 12px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', color: 'rgba(0,0,0,0.7)' }}>
                {showCaption ? 'Esconder' : 'Ver completa'}
              </button>
              <button onClick={copy} style={{
                ...(copied ? glassTint('16,185,129') : glassLight),
                color: copied ? '#047857' : 'rgba(0,0,0,0.7)',
                borderRadius: '999px', padding: '6px 12px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px'
              }}>
                {copied ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar</>}
              </button>
            </div>
          </div>
          <div style={{
            fontSize: '13px', lineHeight: 1.6, color: 'rgba(0,0,0,0.78)',
            whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', fontFamily: 'system-ui, sans-serif',
            maxHeight: showCaption ? '320px' : '100px', overflowY: showCaption ? 'auto' : 'hidden', position: 'relative'
          }}>
            {post.caption}
            {!showCaption && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '50px', background: 'linear-gradient(transparent, #FFFFFF)' }} />
            )}
          </div>
          {post.sourceUrl && (
            <a href={post.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '12px', fontSize: '11px', color: '#2563eb', textDecoration: 'none' }}>
              <Newspaper size={11} /> Ver notícia original →
            </a>
          )}
        </div>

        {/* APROVAR / REPROVAR — abaixo dos textos */}
        <div style={{ marginTop: 'auto', paddingTop: '18px' }}>
          {status === 'approved' ? (
            <div style={{ ...glassTint('22,163,74'), display: 'flex', alignItems: 'center', gap: '8px', color: '#047857', borderRadius: '12px', padding: '12px 14px', fontSize: '13px', fontWeight: 600 }}>
              <Check size={15} /> Conteúdo aprovado
              <button onClick={() => onReview({ status: 'pending', suggestion: '' })} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#047857', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline', opacity: 0.7 }}>desfazer</button>
            </div>
          ) : status === 'reproved' ? (
            <div style={{ ...glassTint('220,38,38'), color: '#b91c1c', borderRadius: '12px', padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                <X size={15} /> Conteúdo reprovado
                <button onClick={() => onReview({ status: 'pending', suggestion: '' })} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#b91c1c', fontSize: '11px', cursor: 'pointer', textDecoration: 'underline', opacity: 0.7 }}>desfazer</button>
              </div>
              <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.6)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                <strong style={{ color: '#b91c1c' }}>Sugestão:</strong> {suggestion}
              </div>
            </div>
          ) : showReproveBox ? (
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(0,0,0,0.6)', display: 'block', marginBottom: '8px' }}>Sugestão de melhoria</label>
              <textarea
                value={draft} onChange={e => setDraft(e.target.value)}
                placeholder="Descreva o que precisa melhorar neste conteúdo..." rows={3} autoFocus
                style={{ width: '100%', boxSizing: 'border-box', border: '1px solid rgba(0,0,0,0.15)', borderRadius: '8px', padding: '10px 12px', fontSize: '13px', lineHeight: 1.5, fontFamily: 'inherit', resize: 'vertical', outline: 'none' }}
              />
              <div style={{ display: 'flex', gap: '8px', marginTop: '10px', justifyContent: 'flex-end' }}>
                <button onClick={() => { setShowReproveBox(false); setDraft(''); }} style={{ ...glassLight, borderRadius: '999px', padding: '9px 18px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', color: 'rgba(0,0,0,0.7)' }}>Cancelar</button>
                <button onClick={() => { onReview({ status: 'reproved', suggestion: draft.trim() }); setShowReproveBox(false); setDraft(''); }} disabled={draft.trim() === ''} style={{ ...glassTint('220,38,38'), opacity: draft.trim() === '' ? 0.4 : 1, color: '#dc2626', borderRadius: '999px', padding: '9px 18px', fontSize: '12.5px', fontWeight: 600, cursor: draft.trim() === '' ? 'not-allowed' : 'pointer' }}>Enviar sugestão</button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => onReview({ status: 'approved', suggestion: '' })} style={{ ...glassTint('22,163,74'), color: '#15803d', flex: 1, borderRadius: '12px', padding: '12px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
                <Check size={15} /> Aprovar
              </button>
              <button onClick={() => setShowReproveBox(true)} style={{ ...glassTint('220,38,38'), color: '#dc2626', flex: 1, borderRadius: '12px', padding: '12px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
                <X size={15} /> Reprovar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// CALENDÁRIO EDITORIAL — junho/2026 (combinado, todas as marcas)
// ============================================================

const WEEKDAYS = ['dom.', 'seg.', 'ter.', 'qua.', 'qui.', 'sex.', 'sáb.'];
const STATUS_COLOR = { approved: '#16a34a', reproved: '#dc2626', pending: '#9ca3af' };
const KIND_LABEL = { noticia: 'Notícia', comercial: 'Comercial', carrossel: 'Carrossel', campanha: 'Campanha', video: 'Vídeo', estatico: 'Estático' };
// Tipos disponíveis ao criar um post no admin
const POST_TYPES = [
  { key: 'estatico', label: 'Estático', icon: <ImageIcon size={15} /> },
  { key: 'carrossel', label: 'Carrossel', icon: <Layers size={15} /> },
  { key: 'video', label: 'Vídeo', icon: <Video size={15} /> }
];
// Tags sugeridas (o admin também pode digitar as próprias)
const TAG_SUGGESTIONS = ['Reels', 'Feed', 'Stories', 'Urgente', 'Institucional', 'Promoção', 'Campanha'];

// Converte um post customizado (do Supabase) para o formato usado pelos cards
function customToPost(p) {
  return {
    day: p.day || 'Avulso',
    date: 'Criado no admin',
    kind: p.kind || 'estatico',
    theme: p.headline || '(sem título)',
    headline: p.headline || '',
    subtitle: p.subtitle || '',
    format: KIND_LABEL[p.kind] || 'Post',
    caption: p.caption || '',
    tags: Array.isArray(p.tags) ? p.tags : [],
    custom: true
  };
}

// Aplica a edição do admin (override) sobre um post fixo
function applyOverride(post, ov) {
  return {
    ...post,
    theme: ov.headline || post.theme,
    headline: ov.headline || post.theme,
    subtitle: ov.subtitle ?? post.subtitle ?? '',
    caption: ov.caption ?? post.caption,
    kind: ov.kind || post.kind,
    tags: Array.isArray(ov.tags) ? ov.tags : (post.tags || [])
  };
}

// Posts de uma marca: fixos (do código, com edições aplicadas) + criados no admin
function postsOf(brandKey, customList = []) {
  const overrides = {};
  const customs = [];
  customList.forEach(p => {
    if (p.brand !== brandKey) return;
    if (String(p.id).startsWith('custom-')) customs.push(p);
    else overrides[p.id] = p; // edição de um post fixo
  });
  const builtin = (clients[brandKey]?.posts || []).map((post, i) => {
    const id = `${brandKey}-${i}`;
    const ov = overrides[id];
    return { id, post: ov ? applyOverride(post, ov) : post, custom: false, edited: !!ov };
  });
  const custom = customs.map(p => ({ id: p.id, post: customToPost(p), custom: true, edited: false }));
  return [...builtin, ...custom];
}

function iso(y, m, d) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

// Calendário de junho/2026 — quadrados de mesmo tamanho, tags clipadas dentro do dia.
// Mostra apenas o que está agendado em `schedule`. onDayClick(iso) ao clicar num dia.
function MonthCalendar({ schedule, reviews, calBrand, setCalBrand, onDayClick, customPosts = [] }) {
  const activeBrands = Object.entries(clients).filter(([, c]) => !c.comingSoon);

  // Agrupa por data (respeitando o filtro de marca) — inclui posts criados no admin
  const byDate = {};
  activeBrands.forEach(([brandKey, c]) => {
    if (calBrand !== 'all' && calBrand !== brandKey) return;
    postsOf(brandKey, customPosts).forEach(({ id, post }) => {
      const date = schedule[id];
      if (!date) return;
      (byDate[date] ||= []).push({ id, c, post, status: reviews[id]?.status || 'pending' });
    });
  });

  // Mês exibido (navegável). Começa no mês atual.
  const now = new Date();
  const [ym, setYm] = useState({ y: now.getFullYear(), m: now.getMonth() }); // m: 0-11
  const prevMonth = () => setYm(v => { const d = new Date(v.y, v.m - 1, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  const nextMonth = () => setYm(v => { const d = new Date(v.y, v.m + 1, 1); return { y: d.getFullYear(), m: d.getMonth() }; });
  const monthTitle = `${MONTHS[ym.m].charAt(0).toUpperCase() + MONTHS[ym.m].slice(1)} de ${ym.y}`;

  // 6 semanas × 7 dias do mês exibido, começando no domingo da 1ª semana
  const startOffset = new Date(ym.y, ym.m, 1).getDay();
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(ym.y, ym.m, 1 - startOffset + i);
    cells.push({ iso: iso(d.getFullYear(), d.getMonth(), d.getDate()), day: d.getDate(), inMonth: d.getMonth() === ym.m, dow: d.getDay() });
  }
  const todayIso = iso(now.getFullYear(), now.getMonth(), now.getDate());
  const navBtn = { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.1)', background: '#fff', color: '#0a0a0a', cursor: 'pointer' };

  const Tag = ({ item }) => (
    <div title={item.post.theme} style={{
      display: 'flex', alignItems: 'center', gap: '4px',
      background: `${item.c.accent}14`, border: `1px solid ${item.c.accent}33`,
      borderRadius: '5px', padding: '2px 5px', marginBottom: '3px',
      maxWidth: '100%', overflow: 'hidden'
    }}>
      <span style={{ flexShrink: 0, width: '6px', height: '6px', borderRadius: '50%', background: item.c.accent }} />
      <span style={{ flex: 1, minWidth: 0, fontSize: '9.5px', fontWeight: 600, color: '#0a0a0a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {KIND_LABEL[item.post.kind] || item.post.kind} · {item.c.name}
      </span>
      <span style={{ flexShrink: 0, width: '6px', height: '6px', borderRadius: '50%', background: STATUS_COLOR[item.status] }} />
    </div>
  );

  return (
    <div>
      {/* Navegação de mês + legenda de status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={prevMonth} aria-label="Mês anterior" style={navBtn}><ChevronLeft size={16} /></button>
          <span style={{ fontSize: '15px', fontWeight: 700, minWidth: '150px', textAlign: 'center', textTransform: 'capitalize' }}>{monthTitle}</span>
          <button onClick={nextMonth} aria-label="Próximo mês" style={navBtn}><ChevronRight size={16} /></button>
        </div>
        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'rgba(0,0,0,0.55)', fontWeight: 600 }}>
          {[['approved', 'Aprovado'], ['reproved', 'Reprovado'], ['pending', 'Pendente']].map(([k, label]) => (
            <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: STATUS_COLOR[k] }} /> {label}
            </span>
          ))}
        </div>
      </div>

      {/* Grade do mês */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: '720px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px' }}>
            {WEEKDAYS.map(w => (
              <div key={w} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 600, color: 'rgba(0,0,0,0.45)', textTransform: 'capitalize' }}>{w}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gridAutoRows: '110px', gap: '8px' }}>
            {cells.map(cell => {
              const items = byDate[cell.iso] || [];
              const isToday = cell.iso === todayIso;
              const visible = items.slice(0, 2);
              const extra = items.length - visible.length;
              return (
                <div
                  key={cell.iso}
                  onClick={() => cell.inMonth && onDayClick(cell.iso)}
                  style={{
                    height: '110px', boxSizing: 'border-box', borderRadius: '12px', padding: '7px',
                    background: cell.inMonth ? '#ffffff' : '#f2f2f0',
                    border: isToday ? '2px solid #dc2626' : '1px solid rgba(0,0,0,0.07)',
                    opacity: cell.inMonth ? 1 : 0.45,
                    cursor: cell.inMonth ? 'pointer' : 'default',
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    transition: 'box-shadow 0.15s ease'
                  }}
                  onMouseEnter={e => { if (cell.inMonth) e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.10)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '4px', flexShrink: 0 }}>
                    <span style={{
                      fontSize: '12.5px', fontWeight: 700,
                      color: isToday ? '#dc2626' : (cell.inMonth ? '#0a0a0a' : 'rgba(0,0,0,0.4)')
                    }}>{cell.day}</span>
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    {visible.map(it => <Tag key={it.id} item={it} />)}
                    {extra > 0 && (
                      <div style={{ fontSize: '9.5px', fontWeight: 700, color: 'rgba(0,0,0,0.5)', paddingLeft: '3px' }}>+{extra} mais</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
// 'YYYY-MM' -> "Junho" (com ano só se for diferente do atual)
function monthLabel(ym) {
  const [y, m] = ym.split('-').map(Number);
  const name = MONTHS[m - 1];
  const label = name.charAt(0).toUpperCase() + name.slice(1);
  return y === new Date().getFullYear() ? label : `${label} ${y}`;
}
const WEEKDAYS_LONG = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
function dayLabel(isoStr) {
  if (isoStr === 'unscheduled') return 'Não agendados';
  const [y, m, d] = isoStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return `${WEEKDAYS_LONG[dt.getDay()]}, ${d} de ${MONTHS[m - 1]}`;
}

// Painel de detalhe de um dia: lista os conteúdos agendados nele e reutiliza PostCard (ver + aprovar)
function DayDetail({ day, schedule, reviews, setReview, onClose, creatives = {}, customPosts = [], getPosting }) {
  const items = [];
  Object.entries(clients).filter(([, c]) => !c.comingSoon).forEach(([brandKey, c]) => {
    postsOf(brandKey, customPosts).forEach(({ id, post }) => {
      if (schedule[id] === day) items.push({ id, brandKey, c, post });
    });
  });

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
        display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
        padding: '24px', overflowY: 'auto'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#f5f5f3', borderRadius: '20px', width: '100%', maxWidth: '980px',
          margin: 'auto', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
      >
        {/* Cabeçalho do dia */}
        <div style={{ background: '#0a0a0a', color: '#fafafa', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.55, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '3px' }}>
              Conteúdos do dia
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0, letterSpacing: '-0.02em', textTransform: 'capitalize' }}>
              {dayLabel(day)}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: '#fafafa', borderRadius: '999px', width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'rgba(0,0,0,0.5)', fontSize: '14px', padding: '24px' }}>
              Nenhum conteúdo neste dia.
            </div>
          ) : items.map(({ id, brandKey, c, post }) => (
            <PostCardWide
              key={id}
              post={post}
              brand={brandKey}
              brandData={c}
              review={reviews[id]}
              onReview={data => setReview(id, data)}
              customSlides={creatives[id]}
              posting={getPosting ? getPosting(id) : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ddmm(isoStr) {
  const [, m, d] = isoStr.split('-').map(Number);
  return `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}`;
}

// Modal do admin: clicar num dia abre a lista de conteúdos disponíveis para colocar/tirar do dia
function DayAssign({ day, schedule, reviews, setSchedulePost, onClose, customPosts = [] }) {
  const activeBrands = Object.entries(clients).filter(([, c]) => !c.comingSoon);
  const countHere = Object.entries(schedule).filter(([, d]) => d === day).length;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)',
        display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '24px', overflowY: 'auto'
      }}
    >
      <div onClick={e => e.stopPropagation()} style={{ background: '#f5f5f3', borderRadius: '20px', width: '100%', maxWidth: '560px', margin: 'auto', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ background: '#0a0a0a', color: '#fafafa', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', opacity: 0.55, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '3px' }}>
              Montar dia · {countHere} selecionado{countHere === 1 ? '' : 's'}
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, margin: 0, letterSpacing: '-0.02em', textTransform: 'capitalize' }}>{dayLabel(day)}</h2>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: '#fafafa', borderRadius: '999px', width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '20px' }}>
          <p style={{ fontSize: '12.5px', color: 'rgba(0,0,0,0.55)', margin: '0 0 16px 0', lineHeight: 1.5 }}>
            Selecione os conteúdos que devem aparecer neste dia. Você pode escolher mais de um.
          </p>
          {activeBrands.map(([brandKey, c]) => (
            <div key={brandKey} style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: c.accent }} />
                <span style={{ fontSize: '13px', fontWeight: 700 }}>{c.name}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {postsOf(brandKey, customPosts).map(({ id, post }) => {
                  const assignedDate = schedule[id];
                  const here = assignedDate === day;
                  const elsewhere = assignedDate && !here;
                  const status = reviews[id]?.status || 'pending';
                  return (
                    <label key={id} style={{
                      display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer',
                      background: here ? `${c.accent}12` : '#fff',
                      border: '1px solid ' + (here ? `${c.accent}55` : 'rgba(0,0,0,0.08)'),
                      borderRadius: '10px', padding: '10px 12px'
                    }}>
                      <input
                        type="checkbox"
                        checked={here}
                        onChange={e => setSchedulePost(id, e.target.checked ? day : null)}
                        style={{ width: '17px', height: '17px', accentColor: c.accent, flexShrink: 0, cursor: 'pointer' }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '10.5px', color: 'rgba(0,0,0,0.45)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '2px' }}>
                          {post.day} · {KIND_LABEL[post.kind] || post.kind}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#0a0a0a', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {post.theme}
                        </div>
                      </div>
                      <span style={{ flexShrink: 0, width: '8px', height: '8px', borderRadius: '50%', background: STATUS_COLOR[status] }} title="status" />
                      {elsewhere && (
                        <span style={{ flexShrink: 0, fontSize: '10px', fontWeight: 700, color: '#b45309', background: '#fef3c7', borderRadius: '999px', padding: '2px 8px' }}>
                          em {ddmm(assignedDate)}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Área de upload de criativos do admin: arrasta/solta ou escolhe da pasta.
// "Subir criativo" troca por uma capa única; "Subir carrossel" acrescenta vários.
function CreativeUploader({ id, urls = [], uploading, onUpload, onRemove }) {
  const [dragOver, setDragOver] = useState(false);

  const btnBase = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    borderRadius: '999px', padding: '7px 14px', fontSize: '12px', fontWeight: 600,
    cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.5 : 1
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (uploading) return;
    if (e.dataTransfer.files?.length) onUpload(id, e.dataTransfer.files, { append: true });
  };

  return (
    <div style={{ marginTop: '14px', borderTop: '1px dashed rgba(0,0,0,0.12)', paddingTop: '14px' }}>
      <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.45)', marginBottom: '10px' }}>
        Criativos{urls.length ? ` · ${urls.length}` : ''}
      </div>

      {urls.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          {urls.map((u, i) => (
            <div key={u + i} style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.1)', background: '#101010' }}>
              <img src={u} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <button
                onClick={() => onRemove(id, i)}
                title="Remover criativo"
                style={{ position: 'absolute', top: '2px', right: '2px', width: '18px', height: '18px', borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.7)', color: '#fff', cursor: 'pointer', fontSize: '12px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >×</button>
            </div>
          ))}
        </div>
      )}

      <div
        onDragOver={e => { e.preventDefault(); if (!uploading) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        style={{
          border: `1.5px dashed ${dragOver ? '#0a0a0a' : 'rgba(0,0,0,0.18)'}`,
          background: dragOver ? 'rgba(0,0,0,0.04)' : 'transparent',
          borderRadius: '10px', padding: '14px', textAlign: 'center', transition: 'all 0.15s ease'
        }}
      >
        <div style={{ fontSize: '11.5px', color: 'rgba(0,0,0,0.5)', marginBottom: '12px' }}>
          {uploading ? 'Subindo criativos…' : 'Arraste imagens aqui ou escolha da pasta'}
        </div>
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <label style={{ ...btnBase, background: '#0a0a0a', color: '#fff' }}>
            <input
              type="file" accept="image/*" style={{ display: 'none' }} disabled={uploading}
              onChange={e => { if (e.target.files?.length) onUpload(id, e.target.files, { append: false }); e.target.value = ''; }}
            />
            Subir criativo
          </label>
          <label style={{ ...btnBase, background: 'rgba(0,0,0,0.05)', color: 'rgba(0,0,0,0.75)', border: '1px solid rgba(0,0,0,0.12)' }}>
            <input
              type="file" accept="image/*" multiple style={{ display: 'none' }} disabled={uploading}
              onChange={e => { if (e.target.files?.length) onUpload(id, e.target.files, { append: true }); e.target.value = ''; }}
            />
            <Layers size={13} /> Subir carrossel
          </label>
        </div>
      </div>
    </div>
  );
}

// Tela de senha do Painel Admin. Aparece sempre que o usuário tenta abrir o admin.
function AdminGate({ expected, onSuccess, onCancel }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);

  const submit = (e) => {
    e.preventDefault();
    if (pw === expected) {
      onSuccess();
    } else {
      setError(true);
      setPw('');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Geist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
      <form onSubmit={submit} style={{ width: '100%', maxWidth: '360px', textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(255,255,255,0.08)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
          <Lock size={22} color="#fafafa" />
        </div>
        <h1 style={{ color: '#fafafa', fontSize: '22px', fontWeight: 600, margin: '0 0 6px', letterSpacing: '-0.02em' }}>Painel Admin</h1>
        <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', margin: '0 0 24px' }}>Digite a senha para acessar.</p>
        <input
          type="password"
          value={pw}
          autoFocus
          onChange={e => { setPw(e.target.value); setError(false); }}
          placeholder="Senha"
          style={{ width: '100%', boxSizing: 'border-box', padding: '13px 16px', borderRadius: '12px', border: error ? '1px solid #f87171' : '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#fafafa', fontSize: '15px', outline: 'none', marginBottom: '12px' }}
        />
        {error && <div style={{ color: '#f87171', fontSize: '12.5px', marginBottom: '12px' }}>Senha incorreta.</div>}
        <button type="submit" style={{ width: '100%', padding: '13px', borderRadius: '12px', border: 'none', background: '#fafafa', color: '#0a0a0a', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginBottom: '10px' }}>Entrar</button>
        <button type="button" onClick={onCancel} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '13px', cursor: 'pointer' }}>Cancelar</button>
      </form>
    </div>
  );
}

// Avatares geométricos (estilo "boring avatars"): 4 da referência + 1 criado para o 5º perfil
const AVATAR_DESIGNS = [
  { base: '#ff005b', blob: '#ffb238', transform: 'translate(9 -5) rotate(219 18 18) scale(1)',   rx: 6,  face: 'translate(4.5 -4) rotate(9 18 18)',  mouth: 'M15 19c2 1 4 1 6 0',       open: false, eyes: [10, 24], color: '#000000' },
  { base: '#ff7d10', blob: '#0a0310', transform: 'translate(5 -1) rotate(55 18 18) scale(1.1)',  rx: 6,  face: 'translate(7 -6) rotate(-5 18 18)',  mouth: 'M15 20c2 1 4 1 6 0',       open: false, eyes: [14, 20], color: '#FFFFFF' },
  { base: '#0a0310', blob: '#1e3a8a', transform: 'translate(-3 7) rotate(227 18 18) scale(1.2)', rx: 36, face: 'translate(-3 3.5) rotate(7 18 18)', mouth: 'M13,21 a1,0.75 0 0,0 10,0', open: true,  eyes: [12, 22], color: '#FFFFFF' },
  { base: '#d8fcb3', blob: '#89fcb3', transform: 'translate(9 -5) rotate(219 18 18) scale(1)',   rx: 6,  face: 'translate(4.5 -4) rotate(9 18 18)',  mouth: 'M15 19c2 1 4 1 6 0',       open: false, eyes: [10, 24], color: '#000000' },
  { base: '#6d28d9', blob: '#22d3ee', transform: 'translate(-4 6) rotate(135 18 18) scale(1.15)', rx: 36, face: 'translate(2 -3) rotate(-7 18 18)', mouth: 'M15 19c2 1 4 1 6 0',        open: false, eyes: [11, 23], color: '#FFFFFF' }
];

// Perfis de revisão (sem login), cada um com um avatar geométrico e uma cor representativa
const PROFILES = [
  { key: 'alex', name: 'ALEX', avatar: 0, tint: '#ff005b' },
  { key: 'marcos', name: 'MARCOS', avatar: 1, tint: '#ff7d10' },
  { key: 'miguel', name: 'MIGUEL', avatar: 2, tint: '#1e3a8a' },
  { key: 'silvio', name: 'SILVIO', avatar: 3, tint: '#89fcb3' },
  { key: 'thiago', name: 'THIAGO', avatar: 4, tint: '#22d3ee' }
];
const profileByName = (name) => PROFILES.find(p => p.name === name) || null;

// Renderiza um avatar geométrico. useId garante máscara única por instância (mesmo design usado 2x).
function BoringAvatar({ index = 0, size = 40 }) {
  const raw = useId();
  const maskId = 'bav' + raw.replace(/[^a-zA-Z0-9]/g, '');
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

// Efeito "gooey": alterna entre os textos com morph borrado + filtro de limiar
const TITLE_PARTS = ['Painel de', 'Conteúdos'];
function GooeyText({ texts, morphTime = 1, cooldownTime = 1.2, fontSize = 'clamp(48px, 9vw, 104px)', color = '#0a0a0a', height = 'clamp(64px, 13vw, 130px)' }) {
  const text1Ref = useRef(null);
  const text2Ref = useRef(null);

  useEffect(() => {
    let frame;
    let textIndex = texts.length - 1;
    let time = new Date();
    let morph = 0;
    let cooldown = cooldownTime;

    if (text1Ref.current && text2Ref.current) {
      text1Ref.current.textContent = texts[textIndex % texts.length];
      text2Ref.current.textContent = texts[(textIndex + 1) % texts.length];
    }

    const setMorph = (fraction) => {
      if (!text1Ref.current || !text2Ref.current) return;
      text2Ref.current.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      text2Ref.current.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
      fraction = 1 - fraction;
      text1Ref.current.style.filter = `blur(${Math.min(8 / fraction - 8, 100)}px)`;
      text1Ref.current.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;
    };

    const doCooldown = () => {
      morph = 0;
      if (!text1Ref.current || !text2Ref.current) return;
      text2Ref.current.style.filter = '';
      text2Ref.current.style.opacity = '100%';
      text1Ref.current.style.filter = '';
      text1Ref.current.style.opacity = '0%';
    };

    const doMorph = () => {
      morph -= cooldown;
      cooldown = 0;
      let fraction = morph / morphTime;
      if (fraction > 1) { cooldown = cooldownTime; fraction = 1; }
      setMorph(fraction);
    };

    function animate() {
      frame = requestAnimationFrame(animate);
      const newTime = new Date();
      const shouldIncrementIndex = cooldown > 0;
      const dt = (newTime.getTime() - time.getTime()) / 1000;
      time = newTime;
      cooldown -= dt;
      if (cooldown <= 0) {
        if (shouldIncrementIndex) {
          textIndex = (textIndex + 1) % texts.length;
          if (text1Ref.current && text2Ref.current) {
            text1Ref.current.textContent = texts[textIndex % texts.length];
            text2Ref.current.textContent = texts[(textIndex + 1) % texts.length];
          }
        }
        doMorph();
      } else {
        doCooldown();
      }
    }

    animate();
    return () => cancelAnimationFrame(frame);
  }, [texts, morphTime, cooldownTime]);

  const spanStyle = {
    position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)',
    width: '100%', userSelect: 'none', textAlign: 'center', whiteSpace: 'nowrap',
    fontWeight: 600, letterSpacing: '-0.04em', lineHeight: 1.02, fontFamily: 'inherit', color, fontSize
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <svg style={{ position: 'absolute', height: 0, width: 0 }} aria-hidden="true" focusable="false">
        <defs>
          <filter id="threshold">
            <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140" />
          </filter>
        </defs>
      </svg>
      <div style={{ position: 'relative', height, filter: 'url(#threshold)' }}>
        <span ref={text1Ref} style={spanStyle} />
        <span ref={text2Ref} style={spanStyle} />
      </div>
    </div>
  );
}

// Tela de seleção de perfil (estilo da referência: avatar grande com rotação ao escolher)
function IdentifyScreen({ onChoose, onAdmin, onBack }) {
  const [selected, setSelected] = useState(0);
  const [rotation, setRotation] = useState(0);
  const pick = (i) => { setRotation(r => r + 1080); setSelected(i); };
  const profile = PROFILES[selected];
  const design = AVATAR_DESIGNS[profile.avatar];
  // Faixa do topo: degradê das 2 cores do avatar selecionado, repetido para o wave fluir em loop
  const band = `linear-gradient(90deg, ${design.base}, ${design.blob}, ${design.base})`;

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f3', fontFamily: 'Geist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <style>{`@keyframes avUp{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:none}}@keyframes avBand{from{opacity:0;height:0}to{opacity:1;height:128px}}@keyframes avWave{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}`}</style>
      <div style={{ width: '100%', maxWidth: '430px', background: 'linear-gradient(180deg,#ffffff,#f7f7f5)', border: '1px solid rgba(0,0,0,0.07)', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
        <div style={{ height: '128px', backgroundImage: band, backgroundSize: '200% 100%', backgroundRepeat: 'no-repeat', animation: 'avBand 0.6s cubic-bezier(0.4,0,0.2,1) both, avWave 6s ease-in-out infinite' }} />

        <div style={{ padding: '0 32px 34px', marginTop: '-64px', textAlign: 'center' }}>
          {/* Avatar principal */}
          <div style={{ width: '152px', height: '152px', margin: '0 auto', borderRadius: '50%', border: '4px solid #ffffff', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', boxShadow: '0 0 0 1px rgba(0,0,0,0.06), 0 10px 28px rgba(0,0,0,0.12)', animation: 'avUp 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `rotate(${rotation}deg)`, transition: 'transform 0.8s cubic-bezier(0.4,0,0.2,1)' }}>
              <BoringAvatar index={profile.avatar} size={104} />
            </div>
          </div>

          <p style={{ color: 'rgba(0,0,0,0.5)', fontSize: '14px', margin: '20px 0 0', fontWeight: 500 }}>Selecione seu perfil</p>

          {/* Picker */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', marginTop: '26px' }}>
            {PROFILES.map((p, i) => {
              const on = selected === i;
              return (
                <div key={p.key} title={p.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', animation: `avUp 0.5s cubic-bezier(0.34,1.56,0.64,1) ${0.15 + i * 0.08}s both` }}>
                  <button
                    onClick={() => pick(i)}
                    aria-label={p.name}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                    style={{ position: 'relative', width: '52px', height: '52px', borderRadius: '50%', overflow: 'hidden', cursor: 'pointer', padding: 0, background: '#ffffff', border: '2px solid ' + (on ? '#0a0a0a' : 'rgba(0,0,0,0.12)'), boxShadow: on ? '0 0 0 2px #ffffff, 0 0 0 4px #0a0a0a' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease' }}
                  >
                    <BoringAvatar index={p.avatar} size={48} />
                  </button>
                  <span style={{ fontSize: '10.5px', fontWeight: on ? 700 : 600, letterSpacing: '0.03em', color: on ? '#0a0a0a' : 'rgba(0,0,0,0.45)', transition: 'color 0.2s ease' }}>{p.name}</span>
                </div>
              );
            })}
          </div>

          {/* Ações */}
          <button
            onClick={() => onChoose(profile.name)}
            style={{ width: '100%', marginTop: '28px', padding: '14px', borderRadius: '14px', border: 'none', background: '#0a0a0a', color: '#ffffff', fontSize: '14.5px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            Entrar como {profile.name} <ArrowRight size={16} />
          </button>
          <button onClick={onAdmin} style={{ width: '100%', marginTop: '12px', background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)', color: 'rgba(0,0,0,0.7)', borderRadius: '14px', padding: '12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Lock size={14} /> Acessar painel admin
          </button>
          <button onClick={onBack} style={{ marginTop: '14px', background: 'none', border: 'none', color: 'rgba(0,0,0,0.4)', fontSize: '12.5px', cursor: 'pointer' }}>Voltar</button>
        </div>
      </div>
    </div>
  );
}

// Selo de status (pendente / aprovado / reprovado)
function StatusBadge({ status }) {
  const map = {
    approved: { label: 'Aprovado', bg: '#dcfce7', color: '#166534' },
    reproved: { label: 'Reprovado', bg: '#fee2e2', color: '#b91c1c' },
    pending: { label: 'Pendente', bg: '#f1f5f9', color: '#64748b' }
  };
  const v = map[status] || map.pending;
  return (
    <span style={{ background: v.bg, color: v.color, padding: '3px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>
      {v.label}
    </span>
  );
}

// Selo do status de postagem (em produção / agendado / postado)
function PostingBadge({ status, small }) {
  const map = {
    producao: { label: 'Em produção', bg: '#f1f5f9', color: '#475569' },
    agendado: { label: 'Agendado', bg: '#fef3c7', color: '#b45309' },
    postado: { label: 'Postado', bg: '#dbeafe', color: '#1e40af' }
  };
  const v = map[status] || map.producao;
  return <span style={{ background: v.bg, color: v.color, padding: small ? '2px 8px' : '3px 10px', borderRadius: '999px', fontSize: small ? '10px' : '11px', fontWeight: 700, whiteSpace: 'nowrap' }}>{v.label}</span>;
}

// Barra de progresso de aprovação: verde = aprovado, vermelho = reprovado, resto = pendente
function ProgressBar({ approved, reproved, total, height = 10 }) {
  const pct = (n) => (total ? (n / total) * 100 : 0);
  return (
    <div style={{ display: 'flex', height: `${height}px`, borderRadius: '999px', overflow: 'hidden', background: 'rgba(0,0,0,0.07)' }}>
      <div style={{ width: `${pct(approved)}%`, background: STATUS_COLOR.approved, transition: 'width 0.45s ease' }} />
      <div style={{ width: `${pct(reproved)}%`, background: STATUS_COLOR.reproved, transition: 'width 0.45s ease' }} />
    </div>
  );
}

// Aviso flutuante (substitui window.alert) — some sozinho
function Toast({ message, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [message]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!message) return null;
  return (
    <div style={{ position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)', background: '#0a0a0a', color: '#fafafa', padding: '13px 22px', borderRadius: '12px', fontSize: '13px', fontWeight: 500, boxShadow: '0 12px 36px rgba(0,0,0,0.32)', zIndex: 1000, maxWidth: '90vw', textAlign: 'center' }}>
      {message}
    </div>
  );
}

// Diálogo de confirmação no estilo do painel (substitui window.confirm)
function ConfirmDialog({ message, confirmLabel = 'Confirmar', onConfirm, onClose }) {
  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', zIndex: 1001, fontFamily: 'Geist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '18px', maxWidth: '380px', width: '100%', padding: '26px', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#fef2f2', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
          <AlertTriangle size={20} color="#dc2626" />
        </div>
        <p style={{ fontSize: '14.5px', color: '#0a0a0a', lineHeight: 1.5, margin: '0 0 22px' }}>{message}</p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)', color: 'rgba(0,0,0,0.7)', borderRadius: '10px', padding: '10px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
          <button onClick={() => { onConfirm(); onClose(); }} style={{ background: '#dc2626', border: 'none', color: '#fff', borderRadius: '10px', padding: '10px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}

// Um conteúdo na lista do admin: miniatura, status, aprovar/reprovar inline, agenda e upload de criativos
function AdminItem({ it, scheduledDate, urls = [], uploading, posting = 'producao', onReview, onUpload, onRemove, onEdit, onDelete, onRestore, onSetProd }) {
  const [showReprove, setShowReprove] = useState(false);
  const [draft, setDraft] = useState('');
  const hasUpload = urls.length > 0;
  const thumb = hasUpload ? urls[0] : null;            // miniatura só com criativo anexado pelo usuário
  const count = hasUpload ? urls.length : 0;

  const approve = () => onReview(it.id, { status: 'approved', suggestion: '' });
  const undo = () => { onReview(it.id, { status: 'pending', suggestion: '' }); setShowReprove(false); setDraft(''); };
  const sendReprove = () => { onReview(it.id, { status: 'reproved', suggestion: draft.trim() }); setShowReprove(false); setDraft(''); };

  const actionBtn = (bg, color, border) => ({
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    background: bg, color, border: border || 'none',
    borderRadius: '999px', padding: '7px 13px', fontSize: '12px', fontWeight: 600, cursor: 'pointer'
  });

  return (
    <div
      style={{ background: '#fff', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)', borderLeft: `3px solid ${STATUS_COLOR[it.status]}`, boxShadow: '0 1px 2px rgba(0,0,0,0.04)', padding: '16px 18px', transition: 'box-shadow 0.18s ease' }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 6px 22px rgba(0,0,0,0.08)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)'; }}
    >
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
        {!it.comingSoon && (
          <div style={{ position: 'relative', flexShrink: 0, width: '58px', height: '58px', borderRadius: '10px', overflow: 'hidden', background: thumb ? '#101010' : 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {thumb ? <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Layers size={18} color="rgba(0,0,0,0.25)" />}
            {count > 1 && (
              <span style={{ position: 'absolute', bottom: '2px', right: '2px', background: 'rgba(0,0,0,0.7)', color: '#fff', fontSize: '9.5px', fontWeight: 700, borderRadius: '5px', padding: '1px 5px' }}>+{count - 1}</span>
            )}
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '10.5px', color: 'rgba(0,0,0,0.45)', fontWeight: 600, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
                <span>{it.day} · {KIND_LABEL[it.kind] || it.kind}</span>
                {it.custom && <span style={{ background: 'rgba(37,99,235,0.1)', color: '#2563eb', borderRadius: '999px', padding: '1px 8px', fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.04em' }}>CRIADO</span>}
                {!it.custom && it.edited && <span style={{ background: 'rgba(217,119,87,0.12)', color: '#b45309', borderRadius: '999px', padding: '1px 8px', fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.04em' }}>EDITADO</span>}
              </div>
              <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#0a0a0a', lineHeight: 1.35 }}>{it.theme}</div>
              <TagChips tags={it.tags} />
            </div>
            <StatusBadge status={it.status} />
          </div>

          {it.reviewer && it.status !== 'pending' && (
            <div style={{ marginTop: '7px', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 600, color: 'rgba(0,0,0,0.55)' }}>
              {(() => { const p = profileByName(it.reviewer); return p ? <BoringAvatar index={p.avatar} size={18} /> : null; })()}
              {it.status === 'approved' ? 'Aprovado' : 'Reprovado'} por {it.reviewer}
            </div>
          )}

          {it.comingSoon ? (
            <div style={{ marginTop: '10px', fontSize: '12px', color: 'rgba(0,0,0,0.4)', fontWeight: 600 }}>Em breve</div>
          ) : (
            <>
              {/* Ações de aprovação */}
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {it.status !== 'approved' && (
                  <button onClick={approve} style={actionBtn('rgba(22,163,74,0.1)', '#15803d', '1px solid rgba(22,163,74,0.25)')}><Check size={13} /> Aprovar</button>
                )}
                {it.status !== 'reproved' && (
                  <button onClick={() => setShowReprove(v => !v)} style={actionBtn('rgba(220,38,38,0.08)', '#b91c1c', '1px solid rgba(220,38,38,0.22)')}><X size={13} /> Reprovar</button>
                )}
                {it.status !== 'pending' && (
                  <button onClick={undo} style={{ background: 'none', border: 'none', color: 'rgba(0,0,0,0.5)', fontSize: '11.5px', cursor: 'pointer', textDecoration: 'underline' }}>desfazer</button>
                )}
                <button onClick={() => onEdit(it.id)} style={actionBtn('rgba(0,0,0,0.05)', 'rgba(0,0,0,0.65)', '1px solid rgba(0,0,0,0.1)')}><Pencil size={12} /> Editar</button>
                {!it.custom && it.edited && (
                  <button onClick={() => onRestore(it.id)} style={actionBtn('rgba(217,119,87,0.1)', '#b45309', '1px solid rgba(217,119,87,0.25)')}><ChevronLeft size={12} /> Restaurar</button>
                )}
                {it.custom && (
                  <button onClick={() => onDelete(it.id)} style={actionBtn('rgba(220,38,38,0.06)', '#b91c1c', '1px solid rgba(220,38,38,0.18)')}><Trash2 size={12} /> Excluir</button>
                )}
                <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', fontWeight: 600, color: scheduledDate ? '#0a0a0a' : 'rgba(0,0,0,0.4)' }}>
                  <Calendar size={12} /> {scheduledDate ? `Agendado · ${ddmm(scheduledDate)}` : 'Não agendado'}
                </span>
              </div>

              {/* Status de postagem */}
              <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '9px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(0,0,0,0.4)' }}>Postagem</span>
                <div style={{ display: 'inline-flex', background: 'rgba(0,0,0,0.05)', borderRadius: '999px', padding: '2px' }}>
                  {[['producao', 'Em produção'], ['agendado', 'Agendado']].map(([k, label]) => {
                    const on = (posting === 'producao' ? 'producao' : 'agendado') === k;
                    return (
                      <button key={k} onClick={() => onSetProd(it.id, k)} style={{ border: 'none', cursor: 'pointer', borderRadius: '999px', padding: '5px 12px', fontSize: '11.5px', fontWeight: 600, background: on ? '#0a0a0a' : 'transparent', color: on ? '#fff' : 'rgba(0,0,0,0.6)', transition: 'all 0.15s ease' }}>{label}</button>
                    );
                  })}
                </div>
                {posting === 'postado' && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                    <PostingBadge status="postado" /> <span style={{ fontSize: '10.5px', color: 'rgba(0,0,0,0.4)' }}>automático</span>
                  </span>
                )}
              </div>

              {showReprove && (
                <div style={{ marginTop: '12px' }}>
                  <textarea
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    placeholder="O que precisa ser ajustado neste conteúdo?"
                    rows={2}
                    style={{ width: '100%', boxSizing: 'border-box', resize: 'vertical', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.14)', padding: '10px 12px', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }}
                  />
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button disabled={!draft.trim()} onClick={sendReprove} style={{ ...actionBtn('#dc2626', '#fff'), opacity: draft.trim() ? 1 : 0.4, cursor: draft.trim() ? 'pointer' : 'not-allowed' }}>Enviar reprovação</button>
                    <button onClick={() => { setShowReprove(false); setDraft(''); }} style={actionBtn('rgba(0,0,0,0.05)', 'rgba(0,0,0,0.6)', '1px solid rgba(0,0,0,0.1)')}>Cancelar</button>
                  </div>
                </div>
              )}

              {it.status === 'reproved' && it.suggestion && !showReprove && (
                <div style={{ marginTop: '12px', background: '#fef2f2', borderRadius: '8px', padding: '10px 12px', fontSize: '12.5px', color: 'rgba(0,0,0,0.7)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                  <strong style={{ color: '#b91c1c' }}>Comentário:</strong> {it.suggestion}
                </div>
              )}

              <CreativeUploader id={it.id} urls={urls} uploading={uploading} onUpload={onUpload} onRemove={onRemove} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Modal de criar/editar um post no admin
function PostEditor({ initial, brands, lockBrand, onSave, onClose }) {
  const [brand, setBrand] = useState(initial?.brand || brands[0]?.[0] || '');
  const [headline, setHeadline] = useState(initial?.headline || '');
  const [subtitle, setSubtitle] = useState(initial?.subtitle || '');
  const [caption, setCaption] = useState(initial?.caption || '');
  const [kind, setKind] = useState(initial?.kind || 'estatico');
  const [tags, setTags] = useState(Array.isArray(initial?.tags) ? initial.tags : []);
  const [tagInput, setTagInput] = useState('');
  const [prodSt, setProdSt] = useState(initial?.prodStatus || 'producao');

  const addTag = (t) => {
    const v = (t || '').trim();
    if (!v) return;
    if (!tags.some(x => x.toLowerCase() === v.toLowerCase())) setTags([...tags, v]);
    setTagInput('');
  };
  const removeTag = (t) => setTags(tags.filter(x => x !== t));

  const canSave = brand && headline.trim();
  const save = () => { if (canSave) onSave({ ...(initial || {}), brand, headline: headline.trim(), subtitle: subtitle.trim(), caption, kind, tags, prodStatus: prodSt }); };

  const field = { width: '100%', boxSizing: 'border-box', borderRadius: '10px', border: '1px solid rgba(0,0,0,0.14)', padding: '11px 13px', fontSize: '14px', fontFamily: 'inherit', outline: 'none', background: '#fff' };
  const label = { fontSize: '11.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'rgba(0,0,0,0.5)', marginBottom: '7px', display: 'block' };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 1001, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', padding: '24px', overflowY: 'auto', fontFamily: 'Geist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#f5f5f3', borderRadius: '20px', width: '100%', maxWidth: '600px', margin: 'auto', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ background: '#0a0a0a', color: '#fafafa', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: '19px', fontWeight: 600, margin: 0, letterSpacing: '-0.02em' }}>{initial ? 'Editar conteúdo' : 'Novo conteúdo'}</h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: '#fafafa', borderRadius: '999px', width: '32px', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>

        <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={label}>Marca</label>
            {lockBrand ? (
              <div style={{ ...field, background: 'rgba(0,0,0,0.04)', color: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lock size={13} /> {brands.find(([k]) => k === brand)?.[1]?.name || clients[brand]?.name || brand}
              </div>
            ) : (
              <select value={brand} onChange={e => setBrand(e.target.value)} style={{ ...field, cursor: 'pointer' }}>
                {brands.map(([k, c]) => <option key={k} value={k}>{c.name}</option>)}
              </select>
            )}
          </div>

          <div>
            <label style={label}>Tipo do conteúdo</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {POST_TYPES.map(t => {
                const on = kind === t.key;
                return (
                  <button key={t.key} onClick={() => setKind(t.key)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '7px', flex: 1, minWidth: '120px', justifyContent: 'center',
                    background: on ? '#0a0a0a' : '#fff', color: on ? '#fff' : 'rgba(0,0,0,0.7)',
                    border: '1px solid ' + (on ? '#0a0a0a' : 'rgba(0,0,0,0.14)'),
                    borderRadius: '10px', padding: '11px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease'
                  }}>
                    {t.icon} {t.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label style={label}>Status de postagem</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[['producao', 'Em produção'], ['agendado', 'Agendado']].map(([k, lab]) => {
                const on = prodSt === k;
                return (
                  <button key={k} onClick={() => setProdSt(k)} style={{
                    flex: 1, background: on ? '#0a0a0a' : '#fff', color: on ? '#fff' : 'rgba(0,0,0,0.7)',
                    border: '1px solid ' + (on ? '#0a0a0a' : 'rgba(0,0,0,0.14)'),
                    borderRadius: '10px', padding: '11px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s ease'
                  }}>{lab}</button>
                );
              })}
            </div>
            <p style={{ fontSize: '11.5px', color: 'rgba(0,0,0,0.45)', margin: '7px 0 0' }}>Agendados viram “Postado” automaticamente no dia marcado no calendário.</p>
          </div>

          <div>
            <label style={label}>Headline do criativo</label>
            <input value={headline} onChange={e => setHeadline(e.target.value)} placeholder="Título principal do criativo" style={field} autoFocus />
          </div>

          <div>
            <label style={label}>Subtítulo</label>
            <input value={subtitle} onChange={e => setSubtitle(e.target.value)} placeholder="Complemento da headline" style={field} />
          </div>

          <div>
            <label style={label}>Legenda</label>
            <textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Texto da publicação…" rows={5} style={{ ...field, resize: 'vertical', lineHeight: 1.5 }} />
          </div>

          <div>
            <label style={label}>Tags</label>
            {tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px', marginBottom: '10px' }}>
                {tags.map(t => (
                  <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#0a0a0a', color: '#fff', borderRadius: '999px', padding: '4px 6px 4px 11px', fontSize: '12px', fontWeight: 600 }}>
                    {t}
                    <button onClick={() => removeTag(t)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', lineHeight: 1 }}>×</button>
                  </span>
                ))}
              </div>
            )}
            <input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(tagInput); } }}
              placeholder="Digite uma tag e tecle Enter"
              style={field}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
              {TAG_SUGGESTIONS.filter(s => !tags.some(t => t.toLowerCase() === s.toLowerCase())).map(s => (
                <button key={s} onClick={() => addTag(s)} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.1)', color: 'rgba(0,0,0,0.6)', borderRadius: '999px', padding: '4px 10px', fontSize: '11.5px', fontWeight: 600, cursor: 'pointer' }}>
                  <Plus size={10} /> {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button onClick={onClose} style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)', color: 'rgba(0,0,0,0.7)', borderRadius: '10px', padding: '11px 18px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}>Cancelar</button>
          <button onClick={save} disabled={!canSave} style={{ background: '#0a0a0a', border: 'none', color: '#fff', borderRadius: '10px', padding: '11px 20px', fontSize: '13.5px', fontWeight: 600, cursor: canSave ? 'pointer' : 'not-allowed', opacity: canSave ? 1 : 0.4, display: 'inline-flex', alignItems: 'center', gap: '7px' }}>
            <Check size={15} /> {initial ? 'Salvar alterações' : 'Criar conteúdo'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// APP PRINCIPAL
// ============================================================

export default function App() {
  const [view, setView] = useState('landing');
  const [activeBrand, setActiveBrand] = useState('octalab');
  const [activeDay, setActiveDay] = useState('all');
  const [activeKind, setActiveKind] = useState('all');
  const [reviews, setReviews] = useState({}); // { 'juspilot-0': { status, suggestion } }
  const [schedule, setSchedule] = useState({}); // { 'juspilot-0': '2026-06-05' } — dia agendado
  const [creatives, setCreatives] = useState({}); // { 'juspilot-0': ['url1', 'url2'] } — criativos subidos pelo admin
  const [uploadingId, setUploadingId] = useState(null); // id do conteúdo cujo upload está em andamento
  const [customPosts, setCustomPosts] = useState({}); // { 'custom-xxx': { id, brand, headline, ... } } — posts criados no admin
  const [editorPost, setEditorPost] = useState(null); // null = fechado; 'new' = criar; objeto = editar
  const [prodStatus, setProdStatus] = useState({}); // { id: 'producao' | 'agendado' } — status de postagem definido no admin
  const [boardTab, setBoardTab] = useState('agendado'); // aba do quadro de status de postagem
  const [boardItem, setBoardItem] = useState(null); // item aberto no resumo curto
  const [calBrand, setCalBrand] = useState('all'); // filtro de marca no calendário
  const [selectedDay, setSelectedDay] = useState(null); // dia aberto no calendário público (ver/aprovar)
  const [adminDay, setAdminDay] = useState(null); // dia aberto no admin (montar/atribuir conteúdos)
  const [adminFilter, setAdminFilter] = useState('all'); // filtro de status no admin
  const [adminSearch, setAdminSearch] = useState(''); // busca por tema/marca no admin
  const [adminMonth, setAdminMonth] = useState('all'); // aba de mês no admin ('YYYY-MM' | 'unscheduled' | 'all')
  const [expandedBrands, setExpandedBrands] = useState({}); // marcas expandidas na lista do admin
  const [toast, setToast] = useState(null); // aviso flutuante
  const [confirmBox, setConfirmBox] = useState(null); // { message, confirmLabel, onConfirm }
  const [currentUser, setCurrentUser] = useState(() => {
    try { return localStorage.getItem('painel-user') || null; } catch { return null; }
  }); // quem está revisando (nome do perfil) — registra autoria das aprovações

  const notify = (message) => setToast(message);
  const askConfirm = (message, onConfirm, confirmLabel) => setConfirmBox({ message, onConfirm, confirmLabel });

  // Escolhe um perfil e segue para o menu de conteúdos
  const chooseUser = (name) => {
    setCurrentUser(name);
    try { localStorage.setItem('painel-user', name); } catch { /* ignore */ }
    setView('select');
  };

  // Carrega as avaliações do Supabase e escuta mudanças em tempo real
  useEffect(() => {
    if (!supabaseReady) return;
    let mounted = true;

    supabase.from('reviews').select('*').then(({ data, error }) => {
      if (!mounted || error || !data) return;
      const map = {};
      data.forEach(r => { map[r.id] = { status: r.status, suggestion: r.suggestion || '', reviewer: r.reviewer || '' }; });
      setReviews(map);
    });

    const channel = supabase
      .channel('reviews-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reviews' }, payload => {
        setReviews(prev => {
          const next = { ...prev };
          if (payload.eventType === 'DELETE') {
            delete next[payload.old.id];
          } else {
            const r = payload.new;
            next[r.id] = { status: r.status, suggestion: r.suggestion || '', reviewer: r.reviewer || '' };
          }
          return next;
        });
      })
      .subscribe();

    return () => { mounted = false; supabase.removeChannel(channel); };
  }, []);

  const setReview = async (id, data) => {
    // Registra quem revisou (vazio quando volta para pendente)
    const reviewer = data.status === 'pending' ? '' : (currentUser || 'Anônimo');
    // Atualização otimista na tela
    setReviews(prev => ({ ...prev, [id]: { ...prev[id], ...data, reviewer } }));
    if (!supabaseReady) return;
    await supabase.from('reviews').upsert({
      id,
      status: data.status,
      suggestion: data.suggestion ?? '',
      reviewer,
      updated_at: new Date().toISOString()
    });
  };

  const resetReviews = () => {
    askConfirm('Tem certeza? Isso vai apagar TODAS as aprovações e reprovações.', async () => {
      setReviews({});
      if (!supabaseReady) return;
      await supabase.from('reviews').delete().neq('id', '');
    }, 'Resetar tudo');
  };

  // Carrega os agendamentos do Supabase e escuta mudanças em tempo real
  useEffect(() => {
    if (!supabaseReady) return;
    let mounted = true;

    supabase.from('schedule').select('*').then(({ data, error }) => {
      if (!mounted || error || !data) return;
      const map = {};
      data.forEach(s => { if (s.date) map[s.id] = s.date; });
      setSchedule(map);
    });

    const channel = supabase
      .channel('schedule-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedule' }, payload => {
        setSchedule(prev => {
          const next = { ...prev };
          if (payload.eventType === 'DELETE') {
            delete next[payload.old.id];
          } else {
            const s = payload.new;
            if (s.date) next[s.id] = s.date; else delete next[s.id];
          }
          return next;
        });
      })
      .subscribe();

    return () => { mounted = false; supabase.removeChannel(channel); };
  }, []);

  // Agenda (ou remove, se date === null) um conteúdo num dia do calendário
  const setSchedulePost = async (id, date) => {
    setSchedule(prev => {
      const next = { ...prev };
      if (date) next[id] = date; else delete next[id];
      return next;
    });
    if (!supabaseReady) return;
    if (date) {
      await supabase.from('schedule').upsert({ id, date, updated_at: new Date().toISOString() });
    } else {
      await supabase.from('schedule').delete().eq('id', id);
    }
  };

  // Carrega os criativos subidos do Supabase e escuta mudanças em tempo real
  useEffect(() => {
    if (!supabaseReady) return;
    let mounted = true;

    supabase.from('creatives').select('*').then(({ data, error }) => {
      if (!mounted || error || !data) return;
      const map = {};
      data.forEach(r => { if (r.urls?.length) map[r.id] = r.urls; });
      setCreatives(map);
    });

    const channel = supabase
      .channel('creatives-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'creatives' }, payload => {
        setCreatives(prev => {
          const next = { ...prev };
          if (payload.eventType === 'DELETE') {
            delete next[payload.old.id];
          } else {
            const r = payload.new;
            if (r.urls?.length) next[r.id] = r.urls; else delete next[r.id];
          }
          return next;
        });
      })
      .subscribe();

    return () => { mounted = false; supabase.removeChannel(channel); };
  }, []);

  // Salva (ou remove, se urls vazio) a lista de criativos de um conteúdo
  const setCreativeUrls = async (id, urls) => {
    setCreatives(prev => {
      const next = { ...prev };
      if (urls && urls.length) next[id] = urls; else delete next[id];
      return next;
    });
    if (!supabaseReady) return;
    if (urls && urls.length) {
      await supabase.from('creatives').upsert({ id, urls, updated_at: new Date().toISOString() });
    } else {
      await supabase.from('creatives').delete().eq('id', id);
    }
  };

  // Sobe arquivos para o Storage e atualiza a lista do conteúdo.
  // append=false (criativo único) substitui tudo; append=true (carrossel) acrescenta.
  const uploadCreatives = async (id, files, { append } = {}) => {
    const list = Array.from(files || []).filter(f => f && f.type.startsWith('image/'));
    if (!list.length) return;
    if (!supabaseReady) {
      notify('Supabase não configurado — não foi possível subir o criativo.');
      return;
    }
    setUploadingId(id);
    try {
      const uploaded = [];
      for (const file of list) {
        const ext = (file.name.split('.').pop() || 'png').toLowerCase();
        const path = `${id}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('creatives')
          .upload(path, file, { upsert: true, contentType: file.type });
        if (upErr) { console.error('[upload]', upErr); continue; }
        const { data } = supabase.storage.from('creatives').getPublicUrl(path);
        if (data?.publicUrl) uploaded.push(data.publicUrl);
      }
      if (!uploaded.length) {
        notify('Falha ao subir os criativos. Verifique se o bucket "creatives" existe e é público.');
        return;
      }
      const current = creatives[id] || [];
      await setCreativeUrls(id, append ? [...current, ...uploaded] : uploaded);
      notify(uploaded.length > 1 ? `${uploaded.length} criativos enviados.` : 'Criativo enviado.');
    } finally {
      setUploadingId(null);
    }
  };

  // Remove um criativo específico da lista (não apaga o arquivo do Storage)
  const removeCreativeAt = (id, idx) => {
    const current = creatives[id] || [];
    setCreativeUrls(id, current.filter((_, i) => i !== idx));
  };

  // Carrega os posts criados no admin e escuta mudanças em tempo real
  useEffect(() => {
    if (!supabaseReady) return;
    let mounted = true;

    supabase.from('posts').select('*').then(({ data, error }) => {
      if (!mounted || error || !data) return;
      const map = {};
      data.forEach(p => { map[p.id] = p; });
      setCustomPosts(map);
    });

    const channel = supabase
      .channel('posts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, payload => {
        setCustomPosts(prev => {
          const next = { ...prev };
          if (payload.eventType === 'DELETE') delete next[payload.old.id];
          else next[payload.new.id] = payload.new;
          return next;
        });
      })
      .subscribe();

    return () => { mounted = false; supabase.removeChannel(channel); };
  }, []);

  // Cria ou atualiza um post customizado
  const savePost = async (record) => {
    const id = record.id || `custom-${(crypto.randomUUID?.() || String(Date.now()))}`;
    const row = {
      id,
      brand: record.brand,
      headline: record.headline || '',
      subtitle: record.subtitle || '',
      caption: record.caption || '',
      kind: record.kind || 'estatico',
      tags: record.tags || [],
      updated_at: new Date().toISOString()
    };
    setCustomPosts(prev => ({ ...prev, [id]: { ...prev[id], ...row } }));
    if (record.prodStatus) setProd(id, record.prodStatus); // status de postagem (tabela separada)
    setEditorPost(null);
    if (!supabaseReady) { notify('Supabase não configurado — post salvo só localmente.'); return; }
    const { error } = await supabase.from('posts').upsert(row);
    if (error) { console.error('[posts]', error); notify('Erro ao salvar. A tabela "posts" existe no Supabase?'); }
    else notify(record.id ? 'Conteúdo atualizado.' : 'Conteúdo criado.');
  };

  // Remove um post customizado (e suas avaliações/agenda/criativos)
  const deletePost = (id) => {
    askConfirm('Excluir este conteúdo criado? Isso remove também a avaliação, o agendamento e os criativos dele.', async () => {
      setCustomPosts(prev => { const n = { ...prev }; delete n[id]; return n; });
      setReviews(prev => { const n = { ...prev }; delete n[id]; return n; });
      setSchedule(prev => { const n = { ...prev }; delete n[id]; return n; });
      setCreatives(prev => { const n = { ...prev }; delete n[id]; return n; });
      if (!supabaseReady) return;
      await supabase.from('posts').delete().eq('id', id);
      await supabase.from('reviews').delete().eq('id', id);
      await supabase.from('schedule').delete().eq('id', id);
      await supabase.from('creatives').delete().eq('id', id);
    }, 'Excluir');
  };

  // Restaura um post fixo editado para a versão original (remove o override)
  const restorePost = (id) => {
    askConfirm('Restaurar este conteúdo para a versão original? Suas edições de texto e tags serão descartadas.', async () => {
      setCustomPosts(prev => { const n = { ...prev }; delete n[id]; return n; });
      if (!supabaseReady) return;
      await supabase.from('posts').delete().eq('id', id);
      notify('Conteúdo restaurado para o original.');
    }, 'Restaurar');
  };

  // Carrega o status de postagem do Supabase e escuta mudanças em tempo real
  useEffect(() => {
    if (!supabaseReady) return;
    let mounted = true;

    supabase.from('prodstatus').select('*').then(({ data, error }) => {
      if (!mounted || error || !data) return;
      const map = {};
      data.forEach(r => { map[r.id] = r.status; });
      setProdStatus(map);
    });

    const channel = supabase
      .channel('prodstatus-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prodstatus' }, payload => {
        setProdStatus(prev => {
          const next = { ...prev };
          if (payload.eventType === 'DELETE') delete next[payload.old.id];
          else next[payload.new.id] = payload.new.status;
          return next;
        });
      })
      .subscribe();

    return () => { mounted = false; supabase.removeChannel(channel); };
  }, []);

  // Define o status de postagem (producao | agendado) de um conteúdo
  const setProd = async (id, status) => {
    setProdStatus(prev => ({ ...prev, [id]: status }));
    if (!supabaseReady) return;
    await supabase.from('prodstatus').upsert({ id, status, updated_at: new Date().toISOString() });
  };

  // Status de postagem efetivo: 'producao' | 'agendado' | 'postado' (postado é automático no dia agendado)
  const today = new Date();
  const todayStr = iso(today.getFullYear(), today.getMonth(), today.getDate());
  const postingStatusOf = (id) => {
    if ((prodStatus[id] || 'producao') !== 'agendado') return 'producao';
    const d = schedule[id];
    return (d && d <= todayStr) ? 'postado' : 'agendado';
  };

  // Resolve o post (fixo/override/custom) para mostrar resumo curto
  const resolvePost = (id) => {
    const rec = customPosts[id];
    if (rec && String(id).startsWith('custom-')) return customToPost(rec);
    const lastDash = id.lastIndexOf('-');
    const bk = id.slice(0, lastDash);
    const idx = parseInt(id.slice(lastDash + 1), 10);
    const base = clients[bk]?.posts?.[idx];
    if (!base) return null;
    return rec ? applyOverride(base, rec) : base;
  };

  // Abre o editor para um post — fixo (monta a partir do código) ou customizado/editado
  const openEditor = (id) => {
    const prodStatusVal = prodStatus[id] || 'producao';
    if (customPosts[id]) { setEditorPost({ ...customPosts[id], prodStatus: prodStatusVal }); return; }
    const lastDash = id.lastIndexOf('-');
    const brandKey = id.slice(0, lastDash);
    const idx = parseInt(id.slice(lastDash + 1), 10);
    const post = clients[brandKey]?.posts?.[idx];
    if (!post) return;
    setEditorPost({
      id, brand: brandKey,
      headline: post.theme || '',
      subtitle: post.subtitle || '',
      caption: post.caption || '',
      kind: post.kind || 'estatico',
      tags: post.tags || [],
      prodStatus: prodStatusVal
    });
  };

  // Lista de posts customizados (array) para passar aos componentes
  const customList = Object.values(customPosts);

  // Data agendada de um post (só o que o admin colocou no calendário via Supabase)
  const postDate = (id) => schedule[id] ?? null;

  // Pílula de filtro liquid glass (sobre o fundo escuro da marca)
  const filterPill = (active) => ({
    background: active ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.05)',
    backdropFilter: active ? 'blur(10px) saturate(180%)' : 'none',
    WebkitBackdropFilter: active ? 'blur(10px) saturate(180%)' : 'none',
    color: brand.text,
    opacity: active ? 1 : 0.65,
    border: `1px solid ${active ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.12)'}`,
    boxShadow: active ? 'inset 0 1px 1px rgba(255,255,255,0.25)' : 'none',
    borderRadius: '999px', padding: '6px 14px',
    fontSize: '11px', fontWeight: 600, cursor: 'pointer',
    transition: 'all 0.2s ease'
  });

  const brand = clients[activeBrand];
  let posts = brand.posts.map((post, i) => ({ post, originalIndex: i }));
  if (activeDay !== 'all') posts = posts.filter(({ originalIndex }) => originalIndex === parseInt(activeDay));
  if (activeKind !== 'all') posts = posts.filter(({ post }) => post.kind === activeKind);

  // ─── TELA INICIAL ───
  // ─── IDENTIFIQUE-SE: seleção de perfil (avatar com rotação ao escolher) ───
  if (view === 'identify') {
    return (
      <IdentifyScreen
        onChoose={chooseUser}
        onAdmin={() => setView('gate')}
        onBack={() => setView('landing')}
      />
    );
  }

  if (view === 'landing') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#ffffff',
        color: '#0a0a0a',
        fontFamily: 'Geist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '24px'
      }}>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: '560px' }}>
          <GooeyText texts={TITLE_PARTS} morphTime={0.6} cooldownTime={0.5} />
          <button
            onClick={() => setView('identify')}
            style={{
              marginTop: '20px',
              background: '#0a0a0a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '999px',
              padding: '15px 30px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '9px',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              transition: 'transform 0.15s ease, box-shadow 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 8px 22px rgba(0,0,0,0.22)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.15)'; }}
          >
            Ver conteúdos <ArrowRight size={17} />
          </button>
          <button
            onClick={() => setView('gate')}
            style={{
              marginTop: '10px', background: 'none', border: 'none',
              color: '#0a0a0a', opacity: 0.45, fontSize: '12px',
              cursor: 'pointer', textDecoration: 'underline'
            }}
          >
            Painel admin
          </button>
        </div>
      </div>
    );
  }

  // ─── MENU PRINCIPAL: calendário ou copies ───
  if (view === 'select') {
    const MenuButton = ({ icon, title, subtitle, onClick, locked }) => (
      <button
        onClick={locked ? undefined : onClick}
        disabled={locked}
        onMouseEnter={e => { if (locked) return; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08), 0 18px 40px rgba(0,0,0,0.12)'; }}
        onMouseLeave={e => { if (locked) return; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.06)'; }}
        style={{
          flex: 1, minWidth: '240px', maxWidth: '360px', position: 'relative',
          background: locked ? '#e9e9e6' : '#0a0a0a', color: locked ? 'rgba(0,0,0,0.4)' : '#fafafa',
          borderRadius: '24px', border: 'none', padding: '36px 30px',
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '18px',
          textAlign: 'left', cursor: locked ? 'not-allowed' : 'pointer', font: 'inherit',
          boxShadow: locked ? 'none' : '0 1px 3px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.06)',
          transition: 'transform 0.2s cubic-bezier(0.4,0,0.2,1), box-shadow 0.2s ease'
        }}
      >
        {locked && (
          <span style={{ position: 'absolute', top: '18px', right: '18px', display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(0,0,0,0.06)', borderRadius: '999px', padding: '4px 10px', fontSize: '11px', fontWeight: 700, color: 'rgba(0,0,0,0.5)' }}>
            <Lock size={11} /> Em breve
          </span>
        )}
        <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '56px', height: '56px', borderRadius: '16px', background: locked ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.10)', border: '1px solid ' + (locked ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.16)') }}>
          {icon}
        </span>
        <div>
          <h3 style={{ fontSize: '21px', fontWeight: 600, margin: '0 0 6px 0', letterSpacing: '-0.02em' }}>{title}</h3>
          <p style={{ fontSize: '13px', opacity: locked ? 0.8 : 0.6, margin: 0, lineHeight: 1.45 }}>{subtitle}</p>
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, opacity: 0.85, marginTop: '2px' }}>
          {locked ? <>Bloqueado <Lock size={14} /></> : <>Acessar <ArrowRight size={14} /></>}
        </span>
      </button>
    );

    return (
      <div style={{
        minHeight: '100vh', background: '#ffffff', color: '#0a0a0a',
        fontFamily: 'Geist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
        padding: 'clamp(28px, 6vh, 64px) 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        <div style={{ width: '100%', maxWidth: '780px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'clamp(28px, 5vh, 56px)' }}>
          <button onClick={() => setView('landing')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0a0a0a', opacity: 0.55, display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 500, padding: 0 }}>
            <ChevronLeft size={14} /> Voltar
          </button>
          <button onClick={() => setView('gate')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0a0a0a', opacity: 0.45, fontSize: '12px', textDecoration: 'underline' }}>
            Painel admin
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 'clamp(28px, 4vh, 44px)' }}>
          {currentUser && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '9px', marginBottom: '18px', background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '999px', padding: '5px 8px 5px 5px' }}>
              {(() => { const p = profileByName(currentUser); return p ? <BoringAvatar index={p.avatar} size={28} /> : null; })()}
              <span style={{ fontSize: '13px', fontWeight: 600 }}>{currentUser}</span>
              <button onClick={() => setView('identify')} style={{ background: 'none', border: 'none', color: 'rgba(0,0,0,0.5)', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', padding: '0 6px 0 0' }}>trocar</button>
            </div>
          )}
          <h1 style={{ fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 600, margin: 0, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
            O que você quer ver?
          </h1>
          <p style={{ fontSize: '14px', opacity: 0.55, margin: '12px 0 0 0' }}>
            Acesse o calendário editorial ou as copies de cada marca.
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', width: '100%', maxWidth: '780px', justifyContent: 'center' }}>
          <MenuButton
            icon={<Calendar size={26} />}
            title="Calendário editorial"
            subtitle="Veja a linha editorial de junho organizada por dia."
            onClick={() => setView('calendar')}
          />
          <MenuButton
            icon={<Layers size={26} />}
            title="Copies das marcas"
            subtitle="Visualize e aprove as copies de cada marca."
            onClick={() => setView('brands')}
            locked
          />
        </div>
      </div>
    );
  }

  // ─── CALENDÁRIO EDITORIAL (público) ───
  if (view === 'calendar') {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f3', fontFamily: 'Geist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif', paddingBottom: '60px' }}>
        <div style={{ background: '#0a0a0a', color: '#fafafa', padding: '44px 28px 32px 28px' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <button onClick={() => setView('select')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#fafafa', opacity: 0.55, display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '12px', fontWeight: 500, padding: 0 }}>
                <ChevronLeft size={14} /> Voltar
              </button>
              <button onClick={() => setView('gate')} style={{ ...glassDark, cursor: 'pointer', color: '#fafafa', borderRadius: '999px', padding: '8px 16px', fontSize: '12px', fontWeight: 600 }}>
                Painel admin
              </button>
            </div>
            <h1 style={{ fontSize: '34px', fontWeight: 600, margin: 0, letterSpacing: '-0.03em', textTransform: 'capitalize' }}>Calendário editorial</h1>
            <p style={{ fontSize: '13.5px', opacity: 0.65, marginTop: '8px' }}>Use as setas para navegar entre os meses · clique num dia para ver e aprovar os conteúdos.</p>
          </div>
        </div>

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '28px' }}>
          <MonthCalendar
            schedule={schedule}
            reviews={reviews}
            calBrand={calBrand}
            setCalBrand={setCalBrand}
            onDayClick={setSelectedDay}
            customPosts={customList}
          />
        </div>

        {selectedDay && (
          <DayDetail
            day={selectedDay}
            schedule={schedule}
            reviews={reviews}
            setReview={setReview}
            onClose={() => setSelectedDay(null)}
            creatives={creatives}
            customPosts={customList}
            getPosting={postingStatusOf}
          />
        )}
      </div>
    );
  }

  // ─── COPIES DAS MARCAS (grade de marcas) ───
  if (view === 'brands') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#ffffff',
        color: '#0a0a0a',
        fontFamily: 'Geist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
        padding: 'clamp(28px, 6vh, 64px) 24px',
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        {/* Cabeçalho */}
        <div style={{
          width: '100%', maxWidth: '960px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 'clamp(28px, 5vh, 56px)'
        }}>
          <button
            onClick={() => setView('select')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#0a0a0a', opacity: 0.55,
              display: 'inline-flex', alignItems: 'center', gap: '5px',
              fontSize: '12px', fontWeight: 500, padding: 0
            }}
          >
            <ChevronLeft size={14} /> Voltar
          </button>
          <button
            onClick={() => setView('gate')}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#0a0a0a', opacity: 0.45, fontSize: '12px',
              textDecoration: 'underline'
            }}
          >
            Painel admin
          </button>
        </div>

        {/* Título */}
        <div style={{ textAlign: 'center', marginBottom: 'clamp(28px, 4vh, 44px)' }}>
          <h1 style={{
            fontSize: 'clamp(32px, 5vw, 52px)',
            fontWeight: 600, margin: 0,
            letterSpacing: '-0.03em', lineHeight: 1.05
          }}>
            Escolha uma marca
          </h1>
          <p style={{ fontSize: '14px', opacity: 0.55, margin: '12px 0 0 0' }}>
            Selecione a marca para ver seus conteúdos.
          </p>
        </div>

        {/* Grid de cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))',
          gap: '20px',
          width: '100%',
          maxWidth: '880px'
        }}>
          {Object.entries(clients).map(([key, c]) => {
            const disabled = c.comingSoon;
            return (
              <button
                key={key}
                onClick={() => {
                  if (disabled) return;
                  setActiveBrand(key);
                  setActiveDay('all');
                  setActiveKind('all');
                  setView('content');
                }}
                disabled={disabled}
                title={disabled ? 'Conteúdo em breve' : undefined}
                onMouseEnter={e => {
                  if (disabled) return;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08), 0 18px 36px rgba(0,0,0,0.10)';
                }}
                onMouseLeave={e => {
                  if (disabled) return;
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.06)';
                }}
                style={{
                  aspectRatio: '1 / 1',
                  background: c.bg,
                  color: c.text,
                  borderRadius: '24px',
                  border: 'none',
                  padding: '26px',
                  display: 'flex', flexDirection: 'column',
                  justifyContent: 'space-between',
                  textAlign: 'left',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  opacity: disabled ? 0.45 : 1,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05), 0 8px 24px rgba(0,0,0,0.06)',
                  transition: 'transform 0.2s cubic-bezier(0.4,0,0.2,1), box-shadow 0.2s ease',
                  position: 'relative', overflow: 'hidden',
                  font: 'inherit'
                }}
              >
                {/* Topo: pontinho da marca + posts/em-breve */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{
                    width: '14px', height: '14px', borderRadius: '50%',
                    background: c.accent,
                    boxShadow: `0 0 14px ${c.accent}aa`
                  }} />
                  {disabled ? (
                    <span style={{
                      fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.12em',
                      textTransform: 'uppercase',
                      background: 'rgba(255,255,255,0.10)',
                      border: '1px solid rgba(255,255,255,0.18)',
                      padding: '4px 10px', borderRadius: '999px'
                    }}>em breve</span>
                  ) : (
                    <span style={{ fontSize: '11px', opacity: 0.6 }}>
                      {c.posts.length} {c.posts.length === 1 ? 'post' : 'posts'}
                    </span>
                  )}
                </div>

                {/* Base: nome + tagline + seta */}
                <div>
                  <h3 style={{
                    fontSize: 'clamp(22px, 2.6vw, 28px)',
                    fontWeight: 600, margin: '0 0 8px 0',
                    letterSpacing: '-0.02em', lineHeight: 1.1
                  }}>
                    {c.name}
                  </h3>
                  <p style={{ fontSize: '12.5px', opacity: 0.65, margin: '0 0 16px 0', lineHeight: 1.4 }}>
                    {c.tagline}
                  </p>
                  {!disabled && (
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      fontSize: '12px', fontWeight: 600, opacity: 0.85
                    }}>
                      Acessar <ArrowRight size={13} />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── TELA DE SENHA DO ADMIN ───
  if (view === 'gate') {
    return (
      <AdminGate
        expected={ADMIN_PASSWORD}
        onSuccess={() => { setCurrentUser('Admin'); setView('admin'); }}
        onCancel={() => setView('select')}
      />
    );
  }

  // ─── PAINEL ADMIN ───
  if (view === 'admin') {
    const allItems = Object.entries(clients).flatMap(([brandKey, c]) =>
      postsOf(brandKey, customList).map(({ id, post, custom, edited }) => {
        const r = reviews[id] || {};
        return {
          id, brandKey, brandName: c.name, accent: c.accent,
          theme: post.theme, kind: post.kind, day: post.day,
          comingSoon: !!c.comingSoon,
          custom, edited, tags: post.tags || [],
          status: r.status || 'pending',
          suggestion: r.suggestion || '',
          reviewer: r.reviewer || '',
          // criativo padrão da marca (imagem em /public), usado como miniatura quando não há upload
          image: post.slide?.image || post.slides?.[0]?.image || null,
          defaultCount: post.slides?.length || 1
        };
      })
    );
    const total = allItems.length;
    const approved = allItems.filter(it => it.status === 'approved').length;
    const reproved = allItems.filter(it => it.status === 'reproved').length;
    const pending = allItems.filter(it => it.status === 'pending').length;
    const donePct = total ? Math.round(((approved + reproved) / total) * 100) : 0;

    // Mês de um conteúdo (pela data agendada)
    const itemMonth = (it) => (schedule[it.id] ? schedule[it.id].slice(0, 7) : null);

    // Abas de mês (a partir das datas agendadas) + Não agendados + Todos
    const monthSet = new Set(Object.values(schedule).map(d => (d ? d.slice(0, 7) : null)).filter(Boolean));
    const monthCount = (key) => allItems.filter(it => {
      const m = itemMonth(it);
      if (key === 'all') return true;
      if (key === 'unscheduled') return !m;
      return m === key;
    }).length;
    const monthTabs = [
      ...[...monthSet].sort().map(m => ({ key: m, label: monthLabel(m) })),
      { key: 'unscheduled', label: 'Não agendados' },
      { key: 'all', label: 'Todos' }
    ];

    // Filtro de status + busca + mês
    const q = adminSearch.trim().toLowerCase();
    const filtered = allItems.filter(it => {
      if (adminFilter !== 'all' && it.status !== adminFilter) return false;
      const m = itemMonth(it);
      if (adminMonth === 'unscheduled' && m) return false;
      if (adminMonth !== 'all' && adminMonth !== 'unscheduled' && m !== adminMonth) return false;
      if (q && !`${it.theme} ${it.brandName} ${KIND_LABEL[it.kind] || it.kind}`.toLowerCase().includes(q)) return false;
      return true;
    });

    // Só a busca abre todas as marcas (pra mostrar o resultado); filtros de status respeitam o recolher
    const forceExpand = q !== '';
    const isBrandOpen = (bk) => forceExpand || !!expandedBrands[bk];
    const toggleBrand = (bk) => setExpandedBrands(prev => ({ ...prev, [bk]: !prev[bk] }));

    const filterPills = [
      ['all', 'Todos', total],
      ['pending', 'Pendentes', pending],
      ['approved', 'Aprovados', approved],
      ['reproved', 'Reprovados', reproved]
    ];

    // Quadro de status de postagem (em produção / agendados / postados)
    const boardGroups = { producao: [], agendado: [], postado: [] };
    allItems.forEach(it => { if (!it.comingSoon) boardGroups[postingStatusOf(it.id)].push(it); });
    const boardTabs = [['producao', 'Em produção'], ['agendado', 'Agendados'], ['postado', 'Postados']];
    const boardList = boardGroups[boardTab] || [];

    const Stat = ({ label, value, color }) => (
      <div style={{
        ...glassLight, borderRadius: '16px', padding: '20px 24px',
        flex: 1, minWidth: '140px'
      }}>
        <div style={{ fontSize: '34px', fontWeight: 700, color, letterSpacing: '-0.02em', lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: '12px', color: 'rgba(0,0,0,0.5)', marginTop: '6px', fontWeight: 600 }}>{label}</div>
      </div>
    );

    return (
      <div style={{
        minHeight: '100vh',
        background: '#f5f5f3',
        fontFamily: 'Geist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
        paddingBottom: '60px'
      }}>
        {/* HEADER ADMIN */}
        <div style={{ background: '#0a0a0a', color: '#fafafa', padding: '44px 28px 32px 28px' }}>
          <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
            <button
              onClick={() => setView('select')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#fafafa', opacity: 0.55,
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                fontSize: '12px', fontWeight: 500, padding: 0, marginBottom: '18px'
              }}
            >
              <ChevronLeft size={14} /> Voltar ao início
            </button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '34px', fontWeight: 600, margin: 0, letterSpacing: '-0.03em' }}>
                Painel Admin
              </h1>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={resetReviews}
                  style={{
                    background: 'rgba(252,165,165,0.10)',
                    backdropFilter: 'blur(12px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(12px) saturate(180%)',
                    color: '#fca5a5',
                    border: '1px solid rgba(252,165,165,0.28)', cursor: 'pointer',
                    borderRadius: '999px', padding: '9px 16px',
                    fontSize: '12.5px', fontWeight: 600,
                    display: 'inline-flex', alignItems: 'center', gap: '7px'
                  }}
                >
                  <X size={14} /> Resetar avaliações
                </button>
                <button
                  onClick={() => setView('select')}
                  style={{
                    ...glassDark, cursor: 'pointer', color: '#fafafa',
                    borderRadius: '999px', padding: '9px 16px',
                    fontSize: '12.5px', fontWeight: 600,
                    display: 'inline-flex', alignItems: 'center', gap: '7px'
                  }}
                >
                  <Lock size={13} /> Travar
                </button>
              </div>
            </div>
            <p style={{ fontSize: '13.5px', opacity: 0.6, marginTop: '8px' }}>
              Status de aprovação e comentários de cada conteúdo.
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px' }}>
          {/* CALENDÁRIO EDITORIAL — montar os dias */}
          <div style={{ background: '#fff', borderRadius: '18px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.05)', padding: '24px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0', letterSpacing: '-0.01em' }}>Calendário editorial</h2>
            <p style={{ fontSize: '12.5px', color: 'rgba(0,0,0,0.55)', margin: '0 0 18px 0' }}>
              Clique num dia para escolher quais conteúdos aparecem nele (pode selecionar mais de um).
            </p>
            <MonthCalendar
              schedule={schedule}
              reviews={reviews}
              calBrand={calBrand}
              setCalBrand={setCalBrand}
              onDayClick={setAdminDay}
              customPosts={customList}
            />
          </div>

          {/* QUADRO DE STATUS DE POSTAGEM */}
          <div style={{ background: '#fff', borderRadius: '18px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.05)', padding: '24px', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0', letterSpacing: '-0.01em' }}>Status de postagem</h2>
            <p style={{ fontSize: '12.5px', color: 'rgba(0,0,0,0.55)', margin: '0 0 16px 0' }}>
              Defina em cada conteúdo se está em produção ou agendado. Os agendados viram “Postado” automaticamente no dia marcado no calendário. Clique num item para ver o resumo.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
              {boardTabs.map(([k, label]) => {
                const on = boardTab === k;
                return (
                  <button key={k} onClick={() => setBoardTab(k)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '7px',
                    background: on ? '#0a0a0a' : 'rgba(0,0,0,0.04)', color: on ? '#fff' : 'rgba(0,0,0,0.65)',
                    border: '1px solid ' + (on ? '#0a0a0a' : 'rgba(0,0,0,0.08)'),
                    borderRadius: '10px', padding: '8px 14px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s ease'
                  }}>
                    {label}
                    <span style={{ background: on ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.07)', borderRadius: '999px', padding: '0 7px', fontSize: '11px', fontWeight: 700 }}>{boardGroups[k].length}</span>
                  </button>
                );
              })}
            </div>
            {boardList.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'rgba(0,0,0,0.4)', fontSize: '13px', padding: '28px 0' }}>Nenhum conteúdo neste status.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '10px' }}>
                {boardList.map(it => {
                  const thumb = creatives[it.id]?.[0];
                  return (
                    <button key={it.id} onClick={() => setBoardItem(it)} style={{ display: 'flex', alignItems: 'center', gap: '10px', textAlign: 'left', width: '100%', background: '#fff', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '12px', padding: '9px 11px', cursor: 'pointer', transition: 'box-shadow 0.15s ease' }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.08)'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <div style={{ flexShrink: 0, width: '44px', height: '44px', borderRadius: '9px', overflow: 'hidden', background: thumb ? '#101010' : 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {thumb ? <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={16} color="rgba(0,0,0,0.25)" />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '10.5px', color: 'rgba(0,0,0,0.45)', fontWeight: 600, marginBottom: '2px' }}>
                          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: it.accent }} /> {it.brandName}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#0a0a0a', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.theme}</div>
                      </div>
                      <span style={{ flexShrink: 0, fontSize: '11px', fontWeight: 700, color: schedule[it.id] ? '#0a0a0a' : 'rgba(0,0,0,0.35)' }}>{schedule[it.id] ? ddmm(schedule[it.id]) : '—'}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* DASHBOARD: progresso geral + números */}
          <div style={{ background: '#fff', borderRadius: '18px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 6px 20px rgba(0,0,0,0.05)', padding: '24px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px', marginBottom: '14px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>Andamento da revisão</h2>
              <div style={{ fontSize: '13px', color: 'rgba(0,0,0,0.55)', fontWeight: 600 }}>
                {approved + reproved}/{total} revisados · <span style={{ color: '#0a0a0a' }}>{donePct}%</span>
              </div>
            </div>
            <ProgressBar approved={approved} reproved={reproved} total={total} height={12} />
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '20px' }}>
              <Stat label="Total" value={total} color="#0a0a0a" />
              <Stat label="Aprovados" value={approved} color="#16a34a" />
              <Stat label="Reprovados" value={reproved} color="#dc2626" />
              <Stat label="Pendentes" value={pending} color="#64748b" />
            </div>
          </div>

          {/* ABAS DE MÊS + CRIAR CONTEÚDO */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
              {monthTabs.map(t => {
                const on = adminMonth === t.key;
                return (
                  <button key={t.key} onClick={() => setAdminMonth(t.key)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: on ? '#0a0a0a' : '#fff', color: on ? '#fff' : 'rgba(0,0,0,0.7)',
                    border: '1px solid ' + (on ? '#0a0a0a' : 'rgba(0,0,0,0.1)'),
                    borderRadius: '10px', padding: '8px 14px', fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s ease'
                  }}>
                    {t.label}
                    <span style={{ background: on ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.07)', borderRadius: '999px', padding: '0 7px', fontSize: '11px', fontWeight: 700 }}>{monthCount(t.key)}</span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setEditorPost('new')}
              style={{ background: '#0a0a0a', color: '#fff', border: 'none', borderRadius: '999px', padding: '11px 20px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(0,0,0,0.12)' }}
            >
              <Plus size={16} /> Criar conteúdo
            </button>
          </div>

          {/* FILTROS + BUSCA */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', marginBottom: '22px' }}>
            <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
              {filterPills.map(([k, label, count]) => {
                const on = adminFilter === k;
                return (
                  <button key={k} onClick={() => setAdminFilter(k)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    background: on ? '#0a0a0a' : 'rgba(0,0,0,0.04)', color: on ? '#fff' : 'rgba(0,0,0,0.65)',
                    border: '1px solid ' + (on ? '#0a0a0a' : 'rgba(0,0,0,0.08)'),
                    borderRadius: '999px', padding: '7px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.18s ease'
                  }}>
                    {label}
                    <span style={{ background: on ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.07)', borderRadius: '999px', padding: '0 7px', fontSize: '11px', fontWeight: 700 }}>{count}</span>
                  </button>
                );
              })}
            </div>
            <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: '300px' }}>
              <input
                value={adminSearch}
                onChange={e => setAdminSearch(e.target.value)}
                placeholder="Buscar por tema ou marca…"
                style={{ width: '100%', boxSizing: 'border-box', padding: '9px 14px 9px 14px', borderRadius: '999px', border: '1px solid rgba(0,0,0,0.12)', background: '#fff', fontSize: '12.5px', outline: 'none', fontFamily: 'inherit' }}
              />
            </div>
          </div>

          {/* LISTA POR MARCA — recolhível (com filtro/busca/mês aplicados) */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'rgba(0,0,0,0.45)', fontSize: '14px', padding: '48px 0' }}>
              Nenhum conteúdo encontrado com esse filtro.
            </div>
          ) : Object.entries(clients).map(([brandKey, c]) => {
            const items = filtered.filter(it => it.brandKey === brandKey);
            if (items.length === 0) return null;
            const bAppr = items.filter(it => it.status === 'approved').length;
            const bRepr = items.filter(it => it.status === 'reproved').length;
            const open = isBrandOpen(brandKey);
            return (
              <div key={brandKey} style={{ marginBottom: '14px' }}>
                <button
                  onClick={() => toggleBrand(brandKey)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '11px', background: '#fff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: open ? '14px 14px 0 0' : '14px', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', padding: '15px 18px', cursor: 'pointer', textAlign: 'left' }}
                >
                  <ChevronRight size={16} style={{ flexShrink: 0, opacity: 0.45, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s ease' }} />
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.accent, flexShrink: 0 }} />
                  <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.01em' }}>{c.name}</span>
                  <span style={{ fontSize: '12px', color: 'rgba(0,0,0,0.4)', fontWeight: 600 }}>{items.length} {items.length === 1 ? 'conteúdo' : 'conteúdos'}</span>
                  <div style={{ flex: 1, maxWidth: '160px', marginLeft: 'auto' }}>
                    <ProgressBar approved={bAppr} reproved={bRepr} total={items.length} height={6} />
                  </div>
                </button>
                {open && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px', background: 'rgba(0,0,0,0.015)', border: '1px solid rgba(0,0,0,0.06)', borderTop: 'none', borderRadius: '0 0 14px 14px' }}>
                    {items.map(it => (
                      <AdminItem
                        key={it.id}
                        it={it}
                        scheduledDate={schedule[it.id]}
                        urls={creatives[it.id]}
                        uploading={uploadingId === it.id}
                        onReview={setReview}
                        onUpload={uploadCreatives}
                        onRemove={removeCreativeAt}
                        onEdit={openEditor}
                        onDelete={deletePost}
                        onRestore={restorePost}
                        posting={postingStatusOf(it.id)}
                        onSetProd={setProd}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {adminDay && (
          <DayAssign
            day={adminDay}
            schedule={schedule}
            reviews={reviews}
            setSchedulePost={setSchedulePost}
            onClose={() => setAdminDay(null)}
            customPosts={customList}
          />
        )}

        {editorPost && (
          <PostEditor
            initial={editorPost === 'new' ? null : editorPost}
            brands={Object.entries(clients).filter(([, c]) => !c.comingSoon)}
            lockBrand={editorPost !== 'new' && !!editorPost && !String(editorPost.id).startsWith('custom-')}
            onSave={savePost}
            onClose={() => setEditorPost(null)}
          />
        )}

        {boardItem && (() => {
          const it = boardItem;
          const post = resolvePost(it.id);
          const thumb = creatives[it.id]?.[0];
          const caption = (post?.caption || '').trim();
          const excerpt = caption.length > 220 ? caption.slice(0, 220) + '…' : caption;
          return (
            <div onClick={() => setBoardItem(null)} style={{ position: 'fixed', inset: 0, zIndex: 1001, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px', fontFamily: 'Geist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif' }}>
              <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '18px', width: '100%', maxWidth: '440px', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' }}>
                <div style={{ background: '#0a0a0a', color: '#fafafa', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '11px', opacity: 0.55, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Resumo do conteúdo</div>
                  <button onClick={() => setBoardItem(null)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', cursor: 'pointer', color: '#fafafa', borderRadius: '999px', width: '30px', height: '30px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}><X size={15} /></button>
                </div>
                <div style={{ padding: '20px', display: 'flex', gap: '16px' }}>
                  <div style={{ flexShrink: 0, width: '110px', height: '138px', borderRadius: '12px', overflow: 'hidden', background: thumb ? '#101010' : 'linear-gradient(150deg, #1a1a1a, #0a0a0a)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: thumb ? 0 : '12px', gap: '6px' }}>
                    {thumb ? <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <><ImageIcon size={18} color="rgba(255,255,255,0.35)" /><span style={{ color: '#fff', fontSize: '11px', fontWeight: 600, lineHeight: 1.25 }}>{post?.headline || it.theme}</span></>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'rgba(0,0,0,0.5)', fontWeight: 600, marginBottom: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: it.accent }} /> {it.brandName}
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 4px', color: '#0a0a0a', lineHeight: 1.3 }}>{post?.headline || it.theme}</h3>
                    {post?.subtitle && <p style={{ fontSize: '12.5px', color: 'rgba(0,0,0,0.6)', margin: '0 0 8px', lineHeight: 1.4 }}>{post.subtitle}</p>}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                      <KindBadge kind={it.kind} />
                      <StatusBadge status={it.status} />
                      <PostingBadge status={postingStatusOf(it.id)} />
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: schedule[it.id] ? '#0a0a0a' : 'rgba(0,0,0,0.4)' }}>
                      <Calendar size={13} /> {schedule[it.id] ? dayLabel(schedule[it.id]) : 'Não agendado'}
                    </div>
                  </div>
                </div>
                {excerpt && (
                  <div style={{ padding: '0 20px 16px' }}>
                    <div style={{ fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'rgba(0,0,0,0.4)', marginBottom: '6px' }}>Legenda</div>
                    <p style={{ fontSize: '12.5px', color: 'rgba(0,0,0,0.7)', lineHeight: 1.55, margin: 0, whiteSpace: 'pre-wrap' }}>{excerpt}</p>
                  </div>
                )}
                <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(0,0,0,0.08)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button onClick={() => { setBoardItem(null); openEditor(it.id); }} style={{ background: 'rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.1)', color: 'rgba(0,0,0,0.7)', borderRadius: '10px', padding: '9px 16px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><Pencil size={13} /> Editar</button>
                  <button onClick={() => setBoardItem(null)} style={{ background: '#0a0a0a', border: 'none', color: '#fff', borderRadius: '10px', padding: '9px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Fechar</button>
                </div>
              </div>
            </div>
          );
        })()}
        {confirmBox && (
          <ConfirmDialog
            message={confirmBox.message}
            confirmLabel={confirmBox.confirmLabel}
            onConfirm={confirmBox.onConfirm}
            onClose={() => setConfirmBox(null)}
          />
        )}
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#f5f5f3',
      fontFamily: 'Geist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
      paddingBottom: '60px'
    }}>
      {/* HEADER */}
      <div style={{
        background: '#0a0a0a', color: '#fafafa',
        padding: '44px 28px 32px 28px'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <button
              onClick={() => setView('brands')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#fafafa', opacity: 0.55,
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                fontSize: '12px', fontWeight: 500, padding: 0
              }}
            >
              <ChevronLeft size={14} /> Voltar
            </button>
            <button
              onClick={() => setView('gate')}
              style={{
                ...glassDark, cursor: 'pointer', color: '#fafafa',
                borderRadius: '999px', padding: '8px 16px',
                fontSize: '12px', fontWeight: 600
              }}
            >
              Painel admin
            </button>
          </div>
          <p style={{ fontSize: '13.5px', opacity: 0.65, marginTop: '12px', maxWidth: '600px', lineHeight: 1.55 }}>
            Para cada marca: 2 posts de notícia (descoberta), 1 post comercial (anúncio do produto), 1 carrossel desdobrando uma notícia. As notícias são reais e verificáveis — link da fonte em cada post.
          </p>
        </div>
      </div>

      {/* TABS DE MARCA — liquid glass */}
      <div style={{
        background: 'rgba(255,255,255,0.6)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
        position: 'sticky', top: 0, zIndex: 10
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '12px 28px' }}>
          <div style={{
            display: 'inline-flex', gap: '4px', padding: '5px',
            background: 'rgba(120,120,128,0.10)',
            borderRadius: '999px', maxWidth: '100%', overflowX: 'auto',
            border: '1px solid rgba(255,255,255,0.5)',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.6)'
          }}>
            {Object.entries(clients).map(([key, c]) => {
              const active = activeBrand === key;
              const disabled = c.comingSoon;
              return (
                <button
                  key={key}
                  onClick={() => { if (disabled) return; setActiveBrand(key); setActiveDay('all'); setActiveKind('all'); }}
                  disabled={disabled}
                  title={disabled ? 'Conteúdo em breve' : undefined}
                  onMouseEnter={e => { if (!active && !disabled) e.currentTarget.style.background = 'rgba(255,255,255,0.45)'; }}
                  onMouseLeave={e => { if (!active && !disabled) e.currentTarget.style.background = 'transparent'; }}
                  style={{
                    background: active ? 'rgba(255,255,255,0.85)' : 'transparent',
                    backdropFilter: active ? 'blur(10px) saturate(180%)' : 'none',
                    WebkitBackdropFilter: active ? 'blur(10px) saturate(180%)' : 'none',
                    color: active ? '#0a0a0a' : 'rgba(0,0,0,0.55)',
                    border: active ? '1px solid rgba(255,255,255,0.9)' : '1px solid transparent',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.4 : 1,
                    padding: '10px 22px',
                    fontSize: '13.5px', fontWeight: 600,
                    letterSpacing: '-0.01em',
                    borderRadius: '999px',
                    boxShadow: active
                      ? `0 1px 3px rgba(0,0,0,0.12), 0 6px 18px ${c.accent}40, inset 0 1px 1px rgba(255,255,255,0.95)`
                      : 'none',
                    display: 'flex', alignItems: 'center', gap: '8px',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.28s cubic-bezier(0.4,0,0.2,1)'
                  }}
                >
                  <span style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: c.accent,
                    boxShadow: active ? `0 0 8px ${c.accent}` : 'none',
                    transition: 'box-shadow 0.28s'
                  }}/>
                  {c.name}
                  {disabled && (
                    <span style={{
                      fontSize: '8.5px', fontWeight: 700, letterSpacing: '0.08em',
                      textTransform: 'uppercase', opacity: 0.8,
                      background: 'rgba(0,0,0,0.08)', borderRadius: '999px',
                      padding: '2px 7px', marginLeft: '2px'
                    }}>em breve</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CABEÇALHO DA MARCA + FILTROS */}
      <div style={{
        background: brand.bg, color: brand.text,
        padding: '32px 28px'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '30px', fontWeight: 600, margin: 0, letterSpacing: '-0.03em' }}>
                {brand.name}
              </h2>
              <p style={{ fontSize: '13px', opacity: 0.7, margin: '4px 0 0 0' }}>
                {brand.tagline}
              </p>
            </div>
            <div style={{ fontSize: '11px', opacity: 0.6 }}>
              {(() => {
                const labels = { noticia: 'notícia', comercial: 'comercial', carrossel: 'carrossel', campanha: 'campanha' };
                const parts = ['noticia', 'comercial', 'carrossel', 'campanha']
                  .map(k => { const c = brand.posts.filter(p => p.kind === k).length; return c ? `${c} ${labels[k]}` : null; })
                  .filter(Boolean);
                return <><strong>{brand.posts.length} posts</strong>{parts.length ? ` · ${parts.join(' · ')}` : ''}</>;
              })()}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
            <span style={{ fontSize: '10px', opacity: 0.55, letterSpacing: '0.1em', alignSelf: 'center', marginRight: '6px' }}>DIA:</span>
            <button
              onClick={() => setActiveDay('all')}
              style={filterPill(activeDay === 'all')}
            >Todos</button>
            {brand.posts.map((post, i) => (
              <button
                key={i}
                onClick={() => setActiveDay(i.toString())}
                style={filterPill(activeDay === i.toString())}
              >
                {post.day}{i === 3 ? ' (S2)' : ''}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <span style={{ fontSize: '10px', opacity: 0.55, letterSpacing: '0.1em', alignSelf: 'center', marginRight: '6px' }}>TIPO:</span>
            {[
              { k: 'all', label: 'Todos' },
              { k: 'noticia', label: 'Notícia' },
              { k: 'comercial', label: 'Comercial' },
              { k: 'carrossel', label: 'Carrossel' },
              { k: 'campanha', label: 'Campanha' }
            ].map(({ k, label }) => (
              <button
                key={k}
                onClick={() => setActiveKind(k)}
                style={filterPill(activeKind === k)}
              >{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* GRID DE POSTS */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 28px' }}>
        {posts.length === 0 ? (
          <div style={{
            background: '#FFFFFF', borderRadius: '14px', padding: '36px',
            textAlign: 'center', color: 'rgba(0,0,0,0.5)', fontSize: '14px'
          }}>
            Nenhum post para os filtros selecionados.
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: posts.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(min(100%, 420px), 1fr))',
            gap: '22px'
          }}>
            {posts.map(({ post, originalIndex }) => {
              const id = `${activeBrand}-${originalIndex}`;
              return (
                <PostCard
                  key={id}
                  post={post}
                  brand={activeBrand}
                  brandData={brand}
                  review={reviews[id]}
                  onReview={data => setReview(id, data)}
                  customSlides={creatives[id]}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* RODAPÉ */}
      <div style={{
        maxWidth: '1280px', margin: '32px auto 0 auto', padding: '20px 28px',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        fontSize: '10.5px', color: 'rgba(0,0,0,0.5)', letterSpacing: '0.03em', lineHeight: 1.6
      }}>
        Todas as notícias citadas são reais e verificáveis. Fontes: Conjur, Migalhas, Canaltech, IT Forum, Seu Dinheiro, Webmotors, Fenauto, O Tempo, Trakcar (2026). Placeholders [inserir link] devem ser substituídos antes da publicação.
      </div>
    </div>
  );
}
