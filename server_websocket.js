const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Servir les fichiers statiques
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'menu.html'));
});

// Structure pour gérer les parties
const games = new Map();
const players = new Map();

class Game {
    constructor(id) {
        this.id = id;
        this.players = [];
        this.maxPlayers = 4;
        this.status = 'waiting'; // waiting, playing, finished
        this.wordsToType = 40;
        this.currentWords = [];
        this.leaderboard = [];
        this.startTime = null;
    }

    addPlayer(player) {
        if (this.players.length < this.maxPlayers && this.status === 'waiting') {
            this.players.push(player);
            return true;
        }
        return false;
    }

    removePlayer(socketId) {
        this.players = this.players.filter(p => p.socketId !== socketId);
    }

    canStart() {
        return this.players.length >= 2 && this.status === 'waiting';
    }

    start(wordsList) {
        this.status = 'playing';
        this.startTime = Date.now();
        // Générer la liste de mots pour cette partie
        this.currentWords = [];
        for (let i = 0; i < this.wordsToType; i++) {
            this.currentWords.push(wordsList[Math.floor(Math.random() * wordsList.length)]);
        }

        // Réinitialiser les scores des joueurs
        this.players.forEach(player => {
            player.wordsCompleted = 0;
            player.wpm = 0;
            player.finished = false;
            player.finishTime = null;
        });
    }

    updatePlayerProgress(socketId, wordsCompleted, wpm) {
        const player = this.players.find(p => p.socketId === socketId);
        if (player) {
            player.wordsCompleted = wordsCompleted;
            player.wpm = wpm;

            // Vérifier si le joueur a terminé
            if (wordsCompleted >= this.wordsToType && !player.finished) {
                player.finished = true;
                player.finishTime = Date.now();
                this.updateLeaderboard();

                // Vérifier si tous les joueurs ont terminé
                if (this.players.every(p => p.finished)) {
                    this.status = 'finished';
                }
            }
        }
    }

    updateLeaderboard() {
        this.leaderboard = [...this.players]
            .filter(p => p.finished)
            .sort((a, b) => a.finishTime - b.finishTime)
            .map((p, index) => ({
                rank: index + 1,
                name: p.name,
                time: ((p.finishTime - this.startTime) / 1000).toFixed(2),
                wpm: p.wpm
            }));
    }

    getGameState() {
        return {
            id: this.id,
            status: this.status,
            players: this.players.map(p => ({
                name: p.name,
                wordsCompleted: p.wordsCompleted || 0,
                wpm: p.wpm || 0,
                finished: p.finished || false
            })),
            currentWords: this.currentWords,
            wordsToType: this.wordsToType,
            leaderboard: this.leaderboard
        };
    }
}

// Liste de mots (identique au jeu solo)
const WORDS = [
    "CHAT", "CHIEN", "MAISON", "VOITURE", "ARBRE", "FLEUR", "SOLEIL", "LUNE",
    "OISEAU", "LION", "TIGRE", "ELEPHANT", "SINGE", "ZEBRE", "GIRAFE", "REQUIN",
    "BALEINE", "DAUPHIN", "TORTUE", "SERPENT", "CROCODILE", "HIBOU", "AIGLE", "FAUCON",
    "RENARD", "LOUP", "OURS", "PANDA", "KANGOUROU", "KOALA", "PINGOUIN", "MANCHOT",
    "SOURIS", "RAT", "LAPIN", "LIEVRE", "ECUREUIL", "CASTOR", "HERISSON", "TAUPE",
    "VACHE", "COCHON", "MOUTON", "CHEVRE", "CHEVAL", "ANE", "POULE", "COQ",
    "CANARD", "OIE", "DINDE", "PAON", "PERROQUET", "PIGEON", "MOINEAU", "CORBEAU",
    "PAPILLON", "ABEILLE", "GUEPE", "FOURMI", "ARAIGNEE", "MOUCHE", "LIBELLULE", "COCCINELLE",
    "PLAGE", "MONTAGNE", "FORET", "DESERT", "JUNGLE", "PRAIRIE", "COLLINE", "VALLEE",
    "OCEAN", "RIVIERE", "LAC", "MER", "VAGUE", "SABLE", "PIERRE", "ROCHER",
    "VOLCAN", "GROTTE", "CASCADE", "SOURCE", "ETANG", "MARAIS", "PLAINE", "PLATEAU",
    "FALAISE", "CANYON", "CREVASSE", "GLACIER", "ICEBERG", "BANQUISE", "TOUNDRA", "STEPPE",
    "ROSE", "TULIPE", "ORCHIDEE", "MARGUERITE", "TOURNESOL", "LILAS", "JASMIN", "LAVANDE",
    "CHENE", "PIN", "SAPIN", "BOULEAU", "ERABLE", "PALMIER", "CACTUS", "BAMBOU",
    "HERBE", "MOUSSE", "FOUGERE", "CHAMPIGNON", "ALGUE", "LICHEN", "LIERRE", "VIGNE",
    "POMME", "BANANE", "CITRON", "FRAISE", "RAISIN", "POIRE", "PECHE", "CERISE",
    "ORANGE", "KIWI", "MANGUE", "ANANAS", "PASTEQUE", "MELON", "PRUNE", "ABRICOT"
];

