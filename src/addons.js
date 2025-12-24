// Paramètres de la grille
const gridSize = 100;
const cols = 11;
const rows = 8;
const totalTiles = 88;

// Stocke les positions occupées
const occupiedPositions = new Map();
let isRevealed = false;

// Génère les positions de la grille
const snapTargets = [];
for (let y = 0; y < rows; y++) {
  for (let x = 0; x < cols; x++) {
    snapTargets.push({ x: x * gridSize, y: y * gridSize });
  }
}

// Fonction pour arrondir à la grille
const snapToGrid = (x, y) => ({
  x: Math.round(x / gridSize) * gridSize,
  y: Math.round(y / gridSize) * gridSize,
});

// Initialise les positions occupées
function initOccupiedPositions() {
  occupiedPositions.clear();
  document.querySelectorAll('.tile').forEach(tile => {
    const x = parseFloat(tile.getAttribute('data-x'));
    const y = parseFloat(tile.getAttribute('data-y'));
    occupiedPositions.set(`${x},${y}`, tile.id);
  });
}

// Mélange les tuiles
function shuffleTiles() {
  const tiles = document.querySelectorAll('.tile');
  const shuffled = [...snapTargets].sort(() => Math.random() - 0.5);

  tiles.forEach((tile, index) => {
    const { x, y } = shuffled[index];
    setTimeout(() => {
      tile.style.transition = 'transform 0.3s ease-in-out';
      tile.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      tile.setAttribute('data-x', x);
      tile.setAttribute('data-y', y);
      tile.dataset.oldX = x;
      tile.dataset.oldY = y;
      occupiedPositions.set(`${x},${y}`, tile.id);
    }, index * 20);
  });
}

// Fonction de mouvement (sans transition pendant le drag)
function dragMoveListener(event) {
  const target = event.target;
  // Désactive la transition pendant le drag
  target.style.transition = 'none';
  const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
  const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
  target.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  target.setAttribute('data-x', x);
  target.setAttribute('data-y', y);
}

// Initialisation
window.addEventListener('DOMContentLoaded', () => {
  initOccupiedPositions();
  setTimeout(shuffleTiles, 1000);

  interact('.tile').draggable({
    inertia: false,
    autoScroll: true,
    modifiers: [
      interact.modifiers.snap({
        targets: snapTargets,
        range: gridSize / 2,
        relativePoints: [{ x: 0, y: 0 }],
      }),
      interact.modifiers.restrictRect({ restriction: 'parent', endOnly: true }),
    ],
    onmove: dragMoveListener,
    onend: function(event) {
      const tile = event.target;
      // Réactive la transition à la fin du drag
      tile.style.transition = 'transform 0.3s ease-in-out';

      const currentX = parseFloat(tile.getAttribute('data-x'));
      const currentY = parseFloat(tile.getAttribute('data-y'));
      const snapped = snapToGrid(currentX, currentY);
      const newPosKey = `${snapped.x},${snapped.y}`;
      const oldPosKey = `${tile.dataset.oldX},${tile.dataset.oldY}`;

      if (!occupiedPositions.has(newPosKey) || occupiedPositions.get(newPosKey) === tile.id) {
        // Applique la position alignée
        tile.style.transform = `translate3d(${snapped.x}px, ${snapped.y}px, 0)`;
        tile.setAttribute('data-x', snapped.x);
        tile.setAttribute('data-y', snapped.y);

        if (oldPosKey !== newPosKey) {
          occupiedPositions.delete(oldPosKey);
          occupiedPositions.set(newPosKey, tile.id);
          tile.dataset.oldX = snapped.x;
          tile.dataset.oldY = snapped.y;
        }
      } else {
        // Retour à l'ancienne position
        const oldX = parseFloat(tile.dataset.oldX);
        const oldY = parseFloat(tile.dataset.oldY);
        tile.style.transform = `translate3d(${oldX}px, ${oldY}px, 0)`;
        tile.setAttribute('data-x', oldX);
        tile.setAttribute('data-y', oldY);
      }
    }
  });

  // Bouton "Vérifier" avec retournement séquentiel
document.getElementById('toggleVerify').addEventListener('click', () => {
  isRevealed = !isRevealed;
  const tiles = document.querySelectorAll('.tile');

  if (isRevealed) {
    // Retourne les tuiles dans l'ordre de la grille (ligne par ligne)
    document.getElementById('toggleVerify').textContent = "Cacher";

    // Trie les tuiles selon leur position dans la grille
    const sortedTiles = [...tiles].sort((a, b) => {
      const aY = parseFloat(a.getAttribute('data-y'));
      const bY = parseFloat(b.getAttribute('data-y'));
      if (aY !== bY) return aY - bY; // Trie par ligne (Y)
      const aX = parseFloat(a.getAttribute('data-x'));
      const bX = parseFloat(b.getAttribute('data-y'));
      return aX - bX; // Trie par colonne (X) dans la même ligne
    });

    // Retourne les tuiles une par une avec un délai
    sortedTiles.forEach((tile, index) => {
      setTimeout(() => {
        const x = parseFloat(tile.getAttribute('data-x')) || 0;
        const y = parseFloat(tile.getAttribute('data-y')) || 0;
        tile.style.transform = `translate3d(${x}px, ${y}px, 0) rotateY(180deg)`;
      }, index * 100); // Délai de 100ms entre chaque tuile
    });
  } else {
    // Retourne toutes les tuiles à leur face recto en même temps
    document.getElementById('toggleVerify').textContent = "Vérifier";
    tiles.forEach(tile => {
      const x = parseFloat(tile.getAttribute('data-x')) || 0;
      const y = parseFloat(tile.getAttribute('data-y')) || 0;
      tile.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
  }
  });

});
