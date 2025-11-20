# Jeu des Lettres 🎮

Un jeu addictif où il faut appuyer sur les bonnes lettres du clavier avec des effets 3D de mur qui se brise !

## 🎯 Deux Versions Disponibles

### Version 3D avec Three.js (RECOMMANDÉE) 🌟

Une expérience immersive avec des effets visuels époustouflants :
- 🧱 **Mur 3D qui se brise** à chaque bonne réponse
- 💥 **Effet d'explosion** avec des fragments qui volent
- ✨ **Animation élastique** pour la reconstruction du mur
- 🎨 **Changement de couleur dynamique** après chaque explosion
- 🌊 **Effet de vague** sur le mur au repos
- 📸 **Tremblement de caméra** quand vous vous trompez

### Version Python avec Pygame 🐍

Version classique 2D pour une expérience plus simple.

## 🚀 Lancement du jeu

### Version 3D (Three.js) - RECOMMANDÉE

1. Lancez le serveur local :
```bash
python server.py
```

2. Le jeu s'ouvrira automatiquement dans votre navigateur à `http://localhost:8000`

### Version Python (Pygame)

1. Installez les dépendances :
```bash
pip install -r requirements.txt
```

2. Lancez le jeu :
```bash
python letter_game.py
```

## 🎮 Comment jouer

1. Une lettre s'affiche au centre de l'écran
2. Appuyez sur la touche correspondante sur votre clavier
3. **Si c'est correct** : 
   - 💥 Le mur explose en milliers de fragments (version 3D)
   - 🎨 Le fond change de couleur
   - ✨ Une nouvelle lettre apparaît
   - 📊 Votre score augmente
4. **Si c'est incorrect** : 
   - 💬 Un message humoristique s'affiche
   - 📸 La caméra tremble (version 3D)
5. Appuyez sur **ESC** pour quitter

## 💬 Messages d'erreur

Le jeu affiche des messages humoristiques quand vous vous trompez :
- "T NAZE"
- "VA VOIR AILLEURS"
- "C'EST PAS ÇA !"
- "T'ES AVEUGLE ?"
- "RATÉ !"
- "ESSAIE ENCORE"
- "NON MAIS SÉRIEUX ?"
- "TU PEUX MIEUX FAIRE"
- "MAUVAISE TOUCHE !"
- "CONCENTRE-TOI !"
- Et bien d'autres...

## 🛠️ Technologies utilisées

### Version 3D
- **Three.js** - Rendu 3D dans le navigateur
- **Vanilla JavaScript** - Logique du jeu
- **HTML5 & CSS3** - Interface utilisateur

### Version Python
- **Pygame** - Bibliothèque de jeu 2D
- **Python 3** - Langage de programmation

## ✨ Fonctionnalités techniques

- Algorithme de contraste automatique pour la lisibilité
- Système de particules pour l'effet d'explosion
- Animation élastique avec easing personnalisé
- Physique simplifiée (gravité, vélocité, rotation)
- Responsive design pour tous les écrans

Amusez-vous bien et essayez de battre votre record ! 🎉🏆

