param(
  [Parameter(Mandatory = $true)]
  [string]$Email,

  [ValidateSet('aprovado', 'pendente', 'reprovado')]
  [string]$Status = 'aprovado'
)

$projectId = 'pwa-academia-gf-20260415'
$configPath = "$env:USERPROFILE\.config\configstore\firebase-tools.json"

if (-not (Test-Path $configPath)) {
  throw 'Sessão do Firebase CLI não encontrada. Execute firebase login primeiro.'
}

$json = Get-Content $configPath -Raw | ConvertFrom-Json
$token = $json.tokens.access_token
$headers = @{ Authorization = "Bearer $token" }

$response = Invoke-RestMethod -Method Get -Uri "https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents/usuarios?pageSize=100" -Headers $headers
$document = $response.documents | Where-Object { $_.fields.email.stringValue -eq $Email } | Select-Object -First 1

if (-not $document) {
  throw "Usuário não encontrado para o e-mail: $Email"
}

$body = @{ fields = @{ statusAprovacao = @{ stringValue = $Status } } } | ConvertTo-Json -Depth 6

Invoke-RestMethod -Method Patch -Uri "https://firestore.googleapis.com/v1/$($document.name)?updateMask.fieldPaths=statusAprovacao" -Headers $headers -ContentType 'application/json' -Body $body | Out-Null

Write-Host "Status atualizado com sucesso para $Email => $Status" -ForegroundColor Green