io.on('connection', (socket) => {
    console.log(`Nouveau joueur connecté: ${socket.id}`);

    // Rejoindre ou créer une partie
    socket.on('join_game', (playerName) => {
        console.log(`${playerName} veut rejoindre une partie`);

        // Chercher une partie en attente
        let game = null;
        for (let [gameId, g] of games) {
            if (g.status === 'waiting' && g.players.length < g.maxPlayers) {
                game = g;
                break;
            }
        }

        // Si aucune partie disponible, en créer une
        if (!game) {
            const gameId = `game_${Date.now()}`;
            game = new Game(gameId);
            games.set(gameId, game);
            console.log(`Nouvelle partie créée: ${gameId}`);
        }

        // Ajouter le joueur
        const player = {
            socketId: socket.id,
            name: playerName,
            wordsCompleted: 0,
            wpm: 0,
            finished: false,
            finishTime: null
        };

        if (game.addPlayer(player)) {
            players.set(socket.id, { gameId: game.id, player });
            socket.join(game.id);

            // Notifier tous les joueurs de la partie
            io.to(game.id).emit('game_update', game.getGameState());

            console.log(`${playerName} a rejoint la partie ${game.id} (${game.players.length}/${game.maxPlayers})`);

            // Si assez de joueurs, démarrer le compte à rebours
            if (game.canStart()) {
                setTimeout(() => {
                    if (game.status === 'waiting') {
                        game.start(WORDS);
                        io.to(game.id).emit('game_start', game.getGameState());
                        console.log(`Partie ${game.id} démarrée !`);
                    }
                }, 3000); // 3 secondes de délai
            }
        } else {
            socket.emit('error', 'Impossible de rejoindre la partie');
        }
    });

    // Mise à jour de la progression du joueur
    socket.on('player_progress', ({ wordsCompleted, wpm }) => {
        const playerData = players.get(socket.id);
        if (playerData) {
            const game = games.get(playerData.gameId);
            if (game && game.status === 'playing') {
                game.updatePlayerProgress(socket.id, wordsCompleted, wpm);

                // Notifier tous les joueurs
                io.to(game.id).emit('game_update', game.getGameState());

                // Si la partie est terminée, l'annoncer
                if (game.status === 'finished') {
                    io.to(game.id).emit('game_finished', game.getGameState());
                }
            }
        }
    });

    // Déconnexion
    socket.on('disconnect', () => {
        console.log(`Joueur déconnecté: ${socket.id}`);

        const playerData = players.get(socket.id);
        if (playerData) {
            const game = games.get(playerData.gameId);
            if (game) {
                game.removePlayer(socket.id);

                // Si plus de joueurs, supprimer la partie
                if (game.players.length === 0) {
                    games.delete(game.id);
                    console.log(`Partie ${game.id} supprimée`);
                } else {
                    // Sinon, notifier les autres joueurs
                    io.to(game.id).emit('game_update', game.getGameState());
                }
            }
            players.delete(socket.id);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Serveur WebSocket démarré sur le port ${PORT}`);
    console.log(`🌐 Accédez au jeu sur http://localhost:${PORT}`);
});

