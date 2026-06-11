# 🥟 O'SAMBOUSSA — Site officiel

> Le vrai goût des Comores 🇰🇲 — Samboussas artisanaux comoriens, livraison partout en France.

Site React + Vite premium, prêt à lancer en local et à déployer sur Vercel.

---

## 🚀 Lancer le projet sur ton ordinateur

### 1. Installer Node.js
Si ce n'est pas déjà fait, télécharge et installe **Node.js (LTS)** depuis [nodejs.org](https://nodejs.org).

Vérifie l'installation dans le terminal :
```bash
node -v
npm -v
```

### 2. Ouvrir le dossier dans VS Code
Ouvre VS Code → `Fichier` → `Ouvrir le dossier` → sélectionne le dossier `osamboussa`.

### 3. Installer les dépendances
Dans le terminal de VS Code (`Terminal` → `Nouveau Terminal`) :
```bash
npm install
```

Cela télécharge React, Vite et tout ce qu'il faut (≈ 1-2 min).

### 4. Lancer le site en local
```bash
npm run dev
```

Le site s'ouvre sur **http://localhost:5173** 🎉

Tu peux modifier `src/App.jsx`, sauvegarder, et la page se rafraîchit automatiquement.

---

## 🌍 Déployer sur Vercel (GRATUIT)

### Option A — Via GitHub (recommandée)

1. Crée un compte sur [github.com](https://github.com)
2. Crée un nouveau "repository" appelé `osamboussa`
3. Dans ton terminal, à la racine du dossier :
   ```bash
   git init
   git add .
   git commit -m "Premier upload"
   git branch -M main
   git remote add origin https://github.com/TON_USERNAME/osamboussa.git
   git push -u origin main
   ```
4. Va sur [vercel.com](https://vercel.com), inscris-toi avec GitHub
5. Clique **"Add New Project"** → sélectionne `osamboussa` → **"Deploy"**
6. ✅ Ton site est en ligne en 1 minute !

### Option B — Direct via terminal (sans GitHub)

```bash
npm install -g vercel
vercel
```
Suis les instructions, c'est tout.

---

## 📁 Structure du projet

```
osamboussa/
├── index.html              ← HTML principal
├── package.json            ← Dépendances
├── vite.config.js          ← Config Vite
├── vercel.json             ← Config Vercel
├── public/
│   └── favicon.svg         ← Icône onglet navigateur
└── src/
    ├── main.jsx            ← Point d'entrée React
    └── App.jsx             ← TOUT le site (à modifier ici)
```

---

## ✏️ Modifier le site

Tout le code du site est dans **`src/App.jsx`**.

Pour modifier :
- **Les produits** → cherche `const PRODUCTS` dans `App.jsx`
- **Les prix** → cherche `const TIERS`
- **Les avis clients** → cherche `const REVIEWS`
- **Le numéro de téléphone** → cherche `+33663982327`
- **L'email** → cherche `lalaprods@outlook.fr`
- **Instagram / Snapchat** → cherche `osamboussa_marseille`

---

## 🛠️ Commandes disponibles

| Commande | Action |
|---|---|
| `npm install` | Installer les dépendances (à faire 1 fois) |
| `npm run dev` | Lancer en local (dev) |
| `npm run build` | Compiler pour la production |
| `npm run preview` | Tester la version compilée en local |

---

Fait avec ❤️ aux Comores 🇰🇲
