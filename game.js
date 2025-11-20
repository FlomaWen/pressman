import * as THREE from 'three';

// Liste de mots étendue
const WORDS = [
    // Animaux
    "CHAT", "CHIEN", "MAISON", "VOITURE", "ARBRE", "FLEUR", "SOLEIL", "LUNE",
    "OISEAU", "LION", "TIGRE", "ELEPHANT", "SINGE", "ZEBRE", "GIRAFE", "REQUIN",
    "BALEINE", "DAUPHIN", "TORTUE", "SERPENT", "CROCODILE", "HIBOU", "AIGLE", "FAUCON",
    "RENARD", "LOUP", "OURS", "PANDA", "KANGOUROU", "KOALA", "PINGOUIN", "MANCHOT",
    "SOURIS", "RAT", "LAPIN", "LIEVRE", "ECUREUIL", "CASTOR", "HERISSON", "TAUPE",
    "VACHE", "COCHON", "MOUTON", "CHEVRE", "CHEVAL", "ANE", "POULE", "COQ",
    "CANARD", "OIE", "DINDE", "PAON", "PERROQUET", "PIGEON", "MOINEAU", "CORBEAU",
    "PAPILLON", "ABEILLE", "GUEPE", "FOURMI", "ARAIGNEE", "MOUCHE", "LIBELLULE", "COCCINELLE",

    // Nature et paysages
    "PLAGE", "MONTAGNE", "FORET", "DESERT", "JUNGLE", "PRAIRIE", "COLLINE", "VALLEE",
    "OCEAN", "RIVIERE", "LAC", "MER", "VAGUE", "SABLE", "PIERRE", "ROCHER",
    "VOLCAN", "GROTTE", "CASCADE", "SOURCE", "ETANG", "MARAIS", "PLAINE", "PLATEAU",
    "FALAISE", "CANYON", "CREVASSE", "GLACIER", "ICEBERG", "BANQUISE", "TOUNDRA", "STEPPE",

    // Plantes et végétaux
    "ROSE", "TULIPE", "ORCHIDEE", "MARGUERITE", "TOURNESOL", "LILAS", "JASMIN", "LAVANDE",
    "CHENE", "PIN", "SAPIN", "BOULEAU", "ERABLE", "PALMIER", "CACTUS", "BAMBOU",
    "HERBE", "MOUSSE", "FOUGERE", "CHAMPIGNON", "ALGUE", "LICHEN", "LIERRE", "VIGNE",

    // Nourriture
    "POMME", "BANANE", "CITRON", "FRAISE", "RAISIN", "POIRE", "PECHE", "CERISE",
    "ORANGE", "KIWI", "MANGUE", "ANANAS", "PASTEQUE", "MELON", "PRUNE", "ABRICOT",
    "PAIN", "FROMAGE", "BEURRE", "LAIT", "SUCRE", "SEL", "POIVRE", "TOMATE",
    "PIZZA", "BURGER", "PATES", "RIZ", "POULET", "POISSON", "VIANDE", "SALADE",
    "GATEAU", "CHOCOLAT", "BONBON", "GLACE", "CREPE", "TARTE", "BISCUIT", "CROISSANT",
    "SOUPE", "SANDWICH", "OMELETTE", "QUICHE", "GRATIN", "STEAK", "ROTI", "JAMBON",

    // Objets du quotidien
    "TABLE", "CHAISE", "LIT", "ARMOIRE", "BUREAU", "CANAPE", "LAMPE", "MIROIR",
    "TELEPHONE", "ORDINATEUR", "CLAVIER", "SOURIS", "ECRAN", "TABLETTE", "CASQUE", "ENCEINTE",
    "STYLO", "CRAYON", "GOMME", "CAHIER", "LIVRE", "JOURNAL", "MAGAZINE", "LETTRE",
    "VERRE", "ASSIETTE", "FOURCHETTE", "COUTEAU", "CUILLERE", "BOL", "TASSE", "POELE",
    "VOITURE", "VELO", "MOTO", "BUS", "TRAIN", "AVION", "BATEAU", "CAMION",

    // Lieux et bâtiments
    "MAISON", "ECOLE", "JARDIN", "FENETRE", "PORTE", "MUR", "TOIT", "ESCALIER",
    "MUSEE", "THEATRE", "CINEMA", "RESTAURANT", "CAFE", "HOTEL", "HOPITAL", "GARE",
    "EGLISE", "TEMPLE", "MOSQUEE", "CHATEAU", "TOUR", "PONT", "TUNNEL", "STADE",
    "PISCINE", "GYMNASE", "PARC", "ZOO", "CIRQUE", "MARCHE", "BOUTIQUE", "BANQUE",

    // Météo et saisons
    "PLUIE", "NEIGE", "VENT", "ORAGE", "BROUILLARD", "GRELE", "NUAGE", "ECLAIR",
    "HIVER", "ETE", "PRINTEMPS", "AUTOMNE", "CHALEUR", "FROID", "GEL", "CANICULE",

    // Temps et moments
    "TEMPS", "JOUR", "NUIT", "MATIN", "MIDI", "SOIR", "AUBE", "CREPUSCULE",
    "HEURE", "MINUTE", "SECONDE", "SEMAINE", "MOIS", "ANNEE", "SIECLE", "INSTANT",
    "HIER", "AUJOURD", "DEMAIN", "AVANT", "APRES", "MAINTENANT", "TOUJOURS", "JAMAIS",

    // Sentiments et émotions
    "AMOUR", "JOIE", "PAIX", "REVE", "ESPOIR", "FORCE", "COURAGE", "LIBERTE",
    "PEUR", "COLERE", "TRISTESSE", "BONHEUR", "PLAISIR", "DOULEUR", "SURPRISE", "CALME",
    "CONFIANCE", "DOUTE", "PATIENCE", "PASSION", "DESIR", "HAINE", "JALOUSIE", "FIERTE",

    // Couleurs
    "ROUGE", "BLEU", "VERT", "JAUNE", "NOIR", "BLANC", "ORANGE", "VIOLET",
    "ROSE", "GRIS", "MARRON", "BEIGE", "TURQUOISE", "ARGENT", "DORE", "BRONZE",

    // Corps humain
    "TETE", "BRAS", "JAMBE", "MAIN", "PIED", "DOIGT", "OEIL", "NEZ",
    "BOUCHE", "OREILLE", "DENT", "LANGUE", "CHEVEU", "VISAGE", "COU", "EPAULE",
    "COEUR", "POUMON", "ESTOMAC", "CERVEAU", "SANG", "OS", "MUSCLE", "PEAU",

    // Sports et activités
    "FOOT", "BASKET", "TENNIS", "RUGBY", "BOXE", "NATATION", "COURSE", "VELO",
    "SKI", "SURF", "PLONGEE", "ESCALADE", "DANSE", "YOGA", "JUDO", "KARATE",
    "GOLF", "BASEBALL", "HOCKEY", "VOLLEY", "HANDBALL", "ESCRIME", "ATHLETISME", "GYMNASTIQUE",

    // Arts et culture
    "MUSIQUE", "PEINTURE", "SCULPTURE", "THEATRE", "DANSE", "CINEMA", "POESIE", "ROMAN",
    "CHANT", "PIANO", "GUITARE", "VIOLON", "BATTERIE", "FLUTE", "SAXOPHONE", "TROMPETTE",
    "PHOTO", "DESSIN", "AQUARELLE", "CRAYON", "PASTEL", "ENCRE", "TOILE", "PALETTE",

    // Technologie
    "INTERNET", "JEUX", "CODE", "LOGICIEL", "PROGRAMME", "FICHIER", "DONNEE", "RESEAU",
    "ROBOT", "ANDROID", "APPLICATION", "SITE", "MESSAGE", "EMAIL", "VIDEO", "IMAGE",
    "SERVEUR", "CLOUD", "WIFI", "BLUETOOTH", "USB", "DISQUE", "MEMOIRE", "PROCESSEUR",

    // Espace et science
    "ESPACE", "MONDE", "PLANETE", "ETOILE", "GALAXIE", "COSMOS", "UNIVERS", "NEBULEUSE",
    "MARS", "VENUS", "JUPITER", "SATURNE", "MERCURE", "NEPTUNE", "URANUS", "PLUTON",
    "COMETE", "ASTEROIDE", "SATELLITE", "FUSEE", "ASTRONAUTE", "TELESCOPE", "ORBITE", "CRATERE",

    // Abstrait
    "VIE", "MORT", "REVE", "REALITE", "VERITE", "MENSONGE", "BIEN", "MAL",
    "BEAUTE", "LAIDEUR", "RICHESSE", "PAUVRETE", "SAGESSE", "FOLIE", "ORDRE", "CHAOS",
    "JUSTICE", "INJUSTICE", "GUERRE", "PAIX", "VICTOIRE", "DEFAITE", "DEBUT", "FIN",
];

