# 🚀 Guide de Configuration Git pour LBP Frontend

## 📋 Étapes pour pousser sur GitHub/GitLab

### 1️⃣ Initialiser le dépôt Git

```bash
cd lbp-frontend
git init
```

### 2️⃣ Ajouter tous les fichiers

```bash
git add .
```

### 3️⃣ Créer le premier commit

```bash
git commit -m "Initial commit: LBP Frontend - React/TypeScript application"
```

### 4️⃣ Créer un dépôt sur GitHub/GitLab

**Sur GitHub :**
1. Allez sur https://github.com/new
2. Créez un nouveau dépôt (ex: `lbp-frontend`)
3. **NE PAS** initialiser avec README, .gitignore ou licence
4. Copiez l'URL du dépôt (ex: `https://github.com/votre-username/lbp-frontend.git`)

**Sur GitLab :**
1. Allez sur https://gitlab.com/projects/new
2. Créez un nouveau projet (ex: `lbp-frontend`)
3. **NE PAS** initialiser avec README
4. Copiez l'URL du dépôt

### 5️⃣ Ajouter le remote et pousser

```bash
# Remplacez l'URL par la vôtre
git remote add origin https://github.com/votre-username/lbp-frontend.git

# Ou pour GitLab :
# git remote add origin https://gitlab.com/votre-username/lbp-frontend.git

# Pousser le code
git branch -M main
git push -u origin main
```

## 🔐 Authentification

Si vous utilisez HTTPS et que GitHub/GitLab demande un token :
1. **GitHub** : Créez un Personal Access Token (Settings > Developer settings > Personal access tokens)
2. **GitLab** : Créez un Personal Access Token (Preferences > Access Tokens)

Utilisez le token comme mot de passe lors du `git push`.

## ✅ Vérification

Après le push, vérifiez que tout est bien en ligne :
- Tous les fichiers source sont présents
- `node_modules` et `dist` sont bien ignorés
- Le README s'affiche correctement

## 📝 Commandes utiles

```bash
# Voir l'état des fichiers
git status

# Voir les fichiers ignorés
git status --ignored

# Voir l'historique des commits
git log --oneline

# Ajouter des modifications
git add .
git commit -m "Description des changements"
git push
```
