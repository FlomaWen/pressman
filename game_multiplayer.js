import * as THREE from 'three';

// Messages d'erreur
const ERROR_MESSAGES = [
    "T NAZE", "VA VOIR AILLEURS", "C'EST PAS ÇA !", "T'ES AVEUGLE ?",
    "RATÉ !", "ESSAIE ENCORE", "NON MAIS SÉRIEUX ?", "TU PEUX MIEUX FAIRE",
    "MAUVAISE TOUCHE !", "CONCENTRE-TOI !", "RECOMMENCE !", "ÉCHEC TOTAL",
    "PITOYABLE !", "NOOOON !", "AÏE AÏE AÏE", "C'EST NUL"
];

// Touches possibles pour les obstacles
const OBSTACLE_KEYS = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'];

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
        this.hasFinished = false; // Nouveau flag pour savoir si on a terminé

        // Stats
        this.startTime = null;
        this.finishTime = null; // Temps de fin
        this.currentWPM = 0;
        this.totalKeystrokes = 0;
        this.correctKeystrokes = 0;

        // Bomb system (local pour ce joueur)
        this.bombMaxTime = 3000; // 3 secondes par mot
        this.bombStartTime = Date.now();
        this.errorCount = 0;
        this.maxErrors = 2;

        // Obstacles system
        this.obstacles = []; // Obstacles sur la ligne du joueur
        this.currentObstacle = null; // Obstacle actuel à éviter
        this.obstacleKeyToPress = ''; // Touche à appuyer pour sauter
        this.isJumping = false; // Pour l'animation de saut
        this.obstacleUIVisible = false; // Flag pour savoir si l'UI de l'obstacle est visible

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

        // Rendre la bombe UI visible
        if (this.bombUI3D) {
            this.bombUI3D.visible = true;
        }

        // Assigner les joueurs aux lignes
        this.assignPlayersToLanes();

        // Créer les obstacles pour le joueur local (APRÈS avoir assigné les lignes)
        this.createObstacles();

        this.updateWordDisplay();
        this.setupEventListeners();
    }

    createObstacles() {
        // Créer des obstacles tous les 5 mots
        this.obstacles = [];
        for (let i = 5; i <= this.totalWords; i += 5) {
            const randomKey = OBSTACLE_KEYS[Math.floor(Math.random() * OBSTACLE_KEYS.length)];
            this.obstacles.push({
                wordPosition: i,
                key: randomKey,
                passed: false,
                mesh: null
            });
        }

        // Le joueur local est TOUJOURS sur la ligne 3 (dernière ligne = en bas)
        const myLaneIndex = 3;
        const myLane = this.playerPaths[myLaneIndex];

        if (myLane) {
            this.obstacles.forEach(obstacle => {
                const obstacleMesh = this.createObstacleMesh(obstacle.key);
                const obstacleX = (obstacle.wordPosition / this.totalWords) * 80; // 80 = maxDistance
                obstacleMesh.position.x = obstacleX;
                obstacleMesh.position.y = myLane.pathLine.position.y;
                obstacleMesh.position.z = 0;
                this.progressionGroup.add(obstacleMesh);
                obstacle.mesh = obstacleMesh;
            });
        }
    }

    createObstacleMesh(key) {
        const group = new THREE.Group();

        // Bombe obstacle (plus petite)
        const bombGroup = this.createBomb(0xff0000);
        bombGroup.scale.setScalar(0.6);
        group.add(bombGroup);

        // Créer un canvas pour afficher la touche
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        // Fond transparent
        ctx.clearRect(0, 0, 128, 128);

        // Cercle de fond
        ctx.fillStyle = 'rgba(255, 255, 0, 0.9)';
        ctx.beginPath();
        ctx.arc(64, 64, 50, 0, Math.PI * 2);
        ctx.fill();

        // Texte de la touche
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 60px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(key, 64, 64);

        // Créer une texture à partir du canvas
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        sprite.scale.set(2, 2, 1);
        sprite.position.y = 2; // Au-dessus de la bombe
        group.add(sprite);

        group.userData.key = key;
        group.userData.bombGroup = bombGroup;
        group.userData.sprite = sprite;

        return group;
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    handleKeyPress(event) {
        if (!this.gameState || this.gameState.status !== 'playing') return;

        // Vérifier si on doit gérer un obstacle
        if (this.currentObstacle && !this.currentObstacle.passed) {
            if (event.key.toUpperCase() === this.currentObstacle.key) {
                // Obstacle réussi !
                this.currentObstacle.passed = true;
                if (this.currentObstacle.mesh) {
                    this.currentObstacle.mesh.visible = false;
                }

                // Hide obstacle UI immediately and clear obstacle timing state
                this.hideObstacleUI();
                this.currentObstacle = null;
                this.obstacleActive = false;
                this.obstacleStartTime = null;
                this.obstacleDuration = 0;

                this.isJumping = true; // Déclencher l'animation de saut

                // Réinitialiser la bombe : remettre le timer à 3s
                this.bombStartTime = Date.now();
                this.bombPaused = false;

                // Afficher un message de succès (petit)
                this.showSuccessMessage('✓ OBSTACLE ÉVITÉ !');

                setTimeout(() => {
                    this.isJumping = false;
                }, 500);
                return;
            }
        }

        // Gestion normale des touches pour les mots
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

                    // Vérifier si on arrive sur un obstacle
                    this.checkForObstacle();

                    // Vérifier si c'est le dernier mot
                    if (this.wordsCompleted >= this.totalWords) {
                        this.hasFinished = true;
                        this.finishTime = Date.now();
                    } else {
                        this.bombStartTime = Date.now(); // Reset timer bombe seulement si pas fini
                    }

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

                // Afficher un message d'erreur
                this.showErrorMessage();

                if (this.errorCount >= this.maxErrors) {
                    // 2 erreurs = retour en arrière
                    this.makePlayerJumpBack();
                    this.errorCount = 0;
                }

                this.updateWordDisplay();
            }
        }
    }

    checkForObstacle() {
        // Vérifier si le prochain mot correspond à un obstacle
        const nextObstacle = this.obstacles.find(
            obs => obs.wordPosition === this.wordsCompleted && !obs.passed
        );

        if (nextObstacle) {
            this.currentObstacle = nextObstacle;
            this.obstacleKeyToPress = nextObstacle.key;

            // Pause la bombe : sauvegarder le temps restant
            const elapsedBomb = Date.now() - this.bombStartTime;
            this.bombRemaining = Math.max(0, this.bombMaxTime - elapsedBomb);
            this.bombPaused = true;

            // Définir le timer d'obstacle (2 secondes)
            this.obstacleStartTime = Date.now();
            this.obstacleDuration = 2000; // ms
            this.obstacleActive = true;

            // Afficher l'UI de l'obstacle (compact) uniquement si actif
            this.showObstacleUI(nextObstacle.key);
        }
    }

    showObstacleUI(key) {
        // Only show when obstacleActive is true
        if (!this.obstacleActive) return;

        // Prevent duplicate UI
        if (this.obstacleUIVisible) {
            // update countdown text and return
            const countdownEl = document.getElementById('obstacle-countdown');
            if (countdownEl) countdownEl.textContent = '2.0s';
            return;
        }

        let obstacleUIElement = document.getElementById('obstacle-ui');
        if (!obstacleUIElement) {
            // Créer une UI compacte et non intrusive
            const div = document.createElement('div');
            div.id = 'obstacle-ui';
            div.style.cssText = `
                position: fixed;
                top: 28%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(255, 60, 60, 0.85);
                color: white;
                padding: 8px 12px;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                z-index: 1200;
                text-align: center;
                border: 2px solid rgba(255,255,255,0.08);
                box-shadow: 0 6px 12px rgba(0,0,0,0.4);
            `;
            document.body.appendChild(div);
            obstacleUIElement = div;
        }

        // Afficher message compact et un petit compteur qui sera mis à jour par updateObstacleTimer()
        obstacleUIElement.innerHTML = `Attention obstacle ! <span id="obstacle-countdown" style="margin-left:8px; font-size:14px; color:#ffff00;">2.0s</span>`;
        obstacleUIElement.style.display = 'block';
        this.obstacleUIVisible = true;
    }

    hideObstacleUI() {
        // Remove all matching nodes to avoid leftover UI
        const nodes = Array.from(document.querySelectorAll('#obstacle-ui'));
        nodes.forEach(n => {
            try { n.remove(); } catch (e) { n.style.display = 'none'; }
        });

        // also remove success element
        const successNodes = Array.from(document.querySelectorAll('#obstacle-success'));
        successNodes.forEach(n => {
            if (n._timeout) clearTimeout(n._timeout);
            try { n.remove(); } catch (e) { n.style.display = 'none'; }
        });

        // Reset internal flags
        this.obstacleUIVisible = false;
        this.obstacleActive = false;
    }

    // Called when the player fails the obstacle timer
    handleObstacleFail() {
        // Mark obstacle as passed (failed) and remove mesh
        if (this.currentObstacle) {
            this.currentObstacle.passed = true;
            if (this.currentObstacle.mesh) this.currentObstacle.mesh.visible = false;
        }

        // Penalité : perdre 2 mots
        this.wordsCompleted = Math.max(0, this.wordsCompleted - 2);
        this.currentWordIndex = this.wordsCompleted;

        // Envoyer mise à jour au serveur
        this.socket.emit('player_progress', {
            wordsCompleted: this.wordsCompleted,
            wpm: this.currentWPM
        });

        // Afficher petit message d'échec
        this.showErrorMessage(); // réutilise message aléatoire court

        // Réinitialiser l'état obstacle
        this.currentObstacle = null;
        this.obstacleActive = false;
        this.hideObstacleUI();

        // Réinitialiser la bombe (on lui redonne un nouveau temps complet)
        this.bombStartTime = Date.now();
        this.bombPaused = false;
    }

    updateObstacleTimer() {
        // If no current obstacle or not active, ensure UI is hidden
        if (!this.currentObstacle || !this.obstacleActive) {
            if (this.obstacleUIVisible) this.hideObstacleUI();
            return;
        }

        const elapsed = Date.now() - this.obstacleStartTime;
        const remainingMs = Math.max(0, this.obstacleDuration - elapsed);
        const remaining = (remainingMs / 1000).toFixed(1);

        const countdownEl = document.getElementById('obstacle-countdown');
        if (countdownEl) countdownEl.textContent = `${remaining}s`;

        // Si le timer se termine => échec
        if (elapsed >= this.obstacleDuration) {
            this.handleObstacleFail();
        }
    }

    updateWordDisplay() {
        const wordDisplay = document.getElementById('word-display');
        if (!this.gameState || this.currentWordIndex >= this.gameState.currentWords.length) {
            wordDisplay.textContent = '✅ TERMINÉ !';
            return;
        }

        // We no longer show a large in-word obstacle message here.
        // The compact obstacle UI (created by showObstacleUI) handles the warning.

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
        const bombTimerUI = document.getElementById('bomb-timer-ui');

        if (!bombTimerUI) return;

        // Si la bombe est en pause (obstacle actif), afficher le temps restant sauvegardé
        if (this.bombPaused) {
            const remaining = (this.bombRemaining / 1000).toFixed(1);
            bombTimerUI.textContent = `${remaining}s`;
            bombTimerUI.style.color = '#888888'; // couleur grisée pour indiquer pause
            return;
        }

        if (this.gameState && this.gameState.status === 'playing' && !this.hasFinished) {
            const elapsed = Date.now() - this.bombStartTime;
            const remaining = Math.max(0, (this.bombMaxTime - elapsed) / 1000);
            bombTimerUI.textContent = `${remaining.toFixed(1)}s`;

            // Changer la couleur selon le temps restant
            if (remaining < 1) {
                bombTimerUI.style.color = '#ff0000';
            } else if (remaining < 2) {
                bombTimerUI.style.color = '#ff6600';
            } else {
                bombTimerUI.style.color = '#ffaa00';
            }
        } else if (this.hasFinished) {
            bombTimerUI.textContent = '✓ TERMINÉ';
            bombTimerUI.style.color = '#00ff00';
        }
    }

    updateWPM() {
        // Utiliser finishTime si le joueur a terminé, sinon Date.now()
        const endTime = this.hasFinished ? this.finishTime : Date.now();
        const elapsedMinutes = (endTime - this.startTime) / 60000;

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

        // Ajouter les particules de fond
        this.setupParticles();

        // Créer la bombe UI en 3D
        this.setupBombUI();
    }

    setupBombUI() {
        // Créer une bombe 3D fixe pour l'UI (à côté du mot)
        this.bombUI3D = this.createBombForUI();
        this.bombUI3D.position.set(7, 4, 20); // Position rapprochée du mot
        this.bombUI3D.scale.setScalar(1.2); // Taille réduite
        this.scene.add(this.bombUI3D);
    }

    createBombForUI() {
        const bombGroup = new THREE.Group();
        const scale = 1;

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
        const sparkGeometry = new THREE.SphereGeometry(0.3 * scale, 8, 8);
        const sparkMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4500,
            emissive: 0xff4500,
            emissiveIntensity: 2
        });
        const spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
        spark.position.y = 2.5 * scale;
        bombGroup.add(spark);

        // Lumière
        const sparkLight = new THREE.PointLight(0xff4500, 2, 10);
        spark.add(sparkLight);

        bombGroup.userData = {
            spark: spark,
            sparkLight: sparkLight,
            body: bombBody,
            fuse: fuse
        };

        return bombGroup;
    }

    setupParticles() {
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 200;
        const posArray = new Float32Array(particlesCount * 3);

        for (let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 100;
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.3,
            color: 0xffffff,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(particlesGeometry, particlesMaterial);
        this.scene.add(this.particles);
    }

    setupProgressionPath() {
        this.progressionGroup = new THREE.Group();
        this.progressionGroup.position.z = 10;
        this.progressionGroup.position.y = -5; // Remonté de -10 à -5 pour ne pas être caché

        // Créer 4 lignes de chemin (une par joueur)
        this.playerPaths = [];
        const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00]; // Rouge, Vert, Bleu, Jaune

        for (let lane = 0; lane < 4; lane++) {
            const laneY = (lane - 1.5) * 4; // Espacer les lignes

            // Ligne du chemin (plus longue pour correspondre aux points)
            const pathGeometry = new THREE.BufferGeometry();
            const pathPoints = [];
            const numPathPoints = 41; // 40 mots + 1
            for (let i = 0; i < numPathPoints; i++) {
                pathPoints.push(new THREE.Vector3(i * 2, laneY, 0));
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

            // Points de progression pour cette ligne (un point tous les 2 mots)
            const dots = [];
            for (let i = 0; i <= 40; i += 2) {
                const dotGeometry = new THREE.SphereGeometry(0.3, 16, 16);
                const dotMaterial = new THREE.MeshStandardMaterial({
                    color: colors[lane],
                    emissive: colors[lane],
                    emissiveIntensity: 0.8
                });
                const dot = new THREE.Mesh(dotGeometry, dotMaterial);
                dot.position.x = i * 2;
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

            this.playerPaths.push({
                lane: lane,
                color: colors[lane],
                pathLine: pathLine,
                dots: dots,
                character: character,
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
        const bombGeometry = new THREE.SphereGeometry(1 * scale, 8, 8);
        const bombMaterial = new THREE.MeshStandardMaterial({
            color: color,
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

        // Réorganiser pour que le joueur local soit toujours sur la ligne du bas (index 3)
        // et les autres joueurs sur les lignes 0, 1, 2
        const allPlayers = this.gameState.players;

        // Trouver le joueur local
        const localPlayerData = allPlayers.find(p => p.name === this.playerName);

        // Autres joueurs (excluant le joueur local)
        const otherPlayers = allPlayers.filter(p => p.name !== this.playerName);

        // Créer l'assignation des lignes : lignes 0-2 = autres, ligne 3 = joueur local
        const laneAssignments = [];

        // Remplir les 3 premières lignes avec les autres joueurs
        for (let i = 0; i < 3; i++) {
            laneAssignments[i] = otherPlayers[i] || null;
        }

        // Ligne 3 = joueur local
        laneAssignments[3] = localPlayerData || null;

        // Appliquer l'assignation aux lignes 3D
        laneAssignments.forEach((playerData, laneIndex) => {
            const lane = this.playerPaths[laneIndex];
            if (!lane) return;

            if (playerData) {
                lane.playerName = playerData.name;
                lane.character.visible = true;
                lane.dots.forEach(dot => dot.visible = true);
                lane.character.userData.targetProgress = (playerData.wordsCompleted / this.totalWords) * 100;
            } else {
                lane.playerName = null;
                lane.character.visible = false;
                lane.dots.forEach(dot => dot.visible = false);
                lane.character.userData.targetProgress = 0;
            }
        });
    }

    showErrorMessage() {
        const errorMessage = document.getElementById('error-message-multi');
        if (errorMessage) {
            const message = ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)];
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';

            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 1000);
        }
    }

    // Message de succès compact (vert), utilisé pour indiquer un obstacle évité
    showSuccessMessage(text) {
        let successEl = document.getElementById('obstacle-success');
        if (!successEl) {
            const div = document.createElement('div');
            div.id = 'obstacle-success';
            div.style.cssText = `
                position: fixed;
                top: 32%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(40, 200, 40, 0.9);
                color: white;
                padding: 6px 12px;
                border-radius: 8px;
                font-size: 14px;
                font-weight: 700;
                z-index: 1210;
                text-align: center;
                border: 2px solid rgba(255,255,255,0.06);
                box-shadow: 0 6px 12px rgba(0,0,0,0.35);
            `;
            document.body.appendChild(div);
            successEl = div;
        }

        successEl.textContent = text;
        successEl.style.display = 'block';

        // Disparition rapide
        clearTimeout(successEl._timeout);
        successEl._timeout = setTimeout(() => {
            successEl.style.display = 'none';
        }, 900);
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

        // Animer les particules
        if (this.particles) {
            this.particles.rotation.y = time * 0.05;
            this.particles.rotation.x = time * 0.03;
        }

        // Animer la bombe UI 3D
        if (this.bombUI3D && this.gameState && this.gameState.status === 'playing' && !this.hasFinished) {
            const elapsed = Date.now() - this.bombStartTime;
            const fuseProgress = Math.min(elapsed / this.bombMaxTime, 1);

            // Rotation de la bombe
            this.bombUI3D.rotation.y = time * 0.5;

            // Déplacer l'étincelle vers le bas
            this.bombUI3D.userData.spark.position.y = 2.5 * (1 - fuseProgress);
            this.bombUI3D.userData.spark.scale.setScalar(1 + Math.sin(time * 20) * 0.3);
            this.bombUI3D.userData.sparkLight.intensity = 2 + Math.sin(time * 20) * 1;

            // Changer la couleur selon le temps restant
            const remaining = (this.bombMaxTime - elapsed) / 1000;
            if (remaining < 1) {
                this.bombUI3D.userData.spark.material.color.setHex(0xff0000);
                this.bombUI3D.userData.sparkLight.color.setHex(0xff0000);
                this.bombUI3D.userData.body.material.emissive.setHex(0x330000);
                this.bombUI3D.userData.body.material.emissiveIntensity = 0.5;
            } else if (remaining < 2) {
                this.bombUI3D.userData.spark.material.color.setHex(0xff6600);
                this.bombUI3D.userData.sparkLight.color.setHex(0xff6600);
                this.bombUI3D.userData.body.material.emissive.setHex(0x331100);
                this.bombUI3D.userData.body.material.emissiveIntensity = 0.3;
            } else {
                this.bombUI3D.userData.spark.material.color.setHex(0xff4500);
                this.bombUI3D.userData.sparkLight.color.setHex(0xff4500);
                this.bombUI3D.userData.body.material.emissive.setHex(0x000000);
                this.bombUI3D.userData.body.material.emissiveIntensity = 0;
            }

            // Si explosion
            if (fuseProgress >= 1) {
                this.makePlayerJumpBack();
                this.bombStartTime = Date.now();
            }
        } else if (this.bombUI3D && this.hasFinished) {
            // Faire disparaître la bombe quand terminé
            this.bombUI3D.visible = false;
        }

        // Animer les obstacles
        if (this.obstacles) {
            this.obstacles.forEach(obstacle => {
                if (obstacle.mesh && !obstacle.passed) {
                    // Rotation de la bombe
                    obstacle.mesh.userData.bombGroup.rotation.y = time * 2;

                    // Pulsation du sprite
                    const scale = 2 + Math.sin(time * 5) * 0.2;
                    obstacle.mesh.userData.sprite.scale.set(scale, scale, 1);

                    // Animation de l'étincelle
                    obstacle.mesh.userData.bombGroup.userData.spark.scale.setScalar(1 + Math.sin(time * 10) * 0.3);
                }
            });
        }

        // Animation du système de progression
        if (this.progressionGroup && this.playerPaths) {
            const lerpSpeed = 0.05;
            // Le joueur local est TOUJOURS sur la ligne 3 (dernière ligne)
            const myLaneIndex = 3;

            // Animer chaque personnage
            this.playerPaths.forEach((lane, index) => {
                if (lane.character.visible) {
                    // Calculer la position X basée sur la progression (0-100%)
                    const maxDistance = 80; // Distance maximale en unités 3D
                    const targetX = (lane.character.userData.targetProgress / 100) * maxDistance;

                    // Interpoler vers la position cible
                    const currentX = lane.character.userData.progress;
                    lane.character.userData.progress += (targetX - currentX) * lerpSpeed;
                    lane.character.position.x = lane.character.userData.progress;

                    // Animation de saut pour le joueur local
                    if (index === myLaneIndex && this.isJumping) {
                        const jumpHeight = Math.sin(time * 20) * 2;
                        lane.character.position.y = lane.pathLine.position.y + Math.abs(jumpHeight);
                    } else {
                        lane.character.position.y = lane.pathLine.position.y;
                    }

                    // Animer les points de cette ligne
                    lane.dots.forEach((dot, dotIndex) => {
                        dot.material.emissiveIntensity = 0.5 + Math.sin(time * 2 + dotIndex * 0.5) * 0.3;
                    });
                }
            });

            // Faire suivre la caméra au joueur local (ligne 3)
            if (this.playerPaths[myLaneIndex]) {
                const myCharacter = this.playerPaths[myLaneIndex].character;
                const targetCameraX = myCharacter.position.x;

                // Déplacer le groupe pour garder le joueur centré
                const targetGroupX = -targetCameraX;
                this.progressionGroup.position.x += (targetGroupX - this.progressionGroup.position.x) * 0.05;
            }

            // Mettre à jour le timer de la bombe
            this.updateBombTimer();
            // Mettre à jour le timer d'obstacle (si actif)
            this.updateObstacleTimer();
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Démarrer le jeu
new MultiplayerGame();