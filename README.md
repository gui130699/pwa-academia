# PWA Academia

Aplicação inicial de academia online com foco em autenticação, cadastro e aprovação de contas para aluno e professor.

## Stack

- React + Vite + TypeScript
- Firebase Authentication
- Cloud Firestore
- Firebase Hosting
- React Router
- Context API
- CSS responsivo em português do Brasil
- Git + GitHub CLI

## Funcionalidades desta etapa

- Login com e-mail e senha
- Cadastro com separação entre aluno e professor
- Recuperação de senha
- Envio automático de verificação por e-mail
- Persistência dos dados extras no Firestore
- Bloqueio de acesso quando o e-mail não foi confirmado
- Bloqueio de acesso enquanto a conta estiver pendente de aprovação
- Dashboard temporário com informações do usuário

## Estrutura principal

```text
src/
  components/
  context/
  firebase/
  hooks/
  pages/
  routes/
  services/
  styles/
  types/
  utils/
```

## Variáveis de ambiente

Copie o arquivo .env.example para .env e preencha com os dados do seu projeto Firebase:

```bash
cp .env.example .env
```

No Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

## Instalação

```bash
npm install
npm run dev
```

## Scripts úteis

```bash
npm run dev
npm run build
npm run preview
npm run typecheck
npm run setup:win
npm run setup:unix
npm run firebase:login
npm run firebase:init
npm run firebase:deploy
npm run github:create
```

## Fluxo de Git e GitHub CLI

1. Faça login no GitHub CLI:

```bash
gh auth login
```

2. Inicie o Git localmente:

```bash
git init
git branch -M main
git add -A
git commit -m "chore: estrutura inicial do app de academia"
```

3. Crie o repositório remoto público e envie a branch principal:

```bash
gh repo create pwa-academia --public --source=. --remote=origin --push
```

## Fluxo Firebase

1. Faça login:

```bash
npx firebase-tools login
```

2. Crie ou selecione um projeto no console do Firebase.

3. Ative manualmente no console:
   - Authentication com provedor E-mail/Senha
   - Firestore Database
   - Hosting

4. Inicialize no terminal:

```bash
npx firebase-tools init hosting firestore
```

Sugestão durante o init:
- public directory: dist
- single-page app: yes
- automatic builds with GitHub: no, por enquanto

5. Faça o deploy:

```bash
npm run build
npx firebase-tools deploy
```

## Firestore esperado

Coleção: usuarios

Aluno:

```json
{
  "uid": "string",
  "tipoConta": "aluno",
  "nomeCompleto": "string",
  "telefone": "string",
  "dataNascimento": "string",
  "email": "string",
  "emailVerificado": false,
  "statusAprovacao": "pendente",
  "criadoEm": "timestamp"
}
```

Professor:

```json
{
  "uid": "string",
  "tipoConta": "professor",
  "nomeCompleto": "string",
  "telefone": "string",
  "dataNascimento": "string",
  "email": "string",
  "credencialProfissional": "string",
  "ufCredencial": "string",
  "credencialValidada": false,
  "emailVerificado": false,
  "statusAprovacao": "pendente",
  "criadoEm": "timestamp"
}
```

## Observações importantes

- A aprovação inicial do usuário fica como pendente até ajuste manual no Firestore.
- Para liberar o acesso ao dashboard, altere o campo statusAprovacao para aprovado no documento do usuário.
- A validação automática de credencial do professor ficou preparada para integração futura.
- Se o app mostrar falhas de autenticação antes da configuração, basta preencher o arquivo .env.

## Guia rápido

Consulte também o arquivo SETUP_PASSO_A_PASSO.md para a ordem exata de execução dentro do VS Code.