// Messages d'erreur
const ERROR_MESSAGES = [
    "T NAZE", "VA VOIR AILLEURS", "C'EST PAS ÇA !", "T'ES AVEUGLE ?",
    "RATÉ !", "ESSAIE ENCORE", "NON MAIS SÉRIEUX ?", "TU PEUX MIEUX FAIRE",
    "MAUVAISE TOUCHE !", "CONCENTRE-TOI !", "RECOMMENCE !", "ÉCHEC TOTAL",
];

// Couleurs
const COLORS = [
    0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff,
    0xff8000, 0x8000ff, 0xffc0cb, 0x008080, 0x808000, 0x800000,
    0xff1493, 0x00fa9a,
];

class LetterGame {
    constructor() {
        this.score = 0;
        this.currentWord = this.generateWord();
        this.typedText = "";
        this.backgroundColor = this.getRandomColor();

        // Stats
        this.startTime = Date.now();
        this.totalWordsTyped = 0;
        this.currentWPM = 0;
        this.totalKeystrokes = 0;
        this.correctKeystrokes = 0;

        // Combo system
        this.combo = 0;
        this.comboMultiplier = 1;
        this.lastSuccessTime = Date.now();

        // Progression system
        this.progressionOffset = 0;
        this.targetProgressionOffset = 0;
        this.totalProgress = 0;

        // Bomb system
        this.bombMaxTime = 10000; // 10 secondes pour taper le mot
        this.bombStartTime = Date.now();
        this.fuseProgress = 0; // 0 à 1, quand il atteint 1, explosion
        this.bombExploding = false; // Pour éviter que le timer continue pendant l'explosion
        this.errorCount = 0; // Compteur d'erreurs (2 erreurs = explosion)
        this.maxErrors = 2; // Nombre max d'erreurs avant explosion

        this.setupScene();
        this.setupBomb();
        this.setupParticles();
        this.setupPostProcessing();
        this.setupProgressionPath();
        this.setupUI();
        this.setupEventListeners();
        this.animate();
    }

