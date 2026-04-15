#!/usr/bin/env sh
set -e

echo "==> Instalando dependências"
npm install

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Arquivo .env criado. Preencha as credenciais do Firebase antes de testar autenticação."
fi

echo "==> Inicializando Git local"
if [ ! -d .git ]; then
  git init
  git branch -M main
fi

git add -A
git commit -m "chore: estrutura inicial do app de academia" || true

echo "==> GitHub CLI"
if command -v gh >/dev/null 2>&1; then
  gh auth status || gh auth login
  if ! git remote get-url origin >/dev/null 2>&1; then
    gh repo create pwa-academia --public --source=. --remote=origin --push
  else
    git push -u origin main
  fi
else
  echo "GitHub CLI não encontrado. Instale antes de continuar."
fi

echo "==> Firebase"
npx firebase-tools login
npx firebase-tools init hosting firestore
npm run build

echo "Setup concluído. Para publicar: npx firebase-tools deploy"
