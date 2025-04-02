import { PortugueseWord } from '../data/portugueseWords';

export interface Position {
  row: number;
  col: number;
}

export interface CrosswordWord {
  word: string;
  clue: string;
  position: Position;
  direction: 'horizontal' | 'vertical';
  number: number;
}

export interface CrosswordCell {
  letter: string | null;
  isActive: boolean;
  wordNumber?: number | number[];
}

export interface CrosswordGrid {
  cells: CrosswordCell[][];
  words: CrosswordWord[];
}

// Get random items from an array
export function getRandomItems<T>(array: T[], count: number): T[] {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// Check if a set of words can form a connected crossword
function canFormConnectedCrossword(words: string[]): boolean {
  // Count shared characters between all words
  for (let i = 0; i < words.length; i++) {
    let hasSharedChar = false;
    const currentWord = words[i];
    
    for (let j = 0; j < words.length; j++) {
      if (i === j) continue;
      
      const otherWord = words[j];
      // Check if they share any character
      for (const char of currentWord) {
        if (otherWord.includes(char)) {
          hasSharedChar = true;
          break;
        }
      }
      
      if (hasSharedChar) break;
    }
    
    // If any word doesn't share characters with any other word, return false
    if (!hasSharedChar) {
      return false;
    }
  }
  
  return true;
}

// Generate a crossword puzzle grid from a list of words
export function generateCrossword(words: PortugueseWord[], count: number = 5): CrosswordGrid {
  // Get random words, ensuring they can form a connected crossword
  let selectedWords: PortugueseWord[] = [];
  let attempts = 0;
  const maxAttempts = 20;
  
  // Keep trying until we get a set of words that can form a connected crossword
  // or until we reach the maximum number of attempts
  while (attempts < maxAttempts) {
    const randomWords = getRandomItems(words, count);
    const wordStrings = randomWords.map(w => w.word);
    
    if (canFormConnectedCrossword(wordStrings)) {
      selectedWords = randomWords;
      break;
    }
    
    attempts++;
  }
  
  // If we couldn't find a good set, just use the last generated set
  if (selectedWords.length === 0) {
    selectedWords = getRandomItems(words, count);
  }
  
  // Sort words by length (longest first) to make placement easier
  const sortedWords = [...selectedWords].sort((a, b) => b.word.length - a.word.length);
  
  // Create an initial grid size (can be adjusted)
  const gridSize = 15;
  const grid: CrosswordCell[][] = Array(gridSize).fill(null).map(() => 
    Array(gridSize).fill(null).map(() => ({ letter: null, isActive: false }))
  );
  
  const placedWords: CrosswordWord[] = [];
  let wordNumber = 1;
  
  // Place the first word horizontally in the middle
  const firstWord = sortedWords[0];
  const firstWordRow = Math.floor(gridSize / 2);
  const firstWordCol = Math.floor((gridSize - firstWord.word.length) / 2);
  
  placedWords.push({
    word: firstWord.word,
    clue: firstWord.clue,
    position: { row: firstWordRow, col: firstWordCol },
    direction: 'horizontal',
    number: wordNumber++
  });
  
  // Place the first word in the grid
  for (let i = 0; i < firstWord.word.length; i++) {
    grid[firstWordRow][firstWordCol + i] = {
      letter: firstWord.word[i],
      isActive: true,
      wordNumber: i === 0 ? 1 : undefined
    };
  }
  
  // Try to place the rest of the words
  for (let i = 1; i < sortedWords.length; i++) {
    const currentWord = sortedWords[i];
    let placed = false;
    
    // Try to find intersections with placed words
    for (let j = 0; j < placedWords.length && !placed; j++) {
      const existingWord = placedWords[j];
      
      // Check each letter in the current word
      for (let charPos = 0; charPos < currentWord.word.length && !placed; charPos++) {
        const currentChar = currentWord.word[charPos];
        
        // For an existing horizontal word, try to place vertically
        if (existingWord.direction === 'horizontal') {
          for (let existingCharPos = 0; existingCharPos < existingWord.word.length && !placed; existingCharPos++) {
            if (existingWord.word[existingCharPos] === currentChar) {
              // Try to place vertically through this intersection
              const newRow = existingWord.position.row - charPos;
              const newCol = existingWord.position.col + existingCharPos;
              
              if (
                canPlaceWord(
                  grid, 
                  currentWord.word, 
                  { row: newRow, col: newCol }, 
                  'vertical',
                  { row: existingWord.position.row, col: existingWord.position.col + existingCharPos }
                )
              ) {
                // Place the word
                placeWord(
                  grid, 
                  currentWord.word, 
                  { row: newRow, col: newCol }, 
                  'vertical',
                  wordNumber
                );
                
                placedWords.push({
                  word: currentWord.word,
                  clue: currentWord.clue,
                  position: { row: newRow, col: newCol },
                  direction: 'vertical',
                  number: wordNumber++
                });
                
                placed = true;
                break;
              }
            }
          }
        } 
        // For an existing vertical word, try to place horizontally
        else if (existingWord.direction === 'vertical') {
          for (let existingCharPos = 0; existingCharPos < existingWord.word.length && !placed; existingCharPos++) {
            if (existingWord.word[existingCharPos] === currentChar) {
              // Try to place horizontally through this intersection
              const newRow = existingWord.position.row + existingCharPos;
              const newCol = existingWord.position.col - charPos;
              
              if (
                canPlaceWord(
                  grid, 
                  currentWord.word, 
                  { row: newRow, col: newCol }, 
                  'horizontal',
                  { row: existingWord.position.row + existingCharPos, col: existingWord.position.col }
                )
              ) {
                // Place the word
                placeWord(
                  grid, 
                  currentWord.word, 
                  { row: newRow, col: newCol }, 
                  'horizontal',
                  wordNumber
                );
                
                placedWords.push({
                  word: currentWord.word,
                  clue: currentWord.clue,
                  position: { row: newRow, col: newCol },
                  direction: 'horizontal',
                  number: wordNumber++
                });
                
                placed = true;
                break;
              }
            }
          }
        }
      }
    }
    
    // If we couldn't place the word with intersections, try again with a new word
    if (!placed) {
      // Try up to 3 more alternative words that might connect
      let altWordFound = false;
      for (let altAttempt = 0; altAttempt < 3 && !altWordFound; altAttempt++) {
        // Find a word that wasn't selected yet and can connect
        for (let k = 0; k < words.length; k++) {
          const altWord = words[k];
          
          // Skip if already in use
          if (selectedWords.some(w => w.word === altWord.word)) {
            continue;
          }
          
          // Check if this word can connect with any placed word
          for (let j = 0; j < placedWords.length && !altWordFound; j++) {
            const existingWord = placedWords[j];
            
            for (let charPos = 0; charPos < altWord.word.length && !altWordFound; charPos++) {
              const currentChar = altWord.word[charPos];
              
              // Check against horizontal words
              if (existingWord.direction === 'horizontal') {
                for (let existingCharPos = 0; existingCharPos < existingWord.word.length && !altWordFound; existingCharPos++) {
                  if (existingWord.word[existingCharPos] === currentChar) {
                    // Try to place vertically
                    const newRow = existingWord.position.row - charPos;
                    const newCol = existingWord.position.col + existingCharPos;
                    
                    if (
                      canPlaceWord(
                        grid, 
                        altWord.word, 
                        { row: newRow, col: newCol }, 
                        'vertical',
                        { row: existingWord.position.row, col: existingWord.position.col + existingCharPos }
                      )
                    ) {
                      // Place the word
                      placeWord(
                        grid, 
                        altWord.word, 
                        { row: newRow, col: newCol }, 
                        'vertical',
                        wordNumber
                      );
                      
                      placedWords.push({
                        word: altWord.word,
                        clue: altWord.clue,
                        position: { row: newRow, col: newCol },
                        direction: 'vertical',
                        number: wordNumber++
                      });
                      
                      altWordFound = true;
                      placed = true;
                      break;
                    }
                  }
                }
              } 
              // Check against vertical words
              else if (existingWord.direction === 'vertical') {
                for (let existingCharPos = 0; existingCharPos < existingWord.word.length && !altWordFound; existingCharPos++) {
                  if (existingWord.word[existingCharPos] === currentChar) {
                    // Try to place horizontally
                    const newRow = existingWord.position.row + existingCharPos;
                    const newCol = existingWord.position.col - charPos;
                    
                    if (
                      canPlaceWord(
                        grid, 
                        altWord.word, 
                        { row: newRow, col: newCol }, 
                        'horizontal',
                        { row: existingWord.position.row + existingCharPos, col: existingWord.position.col }
                      )
                    ) {
                      // Place the word
                      placeWord(
                        grid, 
                        altWord.word, 
                        { row: newRow, col: newCol }, 
                        'horizontal',
                        wordNumber
                      );
                      
                      placedWords.push({
                        word: altWord.word,
                        clue: altWord.clue,
                        position: { row: newRow, col: newCol },
                        direction: 'horizontal',
                        number: wordNumber++
                      });
                      
                      altWordFound = true;
                      placed = true;
                      break;
                    }
                  }
                }
              }
            }
          }
          
          if (altWordFound) break;
        }
      }
      
      // If we still can't place it, force placement near another word
      if (!placed) {
        const lastPlacedWord = placedWords[placedWords.length - 1];
        let direction: 'horizontal' | 'vertical';
        let startRow: number, startCol: number;
        
        // Place it in the opposite direction of the last word
        if (lastPlacedWord.direction === 'horizontal') {
          direction = 'vertical';
          // Try to place it near the start of the last word
          startRow = lastPlacedWord.position.row - 1;
          startCol = lastPlacedWord.position.col;
        } else {
          direction = 'horizontal';
          // Try to place it near the start of the last word
          startRow = lastPlacedWord.position.row;
          startCol = lastPlacedWord.position.col - 1;
        }
        
        // Make sure we're in bounds
        if (startRow < 0) startRow = 0;
        if (startCol < 0) startCol = 0;
        
        // Try different positions near the last word
        for (let offsetRow = -2; offsetRow <= 2 && !placed; offsetRow++) {
          for (let offsetCol = -2; offsetCol <= 2 && !placed; offsetCol++) {
            const newRow = startRow + offsetRow;
            const newCol = startCol + offsetCol;
            
            if (
              newRow >= 0 && newRow < gridSize &&
              newCol >= 0 && newCol < gridSize &&
              canPlaceWord(grid, currentWord.word, { row: newRow, col: newCol }, direction)
            ) {
              placeWord(grid, currentWord.word, { row: newRow, col: newCol }, direction, wordNumber);
              
              placedWords.push({
                word: currentWord.word,
                clue: currentWord.clue,
                position: { row: newRow, col: newCol },
                direction,
                number: wordNumber++
              });
              
              placed = true;
              break;
            }
          }
        }
      }
    }
  }
  
  // Verify that all words are connected
  if (placedWords.length < sortedWords.length) {
    // Restart with a new set of words
    return generateCrossword(words, count);
  }
  
  // Trim the grid to remove empty rows and columns
  const trimmedGrid = trimGrid(grid);
  
  // Adjust word positions after trimming
  const trimOffsetRow = findFirstActiveRow(grid);
  const trimOffsetCol = findFirstActiveCol(grid);
  
  const adjustedWords = placedWords.map(word => ({
    ...word,
    position: {
      row: word.position.row - trimOffsetRow,
      col: word.position.col - trimOffsetCol
    }
  }));
  
  return {
    cells: trimmedGrid,
    words: adjustedWords
  };
}

// Check if a word can be placed at the specified position and direction
function canPlaceWord(
  grid: CrosswordCell[][], 
  word: string, 
  position: Position, 
  direction: 'horizontal' | 'vertical',
  intersectionPoint?: Position
): boolean {
  const gridSize = grid.length;
  const { row, col } = position;
  
  // Check if word would go outside grid
  if (direction === 'horizontal') {
    if (col < 0 || col + word.length > gridSize) return false;
  } else {
    if (row < 0 || row + word.length > gridSize) return false;
  }
  
  // Check each position the word would occupy
  for (let i = 0; i < word.length; i++) {
    const currentRow = direction === 'horizontal' ? row : row + i;
    const currentCol = direction === 'horizontal' ? col + i : col;
    
    // Skip the intersection point
    if (intersectionPoint && currentRow === intersectionPoint.row && currentCol === intersectionPoint.col) {
      continue;
    }
    
    // Make sure position is valid
    if (currentRow < 0 || currentRow >= gridSize || currentCol < 0 || currentCol >= gridSize) {
      return false;
    }
    
    const cell = grid[currentRow][currentCol];
    
    // If cell is occupied, it must match the letter we're trying to place
    if (cell.isActive && cell.letter !== word[i]) {
      return false;
    }
    
    // Check that there are no adjacent letters (except at intersections)
    if (!cell.isActive) {
      // Check adjacent cells
      const adjacentPositions = [
        { row: currentRow - 1, col: currentCol },
        { row: currentRow + 1, col: currentCol },
        { row: currentRow, col: currentCol - 1 },
        { row: currentRow, col: currentCol + 1 }
      ];
      
      for (const pos of adjacentPositions) {
        if (
          pos.row >= 0 && pos.row < gridSize && 
          pos.col >= 0 && pos.col < gridSize &&
          grid[pos.row][pos.col].isActive
        ) {
          // Skip checking if this is part of our word
          if (direction === 'horizontal' && pos.row === row && pos.col >= col && pos.col < col + word.length) {
            continue;
          }
          if (direction === 'vertical' && pos.col === col && pos.row >= row && pos.row < row + word.length) {
            continue;
          }
          
          // If adjacent to another letter (not part of our intersection), can't place
          if (!(intersectionPoint && pos.row === intersectionPoint.row && pos.col === intersectionPoint.col)) {
            return false;
          }
        }
      }
    }
  }
  
  return true;
}

// Place a word on the grid
function placeWord(
  grid: CrosswordCell[][], 
  word: string, 
  position: Position, 
  direction: 'horizontal' | 'vertical',
  wordNumber: number
): void {
  const { row, col } = position;
  
  for (let i = 0; i < word.length; i++) {
    const currentRow = direction === 'horizontal' ? row : row + i;
    const currentCol = direction === 'horizontal' ? col + i : col;
    
    const currentCell = grid[currentRow][currentCol];
    
    // For the first letter of the word
    if (i === 0) {
      // If the cell already has a different word number, store both
      if (currentCell && currentCell.isActive && currentCell.wordNumber !== undefined) {
        // If wordNumber is already an array, add to it
        if (Array.isArray(currentCell.wordNumber)) {
          if (!currentCell.wordNumber.includes(wordNumber)) {
            currentCell.wordNumber.push(wordNumber);
          }
        } else {
          // Convert to array if it's a single number and different from new number
          if (currentCell.wordNumber !== wordNumber) {
            currentCell.wordNumber = [currentCell.wordNumber, wordNumber];
          }
        }
      } else {
        // First word at this position
        grid[currentRow][currentCol] = {
          letter: word[i],
          isActive: true,
          wordNumber: wordNumber
        };
      }
    } else {
      // For the rest of the letters, just set them active without changing word number
      grid[currentRow][currentCol] = {
        letter: word[i],
        isActive: true,
        wordNumber: currentCell && currentCell.isActive ? currentCell.wordNumber : undefined
      };
    }
  }
}

// Find the first row with active cells
function findFirstActiveRow(grid: CrosswordCell[][]): number {
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col].isActive) {
        return row;
      }
    }
  }
  return 0;
}