    setupScene() {
        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 30;

        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        // Lumières améliorées
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        // Lumières directionnelles colorées
        this.lights = [];
        const lightColors = [0xff0000, 0x00ff00, 0x0000ff];
        const lightPositions = [
            [10, 10, 10],
            [-10, -10, 10],
            [0, 10, -10]
        ];

        for (let i = 0; i < 3; i++) {
            const light = new THREE.DirectionalLight(lightColors[i], 0.5);
            light.position.set(...lightPositions[i]);
            light.castShadow = true;
            this.lights.push(light);
            this.scene.add(light);
        }

        // Lumière point dynamique principale
        this.pointLight = new THREE.PointLight(0xffffff, 2, 100);
        this.pointLight.position.set(0, 0, 20);
        this.scene.add(this.pointLight);

        this.updateBackgroundColor();
    }

    setupParticles() {
        // Système de particules en arrière-plan
        const particleCount = 200;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 50 - 20;

            const color = new THREE.Color(COLORS[Math.floor(Math.random() * COLORS.length)]);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;

            sizes[i] = Math.random() * 2 + 0.5;
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const particleMaterial = new THREE.PointsMaterial({
            size: 1,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        this.particleSystem = new THREE.Points(particles, particleMaterial);
        this.scene.add(this.particleSystem);
    }

    setupPostProcessing() {
        // Effet de vignette et bloom (simplifié)
        this.postProcessTime = 0;
    }

    setupProgressionPath() {
        // Créer le groupe de progression (au premier plan, mais visible)
        this.progressionGroup = new THREE.Group();
        this.progressionGroup.position.z = 10; // Plus proche mais toujours devant le mur
        this.progressionGroup.position.y = -10; // Plus bas pour être bien visible

        // Créer la ligne du chemin
        const pathGeometry = new THREE.BufferGeometry();
        const pathPoints = [];
        const numPoints = 50;

        for (let i = 0; i < numPoints; i++) {
            pathPoints.push(new THREE.Vector3(i * 3 - 75, 0, 0));
        }

        pathGeometry.setFromPoints(pathPoints);
        const pathMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 3,
            transparent: true,
            opacity: 0.8
        });

        this.pathLine = new THREE.Line(pathGeometry, pathMaterial);
        this.progressionGroup.add(this.pathLine);

        // Créer les points de progression (agrandis)
        this.progressionDots = [];
        const dotSpacing = 4;
        const numDots = 25;

        for (let i = 0; i < numDots; i++) {
            const dotGeometry = new THREE.SphereGeometry(0.5, 16, 16);
            const dotMaterial = new THREE.MeshStandardMaterial({
                color: 0xffaa00,
                emissive: 0xffaa00,
                emissiveIntensity: 1.0,
                metalness: 0.8,
                roughness: 0.2
            });

            const dot = new THREE.Mesh(dotGeometry, dotMaterial);
            dot.position.x = i * dotSpacing;
            dot.position.y = 0;
            dot.castShadow = true;

            // Ajouter un halo autour du point (plus grand)
            const haloGeometry = new THREE.RingGeometry(0.6, 1.0, 32);
            const haloMaterial = new THREE.MeshBasicMaterial({
                color: 0xffaa00,
                transparent: true,
                opacity: 0.5,
                side: THREE.DoubleSide
            });
            const halo = new THREE.Mesh(haloGeometry, haloMaterial);
            halo.rotation.x = Math.PI / 2;
            dot.add(halo);

            dot.userData = {
                halo: halo,
                initialY: 0,
                index: i
            };

            this.progressionGroup.add(dot);
            this.progressionDots.push(dot);
        }

        // Créer le personnage (un simple bonhomme stylisé) - AGRANDI
        this.character = new THREE.Group();
        const scale = 2; // Facteur d'échelle pour rendre le personnage plus visible

        // Corps
        const bodyGeometry = new THREE.CapsuleGeometry(0.3 * scale, 0.8 * scale, 8, 16);
        const bodyMaterial = new THREE.MeshStandardMaterial({
            color: 0x4444ff,
            metalness: 0.3,
            roughness: 0.7
        });
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        body.position.y = 1.2 * scale;
        body.castShadow = true;
        this.character.add(body);

        // Tête
        const headGeometry = new THREE.SphereGeometry(0.35 * scale, 16, 16);
        const headMaterial = new THREE.MeshStandardMaterial({
            color: 0xffcc88,
            metalness: 0.2,
            roughness: 0.8
        });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 2.2 * scale;
        head.castShadow = true;
        this.character.add(head);

        // Yeux
        const eyeGeometry = new THREE.SphereGeometry(0.08 * scale, 8, 8);
        const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

        const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        leftEye.position.set(-0.12 * scale, 2.25 * scale, 0.3 * scale);
        this.character.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
        rightEye.position.set(0.12 * scale, 2.25 * scale, 0.3 * scale);
        this.character.add(rightEye);

        // Jambes
        const legGeometry = new THREE.CapsuleGeometry(0.12 * scale, 0.6 * scale, 8, 8);
        const legMaterial = new THREE.MeshStandardMaterial({
            color: 0x2222aa,
            metalness: 0.3,
            roughness: 0.7
        });

        const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
        leftLeg.position.set(-0.15 * scale, 0.5 * scale, 0);
        leftLeg.castShadow = true;
        this.character.add(leftLeg);
        this.character.userData.leftLeg = leftLeg;

        const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
        rightLeg.position.set(0.15 * scale, 0.5 * scale, 0);
        rightLeg.castShadow = true;
        this.character.add(rightLeg);
        this.character.userData.rightLeg = rightLeg;

        // Bras
        const armGeometry = new THREE.CapsuleGeometry(0.1 * scale, 0.6 * scale, 8, 8);
        const armMaterial = new THREE.MeshStandardMaterial({
            color: 0xffcc88,
            metalness: 0.2,
            roughness: 0.8
        });

        const leftArm = new THREE.Mesh(armGeometry, armMaterial);
        leftArm.position.set(-0.4 * scale, 1.3 * scale, 0);
        leftArm.rotation.z = 0.3;
        leftArm.castShadow = true;
        this.character.add(leftArm);
        this.character.userData.leftArm = leftArm;

        const rightArm = new THREE.Mesh(armGeometry, armMaterial);
        rightArm.position.set(0.4 * scale, 1.3 * scale, 0);
        rightArm.rotation.z = -0.3;
        rightArm.castShadow = true;
        this.character.add(rightArm);
        this.character.userData.rightArm = rightArm;

        this.character.position.x = 0;
        this.character.position.y = 0;
        this.character.castShadow = true;

        // Lumière sur le personnage (plus forte et plus grande portée)
        const characterLight = new THREE.PointLight(0xffffff, 2, 20);
        characterLight.position.set(0, 3 * scale, 2 * scale);
        this.character.add(characterLight);

        this.progressionGroup.add(this.character);

        // Variables pour l'animation de marche
        this.walkCycle = 0;
        this.isWalking = false;

        this.scene.add(this.progressionGroup);
    }

