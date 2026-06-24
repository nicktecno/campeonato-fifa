# Campeonato Churrasquinho FIFA

Aplicação Next.js para campeonatos com fase de grupos + mata-mata (EA FC 26).

## Funcionalidades

- Criação de campeonato com inscrição individual de jogadores
- Escolha de **Clubes** ou **Seleções** (top 10 EA FC 26)
- Avatar com zoom e recorte
- Fase de grupos + mata-mata automático
- Edição de jogadores durante inscrições
- Persistência com **Neon PostgreSQL** (ou memória local sem config)

## Como rodar

```bash
npm install
npm run dev
```

## Configurar Neon (recomendado)

1. Crie um projeto em [neon.tech](https://neon.tech)
2. No **SQL Editor**, execute o conteúdo de `db/schema.sql`
3. Copie a connection string e crie `.env.local`:

```bash
cp .env.example .env.local
# Edite DATABASE_URL com sua connection string do Neon
```

4. Reinicie o servidor: `npm run dev`

Sem `DATABASE_URL`, o app usa memória local (dados somem ao reiniciar).

## Deploy (Vercel)

Adicione a variável `DATABASE_URL` nas Environment Variables do projeto.

## Tecnologias

- Next.js 15 (App Router)
- TypeScript + Tailwind CSS
- Neon PostgreSQL (`@neondatabase/serverless`)
