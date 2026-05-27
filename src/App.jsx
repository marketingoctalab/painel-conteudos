import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Copy, Check, ArrowRight, Newspaper, Megaphone, Layers, X } from 'lucide-react';
import { supabase, supabaseReady } from './supabase';

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
            type: 'jp-cover',
            chip: 'CNJ · JUSTIÇA EM NÚMEROS 2025',
            title: '80,6 milhões',
            subtitle: 'de processos parados.',
            body: 'O Judiciário brasileiro fechou 2024 baixando 44,8 milhões — e ainda assim acumulou estoque recorde. A conta não fecha sem IA.'
          },
          {
            type: 'jp-numbered',
            number: '01',
            title: 'O dado que ninguém comenta',
            body: 'Se a Justiça parasse de receber novas ações hoje, levaria quase 2 anos para limpar só o estoque atual. O esforço manual não dobra a curva. A matemática não permite.'
          },
          {
            type: 'jp-numbered',
            number: '02',
            title: 'O CNJ já abriu o caminho',
            body: 'A Resolução 615/2025 reconhece a IA como ferramenta auxiliar legítima para automação de serviços acessórios e suporte à decisão — desde que com supervisão humana qualificada.'
          },
          {
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
          type: 'oct-news',
          chip: '"SAASPOCALIPSE" · FEV/2026',
          title: 'Mercado de SaaS viveu',
          highlight: 'a maior queda em 30 anos.',
          subline: 'Investidores correram após o salto dos agentes autônomos de IA. O software tradicional virou pergunta.',
          source: 'Seu Dinheiro · fevereiro de 2026',
          cta: 'LEIA A LEGENDA'
        },
        caption: `Em fevereiro de 2026 o mercado batizou o evento de "SaaSpocalipse": ações de empresas de software como serviço despencaram. O gatilho foi a maturação de agentes autônomos de IA capazes de executar fluxos de trabalho inteiros — não só conversar sobre eles.

A Deloitte projeta que o mercado de agentes autônomos pode chegar a US$ 8,5 bilhões em 2026 e US$ 35 bilhões em 2030. O Gartner é mais cauteloso: 40% dos projetos serão cancelados até 2027 — mas 60% chegam à produção. Em 2026, a pergunta deixou de ser "vamos usar agentes?" e virou "qual processo já está pronto?".

O recado do mercado é claro: software de prateleira que apenas espera o humano clicar virou commodity. O valor migra para sistemas que decidem e executam.

Por isso a Octalab nasceu como casa de produtos AI-Native. Não é software com IA acoplada. É software onde IA é a base:

— Modelos multimodais por padrão
— Agentes com ferramentas just-in-time
— Embeddings e RAG em produção

Construímos, operamos e somos donos dos produtos: Octamind.ai, PlacaPay, JusPilot, Ecosys Auto, Sonar e mais.

We build tomorrow's tech.

Conheça em [inserir link]

— Octalab.ai`
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
          type: 'oct-news',
          chip: 'TRANSFORMAÇÃO AGÊNTICA',
          title: 'Empresa cresce 33%',
          highlight: 'trocando software passivo por agentes de IA.',
          subline: 'Time-to-market caiu mais de 50%. A Zappts virou caso real do que muita empresa ainda discute em comitê.',
          source: 'IT Forum · maio de 2026',
          cta: 'LEIA A LEGENDA'
        },
        caption: `A Zappts cresceu 33% depois de substituir softwares passivos por agentes autônomos de IA na própria operação. Time-to-market dos projetos caiu mais de 50%. (IT Forum, mai/2026)

O CEO Pablo Augusto resumiu bem: "Não se trata só de automatizar tarefas, mas de delegar decisão e execução de processos críticos para agentes que operam com autonomia, governança e escalabilidade."

A diferença é categórica:

— Software passivo = espera instrução, executa, devolve.
— Agente autônomo = recebe objetivo, decide o caminho, executa de ponta a ponta.

Para chegar lá, a Zappts teve que criar um Agentic Transformation Office, contratar 47% mais profissionais de dados e IA, e estabelecer governança. Não é trivial.

E é exatamente esse o trabalho da Octalab. Construir produtos que já nascem assim — sem precisar do ATO interno, sem precisar formar time de IA do zero, sem precisar refazer arquitetura.

Nossas soluções já operam com:
→ Modelos multimodais por padrão
→ Observabilidade nativa
→ RLS multi-tenant obrigatório
→ Operação 24/7 em produção

Donos. Operadores. Construtores.

Conheça em [inserir link]

— Octalab.ai`
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
            type: 'oct-manifesto',
            line1: 'IA não é',
            line2: 'feature.',
            line3: 'É base.'
          },
          {
            type: 'oct-light-card',
            number: '01 / 03',
            title: 'O dado',
            body: 'Investimentos em IA no Brasil ultrapassam US$ 3,4 bilhões em 2026, crescendo +30% ao ano. 78% das empresas ampliarão investimentos. (IDC / IBM)\n\nE 47% dos profissionais já usam IA "por fora" — sem aprovação oficial. Shadow AI virou padrão. O mercado sabe que precisa.'
          },
          {
            type: 'oct-dark-card',
            number: '02 / 03',
            title: 'O problema',
            body: 'A maioria ainda trata IA como camada. Plugin em CRM. Botão de "resumir" no editor. Chat lateral. Quando o agente autônomo aparece, vira retrabalho de arquitetura.\n\nSoftware passivo + IA acoplada = dívida técnica disfarçada.'
          },
          {
            type: 'oct-signature',
            line1: 'AI-Native',
            line2: 'não é estilo.',
            line3: 'É arquitetura.',
            cta: 'Conheça nossas soluções'
          }
        ],
        caption: `Em 2026 o investimento em IA no Brasil ultrapassa US$ 3,4 bilhões — crescendo mais de 30% ao ano. (IDC)

78% das empresas planejam ampliar (IBM). 47% dos profissionais já usam IA sem aprovação formal — o "Shadow AI". (Pesquisa Abiacom)

O mercado entendeu que precisa de IA. Mas a maioria está implementando errado: acoplando IA a softwares passivos legados. Quando o agente autônomo entra em cena, vira retrabalho.

Por isso a Octalab opera como casa de produtos AI-Native. Cada produto nasce com:

→ Modelos multimodais por padrão
→ Agentes com ferramentas just-in-time
→ Embeddings e RAG em produção
→ Observabilidade nativa
→ RLS multi-tenant obrigatório
→ Roadmap guiado por dados

Não é "tem IA". É "é IA".

Nossas soluções: Octamind.ai, PlacaPay, Octagym.ai, Octalife.ai, Octalk.ai, Octabuild.ai, JusPilot, Ecosys Auto, Sonar.

We build tomorrow's tech.

Conheça em [inserir link]

— Octalab.ai`
      },

      // ───────── DIA 4 — SEXTA (COMERCIAL) ─────────
      {
        day: 'Sexta',
        date: 'Sex • Semana 2',
        kind: 'comercial',
        theme: 'Anúncio institucional — casa de produtos',
        format: 'Post estático — capa única',
        slide: {
          type: 'oct-comercial',
          line1: 'Não somos agência.',
          line2: 'Não somos consultoria.',
          line3: 'Não vendemos hora.',
          divider: 'Somos casa de produtos.',
          cta: 'LEIA A LEGENDA'
        },
        caption: `A Octalab nasceu de oito pessoas com um objetivo claro: criar softwares próprios que realmente transformam indústrias.

Não somos agência. Não somos consultoria. Não vendemos hora.

Somos casa de produtos AI-Native. Construímos, lançamos, operamos e somos donos do que entregamos ao mercado.

Oito mentes. Quatro obsessões:

— AI-Native: IA não é feature, é base.
— Velocidade: da ideia ao deploy antes do mercado.
— Escala: pensado para crescer desde o primeiro commit.
— Ownership: operação 24/7 em produção, roadmap guiado por dados.

Nossas soluções: Octamind.ai, PlacaPay, Octagym.ai, Octalife.ai, Octalk.ai, Octabuild.ai, JusPilot, Ecosys Auto, Sonar.

Donos. Operadores. Construtores.

We build tomorrow's tech.

Conheça em [inserir link]

— Octalab.ai`
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

// ============================================================
// ROTEADORES E COMPONENTES VISUAIS
// ============================================================

function renderSlide(slide, brand) {
  if (brand === 'juspilot') return <JusPilotRender slide={slide} />;
  if (brand === 'octalab') return <OctalabRender slide={slide} />;
  if (brand === 'ecosys') return <EcosysRender slide={slide} />;
}

function Carousel({ slides, brand }) {
  const [index, setIndex] = useState(0);
  const total = slides.length;
  return (
    <div>
      <div style={{ position: 'relative', maxWidth: '460px', margin: '0 auto' }}>
        {renderSlide(slides[index], brand)}
        <button
          onClick={() => setIndex((index - 1 + total) % total)}
          style={{
            position: 'absolute', left: '-18px', top: '50%', transform: 'translateY(-50%)',
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <ChevronLeft size={16} color="#000" />
        </button>
        <button
          onClick={() => setIndex((index + 1) % total)}
          style={{
            position: 'absolute', right: '-18px', top: '50%', transform: 'translateY(-50%)',
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.95)', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <ChevronRight size={16} color="#000" />
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
    noticia: { label: 'NOTÍCIA · DESCOBERTA', icon: <Newspaper size={11} />, bg: '#0a0a0a', color: '#fafafa' },
    comercial: { label: 'COMERCIAL · ANÚNCIO', icon: <Megaphone size={11} />, bg: '#16a34a', color: '#fff' },
    carrossel: { label: 'CARROSSEL · NOTÍCIA DESDOBRADA', icon: <Layers size={11} />, bg: '#7c3aed', color: '#fff' }
  };
  const v = map[kind];
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      background: v.bg, color: v.color,
      padding: '4px 9px', borderRadius: '4px',
      fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.07em'
    }}>
      {v.icon} {v.label}
    </div>
  );
}

function PostCard({ post, brand, brandData, review, onReview }) {
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
            background: brandData.bg, color: brandData.text,
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
        <div style={{ fontSize: '11.5px', color: 'rgba(0,0,0,0.5)' }}>
          {post.format}{post.sourceLabel ? ` · ${post.sourceLabel}` : ''}
        </div>
      </div>

      {post.kind === 'carrossel' ? (
        <Carousel slides={post.slides} brand={brand} />
      ) : (
        <div style={{ maxWidth: '460px', margin: '0 auto' }}>
          {renderSlide(post.slide, brand)}
        </div>
      )}

      <div style={{ marginTop: '22px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{ fontSize: '10.5px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(0,0,0,0.5)' }}>
            Legenda
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => setShowCaption(!showCaption)}
              style={{
                background: 'none', border: '1px solid rgba(0,0,0,0.15)',
                borderRadius: '6px', padding: '5px 10px',
                fontSize: '11px', cursor: 'pointer', color: '#0a0a0a'
              }}
            >
              {showCaption ? 'Esconder' : 'Ver completa'}
            </button>
            <button
              onClick={copy}
              style={{
                background: copied ? '#10b981' : '#0a0a0a',
                color: '#fff', border: 'none',
                borderRadius: '6px', padding: '5px 10px',
                fontSize: '11px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '5px'
              }}
            >
              {copied ? <><Check size={11} /> Copiado</> : <><Copy size={11} /> Copiar</>}
            </button>
          </div>
        </div>
        <div style={{
          fontSize: '13px', lineHeight: 1.6, color: 'rgba(0,0,0,0.78)',
          whiteSpace: 'pre-wrap', fontFamily: 'system-ui, sans-serif',
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
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#ecfdf5', color: '#047857',
            borderRadius: '8px', padding: '12px 14px',
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
            background: '#fef2f2', color: '#b91c1c',
            borderRadius: '8px', padding: '12px 14px'
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
                  background: 'none', border: '1px solid rgba(0,0,0,0.15)',
                  borderRadius: '8px', padding: '9px 16px',
                  fontSize: '12.5px', fontWeight: 600, cursor: 'pointer', color: '#0a0a0a'
                }}
              >Cancelar</button>
              <button
                onClick={() => { onReview({ status: 'reproved', suggestion: draft.trim() }); setShowReproveBox(false); setDraft(''); }}
                disabled={draft.trim() === ''}
                style={{
                  background: draft.trim() === '' ? 'rgba(0,0,0,0.12)' : '#dc2626',
                  color: draft.trim() === '' ? 'rgba(0,0,0,0.4)' : '#fff',
                  border: 'none', borderRadius: '8px', padding: '9px 16px',
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
                flex: 1, background: '#16a34a', color: '#fff',
                border: 'none', borderRadius: '8px', padding: '12px',
                fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px'
              }}
            >
              <Check size={15} /> Aprovar
            </button>
            <button
              onClick={() => setShowReproveBox(true)}
              style={{
                flex: 1, background: '#fff', color: '#dc2626',
                border: '1px solid rgba(220,38,38,0.4)', borderRadius: '8px', padding: '12px',
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

// ============================================================
// APP PRINCIPAL
// ============================================================

export default function App() {
  const [view, setView] = useState('landing');
  const [activeBrand, setActiveBrand] = useState('juspilot');
  const [activeDay, setActiveDay] = useState('all');
  const [activeKind, setActiveKind] = useState('all');
  const [reviews, setReviews] = useState({}); // { 'juspilot-0': { status, suggestion } }

  // Carrega as avaliações do Supabase e escuta mudanças em tempo real
  useEffect(() => {
    if (!supabaseReady) return;
    let mounted = true;

    supabase.from('reviews').select('*').then(({ data, error }) => {
      if (!mounted || error || !data) return;
      const map = {};
      data.forEach(r => { map[r.id] = { status: r.status, suggestion: r.suggestion || '' }; });
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
            next[r.id] = { status: r.status, suggestion: r.suggestion || '' };
          }
          return next;
        });
      })
      .subscribe();

    return () => { mounted = false; supabase.removeChannel(channel); };
  }, []);

  const setReview = async (id, data) => {
    // Atualização otimista na tela
    setReviews(prev => ({ ...prev, [id]: { ...prev[id], ...data } }));
    if (!supabaseReady) return;
    await supabase.from('reviews').upsert({
      id,
      status: data.status,
      suggestion: data.suggestion ?? '',
      updated_at: new Date().toISOString()
    });
  };

  const resetReviews = async () => {
    if (!window.confirm('Tem certeza? Isso vai apagar TODAS as aprovações e reprovações.')) return;
    setReviews({});
    if (!supabaseReady) return;
    await supabase.from('reviews').delete().neq('id', '');
  };

  const brand = clients[activeBrand];
  let posts = brand.posts.map((post, i) => ({ post, originalIndex: i }));
  if (activeDay !== 'all') posts = posts.filter(({ originalIndex }) => originalIndex === parseInt(activeDay));
  if (activeKind !== 'all') posts = posts.filter(({ post }) => post.kind === activeKind);

  // ─── TELA INICIAL ───
  if (view === 'landing') {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: '#fafafa',
        fontFamily: 'Geist, -apple-system, BlinkMacSystemFont, system-ui, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '24px'
      }}>
        <div style={{ fontSize: '11px', letterSpacing: '0.3em', opacity: 0.5, marginBottom: '24px', fontWeight: 600 }}>
          4 DIAS · 3 MARCAS
        </div>
        <h1 style={{
          fontSize: 'clamp(48px, 9vw, 104px)',
          fontWeight: 600,
          margin: 0,
          letterSpacing: '-0.04em',
          lineHeight: 1.02
        }}>
          Painel de Conteúdos
        </h1>
        <p style={{ fontSize: '15px', opacity: 0.55, marginTop: '20px', maxWidth: '480px', lineHeight: 1.6 }}>
          Notícia, descoberta e venda. Cada um no seu lugar.
        </p>
        <button
          onClick={() => setView('content')}
          style={{
            marginTop: '40px',
            background: '#fafafa',
            color: '#0a0a0a',
            border: 'none',
            borderRadius: '999px',
            padding: '15px 30px',
            fontSize: '15px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '9px',
            transition: 'transform 0.15s ease'
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          Ver conteúdos <ArrowRight size={17} />
        </button>
        <button
          onClick={() => setView('admin')}
          style={{
            marginTop: '20px', background: 'none', border: 'none',
            color: '#fafafa', opacity: 0.4, fontSize: '12px',
            cursor: 'pointer', textDecoration: 'underline'
          }}
        >
          Painel admin
        </button>
      </div>
    );
  }

  // ─── PAINEL ADMIN ───
  if (view === 'admin') {
    const allItems = Object.entries(clients).flatMap(([brandKey, c]) =>
      c.posts.map((post, i) => {
        const id = `${brandKey}-${i}`;
        const r = reviews[id] || {};
        return {
          id, brandKey, brandName: c.name, accent: c.accent,
          theme: post.theme, kind: post.kind, day: post.day,
          status: r.status || 'pending',
          suggestion: r.suggestion || ''
        };
      })
    );
    const total = allItems.length;
    const approved = allItems.filter(it => it.status === 'approved').length;
    const reproved = allItems.filter(it => it.status === 'reproved').length;
    const pending = allItems.filter(it => it.status === 'pending').length;

    const statusBadge = (status) => {
      const map = {
        approved: { label: 'Aprovado', bg: '#dcfce7', color: '#166534' },
        reproved: { label: 'Reprovado', bg: '#fee2e2', color: '#b91c1c' },
        pending: { label: 'Pendente', bg: '#f1f5f9', color: '#64748b' }
      };
      const v = map[status];
      return (
        <span style={{
          background: v.bg, color: v.color,
          padding: '3px 10px', borderRadius: '999px',
          fontSize: '11px', fontWeight: 700, whiteSpace: 'nowrap'
        }}>{v.label}</span>
      );
    };

    const Stat = ({ label, value, color }) => (
      <div style={{
        background: '#FFFFFF', borderRadius: '14px', padding: '20px 24px',
        border: '1px solid rgba(0,0,0,0.06)', flex: 1, minWidth: '140px'
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
              onClick={() => setView('content')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#fafafa', opacity: 0.55,
                display: 'inline-flex', alignItems: 'center', gap: '5px',
                fontSize: '12px', fontWeight: 500, padding: 0, marginBottom: '18px'
              }}
            >
              <ChevronLeft size={14} /> Voltar aos conteúdos
            </button>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '34px', fontWeight: 600, margin: 0, letterSpacing: '-0.03em' }}>
                Painel Admin
              </h1>
              <button
                onClick={resetReviews}
                style={{
                  background: 'transparent', color: '#fca5a5',
                  border: '1px solid rgba(252,165,165,0.4)', cursor: 'pointer',
                  borderRadius: '8px', padding: '9px 16px',
                  fontSize: '12.5px', fontWeight: 600,
                  display: 'inline-flex', alignItems: 'center', gap: '7px'
                }}
              >
                <X size={14} /> Resetar avaliações
              </button>
            </div>
            <p style={{ fontSize: '13.5px', opacity: 0.6, marginTop: '8px' }}>
              Status de aprovação e comentários de cada conteúdo.
            </p>
          </div>
        </div>

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px' }}>
          {/* RESUMO */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '32px' }}>
            <Stat label="Total" value={total} color="#0a0a0a" />
            <Stat label="Aprovados" value={approved} color="#16a34a" />
            <Stat label="Reprovados" value={reproved} color="#dc2626" />
            <Stat label="Pendentes" value={pending} color="#64748b" />
          </div>

          {/* LISTA POR MARCA */}
          {Object.entries(clients).map(([brandKey, c]) => {
            const items = allItems.filter(it => it.brandKey === brandKey);
            return (
              <div key={brandKey} style={{ marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.accent }} />
                  <h2 style={{ fontSize: '18px', fontWeight: 700, margin: 0, letterSpacing: '-0.01em' }}>{c.name}</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {items.map(it => (
                    <div key={it.id} style={{
                      background: '#FFFFFF', borderRadius: '12px',
                      border: '1px solid rgba(0,0,0,0.06)', padding: '16px 18px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
                        <div>
                          <div style={{ fontSize: '11px', color: 'rgba(0,0,0,0.45)', fontWeight: 600, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {it.day} · {it.kind}
                          </div>
                          <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#0a0a0a', lineHeight: 1.35 }}>
                            {it.theme}
                          </div>
                        </div>
                        {statusBadge(it.status)}
                      </div>
                      {it.status === 'reproved' && it.suggestion && (
                        <div style={{
                          marginTop: '12px', background: '#fef2f2', borderRadius: '8px',
                          padding: '10px 12px', fontSize: '12.5px', color: 'rgba(0,0,0,0.7)',
                          lineHeight: 1.5, whiteSpace: 'pre-wrap'
                        }}>
                          <strong style={{ color: '#b91c1c' }}>Comentário:</strong> {it.suggestion}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
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
              onClick={() => setView('landing')}
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
              onClick={() => setView('admin')}
              style={{
                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer', color: '#fafafa',
                borderRadius: '999px', padding: '7px 14px',
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
              return (
                <button
                  key={key}
                  onClick={() => { setActiveBrand(key); setActiveDay('all'); setActiveKind('all'); }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.45)'; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                  style={{
                    background: active ? 'rgba(255,255,255,0.85)' : 'transparent',
                    backdropFilter: active ? 'blur(10px) saturate(180%)' : 'none',
                    WebkitBackdropFilter: active ? 'blur(10px) saturate(180%)' : 'none',
                    color: active ? '#0a0a0a' : 'rgba(0,0,0,0.55)',
                    border: active ? '1px solid rgba(255,255,255,0.9)' : '1px solid transparent',
                    cursor: 'pointer',
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
              <strong>4 posts</strong> · 2 notícia · 1 comercial · 1 carrossel
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
            <span style={{ fontSize: '10px', opacity: 0.55, letterSpacing: '0.1em', alignSelf: 'center', marginRight: '6px' }}>DIA:</span>
            <button
              onClick={() => setActiveDay('all')}
              style={{
                background: activeDay === 'all' ? brand.accent : 'transparent',
                color: activeDay === 'all' ? brand.bg : brand.text,
                border: `1px solid ${activeDay === 'all' ? brand.accent : 'rgba(255,255,255,0.18)'}`,
                borderRadius: '999px', padding: '5px 12px',
                fontSize: '11px', fontWeight: 600, cursor: 'pointer'
              }}
            >Todos</button>
            {brand.posts.map((post, i) => (
              <button
                key={i}
                onClick={() => setActiveDay(i.toString())}
                style={{
                  background: activeDay === i.toString() ? brand.accent : 'transparent',
                  color: activeDay === i.toString() ? brand.bg : brand.text,
                  border: `1px solid ${activeDay === i.toString() ? brand.accent : 'rgba(255,255,255,0.18)'}`,
                  borderRadius: '999px', padding: '5px 12px',
                  fontSize: '11px', fontWeight: 600, cursor: 'pointer'
                }}
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
              { k: 'carrossel', label: 'Carrossel' }
            ].map(({ k, label }) => (
              <button
                key={k}
                onClick={() => setActiveKind(k)}
                style={{
                  background: activeKind === k ? brand.accent : 'transparent',
                  color: activeKind === k ? brand.bg : brand.text,
                  border: `1px solid ${activeKind === k ? brand.accent : 'rgba(255,255,255,0.18)'}`,
                  borderRadius: '999px', padding: '5px 12px',
                  fontSize: '11px', fontWeight: 600, cursor: 'pointer'
                }}
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
            gridTemplateColumns: posts.length === 1 ? '1fr' : 'repeat(auto-fit, minmax(420px, 1fr))',
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
