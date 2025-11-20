#!/usr/bin/env node

/**
 * Script de vérification avant déploiement Railway
 * Lance ce script avec : node check-railway.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la configuration pour Railway...\n');

let errors = 0;
let warnings = 0;

// Vérifier les fichiers essentiels
const essentialFiles = [
    'server_websocket.js',
    'package.json',
    'Procfile',
    '.gitignore',
    'index.html',
    'game.js',
    'multiplayer.html',
    'game_multiplayer.js',
    'menu.html'
];

console.log('📁 Vérification des fichiers essentiels...');
essentialFiles.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file))) {
        console.log(`  ✅ ${file}`);
    } else {
        console.log(`  ❌ ${file} - MANQUANT`);
        errors++;
    }
});

// Vérifier package.json
console.log('\n📦 Vérification de package.json...');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

    // Vérifier les scripts
    if (packageJson.scripts && packageJson.scripts.start) {
        console.log(`  ✅ Script "start" défini: ${packageJson.scripts.start}`);
    } else {
        console.log('  ❌ Script "start" manquant');
        errors++;
    }

    // Vérifier les engines
    if (packageJson.engines && packageJson.engines.node) {
        console.log(`  ✅ Version Node.js spécifiée: ${packageJson.engines.node}`);
    } else {
        console.log('  ⚠️  Version Node.js non spécifiée (recommandé)');
        warnings++;
    }

    // Vérifier les dépendances
    const requiredDeps = ['express', 'socket.io'];
    requiredDeps.forEach(dep => {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
            console.log(`  ✅ Dépendance ${dep}: ${packageJson.dependencies[dep]}`);
        } else {
            console.log(`  ❌ Dépendance ${dep} manquante`);
            errors++;
        }
    });
} catch (e) {
    console.log('  ❌ Erreur lors de la lecture de package.json');
    errors++;
}

// Vérifier le serveur
console.log('\n🌐 Vérification du serveur...');
try {
    const serverCode = fs.readFileSync('server_websocket.js', 'utf8');

    // Vérifier le PORT dynamique
    if (serverCode.includes('process.env.PORT')) {
        console.log('  ✅ Variable PORT dynamique détectée');
    } else {
        console.log('  ❌ process.env.PORT non trouvé - nécessaire pour Railway');
        errors++;
    }

    // Vérifier CORS
    if (serverCode.includes('cors')) {
        console.log('  ✅ CORS configuré');
    } else {
        console.log('  ⚠️  Configuration CORS recommandée');
        warnings++;
    }

    // Vérifier Socket.IO
    if (serverCode.includes('socket.io')) {
        console.log('  ✅ Socket.IO importé');
    } else {
        console.log('  ❌ Socket.IO non trouvé');
        errors++;
    }
} catch (e) {
    console.log('  ❌ Erreur lors de la lecture du serveur');
    errors++;
}

// Vérifier .gitignore
console.log('\n🚫 Vérification de .gitignore...');
try {
    const gitignore = fs.readFileSync('.gitignore', 'utf8');
    if (gitignore.includes('node_modules')) {
        console.log('  ✅ node_modules/ exclu');
    } else {
        console.log('  ⚠️  node_modules/ devrait être exclu');
        warnings++;
    }

    if (gitignore.includes('.env')) {
        console.log('  ✅ .env exclu');
    } else {
        console.log('  ⚠️  .env devrait être exclu');
        warnings++;
    }
} catch (e) {
    console.log('  ⚠️  .gitignore non trouvé (recommandé)');
    warnings++;
}

// Vérifier Procfile
console.log('\n📄 Vérification de Procfile...');
try {
    const procfile = fs.readFileSync('Procfile', 'utf8');
    if (procfile.includes('node server_websocket.js')) {
        console.log('  ✅ Commande de démarrage correcte');
    } else {
        console.log('  ⚠️  Commande de démarrage non standard');
        warnings++;
    }
} catch (e) {
    console.log('  ⚠️  Procfile non trouvé (Railway peut détecter automatiquement)');
    warnings++;
}

// Résumé
console.log('\n' + '='.repeat(50));
console.log('📊 RÉSUMÉ DE LA VÉRIFICATION\n');

if (errors === 0 && warnings === 0) {
    console.log('🎉 PARFAIT ! Le projet est prêt pour Railway !');
    console.log('✨ Vous pouvez déployer en toute confiance.\n');
    console.log('Prochaines étapes :');
    console.log('1. Initialisez Git : git init');
    console.log('2. Commitez : git add . && git commit -m "Ready for Railway"');
    console.log('3. Créez un repo GitHub et poussez le code');
    console.log('4. Déployez sur Railway depuis GitHub');
    process.exit(0);
} else {
    if (errors > 0) {
        console.log(`❌ ${errors} erreur(s) critique(s) trouvée(s)`);
        console.log('⚠️  Corrigez ces erreurs avant de déployer.\n');
    }
    if (warnings > 0) {
        console.log(`⚠️  ${warnings} avertissement(s)`);
        console.log('💡 Ces avertissements n\'empêchent pas le déploiement,');
        console.log('   mais il est recommandé de les corriger.\n');
    }

    if (errors > 0) {
        console.log('📖 Consultez DEPLOY_RAILWAY.md pour plus d\'informations.');
        process.exit(1);
    } else {
        console.log('✅ Le projet peut être déployé malgré les avertissements.');
        process.exit(0);
    }
}

