import React from 'react';
import { CrosswordGrid } from '../utils/crosswordGenerator';
import '../styles/CrosswordPuzzle.css';

interface CrosswordPuzzleProps {
  grid: CrosswordGrid;
  userInputs: string[][];
  onLetterChange: (row: number, col: number, value: string) => void;
}

const CrosswordPuzzle: React.FC<CrosswordPuzzleProps> = ({ grid, userInputs, onLetterChange }) => {
  const handleInputChange = (row: number, col: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.slice(-1); // Take only the last character entered
    onLetterChange(row, col, value);
    
    // Auto-focus next input if available
    if (value && e.target.nextElementSibling) {
      (e.target.nextElementSibling as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (row: number, col: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle arrow key navigation
    switch (e.key) {
      case 'ArrowUp':
        focusCell(row - 1, col);
        break;
      case 'ArrowDown':
        focusCell(row + 1, col);
        break;
      case 'ArrowLeft':
        focusCell(row, col - 1);
        break;
      case 'ArrowRight':
        focusCell(row, col + 1);
        break;
    }
  };

  const focusCell = (row: number, col: number) => {
    // Check if the cell is within bounds and active
    if (
      row >= 0 && 
      row < grid.cells.length && 
      col >= 0 && 
      col < grid.cells[0].length && 
      grid.cells[row][col].isActive
    ) {
      const cellElement = document.getElementById(`cell-input-${row}-${col}`) as HTMLInputElement;
      if (cellElement) {
        cellElement.focus();
        // Select the text in the cell
        cellElement.select();
      }
    }
  };

  // Helper to render word number(s)
  const renderWordNumber = (wordNumber: number | number[] | undefined) => {
    if (wordNumber === undefined) return null;
    
    if (Array.isArray(wordNumber)) {
      // Display multiple numbers with a slash between them for better readability
      return <span className="cell-number">{wordNumber.join('/')}</span>;
    }
    
    return <span className="cell-number">{wordNumber}</span>;
  };

  return (
    <div className="crossword-puzzle">
      {grid.cells.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="crossword-row">
          {row.map((cell, colIndex) => (
            <div 
              key={`cell-${rowIndex}-${colIndex}`} 
              className={`crossword-cell ${cell.isActive ? 'active' : 'inactive'}`}
            >
              {cell.isActive ? (
                <>
                  {renderWordNumber(cell.wordNumber)}
                  <input 
                    id={`cell-input-${rowIndex}-${colIndex}`}
                    type="text"
                    value={userInputs[rowIndex][colIndex] || ''}
                    onChange={(e) => handleInputChange(rowIndex, colIndex, e)}
                    onKeyDown={(e) => handleKeyDown(rowIndex, colIndex, e)}
                    maxLength={1}
                    className="cell-input"
                    onFocus={(e) => e.target.select()}
                  />
                </>
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default CrosswordPuzzle; 