    setupBomb() {
        this.bombGroup = new THREE.Group();

        // Corps de la bombe (sphère noire)
        const bombGeometry = new THREE.SphereGeometry(3, 32, 32);
        const bombMaterial = new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            roughness: 0.3,
            metalness: 0.8
        });
        this.bombBody = new THREE.Mesh(bombGeometry, bombMaterial);
        this.bombBody.castShadow = true;
        this.bombGroup.add(this.bombBody);

        // Cylindre métallique en haut
        const topGeometry = new THREE.CylinderGeometry(0.5, 0.8, 1, 16);
        const topMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.2,
            metalness: 0.9
        });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = 3.5;
        top.castShadow = true;
        this.bombGroup.add(top);

        // Mèche (ligne courbe qui brûle)
        const fusePoints = [];
        for (let i = 0; i <= 30; i++) {
            const t = i / 30;
            const x = Math.sin(t * Math.PI * 2) * 0.5;
            const y = 4 + t * 3;
            const z = Math.cos(t * Math.PI * 2) * 0.5;
            fusePoints.push(new THREE.Vector3(x, y, z));
        }

        const fuseGeometry = new THREE.BufferGeometry().setFromPoints(fusePoints);
        const fuseMaterial = new THREE.LineBasicMaterial({
            color: 0x8b4513,
            linewidth: 3
        });
        this.fuse = new THREE.Line(fuseGeometry, fuseMaterial);
        this.bombGroup.add(this.fuse);

        // Étincelle au bout de la mèche
        const sparkGeometry = new THREE.SphereGeometry(0.3, 16, 16);
        const sparkMaterial = new THREE.MeshBasicMaterial({
            color: 0xff4500,
            emissive: 0xff4500,
            emissiveIntensity: 2
        });
        this.spark = new THREE.Mesh(sparkGeometry, sparkMaterial);
        this.spark.position.set(0, 7, 0);
        this.bombGroup.add(this.spark);

        // Lumière de l'étincelle
        this.sparkLight = new THREE.PointLight(0xff4500, 2, 10);
        this.spark.add(this.sparkLight);

        // Particules autour de l'étincelle
        const sparkParticlesGeometry = new THREE.BufferGeometry();
        const sparkParticlesPositions = new Float32Array(20 * 3);
        for (let i = 0; i < 20; i++) {
            sparkParticlesPositions[i * 3] = (Math.random() - 0.5) * 0.5;
            sparkParticlesPositions[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
            sparkParticlesPositions[i * 3 + 2] = (Math.random() - 0.5) * 0.5;
        }
        sparkParticlesGeometry.setAttribute('position', new THREE.BufferAttribute(sparkParticlesPositions, 3));
        const sparkParticlesMaterial = new THREE.PointsMaterial({
            color: 0xffa500,
            size: 0.2,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
        this.sparkParticles = new THREE.Points(sparkParticlesGeometry, sparkParticlesMaterial);
        this.spark.add(this.sparkParticles);

        this.bombGroup.position.set(0, 0, 0);
        this.scene.add(this.bombGroup);

        // Fragments pour l'explosion
        this.bombFragments = [];
    }

    explodeBomb(success = true) {
        // Marquer comme en train d'exploser
        this.bombExploding = true;

        // Créer des fragments de la bombe
        this.bombFragments = [];
        const numFragments = 20;

        for (let i = 0; i < numFragments; i++) {
            const fragmentGeometry = new THREE.SphereGeometry(0.5 + Math.random() * 0.5, 8, 8);
            const fragmentMaterial = new THREE.MeshStandardMaterial({
                color: success ? this.backgroundColor : 0xff0000,
                roughness: 0.5,
                metalness: 0.5
            });

            const fragment = new THREE.Mesh(fragmentGeometry, fragmentMaterial);
            fragment.position.copy(this.bombBody.position);

            const direction = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2,
                (Math.random() - 0.5) * 2
            ).normalize();

            fragment.userData = {
                velocity: direction.multiplyScalar(10 + Math.random() * 10),
                rotation: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.3,
                    (Math.random() - 0.5) * 0.3,
                    (Math.random() - 0.5) * 0.3
                )
            };

            this.scene.add(fragment);
            this.bombFragments.push(fragment);
        }

        // Masquer la bombe temporairement
        this.bombGroup.visible = false;

        // Flash lumineux
        this.pointLight.color.setHex(success ? this.backgroundColor : 0xff0000);
        this.pointLight.intensity = 8;

        setTimeout(() => {
            this.pointLight.color.setHex(0xffffff);
            this.pointLight.intensity = 2;
        }, 100);

        // Reconstruire après 1 seconde (plus rapide)
        setTimeout(() => {
            this.rebuildBomb();
        }, 1000);
    }

    rebuildBomb() {
        // Nettoyer les fragments
        this.bombFragments.forEach(fragment => {
            this.scene.remove(fragment);
        });
        this.bombFragments = [];

        // Réafficher la bombe
        this.bombGroup.visible = true;
        this.bombExploding = false; // Réactiver le timer

        // Réinitialiser la mèche (mais bombStartTime est déjà réinitialisé lors du succès)
        this.fuseProgress = 0;

        // Changer la couleur de fond
        const newColor = this.getRandomColor();
        this.backgroundColor = newColor;
        this.updateBackgroundColor();
    }

    easeOutElastic(x) {
        const c4 = (2 * Math.PI) / 3;
        return x === 0 ? 0 : x === 1 ? 1 :
            Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    }

    updateBackgroundColor() {
        const color = new THREE.Color(this.backgroundColor);
        this.scene.background = color;
        this.scene.fog = new THREE.Fog(this.backgroundColor, 50, 100);
    }

    setupUI() {
        this.letterDisplay = document.getElementById('letter-display');
        this.scoreDisplay = document.getElementById('score');
        this.errorDisplay = document.getElementById('error-message');
        this.wpmDisplay = document.getElementById('wpm');
        this.comboDisplay = document.getElementById('combo');
        this.accuracyDisplay = document.getElementById('accuracy');
        this.errorCounterDisplay = document.getElementById('error-counter');

        this.updateUI();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        window.addEventListener('resize', () => this.handleResize());
    }

    handleKeyPress(event) {
        if (event.key === 'Escape') {
            if (confirm('Voulez-vous quitter le jeu ?')) {
                window.close();
            }
            return;
        }

        if (event.key === 'Backspace') {
            this.typedText = this.typedText.slice(0, -1);
            this.updateUI();
            return;
        }

        if (event.key.match(/^[a-zA-Z]$/)) {
            const pressedKey = event.key.toUpperCase();
            this.typedText += pressedKey;
            this.totalKeystrokes++;

            if (this.currentWord.startsWith(this.typedText)) {
                this.correctKeystrokes++;
                this.updateUI();

                if (this.typedText === this.currentWord) {
                    // Mot complet !
                    this.score += this.comboMultiplier;
                    this.totalWordsTyped++;

                    // Système de combo
                    const timeSinceLastSuccess = Date.now() - this.lastSuccessTime;
                    if (timeSinceLastSuccess < 3000) {
                        this.combo++;
                        this.comboMultiplier = Math.min(Math.floor(this.combo / 3) + 1, 10);
                    } else {
                        this.combo = 1;
                        this.comboMultiplier = 1;
                    }
                    this.lastSuccessTime = Date.now();

                    this.updateWPM();
                    this.explodeBomb(true);
                    this.updateComboDisplay();

                    // Faire avancer le personnage
                    this.advanceCharacter();

                    this.currentWord = this.generateWord();
                    this.typedText = "";
                    this.bombStartTime = Date.now(); // Reset bomb timer
                    this.errorCount = 0; // Reset compteur d'erreurs
                    this.updateUI();
                    this.hideError();
                }
            } else {
                // Erreur
                this.typedText = "";
                this.errorCount++;

                // Si 2 erreurs, explosion de la bombe !
                if (this.errorCount >= this.maxErrors) {
                    this.explodeBomb(false);
                    this.makeCharacterJumpBack();
                    this.combo = 0;
                    this.comboMultiplier = 1;
                    this.showError();
                    this.shakeCamera();
                    this.updateComboDisplay();

                    // Nouveau mot
                    this.currentWord = this.generateWord();
                    this.bombStartTime = Date.now();
                    this.errorCount = 0; // Reset compteur d'erreurs
                } else {
                    // Première erreur, juste afficher le message
                    this.combo = 0;
                    this.comboMultiplier = 1;
                    this.showError();
                    this.shakeCamera();
                    this.updateComboDisplay();
                }

                this.updateUI();
            }
        }
    }

    handleResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    generateWord() {
        return WORDS[Math.floor(Math.random() * WORDS.length)];
    }

    getRandomColor() {
        return COLORS[Math.floor(Math.random() * COLORS.length)];
    }

    getContrastColor(backgroundColor) {
        const color = new THREE.Color(backgroundColor);
        const brightness = (color.r * 299 + color.g * 587 + color.b * 114) / 1000;

        const availableColors = COLORS.filter(c => {
            if (c === backgroundColor) return false;
            const testColor = new THREE.Color(c);
            const testBrightness = (testColor.r * 299 + testColor.g * 587 + testColor.b * 114) / 1000;
            return Math.abs(brightness - testBrightness) > 0.3;
        });

        return availableColors[Math.floor(Math.random() * availableColors.length)] || 0xffffff;
    }

    updateWPM() {
        const elapsedMinutes = (Date.now() - this.startTime) / 60000;
        if (elapsedMinutes > 0) {
            this.currentWPM = Math.round(this.totalWordsTyped / elapsedMinutes);
        }
    }

    updateComboDisplay() {
        if (this.combo > 1) {
            this.comboDisplay.textContent = `x${this.comboMultiplier} COMBO!`;
            this.comboDisplay.classList.add('show');

            // Animation de taille basée sur le combo
            const scale = 1 + (this.comboMultiplier * 0.1);
            this.comboDisplay.style.transform = `scale(${scale})`;
        } else {
            this.comboDisplay.classList.remove('show');
        }
    }

    advanceCharacter() {
        // Augmenter la position cible du personnage de 4 unités (distance entre les points)
        this.totalProgress += 4;

        // L'offset du groupe se déplace dans la direction opposée pour garder le personnage centré
        this.targetProgressionOffset = this.totalProgress;

        // Activer l'animation de marche
        this.isWalking = true;

        // Tourner le personnage vers la droite (direction de marche)
        this.character.rotation.y = -Math.PI / 6; // Légère rotation vers la droite

        // Désactiver la marche après un court délai
        setTimeout(() => {
            this.isWalking = false;
            // Réinitialiser la rotation
            this.character.rotation.y = 0;
        }, 500);

        // Faire briller le prochain point
        const nextDotIndex = Math.floor(this.totalProgress / 4) % this.progressionDots.length;
        if (this.progressionDots[nextDotIndex]) {
            const dot = this.progressionDots[nextDotIndex];

            // Animation de saut du point
            const startTime = Date.now();
            const animateDot = () => {
                const elapsed = Date.now() - startTime;
                const progress = elapsed / 300;

                if (progress < 1) {
                    dot.position.y = Math.sin(progress * Math.PI) * 1.5;
                    dot.userData.halo.rotation.z += 0.1;
                    requestAnimationFrame(animateDot);
                } else {
                    dot.position.y = 0;
                }
            };
            animateDot();
        }
    }

    makeCharacterJumpBack() {
        // Faire reculer le personnage d'un point (pénalité)
        this.totalProgress = Math.max(0, this.totalProgress - 4);
        this.targetProgressionOffset = this.totalProgress;

        // Animation de saut en arrière avec rotation
        const startTime = Date.now();
        const duration = 600;
        const startRotation = this.character.rotation.y;
        const startY = this.character.position.y;

        const animateJumpBack = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            if (progress < 1) {
                // Parabole pour le saut
                const jumpHeight = Math.sin(progress * Math.PI) * 3;
                this.character.position.y = startY + jumpHeight;

                // Rotation en arrière pendant le saut
                this.character.rotation.y = startRotation + Math.sin(progress * Math.PI) * Math.PI / 3;

                // Inclinaison dramatique
                this.character.rotation.z = Math.sin(progress * Math.PI * 2) * 0.3;

                requestAnimationFrame(animateJumpBack);
            } else {
                // Réinitialiser les rotations
                this.character.position.y = 0;
                this.character.rotation.y = 0;
                this.character.rotation.z = 0;
            }
        };

        animateJumpBack();
    }

    updateUI() {
        this.scoreDisplay.textContent = `Score: ${this.score}`;
        this.wpmDisplay.textContent = `WPM: ${this.currentWPM}`;

        // Précision
        const accuracy = this.totalKeystrokes > 0
            ? Math.round((this.correctKeystrokes / this.totalKeystrokes) * 100)
            : 100;
        this.accuracyDisplay.textContent = `Précision: ${accuracy}%`;

        // Compteur d'erreurs
        this.errorCounterDisplay.textContent = `❌ ${this.errorCount}/${this.maxErrors}`;

        // Animation si 1 erreur (avertissement)
        if (this.errorCount === 1) {
            this.errorCounterDisplay.classList.add('warning');
        } else {
            this.errorCounterDisplay.classList.remove('warning');
        }

        // Affichage du mot avec progression
        let displayText = '';
        for (let i = 0; i < this.currentWord.length; i++) {
            if (i < this.typedText.length) {
                displayText += `<span style="color: #00ff00; text-shadow: 0 0 20px #00ff00, 0 0 40px #00ff00;">${this.currentWord[i]}</span>`;
            } else {
                displayText += this.currentWord[i];
            }
        }

        this.letterDisplay.innerHTML = displayText;

        const letterColor = this.getContrastColor(this.backgroundColor);
        this.letterDisplay.style.color = '#' + new THREE.Color(letterColor).getHexString();
    }

    showError() {
        const message = ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)];
        this.errorDisplay.textContent = message;
        this.errorDisplay.classList.add('show');

        setTimeout(() => {
            this.hideError();
        }, 1000);
    }

    hideError() {
        this.errorDisplay.classList.remove('show');
    }

    shakeCamera() {
        const originalZ = this.camera.position.z;
        const shakeIntensity = 0.8;
        const shakeDuration = 400;
        const startTime = Date.now();

        const shake = () => {
            const elapsed = Date.now() - startTime;
            if (elapsed < shakeDuration) {
                this.camera.position.x = (Math.random() - 0.5) * shakeIntensity;
                this.camera.position.y = (Math.random() - 0.5) * shakeIntensity;
                this.camera.rotation.z = (Math.random() - 0.5) * 0.05;
                requestAnimationFrame(shake);
            } else {
                this.camera.position.x = 0;
                this.camera.position.y = 0;
                this.camera.position.z = originalZ;
                this.camera.rotation.z = 0;
            }
        };

        shake();
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = Date.now() * 0.001;

        // Animer les particules en arrière-plan
        if (this.particleSystem) {
            this.particleSystem.rotation.y = time * 0.05;
            this.particleSystem.rotation.x = Math.sin(time * 0.3) * 0.1;

            const positions = this.particleSystem.geometry.attributes.position.array;
            for (let i = 0; i < positions.length; i += 3) {
                positions[i + 1] += Math.sin(time + positions[i]) * 0.02;
            }
            this.particleSystem.geometry.attributes.position.needsUpdate = true;
        }

        // Animer les lumières colorées
        this.lights.forEach((light, index) => {
            const angle = time + (index * Math.PI * 2 / 3);
            light.position.x = Math.cos(angle) * 15;
            light.position.y = Math.sin(angle) * 15;
        });

        // Animer la bombe et la mèche
        if (this.bombGroup && this.bombGroup.visible && !this.bombExploding) {
            // Calculer la progression de la mèche
            const elapsed = Date.now() - this.bombStartTime;
            this.fuseProgress = Math.min(elapsed / this.bombMaxTime, 1);

            // Déplacer l'étincelle le long de la mèche
            const fuseLength = 30; // Nombre de points dans la mèche
            const sparkPosition = fuseLength - (this.fuseProgress * fuseLength);
            const sparkT = Math.max(0, sparkPosition / fuseLength);

            this.spark.position.x = Math.sin(sparkT * Math.PI * 2) * 0.5;
            this.spark.position.y = 4 + sparkT * 3;
            this.spark.position.z = Math.cos(sparkT * Math.PI * 2) * 0.5;

            // Animation de l'étincelle (scintillement)
            this.spark.scale.setScalar(1 + Math.sin(time * 20) * 0.3);
            this.sparkLight.intensity = 2 + Math.sin(time * 20) * 1;

            // Rotation de la bombe
            this.bombGroup.rotation.y = time * 0.5;

            // Si la mèche atteint la bombe, explosion !
            if (this.fuseProgress >= 1) {
                // Explosion de la bombe (échec)
                this.explodeBomb(false);
                this.makeCharacterJumpBack();
                this.combo = 0;
                this.comboMultiplier = 1;
                this.showError();
                this.shakeCamera();
                this.updateComboDisplay();

                // Nouveau mot
                this.currentWord = this.generateWord();
                this.typedText = "";
                this.bombStartTime = Date.now();
                this.errorCount = 0; // Reset compteur d'erreurs
                this.updateUI();
            }
        }

        // Mettre à jour les fragments de la bombe
        if (this.bombFragments && this.bombFragments.length > 0) {
            this.bombFragments.forEach(fragment => {
                fragment.userData.velocity.y -= 0.5;
                fragment.position.add(fragment.userData.velocity.clone().multiplyScalar(0.016));

                fragment.rotation.x += fragment.userData.rotation.x;
                fragment.rotation.y += fragment.userData.rotation.y;
                fragment.rotation.z += fragment.userData.rotation.z;

                // Effet de fade
                fragment.material.opacity = Math.max(0, 1 - (fragment.position.length() / 100));
                fragment.material.transparent = true;
            });
        }

        // Animer le système de progression
        if (this.progressionGroup) {
            // Interpoler doucement vers la position cible
            const lerpSpeed = 0.1;
            this.progressionOffset += (this.targetProgressionOffset - this.progressionOffset) * lerpSpeed;

            // Faire avancer le personnage vers la droite
            const targetCharacterX = this.progressionOffset;
            const currentCharacterX = this.character.position.x;
            this.character.position.x += (targetCharacterX - currentCharacterX) * lerpSpeed;

            // Déplacer tout le groupe vers la gauche pour garder le personnage centré à l'écran
            this.progressionGroup.position.x = -this.progressionOffset;

            // Animation de marche du personnage
            if (this.isWalking) {
                this.walkCycle += 0.25;

                // Animation des jambes - mouvement plus prononcé pour une vraie marche
                if (this.character.userData.leftLeg && this.character.userData.rightLeg) {
                    // Rotation des jambes pour créer un pas
                    const legSwing = Math.sin(this.walkCycle) * 0.8;
                    this.character.userData.leftLeg.rotation.x = legSwing;
                    this.character.userData.rightLeg.rotation.x = -legSwing;

                    // Légère rotation latérale pour plus de réalisme
                    this.character.userData.leftLeg.rotation.z = Math.abs(Math.sin(this.walkCycle)) * 0.1;
                    this.character.userData.rightLeg.rotation.z = -Math.abs(Math.sin(this.walkCycle)) * 0.1;
                }

                // Animation des bras - mouvement opposé aux jambes
                if (this.character.userData.leftArm && this.character.userData.rightArm) {
                    const armSwing = Math.sin(this.walkCycle + Math.PI) * 0.4;
                    this.character.userData.leftArm.rotation.x = armSwing;
                    this.character.userData.rightArm.rotation.x = -armSwing;
                }

                // Mouvement vertical (rebond naturel de la marche)
                this.character.position.y = Math.abs(Math.sin(this.walkCycle * 2)) * 0.2;

                // Légère inclinaison du corps lors de la marche
                const bodyTilt = Math.sin(this.walkCycle) * 0.05;
                this.character.children[0].rotation.z = bodyTilt; // Le corps est le premier enfant
            } else {
                // Réinitialiser progressivement toutes les positions
                this.character.position.y *= 0.9;
                if (this.character.userData.leftLeg) {
                    this.character.userData.leftLeg.rotation.x *= 0.9;
                    this.character.userData.leftLeg.rotation.z *= 0.9;
                }
                if (this.character.userData.rightLeg) {
                    this.character.userData.rightLeg.rotation.x *= 0.9;
                    this.character.userData.rightLeg.rotation.z *= 0.9;
                }
                if (this.character.userData.leftArm) this.character.userData.leftArm.rotation.x *= 0.9;
                if (this.character.userData.rightArm) this.character.userData.rightArm.rotation.x *= 0.9;
                if (this.character.children[0]) this.character.children[0].rotation.z *= 0.9;
            }

            // Animer les points de progression
            this.progressionDots.forEach((dot, index) => {
                // Rotation des halos
                if (dot.userData.halo) {
                    dot.userData.halo.rotation.z += 0.02;
                }

                // Pulsation lumineuse
                dot.material.emissiveIntensity = 0.5 + Math.sin(time * 2 + index * 0.5) * 0.3;

                // Mouvement vertical léger
                const baseY = dot.userData.initialY || 0;
                dot.position.y = baseY + Math.sin(time * 1.5 + index * 0.3) * 0.1;
            });
        }

        this.renderer.render(this.scene, this.camera);
    }
}

// Démarrer le jeu
new LetterGame();

