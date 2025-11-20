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

                    this.updateWPM();
                    this.advanceCharacter();
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
        playersList.innerHTML = gameState.players.map(player => {
            const percentage = (player.wordsCompleted / this.totalWords) * 100;
            const finishedClass = player.finished ? 'finished' : '';

            return `
                <div class="player-status ${finishedClass}">
                    <div class="name">${player.finished ? '🏆 ' : ''}${player.name}</div>
                    <div class="stats">
                        ${player.wordsCompleted}/${this.totalWords} mots | ${player.wpm} WPM
                    </div>
                    <div class="progress-mini">
                        <div class="progress-mini-fill" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        }).join('');
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

        // Ligne du chemin
        const pathGeometry = new THREE.BufferGeometry();
        const pathPoints = [];
        for (let i = 0; i < 50; i++) {
            pathPoints.push(new THREE.Vector3(i * 3 - 75, 0, 0));
        }
        pathGeometry.setFromPoints(pathPoints);
        const pathMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 3
        });
        const pathLine = new THREE.Line(pathGeometry, pathMaterial);
        this.progressionGroup.add(pathLine);

        // Points de progression
        this.progressionDots = [];
        for (let i = 0; i < 25; i++) {
            const dotGeometry = new THREE.SphereGeometry(0.5, 16, 16);
            const dotMaterial = new THREE.MeshStandardMaterial({
                color: 0xffaa00,
                emissive: 0xffaa00,
                emissiveIntensity: 1.0
            });
            const dot = new THREE.Mesh(dotGeometry, dotMaterial);
            dot.position.x = i * 4;
            dot.position.y = 0;
            this.progressionGroup.add(dot);
            this.progressionDots.push(dot);
        }

        // Personnage
        this.character = this.createCharacter();
        this.character.position.x = 0;
        this.progressionGroup.add(this.character);

        this.scene.add(this.progressionGroup);

        this.progressionOffset = 0;
        this.targetProgressionOffset = 0;
        this.totalProgress = 0;
    }

    createCharacter() {
        const character = new THREE.Group();
        const scale = 2;

        // Corps
        const bodyGeometry = new THREE.CapsuleGeometry(0.3 * scale, 0.8 * scale, 8, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0x4444ff });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.2 * scale;
        character.add(body);

        // Tête
        const headGeometry = new THREE.SphereGeometry(0.35 * scale, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc88 });
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

    advanceCharacter() {
        this.totalProgress += 4;
        this.targetProgressionOffset = this.totalProgress;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = Date.now() * 0.001;

        // Animation du système de progression
        if (this.progressionGroup) {
            const lerpSpeed = 0.1;
            this.progressionOffset += (this.targetProgressionOffset - this.progressionOffset) * lerpSpeed;

            const targetCharacterX = this.progressionOffset;
            const currentCharacterX = this.character.position.x;
            this.character.position.x += (targetCharacterX - currentCharacterX) * lerpSpeed;

            this.progressionGroup.position.x = -this.progressionOffset;

            // Animer les points
            this.progressionDots.forEach((dot, index) => {
                dot.material.emissiveIntensity = 0.5 + Math.sin(time * 2 + index * 0.5) * 0.3;
                dot.position.y = Math.sin(time * 1.5 + index * 0.3) * 0.1;
            });
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Démarrer le jeu
new MultiplayerGame();

