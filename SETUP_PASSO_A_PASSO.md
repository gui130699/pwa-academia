# Setup passo a passo

## 1) Instalar dependências

No terminal do VS Code:

```powershell
npm install
```

## 2) Criar o arquivo de ambiente

```powershell
Copy-Item .env.example .env
```

Depois, preencha o arquivo .env com as credenciais do seu projeto Firebase.

## 3) Autenticar no GitHub CLI

Se ainda não tiver o GitHub CLI instalado no Windows:

```powershell
winget install --id GitHub.cli
```

Depois:

```powershell
gh auth login
```

## 4) Inicializar Git local

```powershell
git init
git branch -M main
git add -A
git commit -m "chore: estrutura inicial do app de academia"
```

## 5) Criar repositório remoto no GitHub

```powershell
gh repo create pwa-academia --public --source=. --remote=origin --push
```

## 6) Autenticar no Firebase

```powershell
npx firebase-tools login
```

## 7) Ativar serviços no console do Firebase

No painel do projeto, ative manualmente:

- Authentication > Sign-in method > Email/Password
- Firestore Database
- Hosting

## 8) Inicializar Hosting e Firestore

```powershell
npx firebase-tools init hosting firestore
```

Quando o assistente perguntar:

- public directory: dist
- configure as single-page app: yes
- set up automatic builds with GitHub: no

## 9) Rodar localmente

```powershell
npm run dev
```

## 10) Fazer deploy online

```powershell
npm run build
npx firebase-tools deploy
```
