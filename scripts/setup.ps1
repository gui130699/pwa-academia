Write-Host "==> Instalando dependências" -ForegroundColor Green
npm install

if (-not (Test-Path '.env')) {
  Copy-Item '.env.example' '.env'
  Write-Host "Arquivo .env criado. Preencha as credenciais do Firebase antes de testar autenticação." -ForegroundColor Yellow
}

Write-Host "==> Inicializando Git local" -ForegroundColor Green
if (-not (Test-Path '.git')) {
  git init
  git branch -M main
}

git add -A
try {
  git commit -m "chore: estrutura inicial do app de academia" 2>$null
} catch {
  Write-Host "Nenhum novo commit criado neste momento." -ForegroundColor Yellow
}

Write-Host "==> GitHub CLI" -ForegroundColor Green
if (Get-Command gh -ErrorAction SilentlyContinue) {
  gh auth status 2>$null
  if ($LASTEXITCODE -ne 0) {
    gh auth login
  }

  git remote get-url origin 2>$null
  if ($LASTEXITCODE -ne 0) {
    gh repo create pwa-academia --public --source=. --remote=origin --push
  } else {
    git push -u origin main
  }
} else {
  Write-Host "GitHub CLI não encontrado. Instale com: winget install --id GitHub.cli" -ForegroundColor Yellow
}

Write-Host "==> Firebase" -ForegroundColor Green
npx firebase-tools login
npx firebase-tools init hosting firestore
npm run build

Write-Host "Setup concluído. Para publicar: npx firebase-tools deploy" -ForegroundColor Cyan
