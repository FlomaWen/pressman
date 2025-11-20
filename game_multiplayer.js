import * as THREE from 'three';

class MultiplayerGame {
    constructor() {
        this.socket = io();
        this.playerName = '';
        this.gameState = null;
        this.currentWordIndex = 0;
        this.typedText = '';
        this.wordsCompleted = 0;
        this.totalWords = 40;
        this.isReady = false;

        // Stats
        this.startTime = null;
        this.currentWPM = 0;
        this.totalKeystrokes = 0;
        this.correctKeystrokes = 0;

        // Bomb system (local pour ce joueur)
        this.bombMaxTime = 10000; // 10 secondes par mot
        this.bombStartTime = Date.now();
        this.errorCount = 0;
        this.maxErrors = 2;

        this.setupLoginScreen();
    }

    setupLoginScreen() {
        const joinBtn = document.getElementById('join-btn');
        const nameInput = document.getElementById('player-name');

        nameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.joinGame();
            }
        });

        joinBtn.addEventListener('click', () => this.joinGame());
    }

    joinGame() {
        const nameInput = document.getElementById('player-name');
        const name = nameInput.value.trim();

        if (name.length < 2) {
            alert('Veuillez entrer un pseudo d\'au moins 2 caractères');
            return;
        }

        this.playerName = name;

        // Masquer l'écran de connexion
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('game-screen').style.display = 'block';

        // Se connecter au serveur
        this.socket.emit('join_game', this.playerName);

        // Configurer les événements WebSocket
        this.setupSocketEvents();

        // Configurer le bouton PRÊT
        this.setupReadyButton();

        // Initialiser la scène 3D
        this.setupScene();
        this.setupProgressionPath();
        this.animate();
    }

    setupReadyButton() {
        const readyButton = document.getElementById('ready-button');
        readyButton.addEventListener('click', () => {
            this.isReady = !this.isReady;

            if (this.isReady) {
                readyButton.textContent = '✗ PAS PRÊT';
                readyButton.classList.add('ready');
            } else {
                readyButton.textContent = '✓ JE SUIS PRÊT';
                readyButton.classList.remove('ready');
            }

            // Envoyer le statut au serveur
            this.socket.emit('player_ready', this.isReady);
        });
    }

    setupSocketEvents() {
        // Mise à jour de l'état du jeu
        this.socket.on('game_update', (gameState) => {
            this.gameState = gameState;
            this.updateWaitingRoom(gameState);
            this.updatePlayersStatus(gameState);
        });

        // Compte à rebours commence
        this.socket.on('countdown_start', (seconds) => {
            document.getElementById('countdown').textContent = seconds;
            document.getElementById('ready-button').disabled = true;
            document.getElementById('waiting-info').textContent = '🚀 La partie va commencer !';
        });

        // Mise à jour du compte à rebours
        this.socket.on('countdown_update', (seconds) => {
            document.getElementById('countdown').textContent = seconds;
        });

        // Début de la partie
        this.socket.on('game_start', (gameState) => {
            this.gameState = gameState;
            this.startGame();
        });

        // Partie terminée
        this.socket.on('game_finished', (gameState) => {
            this.gameState = gameState;
            this.showLeaderboard();
        });

        // Erreur
        this.socket.on('error', (message) => {
            alert(message);
        });
    }

    updateWaitingRoom(gameState) {
        if (gameState.status !== 'waiting') return;

        const playersList = document.getElementById('players-waiting');
        playersList.innerHTML = gameState.players.map(p => {
            const readyClass = p.ready ? 'ready' : 'not-ready';
            const statusClass = p.ready ? 'ready' : 'waiting';
            const statusText = p.ready ? '✓ PRÊT' : '⏳ En attente...';

            return `
                <div class="player-item ${readyClass}">
                    <span class="player-name">👤 ${p.name}</span>
                    <span class="player-status ${statusClass}">${statusText}</span>
                </div>
            `;
        }).join('');

        const lobbyStatus = document.getElementById('lobby-status');
        lobbyStatus.textContent = `${gameState.players.length}/${4} joueurs connectés`;

        // Mise à jour du texte d'information
        const readyCount = gameState.players.filter(p => p.ready).length;
        const totalPlayers = gameState.players.length;
        const waitingInfo = document.getElementById('waiting-info');

        if (totalPlayers < 2) {
            waitingInfo.textContent = '⏳ En attente d\'au moins 2 joueurs...';
        } else if (readyCount < totalPlayers) {
            waitingInfo.textContent = `${readyCount}/${totalPlayers} joueurs prêts`;
        } else {
            waitingInfo.textContent = '';
        }
    }

    startGame() {
        document.getElementById('waiting-room').style.display = 'none';
        document.getElementById('game-ui').style.display = 'block';

        this.startTime = Date.now();
        this.currentWordIndex = 0;
        this.wordsCompleted = 0;
        this.typedText = '';

        // Assigner les joueurs aux lignes
        this.assignPlayersToLanes();

        this.updateWordDisplay();
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    handleKeyPress(event) {
        if (!this.gameState || this.gameState.status !== 'playing') return;

        if (event.key === 'Backspace') {
            this.typedText = this.typedText.slice(0, -1);
            this.updateWordDisplay();
            return;
        }

        if (event.key.match(/^[a-zA-Z]$/)) {
            const currentWord = this.gameState.currentWords[this.currentWordIndex];
            const pressedKey = event.key.toUpperCase();

            this.typedText += pressedKey;
            this.totalKeystrokes++;

            if (currentWord.startsWith(this.typedText)) {
                this.correctKeystrokes++;
                this.updateWordDisplay();

                if (this.typedText === currentWord) {
                    // Mot complet !
                    this.wordsCompleted++;
                    this.currentWordIndex++;
                    this.typedText = '';
                    this.errorCount = 0; // Reset erreurs
                    this.bombStartTime = Date.now(); // Reset timer bombe

                    this.updateWPM();
                    this.updateProgress();

                    // Envoyer la progression au serveur
                    this.socket.emit('player_progress', {
                        wordsCompleted: this.wordsCompleted,
                        wpm: this.currentWPM
                    });

                    if (this.currentWordIndex < this.gameState.currentWords.length) {
                        this.updateWordDisplay();
                    }
                }
            } else {
                // Erreur
                this.typedText = '';
                this.errorCount++;

                if (this.errorCount >= this.maxErrors) {
                    // 2 erreurs = retour en arrière
                    this.makePlayerJumpBack();
                    this.errorCount = 0;
                }

                this.updateWordDisplay();
            }
        }
    }

    updateWordDisplay() {
        const wordDisplay = document.getElementById('word-display');
        if (!this.gameState || this.currentWordIndex >= this.gameState.currentWords.length) {
            wordDisplay.textContent = '✅ TERMINÉ !';
            return;
        }

        const currentWord = this.gameState.currentWords[this.currentWordIndex];
        let displayText = '';

        for (let i = 0; i < currentWord.length; i++) {
            if (i < this.typedText.length) {
                displayText += `<span style="color: #00ff00; text-shadow: 0 0 20px #00ff00;">${currentWord[i]}</span>`;
            } else {
                displayText += currentWord[i];
            }
        }

        wordDisplay.innerHTML = displayText;
    }

    updateProgress() {
        const progressFill = document.getElementById('progress-fill');
        const percentage = (this.wordsCompleted / this.totalWords) * 100;
        progressFill.style.width = `${percentage}%`;
        progressFill.textContent = `${this.wordsCompleted}/${this.totalWords}`;

        document.getElementById('words-count').textContent = `${this.wordsCompleted}/${this.totalWords}`;

        // Mettre à jour le compteur d'erreurs
        const errorCount = document.getElementById('error-count');
        if (errorCount) {
            errorCount.textContent = `${this.errorCount}/${this.maxErrors}`;
            errorCount.style.color = this.errorCount >= 1 ? '#ff0000' : '#ffffff';
        }
    }

    updateBombTimer() {
        const bombTimer = document.getElementById('bomb-timer');
        if (bombTimer && this.gameState && this.gameState.status === 'playing') {
            const elapsed = Date.now() - this.bombStartTime;
            const remaining = Math.max(0, (this.bombMaxTime - elapsed) / 1000);
            bombTimer.textContent = `${remaining.toFixed(1)}s`;
            bombTimer.style.color = remaining < 3 ? '#ff0000' : remaining < 5 ? '#ffaa00' : '#00ff00';
        }
    }

    updateWPM() {
        const elapsedMinutes = (Date.now() - this.startTime) / 60000;
        if (elapsedMinutes > 0) {
            this.currentWPM = Math.round(this.wordsCompleted / elapsedMinutes);
            document.getElementById('wpm').textContent = this.currentWPM;
        }
    }

    updatePlayersStatus(gameState) {
        if (gameState.status === 'waiting') return;

        const playersList = document.getElementById('players-list');
        playersList.innerHTML = gameState.players.map((player, index) => {
            const percentage = (player.wordsCompleted / this.totalWords) * 100;
            const finishedClass = player.finished ? 'finished' : '';
            const colors = ['🔴', '🟢', '🔵', '🟡'];
            const colorIcon = colors[index] || '⚪';

            return `
                <div class="player-status ${finishedClass}">
                    <div class="name">${colorIcon} ${player.finished ? '🏆 ' : ''}${player.name}</div>
                    <div class="stats">
                        ${player.wordsCompleted}/${this.totalWords} mots | ${player.wpm} WPM
                    </div>
                    <div class="progress-mini">
                        <div class="progress-mini-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        }).join('');

        // Mettre à jour la visualisation 3D
        this.assignPlayersToLanes();
    }

    showLeaderboard() {
        document.getElementById('game-ui').style.display = 'none';
        document.getElementById('leaderboard').style.display = 'block';

        const leaderboardList = document.getElementById('leaderboard-list');
        const medals = ['🥇', '🥈', '🥉'];
        const rankClasses = ['first', 'second', 'third'];

        leaderboardList.innerHTML = this.gameState.leaderboard.map((player, index) => {
            const rankClass = rankClasses[index] || '';
            const medal = medals[index] || '🏅';

            return `
                <div class="leaderboard-item ${rankClass}">
                    <div>
                        <span class="rank">${medal}</span>
                        <strong>${player.name}</strong>
                    </div>
                    <div>
                        ${player.time}s | ${player.wpm} WPM
                    </div>
                </div>
            `;
        }).join('');

        // Compte à rebours avant retour au menu
        let countdown = 10;
        const countdownElement = document.getElementById('return-countdown');

        const countdownInterval = setInterval(() => {
            countdown--;
            if (countdownElement) {
                countdownElement.textContent = countdown;
            }

            if (countdown <= 0) {
                clearInterval(countdownInterval);
                location.reload();
            }
        }, 1000);
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x222244);

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 30;

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        // Lumières
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xffffff, 1, 100);
        pointLight.position.set(0, 10, 20);
        this.scene.add(pointLight);

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    setupProgressionPath() {
        this.progressionGroup = new THREE.Group();
        this.progressionGroup.position.z = 10;
        this.progressionGroup.position.y = -10;

        // Créer 4 lignes de chemin (une par joueur)
        this.playerPaths = [];
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00]; // Rouge, Vert, Bleu, Jaune

        for (let lane = 0; lane < 4; lane++) {
            const laneY = (lane - 1.5) * 4; // Espacer les lignes

            // Ligne du chemin
            const pathGeometry = new THREE.BufferGeometry();
            const pathPoints = [];
            for (let i = 0; i < 50; i++) {
                pathPoints.push(new THREE.Vector3(i * 3 - 75, laneY, 0));
            }
            pathGeometry.setFromPoints(pathPoints);
            const pathMaterial = new THREE.LineBasicMaterial({
                color: colors[lane],
                linewidth: 2,
                transparent: true,
                opacity: 0.5
            });
            const pathLine = new THREE.Line(pathGeometry, pathMaterial);
            this.progressionGroup.add(pathLine);

            // Points de progression pour cette ligne
            const dots = [];
            for (let i = 0; i < 25; i++) {
                const dotGeometry = new THREE.SphereGeometry(0.3, 16, 16);
                const dotMaterial = new THREE.MeshStandardMaterial({
                    color: colors[lane],
                    emissive: colors[lane],
                    emissiveIntensity: 0.8
                });
                const dot = new THREE.Mesh(dotGeometry, dotMaterial);
                dot.position.x = i * 4;
                dot.position.y = laneY;
                dot.visible = false; // Caché par défaut
                this.progressionGroup.add(dot);
                dots.push(dot);
            }

            // Personnage pour cette ligne
            const character = this.createCharacter(colors[lane]);
            character.position.x = 0;
            character.position.y = laneY;
            character.visible = false; // Caché par défaut
            character.userData.progress = 0;
            character.userData.targetProgress = 0;
            this.progressionGroup.add(character);

            // Bombe pour cette ligne
            const bomb = this.createBomb(colors[lane]);
            bomb.position.x = -5; // Devant le personnage
            bomb.position.y = laneY;
            bomb.visible = false;
            this.progressionGroup.add(bomb);

            this.playerPaths.push({
                lane: lane,
                color: colors[lane],
                pathLine: pathLine,
                dots: dots,
                character: character,
                bomb: bomb,
                playerName: null
            });
        }

        this.scene.add(this.progressionGroup);
    }

    createCharacter(color = 0x4444ff) {
        const character = new THREE.Group();
        const scale = 1.5; // Réduit pour que 4 personnages tiennent

        // Corps
        const bodyGeometry = new THREE.CapsuleGeometry(0.3 * scale, 0.8 * scale, 8, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: color,
            metalness: 0.3,
            roughness: 0.7
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.2 * scale;
        character.add(body);

        // Tête
        const headGeometry = new THREE.SphereGeometry(0.35 * scale, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0xffcc88,
            metalness: 0.2,
            roughness: 0.8
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.2 * scale;
        character.add(head);

        // Yeux
        const eyeGeometry = new THREE.SphereGeometry(0.08 * scale, 8, 8);
        const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.12 * scale, 2.25 * scale, 0.3 * scale);
        character.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.12 * scale, 2.25 * scale, 0.3 * scale);
        character.add(rightEye);

        return character;
    }

    createBomb(color = 0x1a1a1a) {
        const bombGroup = new THREE.Group();
        const scale = 0.8; // Plus petit

        // Corps de la bombe
        const bombGeometry = new THREE.SphereGeometry(1 * scale, 16, 16);
        const bombMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.3,
            metalness: 0.8
        });
        const bombBody = new THREE.Mesh(bombGeometry, bombMaterial);
        bombGroup.add(bombBody);

        // Mèche
        const fuseGeometry = new THREE.CylinderGeometry(0.1 * scale, 0.1 * scale, 2 * scale, 8);
        const fuseMaterial = new THREE.MeshStandardMaterial({ color: 0x8b4513 });
        const fuse = new THREE.Mesh(fuseGeometry, fuseMaterial);
        fuse.position.y = 1.5 * scale;
        bombGroup.add(fuse);

        // Étincelle
        const sparkGeometry = new THREE.SphereGeometry(0.2 * scale, 8, 8);
        const sparkMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4500,
            emissive: 0xff4500,
            emissiveIntensity: 2
        });
        const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
        spark.position.y = 2.5 * scale;
        bombGroup.add(spark);

        // Lumière
        const sparkLight = new THREE.PointLight(0xff4500, 1, 5);
        spark.add(sparkLight);

        bombGroup.userData = {
            spark: spark,
            sparkLight: sparkLight,
            fuseProgress: 0
        };

        return bombGroup;
    }

    assignPlayersToLanes() {
        if (!this.gameState || !this.gameState.players) return;

        this.gameState.players.forEach((player, index) => {
            if (index < 4 && this.playerPaths[index]) {
                const lane = this.playerPaths[index];
                lane.playerName = player.name;
                lane.character.visible = true;
                lane.bomb.visible = true; // Afficher la bombe

                // Afficher les points pour cette ligne
                lane.dots.forEach(dot => dot.visible = true);

                // Mettre à jour la progression
                const progress = (player.wordsCompleted / this.totalWords) * 100;
                lane.character.userData.targetProgress = progress;

                // Positionner la bombe devant le personnage
                lane.bomb.position.x = lane.character.userData.progress - 5;
            }
        });
    }

    makePlayerJumpBack() {
        // Reculer d'un mot (2.5% de progression)
        this.wordsCompleted = Math.max(0, this.wordsCompleted - 1);
        this.currentWordIndex = this.wordsCompleted;

        // Envoyer la mise à jour
        this.socket.emit('player_progress', {
            wordsCompleted: this.wordsCompleted,
            wpm: this.currentWPM
        });

        // Reset le mot actuel
        this.typedText = '';
        this.updateWordDisplay();
        this.updateProgress();
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = Date.now() * 0.001;

        // Animation du système de progression
        if (this.progressionGroup && this.playerPaths) {
            const lerpSpeed = 0.05;
            let myLaneIndex = -1;

            // Trouver ma ligne
            if (this.gameState && this.gameState.players) {
                myLaneIndex = this.gameState.players.findIndex(p => p.name === this.playerName);
            }

            // Animer chaque personnage et bombe
            this.playerPaths.forEach((lane, index) => {
                if (lane.character.visible) {
                    // Calculer la position X basée sur la progression (0-100%)
                    const maxDistance = 80; // Distance maximale en unités 3D
                    const targetX = (lane.character.userData.targetProgress / 100) * maxDistance;

                    // Interpoler vers la position cible
                    const currentX = lane.character.userData.progress;
                    lane.character.userData.progress += (targetX - currentX) * lerpSpeed;
                    lane.character.position.x = lane.character.userData.progress;

                    // Animer la bombe pour cette ligne
                    if (lane.bomb.visible) {
                        // Positionner la bombe devant le personnage
                        lane.bomb.position.x = lane.character.position.x - 5;

                        // Animer l'étincelle si c'est ma ligne
                        if (index === myLaneIndex && this.gameState.status === 'playing') {
                            const elapsed = Date.now() - this.bombStartTime;
                            const fuseProgress = Math.min(elapsed / this.bombMaxTime, 1);

                            // Déplacer l'étincelle vers le bas
                            lane.bomb.userData.spark.position.y = 2.5 * (1 - fuseProgress);
                            lane.bomb.userData.spark.scale.setScalar(1 + Math.sin(time * 20) * 0.3);
                            lane.bomb.userData.sparkLight.intensity = 1 + Math.sin(time * 20) * 0.5;

                            // Si la mèche atteint la bombe, explosion !
                            if (fuseProgress >= 1) {
                                this.makePlayerJumpBack();
                                this.bombStartTime = Date.now();
                            }
                        }

                        // Rotation de la bombe
                        lane.bomb.rotation.y = time * 0.5;
                    }

                    // Animer les points de cette ligne
                    lane.dots.forEach((dot, index) => {
                        dot.material.emissiveIntensity = 0.5 + Math.sin(time * 2 + index * 0.5) * 0.3;
                    });
                }
            });

            // Faire suivre la caméra au joueur local
            if (myLaneIndex >= 0 && this.playerPaths[myLaneIndex]) {
                const myCharacter = this.playerPaths[myLaneIndex].character;
                const targetCameraX = myCharacter.position.x;

                // Déplacer le groupe pour garder le joueur centré
                const targetGroupX = -targetCameraX;
                this.progressionGroup.position.x += (targetGroupX - this.progressionGroup.position.x) * 0.05;
            }

            // Mettre à jour le timer de la bombe
            this.updateBombTimer();
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Démarrer le jeu
new MultiplayerGame();

