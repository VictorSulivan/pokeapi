## Déploiement sur Vercel (React + Vite)

Ce projet utilise React avec Vite et se déploie facilement sur Vercel.

### Prérequis
- Un compte Vercel
- Git installé
- (Optionnel) Vercel CLI si vous préférez déployer depuis le terminal

### Structure du projet
- `index.html`: Entrée Vite
- `src/`: Code source React (`App.jsx`, `main.jsx`)
- `style.css`: Styles
- `vite.config.js`: Configuration Vite
- `vercel.json`: Config Vercel (headers sécurité, cache, rewrites)

### Option A — Déploiement via Git (recommandé)
1. Créez un dépôt Git (si ce n’est pas déjà fait) et poussez sur GitHub/GitLab/Bitbucket.
2. Allez sur Vercel et importez le dépôt.
3. Paramètres de build:
   - Framework: « Vite » (auto-détecté)
   - Commande d’installation: `npm ci` (ou `npm install`)
   - Commande de build: `npm run build`
   - Dossier de sortie: `dist`
4. Lancez le déploiement. Vercel servira `index.html` par défaut.

### Option B — Déploiement via Vercel CLI
1. Installez la CLI:
   ```bash
   npm i -g vercel
   ```
2. Depuis le dossier du projet:
   ```bash
   npm install
   vercel
   ```
   Répondez aux questions (projet existant ou nouveau, scope, etc.).
3. Pour un déploiement en production:
   ```bash
   vercel --prod
   ```

### Configuration (facultative) avec `vercel.json`
Un fichier `vercel.json` minimal est fourni pour définir le projet comme site statique et éviter toute étape de build. Vous pouvez l’ajuster si besoin (en-têtes, redirections, etc.).

### Variables d’environnement
Si vous utilisez des clés (par ex. pour une API), définissez-les dans Vercel:
- Vercel Dashboard → Project → Settings → Environment Variables
- En CLI:
  ```bash
  vercel env add NAME
  ```

### Dépannage
- Page blanche: vérifiez la console du navigateur pour les erreurs CORS ou de chemin.
- 404 sur assets: assurez-vous que les chemins relatifs dans `index.html` sont corrects (fichiers à la racine).
- Cache agressif: ajoutez des en-têtes via `vercel.json` si nécessaire.

### Développement local
```bash
npm install
npm run dev
```

Ensuite, ouvrez l’URL affichée (par défaut `http://localhost:5173`).

### Notes
- Les appels API passent par un proxy Vercel: `/api/pokemon/:id` → `https://pokeapi.co/api/v2/pokemon/:id`.
- Les en-têtes de sécurité (CSP, HSTS, etc.) sont définis dans `vercel.json`.

## CI/CD avec GitHub Actions + Vercel

Un workflow est fourni: `.github/workflows/vercel-deploy.yml`.

### Secrets GitHub requis
- `VERCEL_TOKEN`: token API personnel Vercel (Account Settings → Tokens)
- `VERCEL_ORG_ID`: ID d’organisation Vercel
- `VERCEL_PROJECT_ID`: ID du projet Vercel

Ajoutez ces secrets dans GitHub: Settings → Secrets and variables → Actions → New repository secret.

### Comportement du workflow
- Pull Request vers `main`: build local (`npm ci && npm run build`) puis déploiement PREVIEW sur Vercel.
- Push sur `main`: build local puis déploiement PRODUCTION sur Vercel.

Le workflow utilise Vercel CLI:
- `vercel pull` pour récupérer la config d’environnement (preview/prod)
- `vercel deploy --prebuilt` pour déployer l’artefact

### Configuration Vercel recommandée (Dashboard)
- Framework: Vite (auto)
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: `dist`
- Node.js Version: 20 (ou 18)
- Environment Variables: (aucune nécessaire par défaut)

Assurez-vous que le repo est lié au projet Vercel (Import Project → sélectionner le repo). 


