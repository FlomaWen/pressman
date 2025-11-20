import http.server
import socketserver
import webbrowser
import os

PORT = 8000

# Changer le répertoire vers le dossier du script
os.chdir(os.path.dirname(os.path.abspath(__file__)))

Handler = http.server.SimpleHTTPRequestHandler

print(f"🎮 Serveur démarré sur http://localhost:{PORT}")
print(f"📂 Dossier servi : {os.getcwd()}")
print("🌐 Ouverture du navigateur...")
print("\nAppuyez sur Ctrl+C pour arrêter le serveur\n")

# Ouvrir le navigateur automatiquement
webbrowser.open(f'http://localhost:{PORT}')

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\n👋 Serveur arrêté")

