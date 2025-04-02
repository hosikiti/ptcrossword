import React from 'react';
import { CrosswordWord } from '../utils/crosswordGenerator';
import '../styles/WordClues.css';

interface WordCluesProps {
  words: CrosswordWord[];
  isWordComplete: (wordIndex: number) => boolean;
}

const WordClues: React.FC<WordCluesProps> = ({ words, isWordComplete }) => {
  // Separate words by direction
  const horizontalWords = words.filter(word => word.direction === 'horizontal');
  const verticalWords = words.filter(word => word.direction === 'vertical');

  return (
    <div className="word-clues">
      <div className="clues-section">
        <h3>Horizontal</h3>
        <ul>
          {horizontalWords.map((word) => {
            const wordIndex = words.findIndex(w => w.number === word.number);
            const complete = isWordComplete(wordIndex);
            
            return (
              <li key={`h-${word.number}`} className={complete ? 'complete' : ''}>
                <span className="clue-number">{word.number}.</span>
                <span className="clue-text">{word.clue}</span>
                {complete && <span className="check-mark">✓</span>}
              </li>
            );
          })}
        </ul>
      </div>
      
      <div className="clues-section">
        <h3>Vertical</h3>
        <ul>
          {verticalWords.map((word) => {
            const wordIndex = words.findIndex(w => w.number === word.number);
            const complete = isWordComplete(wordIndex);
            
            return (
              <li key={`v-${word.number}`} className={complete ? 'complete' : ''}>
                <span className="clue-number">{word.number}.</span>
                <span className="clue-text">{word.clue}</span>
                {complete && <span className="check-mark">✓</span>}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default WordClues; 