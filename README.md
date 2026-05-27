# Bus en direct (Grand Lyon)

Carte OpenStreetMap (Leaflet) affichant les positions en temps réel des véhicules TCL via l’API SIRI-Lite de Grand Lyon.

## Stack

- React + TypeScript (Vite)
- Leaflet + react-leaflet
- Tuiles OpenStreetMap
- MUI
- **Netlify Functions** : proxy serveur vers l’API (auth Basic, pas d’exposition des identifiants dans le navigateur)

## Configuration locale

1. Copier `.env.example` vers `.env` :

```bash
GRANDLYON_USER=votre_email
GRANDLYON_PASSWORD=votre_mot_de_passe
```

2. Installer et lancer :

```bash
npm install
npm run dev
```

Le serveur écoute sur **toutes les interfaces** (`0.0.0.0`). Au démarrage, Vite affiche les URLs réseau, par ex. :

- `http://localhost:5173`
- `http://192.168.x.x:5173` (depuis un autre appareil sur le même réseau Wi‑Fi)

Le front appelle `/api/siri/vehicle-monitoring.json`. En dev, Vite proxifie vers Grand Lyon. Avec Netlify en local :

```bash
npm run dev:netlify
```

→ http://localhost:8888 (proxy Netlify + Functions)

**Accès par IP sur le réseau local :** utiliser `npm run dev` (pas `dev:netlify`) — Vite écoute sur `0.0.0.0:5173` avec le proxy API. La commande `netlify dev` ne propose pas l’option `--host` ; pour un accès distant avec les Functions, utiliser `netlify dev --live` (tunnel public Netlify).

**Pare-feu :** autoriser le port 5173 (ou 8888) si un autre appareil ne peut pas se connecter.

## Déploiement Netlify

### Pourquoi une Function ?

L’API `data.grandlyon.com` ne peut pas être appelée directement depuis le navigateur en production (CORS + identifiants). Une **Netlify Function** (`netlify/functions/vehicle-monitoring.ts`) appelle l’endpoint côté serveur ; `netlify.toml` réécrit `/api/siri/vehicle-monitoring.json` vers cette function.

### Étapes

1. Pousser le dépôt sur GitHub/GitLab et connecter le site à Netlify.
2. Build settings (déjà dans `netlify.toml`) :
   - **Build command** : `npm run build`
   - **Publish directory** : `dist`
3. Dans **Site configuration → Environment variables**, ajouter :
   - `GRANDLYON_USER` — email du compte API
   - `GRANDLYON_PASSWORD` — mot de passe API
4. Déployer.

Le front utilise toujours le chemin relatif `/api/siri/vehicle-monitoring.json` ; aucune modification n’est nécessaire entre dev et prod.

## Fonctionnalités

- Marqueurs avec numéro de ligne (ex. `52` depuis `ActIV:Line::52:SYTRAL`)
- Filtre par ligne + centrage carte sur le(s) bus sélectionné(s)
- Rafraîchissement automatique (intervalle configurable dans `App.tsx`)
