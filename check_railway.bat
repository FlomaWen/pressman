@echo off
echo ========================================
echo   VERIFICATION RAILWAY - PRESSMAN
echo ========================================
echo.

cd /d "%~dp0"

echo Lancement de la verification...
echo.

node check-railway.js

echo.
echo ========================================
echo.

if %ERRORLEVEL% EQU 0 (
    echo [92m TOUT EST PRET ! [0m
    echo.
    echo Prochaines etapes :
    echo 1. Initialisez Git : git init
    echo 2. Ajoutez les fichiers : git add .
    echo 3. Commitez : git commit -m "Ready for Railway"
    echo 4. Creez un repo GitHub
    echo 5. Deployez sur Railway
    echo.
    echo Consultez RAILWAY_QUICK.md pour le guide complet
) else (
    echo [91m ERREURS DETECTEES [0m
    echo.
    echo Consultez les messages ci-dessus
    echo et corrigez les erreurs avant de deployer.
)

echo.
pause

