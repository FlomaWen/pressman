import pygame
import random
import string
import sys

# Initialisation de pygame
pygame.init()

# Constantes
WINDOW_WIDTH = 800
WINDOW_HEIGHT = 600
FPS = 60

# Couleurs
COLORS = [
    (255, 0, 0),      # Rouge
    (0, 255, 0),      # Vert
    (0, 0, 255),      # Bleu
    (255, 255, 0),    # Jaune
    (255, 0, 255),    # Magenta
    (0, 255, 255),    # Cyan
    (255, 128, 0),    # Orange
    (128, 0, 255),    # Violet
    (255, 192, 203),  # Rose
    (0, 128, 128),    # Teal
    (128, 128, 0),    # Olive
    (128, 0, 0),      # Marron
]

# Messages d'erreur
ERROR_MESSAGES = [
    "T NAZE",
    "VA VOIR AILLEURS",
    "C'EST PAS ÇA !",
    "T'ES AVEUGLE ?",
    "RATÉ !",
    "ESSAIE ENCORE",
    "NON MAIS SÉRIEUX ?",
    "TU PEUX MIEUX FAIRE",
    "MAUVAISE TOUCHE !",
    "CONCENTRE-TOI !",
]

class LetterGame:
    def __init__(self):
        self.screen = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
        pygame.display.set_caption("Jeu des Lettres")
        self.clock = pygame.time.Clock()

        # État du jeu
        self.bg_color = random.choice(COLORS)
        self.current_letter = self.generate_letter()
        self.letter_color = self.get_contrasting_color()
        self.score = 0

        # Police
        self.letter_font = pygame.font.Font(None, 200)
        self.score_font = pygame.font.Font(None, 40)
        self.error_font = pygame.font.Font(None, 60)

        # Message d'erreur
        self.error_message = ""
        self.error_timer = 0

    def generate_letter(self):
        """Génère une lettre aléatoire"""
        return random.choice(string.ascii_uppercase)

    def get_contrasting_color(self):
        """Retourne une couleur contrastante avec le fond"""
        while True:
            color = random.choice(COLORS)
            # Vérifie que la couleur n'est pas la même que le fond
            if color != self.bg_color:
                # Calcule la différence de luminosité
                bg_luminosity = (self.bg_color[0] * 0.299 +
                               self.bg_color[1] * 0.587 +
                               self.bg_color[2] * 0.114)
                color_luminosity = (color[0] * 0.299 +
                                  color[1] * 0.587 +
                                  color[2] * 0.114)

                # Si la différence est suffisante, on utilise cette couleur
                if abs(bg_luminosity - color_luminosity) > 100:
                    return color

    def change_background(self):
        """Change la couleur de fond"""
        old_bg = self.bg_color
        while self.bg_color == old_bg:
            self.bg_color = random.choice(COLORS)

    def handle_keypress(self, key):
        """Gère les touches pressées"""
        if key.upper() == self.current_letter:
            # Bonne touche !
            self.score += 1
            self.change_background()
            self.current_letter = self.generate_letter()
            self.letter_color = self.get_contrasting_color()
            self.error_message = ""
        else:
            # Mauvaise touche !
            self.error_message = random.choice(ERROR_MESSAGES)
            self.error_timer = 60  # Affiche pendant 1 seconde (60 frames)

    def draw(self):
        """Dessine le jeu"""
        # Fond
        self.screen.fill(self.bg_color)

        # Lettre au centre
        letter_surface = self.letter_font.render(self.current_letter, True, self.letter_color)
        letter_rect = letter_surface.get_rect(center=(WINDOW_WIDTH // 2, WINDOW_HEIGHT // 2))
        self.screen.blit(letter_surface, letter_rect)

        # Score
        score_surface = self.score_font.render(f"Score: {self.score}", True, (255, 255, 255))
        score_rect = score_surface.get_rect(topleft=(10, 10))
        # Ombre pour le score
        shadow_surface = self.score_font.render(f"Score: {self.score}", True, (0, 0, 0))
        shadow_rect = shadow_surface.get_rect(topleft=(12, 12))
        self.screen.blit(shadow_surface, shadow_rect)
        self.screen.blit(score_surface, score_rect)

        # Message d'erreur
        if self.error_timer > 0:
            error_surface = self.error_font.render(self.error_message, True, (255, 0, 0))
            error_rect = error_surface.get_rect(center=(WINDOW_WIDTH // 2, WINDOW_HEIGHT - 100))
            # Ombre pour le message d'erreur
            error_shadow = self.error_font.render(self.error_message, True, (0, 0, 0))
            error_shadow_rect = error_shadow.get_rect(center=(WINDOW_WIDTH // 2 + 2, WINDOW_HEIGHT - 98))
            self.screen.blit(error_shadow, error_shadow_rect)
            self.screen.blit(error_surface, error_rect)
            self.error_timer -= 1

        pygame.display.flip()

    def run(self):
        """Boucle principale du jeu"""
        running = True

        while running:
            self.clock.tick(FPS)

            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    running = False
                elif event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_ESCAPE:
                        running = False
                    elif event.unicode.isalpha():
                        self.handle_keypress(event.unicode)

            self.draw()

        pygame.quit()
        sys.exit()

if __name__ == "__main__":
    game = LetterGame()
    game.run()

