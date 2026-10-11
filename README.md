# Octalab — site das marcas

Site institucional da Octalab: a casa e suas marcas (Octalab, JusPilot, OctaGym, Ecosys AUTO, OctaBuild, OctaLife, Octalk, Colmeia, VaiVender), com manifesto, identidade, paleta, tipografia, manual e arquivos para download de cada uma.

Página única e estática (`index.html`), sem framework. Os arquivos de cada marca ficam em `public/marcas/<marca>/`.

## Rodar localmente

```bash
npm install
npm run dev
```

Abre em http://localhost:5173. Uma marca específica: `?marca=octagym`.

## Espaços especiais

Algumas marcas têm uma seção extra (ex.: camisetas da OctaGym, onboarding da Octalab). Os arquivos ficam em `public/marcas/<marca>/<secao>/` e são listados em `arquivos.json` da mesma pasta — veja o `LEIA-ME.txt` lá dentro.

## Publicar

O repositório está ligado ao Vercel (projeto `painel-conteudos`): todo push na `main` publica automaticamente em https://marcas-octalab.vercel.app.
