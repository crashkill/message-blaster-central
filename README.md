# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/a640844a-a80c-4c83-9309-f5c51c35dd3c

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a640844a-a80c-4c83-9309-f5c51c35dd3c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a640844a-a80c-4c83-9309-f5c51c35dd3c) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Galatéia Sender – Automação de Mensagens WhatsApp

### Visão Geral
Aplicação full-stack que permite:
* Envio individual ou em massa de mensagens via WhatsApp Web.
* Personalização de texto com placeholders (ex.: `{nome}`).
* Upload de planilha XLSX com lista de contatos.
* Interface em React + shadcn-ui com tema claro/escuro.
* Comunicação em tempo real via Socket.io com backend Node.js.

### Instalação local
```bash
# Clonar o repositório
git clone <repo>
cd message-blaster-central

# Instalar dependências
npm i
npm --prefix server i

# Rodar desenvolvimento
# 1 – backend
npm run dev:server
# 2 – frontend
npm run dev
```
Frontend inicia por padrão em `http://localhost:8080` (ou próxima porta livre).

### Uso
1. **Escaneie o QR Code**: na primeira execução, será solicitado o login no WhatsApp Web.
2. **Compose sua mensagem**: escreva o texto (suporta `{nome}`).
3. **Envio Individual**: preencha nome/telefone e clique _Enviar_.
4. **Envio em Massa**:
   * Baixe o modelo de planilha em **Upload de Contatos**.
   * Preencha com Nome & Telefone (colunas obrigatórias).
   * Faça upload, revise a pré-visualização e clique _Enviar_.

### Segurança
* Sessão do WhatsApp é armazenada em `.wwebjs_auth/` (já no `.gitignore`).
* Origem da conexão Socket.io limitada a `localhost` durante o dev.

### Scripts úteis
| Comando | Descrição |
|---------|-----------|
| `npm run build` | build de produção (Vite) |
| `npm run dev` | inicia Vite + HMR |
| `npm run dev:server` | inicia backend com Nodemon |

---
### Changelog (últimas principais alterações)
* **SplashScreen** com animação `anime.js` (10 s).
* Efeito `TiltCard` nos principais cards (Framer Motion).
* Correção de reinício em loop do backend (Nodemon + `.wwebjs_*` ignorados).
* Suporte a envio de mensagem em massa + preview personalizado.
