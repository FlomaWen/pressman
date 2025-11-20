# 🚂 Guide de déploiement sur Railway

## ✅ Le projet est prêt pour Railway !

Tous les fichiers nécessaires sont configurés :
- ✅ `package.json` avec `engines` Node.js
- ✅ `Procfile` pour démarrage automatique
- ✅ `.gitignore` pour exclure node_modules
- ✅ Variable `PORT` dynamique dans le serveur
- ✅ CORS configuré pour accepter toutes les origines

---

## 🚀 Étapes de déploiement

### 1. Créer un compte Railway

1. Allez sur **https://railway.app**
2. Cliquez sur **"Start a New Project"**
3. Connectez-vous avec GitHub (recommandé)

### 2. Préparer le projet

#### Option A : Avec Git (recommandé)

```bash
cd C:\Users\Florian\Desktop\DEV\pressman

# Initialiser Git si pas encore fait
git init

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Initial commit - Pressman multiplayer game"

# Créer un repository sur GitHub
# Puis pushez le code
git remote add origin https://github.com/VOTRE_USERNAME/pressman.git
git branch -M main
git push -u origin main
```

#### Option B : Sans Git (upload direct)

Railway permet aussi l'upload direct de dossiers (moins pratique pour les mises à jour).

### 3. Déployer sur Railway

1. Sur Railway, cliquez **"Deploy from GitHub repo"**
2. Sélectionnez votre repository `pressman`
3. Railway détecte automatiquement qu'il s'agit d'un projet Node.js
4. Le déploiement commence automatiquement ! 🎉

### 4. Configuration

Railway configure automatiquement :
- ✅ Installation de `npm install`
- ✅ Variable d'environnement `PORT`
- ✅ Démarrage via `npm start`
- ✅ URL publique générée

### 5. Obtenir l'URL

1. Une fois déployé, cliquez sur votre projet
2. Allez dans l'onglet **"Settings"**
3. Section **"Domains"**
4. Cliquez sur **"Generate Domain"**
5. Vous obtenez une URL du type : `pressman-production.up.railway.app`

### 6. Tester

Ouvrez l'URL dans votre navigateur :
```
https://pressman-production.up.railway.app
```

Vous devriez voir le menu du jeu ! 🎮

---

## 🔧 Configuration avancée (optionnel)

### Variables d'environnement

Dans Railway, vous pouvez ajouter des variables :

1. Onglet **"Variables"**
2. Ajoutez :
   - `NODE_ENV` = `production`
   - `MAX_PLAYERS` = `4` (optionnel)
   - `WORDS_TO_TYPE` = `40` (optionnel)

### Logs en temps réel

1. Onglet **"Deployments"**
2. Cliquez sur le dernier déploiement
3. Onglet **"Logs"** pour voir les logs du serveur

### Domaine personnalisé

1. Onglet **"Settings"** → **"Domains"**
2. **"Custom Domain"**
3. Ajoutez votre domaine (ex: pressman.votresite.com)
4. Configurez les DNS selon les instructions

---

## 📊 Vérifications avant déploiement

✅ **Fichiers essentiels présents**
- [x] `server_websocket.js` - Serveur principal
- [x] `package.json` - Dépendances et scripts
- [x] `Procfile` - Commande de démarrage
- [x] `.gitignore` - Exclusions Git
- [x] Fichiers HTML/JS du client

✅ **Configuration serveur**
- [x] `process.env.PORT` utilisé
- [x] CORS configuré (`origin: "*"`)
- [x] Chemins relatifs pour les fichiers statiques

✅ **Dépendances**
- [x] `express` installé
- [x] `socket.io` installé
- [x] Version Node.js spécifiée (>=18.0.0)

---

## 🎮 Après le déploiement

### Partager avec des amis

Envoyez-leur simplement l'URL :
```
https://votre-app.up.railway.app
```

Ils pourront :
1. Choisir entre Mode Solo et Mode Course
2. Jouer directement sans installation
3. Vous affronter en temps réel !

### Mises à jour

Pour mettre à jour l'application :

```bash
# Faire vos modifications
git add .
git commit -m "Description des changements"
git push origin main
```

Railway redéploie automatiquement ! ✨

---

## 🐛 Dépannage

### L'application ne démarre pas

1. Vérifiez les logs dans Railway
2. Assurez-vous que `npm install` s'est bien passé
3. Vérifiez que le port est bien `process.env.PORT`

### WebSockets ne fonctionnent pas

Railway supporte nativement les WebSockets. Si problème :
1. Vérifiez la configuration CORS dans `server_websocket.js`
2. Assurez-vous d'utiliser l'URL HTTPS fournie par Railway

### Problème de performance

Railway offre :
- **512 MB RAM** sur le plan gratuit
- **500 heures/mois** d'exécution gratuit
- Pour plus, passez au plan payant ($5/mois)

### Erreur "Cannot find module"

```bash
# Vérifiez que toutes les dépendances sont dans package.json
npm install --save express socket.io
git add package.json package-lock.json
git commit -m "Update dependencies"
git push
```

---

## 💰 Coûts

### Plan gratuit Railway
- ✅ 500 heures/mois
- ✅ 512 MB RAM
- ✅ 1 GB de stockage
- ✅ WebSockets supportés
- ✅ Sous-domaine Railway gratuit

**Pour Pressman, le plan gratuit est largement suffisant !**

### Optimisation

Si vous approchez la limite :
- L'app s'endort après 30 min d'inactivité (normal)
- Se réveille automatiquement à la première connexion
- Temps de réveil : ~10-20 secondes

---

## 📝 Checklist finale

Avant de déployer, vérifiez :

- [ ] Node.js version >= 18.0.0 dans package.json
- [ ] `npm start` fonctionne en local
- [ ] Tous les fichiers sont commités sur Git
- [ ] `.gitignore` exclut `node_modules/`
- [ ] `process.env.PORT` dans le serveur
- [ ] CORS configuré correctement

---

## 🎉 Félicitations !

Une fois déployé, votre jeu sera accessible **24/7** sur Internet !

Vous pourrez :
- ✨ Jouer de n'importe où
- 👥 Inviter vos amis facilement
- 🏆 Organiser des tournois
- 📊 Suivre les statistiques

---

## 🔗 Liens utiles

- **Railway Dashboard** : https://railway.app/dashboard
- **Documentation Railway** : https://docs.railway.app
- **Support Railway** : https://discord.gg/railway

---

**Bon déploiement ! 🚀**

*Le projet est 100% compatible Railway tel quel !*