// Find the first column with active cells
function findFirstActiveCol(grid: CrosswordCell[][]): number {
  for (let col = 0; col < grid[0].length; col++) {
    for (let row = 0; row < grid.length; row++) {
      if (grid[row][col].isActive) {
        return col;
      }
    }
  }
  return 0;
}

// Find the last row with active cells
function findLastActiveRow(grid: CrosswordCell[][]): number {
  for (let row = grid.length - 1; row >= 0; row--) {
    for (let col = 0; col < grid[row].length; col++) {
      if (grid[row][col].isActive) {
        return row;
      }
    }
  }
  return grid.length - 1;
}

// Find the last column with active cells
function findLastActiveCol(grid: CrosswordCell[][]): number {
  for (let col = grid[0].length - 1; col >= 0; col--) {
    for (let row = 0; row < grid.length; row++) {
      if (grid[row][col].isActive) {
        return col;
      }
    }
  }
  return grid[0].length - 1;
}

// Trim the grid to remove empty rows and columns
function trimGrid(grid: CrosswordCell[][]): CrosswordCell[][] {
  const firstActiveRow = findFirstActiveRow(grid);
  const firstActiveCol = findFirstActiveCol(grid);
  const lastActiveRow = findLastActiveRow(grid);
  const lastActiveCol = findLastActiveCol(grid);
  
  const trimmedHeight = lastActiveRow - firstActiveRow + 1;
  const trimmedWidth = lastActiveCol - firstActiveCol + 1;
  
  const trimmedGrid: CrosswordCell[][] = Array(trimmedHeight).fill(null).map(() => 
    Array(trimmedWidth).fill(null).map(() => ({ letter: null, isActive: false }))
  );
  
  for (let row = 0; row < trimmedHeight; row++) {
    for (let col = 0; col < trimmedWidth; col++) {
      trimmedGrid[row][col] = grid[row + firstActiveRow][col + firstActiveCol];
    }
  }
  
  return trimmedGrid;
} 