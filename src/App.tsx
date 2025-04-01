import React, { useState } from 'react';
import './App.css';
import { portugueseWords } from './data/portugueseWords';
import { generateCrossword, CrosswordGrid } from './utils/crosswordGenerator';
import CrosswordPuzzle from './components/CrosswordPuzzle';
import WordClues from './components/WordClues';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [crosswordGrid, setCrosswordGrid] = useState<CrosswordGrid | null>(null);
  const [userInputs, setUserInputs] = useState<string[][]>([]);

  const startGame = () => {
    const newGrid = generateCrossword(portugueseWords, 5);
    
    // Initialize user inputs with empty strings
    const newUserInputs: string[][] = Array(newGrid.cells.length)
      .fill(null)
      .map(() => Array(newGrid.cells[0].length).fill(''));
    
    setCrosswordGrid(newGrid);
    setUserInputs(newUserInputs);
    setGameStarted(true);
  };

  const handleLetterChange = (row: number, col: number, value: string) => {
    if (!crosswordGrid || !crosswordGrid.cells[row][col].isActive) return;
    
    const newUserInputs = [...userInputs];
    newUserInputs[row][col] = value;
    setUserInputs(newUserInputs);
  };

  const isWordComplete = (wordIndex: number) => {
    if (!crosswordGrid) return false;
    
    const word = crosswordGrid.words[wordIndex];
    const { position, direction } = word;
    
    for (let i = 0; i < word.word.length; i++) {
      const currentRow = direction === 'horizontal' ? position.row : position.row + i;
      const currentCol = direction === 'horizontal' ? position.col + i : position.col;
      
      if (
        !userInputs[currentRow] || 
        !userInputs[currentRow][currentCol] || 
        userInputs[currentRow][currentCol].toLowerCase() !== word.word[i].toLowerCase()
      ) {
        return false;
      }
    }
    
    return true;
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Palavras Cruzadas - Português</h1>
        {!gameStarted ? (
          <div className="start-container">
            <p>Jogo de palavras cruzadas com palavras básicas em português.</p>
            <button className="start-button" onClick={startGame}>
              Começar!
            </button>
          </div>
        ) : (
          <div className="game-container">
            {crosswordGrid && (
              <>
                <div className="crossword-container">
                  <CrosswordPuzzle 
                    grid={crosswordGrid} 
                    userInputs={userInputs}
                    onLetterChange={handleLetterChange}
                  />
                </div>
                <div className="clues-container">
                  <WordClues 
                    words={crosswordGrid.words}
                    isWordComplete={isWordComplete}
                  />
                </div>
              </>
            )}
            <button className="restart-button" onClick={startGame}>
              Nova Palavras Cruzadas
            </button>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
