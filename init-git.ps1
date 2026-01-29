# Script d'initialisation Git pour LBP Frontend
Write-Host "🚀 Initialisation du dépôt Git pour LBP Frontend" -ForegroundColor Cyan

# Vérifier si Git est installé
try {
    $gitVersion = git --version
    Write-Host "✅ Git trouvé : $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git n'est pas installé. Installez Git depuis https://git-scm.com" -ForegroundColor Red
    exit 1
}

# Vérifier si on est dans le bon dossier
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Ce script doit être exécuté depuis le dossier lbp-frontend" -ForegroundColor Red
    exit 1
}

# Initialiser Git
Write-Host "`n📦 Initialisation du dépôt Git..." -ForegroundColor Yellow
git init

# Ajouter tous les fichiers
Write-Host "📝 Ajout des fichiers..." -ForegroundColor Yellow
git add .

# Créer le premier commit
Write-Host "💾 Création du premier commit..." -ForegroundColor Yellow
git commit -m "Initial commit: LBP Frontend - React/TypeScript application"

Write-Host "`n✅ Dépôt Git initialisé avec succès !" -ForegroundColor Green
Write-Host "`n📋 Prochaines étapes :" -ForegroundColor Cyan
Write-Host "1. Créez un dépôt sur GitHub/GitLab (sans initialiser avec README)" -ForegroundColor White
Write-Host "2. Exécutez les commandes suivantes :" -ForegroundColor White
Write-Host "   git remote add origin <URL_DE_VOTRE_DEPOT>" -ForegroundColor Gray
Write-Host "   git branch -M main" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host "`n📖 Consultez GIT_SETUP.md pour plus de détails" -ForegroundColor Cyan
