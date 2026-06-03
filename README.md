# Bus en direct (Grand Lyon)

Carte OpenStreetMap (Leaflet) affichant les positions en temps réel des véhicules TCL (API SIRI-Lite) et l’état du trafic routier métropolitain (GeoJSON).

## Stack

- React + TypeScript (Vite)
- Leaflet + react-leaflet
- Tuiles OpenStreetMap
- MUI
- **Netlify Functions** : proxy serveur pour l’API véhicules (auth Basic, identifiants non exposés au navigateur)

## Évolutions et fonctionnalités

### Affichage des véhicules selon le mode

| Mode | Comportement |
|------|----------------|
| **Toutes les lignes** + zoom faible (&lt; 13) | **Points** colorés (`CircleMarker`) — vue d’ensemble du réseau sans surcharge visuelle |
| **Toutes les lignes** + zoom élevé (≥ 13) | **Marqueurs** complets : numéro de ligne, orientation (`bearing`), taille qui augmente progressivement avec le zoom (échelle 50 % → 100 %) |
| **Ligne(s) sélectionnée(s)** | **Marqueurs** complets à taille fixe (taille « normale »), uniquement les bus des lignes choisies ; les autres disparaissent de la carte |

La sélection des lignes est mémorisée dans le navigateur (`localStorage`, clé `tcl_selectedLines`) et réutilisée à la prochaine visite. Sélection multiple possible dans la liste déroulante.

### Couleurs selon le retard (avance / retard)

La couleur des **points** et des **marqueurs** reflète le délai SIRI (`Delay`) du véhicule :

| Situation | Couleur |
|-----------|---------|
| En avance | Bleu |
| Retard jusqu’à 2 min | Bleu → vert (dégradé) |
| Retard 2 → 4 min | Vert → jaune |
| Retard 4 → 6 min | Jaune → orange |
| Retard 6 → 10 min | Orange → rouge |
| Retard &gt; 10 min | Noir |

Une légende est affichée dans la popup de chaque véhicule.

### Couche trafic routier (GeoJSON)

Tronçons de voirie colorés selon l’état du trafic (jeu **pvotrafic**, Grand Lyon), chargés en GeoJSON et affichés sous les bus.

- **Source** : [OGC API Features — pvotrafic](https://data.grandlyon.com/fr/geoserv/ogc/features/v1/collections/metropole-de-lyon:pvo_patrimoine_voirie.pvotrafic/items?f=application%2Fgeo%2Bjson&crs=EPSG:4171&startIndex=0&sortby=gid)
- **Appel applicatif** : `/api/traffic/items` (pagination automatique, 1000 entités par page)
- **Rafraîchissement** : toutes les 60 s

| Code `etat` | Signification | Affichage carte |
|-------------|---------------|-----------------|
| `G` | Fluide | Masqué (carte allégée) |
| `V` | Circulation normale | Masqué (Vert)|
| `O` | Trafic dense | Orange |
| `R` | Congestion | Rouge |
| `N` | Non renseigné | Masqué (Gris) |
| `*` | Sans mesure | Masqué (Gris clair) |

Clic sur un tronçon : popup (libellé, état, vitesse, date de mise à jour).

### Popup véhicule

Pour chaque bus :

- Ligne
- **Destination** (`DestinationRef` → nom via `public/arrets.json`)
- **Prochain arrêt** (`MonitoredCall.StopPointRef` → nom via `arrets.json`)
- **Avance / retard** (`Delay`, formaté en texte lisible)

### Autres

- Centrage automatique sur le(s) bus filtré(s) lors d’une sélection de ligne
- Marqueurs orientés selon le cap (`bearing`)
- Proxy API véhicules : `/api/siri/vehicle-monitoring.json`

## Sources de données

| Donnée | Endpoint / fichier |
|--------|-------------------|
| Positions bus (SIRI-Lite) | `https://data.grandlyon.com/siri-lite/2.0/vehicle-monitoring.json` |
| Noms d’arrêts | `public/arrets.json` |
| Trafic routier (GeoJSON) | [pvotrafic/items](https://data.grandlyon.com/fr/geoserv/ogc/features/v1/collections/metropole-de-lyon:pvo_patrimoine_voirie.pvotrafic/items?f=application%2Fgeo%2Bjson&crs=EPSG:4171&startIndex=0&sortby=gid) |

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

**Proxies Vite (dev)** :

- `/api/siri/*` → API SIRI-Lite (auth Basic depuis `.env`)
- `/api/traffic/*` → OGC Features pvotrafic

**Netlify en local** (véhicules + redirects comme en prod) :

```bash
npm run dev:netlify
```

→ http://localhost:8888

**Accès par IP :** préférer `npm run dev` pour `http://<IP>:5173`. Autoriser le port dans le pare-feu Windows si besoin.

## Déploiement Netlify

### Pourquoi des Functions / redirects ?

Les API Grand Lyon ne sont en général pas appelables directement depuis le navigateur (CORS ; auth Basic pour SIRI). Le site utilise des chemins relatifs proxifiés côté Netlify.

| Chemin front | Rôle |
|--------------|------|
| `/api/siri/vehicle-monitoring.json` | Function `vehicle-monitoring` (auth `GRANDLYON_USER` / `GRANDLYON_PASSWORD`) |
| `/api/traffic/items` | Function `road-traffic` (proxy OGC pvotrafic, sans auth) |

### Étapes

1. Connecter le dépôt à Netlify.
2. Build (déjà dans `netlify.toml`) : `npm run build`, publish `dist`.
3. Variables d’environnement :
   - `GRANDLYON_USER`
   - `GRANDLYON_PASSWORD`
4. Déployer. En cas d’ancien build cassé (`export default "/assets/....html"`), vérifier qu’**aucun** `assetsInclude: ['**/*.html']` n’est présent dans `vite.config.ts`, puis **Clear cache and deploy**.

## Structure utile

```
src/
  api/
    vehicleMonitoring.ts   # Bus SIRI-Lite
    arrets.ts                # Index arrêts (arrets.json)
    roadTraffic.ts           # GeoJSON trafic (pagination)
  components/
    BusMap.tsx
    VehicleMarkers.tsx       # Points / marqueurs, couleurs retard
    RoadTrafficLayer.tsx     # Couche GeoJSON trafic
    LineFilter.tsx
    MapViewController.tsx
  utils/
    delayColor.ts            # Échelle couleurs retard
    trafficColor.ts          # Couleurs état voirie
netlify/functions/
  vehicle-monitoring.ts
  road-traffic.ts
public/
  arrets.json
```

## Scripts

| Commande | Description |
|----------|-------------|
| `npm run dev` | Vite + proxies API (dev rapide) |
| `npm run dev:netlify` | Netlify Dev (port 8888, proche prod) |
| `npm run build` | Build production |
| `npm run preview` | Prévisualiser le build |
