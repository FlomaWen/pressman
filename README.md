# 🎮 PRESSMAN - Jeu de Dactylographie Multijoueur

Un jeu de course de dactylographie en temps réel avec WebSockets et Three.js.

## ✨ Fonctionnalités

### 🎯 Mode Solo
- Bombe 3D avec mèche qui brûle (10 secondes par mot)
- Système d'erreurs (2 erreurs = explosion)
- Personnage 3D qui marche et saute
- 350+ mots variés
- Système de combo
- Statistiques (WPM, précision)

### 🏁 Mode Multijoueur (2-4 joueurs)
- **Lobby avec système "PRÊT"**
- **4 personnages visibles simultanément** (un par joueur)
- Course de 40 mots en temps réel
- Synchronisation WebSocket
- Leaderboard avec podium
- Retour automatique au menu

## 🚀 Installation et Lancement

### Prérequis
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
npm install
```

### Démarrage
```bash
npm start
```

Puis ouvrez : **http://localhost:3000**

## 📁 Structure du Projet

```
pressman/
├── server_websocket.js      # Serveur Node.js + Socket.IO
├── package.json              # Dépendances
├── menu.html                 # Menu principal
├── index.html                # Mode solo
├── game.js                   # Logique mode solo
├── multiplayer.html          # Mode multijoueur
├── game_multiplayer.js       # Logique multijoueur (4 personnages)
└── docs/
    ├── DEPLOY_RAILWAY.md     # Guide Railway
    ├── RAILWAY_QUICK.md      # Quick start Railway
    └── TEST_LOBBY.md         # Guide de test
```

## 🎮 Comment Jouer

### Mode Solo
1. Cliquez sur "MODE SOLO"
2. Tapez les mots avant que la bombe explose
3. Attention : 2 erreurs = explosion !

### Mode Multijoueur
1. Cliquez sur "MODE COURSE"
2. Entrez votre pseudo
3. Attendez d'autres joueurs (2-4)
4. Cliquez sur "JE SUIS PRÊT"
5. La course démarre quand tous sont prêts !
6. Premier à 40 mots = gagnant 🏆

## 🎨 Personnages

4 personnages de couleurs différentes visibles en 3D :
- 🔴 **Rouge** - Joueur 1
- 🟢 **Vert** - Joueur 2
- 🔵 **Bleu** - Joueur 3
- 🟡 **Jaune** - Joueur 4

Chaque personnage a sa propre ligne de course visible simultanément !

## 🌐 Déploiement sur Railway

Le projet est 100% compatible Railway !

```bash
# Vérifier la compatibilité
node check-railway.js

# Déployer
git add .
git commit -m "update"
git push
```

Voir **DEPLOY_RAILWAY.md** pour le guide complet.

## 🔧 Configuration

### Modifier le nombre de mots (Multijoueur)
`server_websocket.js` ligne 19 :
```javascript
this.wordsToType = 40;
```

### Modifier le nombre de joueurs max
`server_websocket.js` ligne 18 :
```javascript
this.maxPlayers = 4; // 2 à 4 joueurs
```

### Modifier le temps de la bombe (Solo)
`game.js` :
```javascript
this.bombMaxTime = 10000; // millisecondes
```

## 📊 Technologies

- **Backend** : Node.js, Express, Socket.IO
- **Frontend** : HTML5, Vanilla JavaScript, Three.js
- **3D** : Three.js pour les 4 personnages et animations
- **Temps réel** : WebSockets (Socket.IO)

## 🧪 Tests

Pour tester le multijoueur localement :
1. Ouvrez 2-4 onglets
2. Allez sur `http://localhost:3000/multiplayer.html`
3. Entrez des pseudos différents
4. Cliquez sur "JE SUIS PRÊT" dans chaque onglet
5. Regardez les 4 personnages colorés courir !

Voir **TEST_LOBBY.md** pour les scénarios de test complets.

## 📝 Scripts Disponibles

```bash
npm start              # Lancer le serveur
npm run dev            # Mode développement (auto-reload)
node check-railway.js  # Vérifier compatibilité Railway
```

## 🐛 Dépannage

### Les personnages ne s'affichent pas
- Vérifiez que vous êtes en mode multijoueur
- Attendez que la partie commence
- Les personnages apparaissent uniquement quand la course démarre

### Le lobby n'affiche pas les joueurs
- Rafraîchissez la page (F5)
- Vérifiez que le serveur est bien démarré
- Ouvrez la console (F12) pour voir les erreurs

### Le leaderboard ne s'affiche pas
- Attendez que tous les joueurs aient fini
- Le leaderboard apparaît automatiquement à la fin

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :
- Ajouter de nouveaux mots
- Améliorer les animations
- Créer de nouveaux modes de jeu

## 📄 Licence

MIT License

---

**Développé avec ❤️ et ☕**

*Version 2.0 - Mode Multijoueur avec 4 Personnages*

