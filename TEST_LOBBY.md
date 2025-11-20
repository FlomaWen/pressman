# 🎮 NOUVEAU SYSTÈME DE LOBBY - Guide de test

## ✨ Nouvelles fonctionnalités ajoutées

### 1. **Lobby avec système PRÊT** ✅
- Chaque joueur doit cliquer sur "JE SUIS PRÊT" 
- La partie ne démarre que quand TOUS les joueurs sont prêts
- Minimum 2 joueurs requis pour démarrer

### 2. **Compte à rebours** ⏱️
- Quand tous les joueurs sont prêts : compte à rebours de 3 secondes
- Affichage visuel du compte à rebours
- Impossible de changer son statut pendant le compte à rebours

### 3. **Retour automatique au menu** 🔄
- Après la fin de la partie : affichage du leaderboard
- Compte à rebours de 10 secondes
- Retour automatique au menu de connexion
- Tout se reset (joueurs, scores, ready status)

---

## 🧪 Comment tester

### Étape 1 : Lancer le serveur
```bash
npm start
```

### Étape 2 : Ouvrir plusieurs onglets
1. Ouvrez 2-4 onglets de votre navigateur
2. Allez sur `http://localhost:3000/multiplayer.html` dans chaque onglet

### Étape 3 : Tester le lobby
1. **Entrez un pseudo différent** dans chaque onglet
2. Vous arrivez dans le **LOBBY**
3. Vous voyez la liste de tous les joueurs connectés
4. Chaque joueur a un statut :
   - 🟡 **⏳ En attente...** (pas prêt)
   - 🟢 **✓ PRÊT** (prêt à jouer)

### Étape 4 : Se marquer prêt
1. Cliquez sur **"✓ JE SUIS PRÊT"** dans chaque onglet
2. Le bouton change en **"✗ PAS PRÊT"** (rouge)
3. Les autres joueurs voient votre statut changer en temps réel
4. Un compteur affiche : "X/Y joueurs prêts"

### Étape 5 : Lancer la partie
1. Quand **tous les joueurs** sont prêts (minimum 2)
2. Un **compte à rebours apparaît** : 3... 2... 1...
3. Message : "🚀 La partie va commencer !"
4. La course commence automatiquement !

### Étape 6 : Jouer la course
1. Tapez les 40 mots le plus vite possible
2. Voyez la progression des autres en temps réel
3. Le premier à finir remporte la course

### Étape 7 : Fin de partie
1. Le **leaderboard final** s'affiche avec :
   - 🥇 1ère place (Or)
   - 🥈 2ème place (Argent)
   - 🥉 3ème place (Bronze)
   - Temps et WPM de chacun
2. **Compte à rebours de 10 secondes** : "⏰ Retour au menu dans X secondes..."
3. **Retour automatique** au menu de connexion
4. Tout est réinitialisé !

---

## 🎯 Scénarios à tester

### Scénario 1 : Changement d'avis
1. Joueur 1 se marque PRÊT
2. Joueur 2 se marque PRÊT
3. Joueur 1 clique à nouveau → PAS PRÊT
4. ✅ Le compte à rebours ne démarre pas

### Scénario 2 : Joueur arrive en retard
1. Joueurs 1 et 2 sont PRÊTS
2. Compte à rebours en cours (3... 2...)
3. Joueur 3 rejoint le lobby
4. ✅ Le compte à rebours continue
5. ✅ Joueur 3 participe quand même à la partie

### Scénario 3 : Un seul joueur
1. Un seul joueur dans le lobby
2. Il se marque PRÊT
3. ✅ Message : "⏳ En attente d'au moins 2 joueurs..."
4. ✅ La partie ne démarre pas

### Scénario 4 : Déconnexion pendant le lobby
1. Joueurs 1, 2, 3 dans le lobby
2. Joueur 2 ferme son onglet
3. ✅ Il disparaît de la liste instantanément
4. ✅ Les autres joueurs peuvent continuer

