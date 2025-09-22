const directions = [
  { x: 1, y: 0 },   // Horizontal
  { x: 0, y: 1 },   // Vertical
  { x: 1, y: 1 },   // Diagonal down-right
  { x: 1, y: -1 },  // Diagonal up-right
  { x: -1, y: 0 },  // Horizontal reversed
  { x: 0, y: -1 },  // Vertical reversed
  { x: -1, y: -1 }, // Diagonal up-left
  { x: -1, y: 1 },  // Diagonal down-left
];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export interface PlacedWord {
  word: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export const generateGrid = (words: string[], size: number): { grid: string[][], placedWords: PlacedWord[] } | null => {
  const grid: (string | null)[][] = Array(size).fill(null).map(() => Array(size).fill(null));
  const placedWords: PlacedWord[] = [];

  const sortedWords = [...words].sort((a, b) => b.length - a.length);

  for (const word of sortedWords) {
    let placed = false;
    let attempts = 0;
    while (!placed && attempts < 100) {
      const direction = getRandomElement(directions);
      const startX = Math.floor(Math.random() * size);
      const startY = Math.floor(Math.random() * size);

      const endX = startX + (word.length - 1) * direction.x;
      const endY = startY + (word.length - 1) * direction.y;

      if (endX >= 0 && endX < size && endY >= 0 && endY < size) {
        let canPlace = true;
        for (let i = 0; i < word.length; i++) {
          const x = startX + i * direction.x;
          const y = startY + i * direction.y;
          if (grid[y][x] !== null && grid[y][x] !== word[i]) {
            canPlace = false;
            break;
          }
        }

        if (canPlace) {
          for (let i = 0; i < word.length; i++) {
            const x = startX + i * direction.x;
            const y = startY + i * direction.y;
            grid[y][x] = word[i];
          }
          placedWords.push({ word, startX, startY, endX, endY });
          placed = true;
        }
      }
      attempts++;
    }
    if (!placed) {
      // console.error(`Could not place word: ${word}`);
      // If a word can't be placed after many attempts, we might need to restart generation.
      // For this implementation, we'll continue, but a more robust solution might retry.
    }
  }
  
  // Check if all words were placed
  if (placedWords.length !== words.length) {
    return null; // Indicate failure
  }

  const finalGrid = grid.map(row =>
    row.map(cell => cell || String.fromCharCode(65 + Math.floor(Math.random() * 26)))
  );

  return { grid: finalGrid, placedWords };
};