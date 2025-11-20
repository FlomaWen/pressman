// Configuration du jeu Pressman

module.exports = {
    // Configuration du serveur
    server: {
        port: process.env.PORT || 3000,
        corsOrigin: "*"
    },

    // Configuration de la partie
    game: {
        wordsToType: 40,           // Nombre de mots à taper dans une course
        maxPlayers: 4,             // Nombre maximum de joueurs par partie
        minPlayers: 2,             // Nombre minimum de joueurs pour démarrer
        startDelay: 3000,          // Délai avant le démarrage (ms)
        bombTimeLimit: 10000       // Temps limite de la bombe en mode solo (ms)
    },

    // Configuration du personnage
    character: {
        scale: 2,                  // Taille du personnage
        moveSpeed: 4,              // Distance de déplacement par mot
        animationSpeed: 0.25       // Vitesse d'animation de la marche
    },

    // Configuration de la progression
    progression: {
        dotSpacing: 4,             // Espacement entre les points
        numDots: 25,               // Nombre de points sur le chemin
        lerpSpeed: 0.1             // Vitesse d'interpolation (0-1)
    }
};