### Scénario 5 : Partie complète
1. Jouez une partie complète à 2+ joueurs
2. Finissez tous les 40 mots
3. ✅ Leaderboard affiché avec classement
4. ✅ Après 10 secondes → retour au menu
5. ✅ Vous pouvez rejoindre une nouvelle partie

---

## 🔍 Indicateurs visuels

### Dans le lobby
- **Joueur pas prêt** :
  - Fond jaune/orange
  - Badge "⏳ En attente..."
  - Bordure orange

- **Joueur prêt** :
  - Fond vert
  - Badge "✓ PRÊT" (vert)
  - Bordure verte

- **Bouton PRÊT** :
  - Normal : Vert "✓ JE SUIS PRÊT"
  - Activé : Rouge "✗ PAS PRÊT"
  - Désactivé pendant le compte à rebours

### Compte à rebours
- **Très gros chiffre** rouge (120px)
- Animation de pulsation
- Ombre lumineuse rouge

### Informations
- Nombre de joueurs : "2/4 joueurs connectés"
- Joueurs prêts : "2/3 joueurs prêts"
- Message : "🚀 La partie va commencer !"

---

## 📊 Flow complet

```
1. Menu de connexion
   ↓
2. Entrer son pseudo
   ↓
3. LOBBY (salle d'attente)
   ↓
4. Clic sur "JE SUIS PRÊT"
   ↓
5. Attendre les autres joueurs
   ↓
6. Tous prêts → Compte à rebours (3s)
   ↓
7. COURSE (40 mots)
   ↓
8. Premier joueur termine → continue
   ↓
9. Tous ont fini → LEADERBOARD
   ↓
10. Compte à rebours (10s)
   ↓
11. Retour au menu (étape 1)
```

---

## 🐛 Points de vérification

### Serveur (logs console)
```
✅ "Nouveau joueur connecté: [socketId]"
✅ "[Nom] a rejoint la partie [gameId]"
✅ "[Nom] est prêt" / "pas prêt"
✅ "Partie [gameId] démarrée !"
✅ "Joueur déconnecté: [socketId]"
```

### Client (comportement)
```
✅ Connexion au lobby instantanée
✅ Liste des joueurs se met à jour en temps réel
✅ Changement de statut visible pour tous
✅ Compte à rebours synchronisé
✅ Démarrage simultané de la course
✅ Leaderboard correct avec bonnes positions
✅ Retour au menu après 10 secondes
```

---

## 💡 Astuces de débogage

### Voir les événements WebSocket
Ouvrez la console (F12) :
```javascript
// Dans la console du navigateur
socket.on('game_update', console.log)
socket.on('countdown_start', console.log)
socket.on('countdown_update', console.log)
socket.on('game_start', console.log)
```

### Forcer le retour au menu
```javascript
// Dans la console
location.reload()
```

### Simuler plusieurs joueurs rapidement
1. Ouvrez 3 onglets
2. Ctrl+Shift+T pour réouvrir des onglets rapidement
3. Utilisez des pseudos courts : A, B, C, D

---

## ✅ Checklist de validation

- [ ] Connexion au lobby fonctionne
- [ ] Liste des joueurs s'affiche correctement
- [ ] Bouton PRÊT change l'état
- [ ] Tous les joueurs voient les changements
- [ ] Compte à rebours démarre quand tous prêts
- [ ] Partie démarre après le compte à rebours
- [ ] Course fonctionne normalement
- [ ] Leaderboard s'affiche à la fin
- [ ] Retour automatique au menu après 10s
- [ ] Possibilité de rejouer immédiatement

---

## 🚀 Prêt pour le déploiement Railway

Toutes ces fonctionnalités sont compatibles Railway !

```bash
git add .
git commit -m "feat: add lobby ready system and auto return to menu"
git push
```

Railway redéploiera automatiquement. 🎉

---

**Bon test ! 🎮**

