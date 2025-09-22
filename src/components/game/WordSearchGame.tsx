import React, { useState, useEffect, useCallback } from 'react';
import { categories, difficulties, Category, Difficulty } from '@/data/word-lists';
import { generateGrid, PlacedWord } from '@/lib/grid-generator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lightbulb, Timer, Trophy, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"


type Cell = { row: number; col: number };

const WordSearchGame: React.FC = () => {
  const [grid, setGrid] = useState<string[][]>([]);
  const [placedWords, setPlacedWords] = useState<PlacedWord[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<Cell[]>([]);
  const [isSelecting, setIsSelecting] = useState(false);
  const [category, setCategory] = useState<Category>('animals');
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [timeLeft, setTimeLeft] = useState<number | null>(180);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const { toast } = useToast();

  const startNewGame = useCallback(() => {
    const diffSettings = difficulties[difficulty];
    const wordList = [...categories[category]].sort(() => 0.5 - Math.random()).slice(0, diffSettings.words);
    
    let generationResult: { grid: string[][]; placedWords: PlacedWord[] } | null = null;
    let retries = 0;
    while(generationResult === null && retries < 10) {
        generationResult = generateGrid(wordList, diffSettings.size);
        retries++;
    }

    if (generationResult) {
        setGrid(generationResult.grid);
        setPlacedWords(generationResult.placedWords);
        setFoundWords([]);
        setSelectedCells([]);
        setGameOver(false);
        setWin(false);
        setTimeLeft(diffSettings.size * 15);
    } else {
        toast({
            title: "Error",
            description: "Could not generate a valid grid. Please try again.",
            variant: "destructive"
        })
    }
  }, [category, difficulty, toast]);

  useEffect(() => {
    startNewGame();
  }, [startNewGame]);

  useEffect(() => {
    if (timeLeft === 0) {
      setGameOver(true);
      setWin(false);
    }
    if (!gameOver && timeLeft !== null && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(t => (t ? t - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, gameOver]);

  useEffect(() => {
    if (placedWords.length > 0 && foundWords.length === placedWords.length) {
      setGameOver(true);
      setWin(true);
    }
  }, [foundWords, placedWords]);

  const handleMouseDown = (row: number, col: number) => {
    if (gameOver) return;
    setIsSelecting(true);
    setSelectedCells([{ row, col }]);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (!isSelecting || gameOver) return;
    setSelectedCells(prev => [...prev, { row, col }]);
  };

  const handleMouseUp = () => {
    if (gameOver) return;
    setIsSelecting(false);
    
    const selectedWord = selectedCells.map(cell => grid[cell.row][cell.col]).join('');
    const reversedSelectedWord = selectedWord.split('').reverse().join('');

    const wordToFind = placedWords.find(
      p => (p.word === selectedWord || p.word === reversedSelectedWord) && !foundWords.includes(p.word)
    );

    if (wordToFind) {
      setFoundWords(prev => [...prev, wordToFind.word]);
      toast({
        title: "Word Found!",
        description: `You found "${wordToFind.word}"!`,
      });
    }
    setSelectedCells([]);
  };

  const isCellSelected = (row: number, col: number) => {
    return selectedCells.some(cell => cell.row === row && cell.col === col);
  };

  const isCellInFoundWord = (row: number, col: number) => {
    for (const foundWord of foundWords) {
        const pWord = placedWords.find(p => p.word === foundWord);
        if (!pWord) continue;

        const { startX, startY, endX, endY } = pWord;
        const dx = Math.sign(endX - startX);
        const dy = Math.sign(endY - startY);

        for (let i = 0; i < foundWord.length; i++) {
            if (startY + i * dy === row && startX + i * dx === col) {
                return true;
            }
        }
    }
    return false;
  };
  
  const getHint = () => {
    const unfoundWord = placedWords.find(p => !foundWords.includes(p.word));
    if (unfoundWord) {
        toast({
            title: "Hint",
            description: `Try to find a word that starts with '${unfoundWord.word[0]}'.`,
        });
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="shadow-xl" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
            <CardContent className="p-2 sm:p-4">
              <div 
                className="grid select-none aspect-square" 
                style={{ gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))` }}
              >
                {grid.map((row, rowIndex) =>
                  row.map((letter, colIndex) => (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={cn(
                        "flex items-center justify-center aspect-square text-lg sm:text-xl md:text-2xl font-bold uppercase cursor-pointer transition-colors duration-200",
                        isCellSelected(rowIndex, colIndex) && "bg-primary/80 text-primary-foreground rounded-md scale-110",
                        isCellInFoundWord(rowIndex, colIndex) && "bg-green-500/80 text-white rounded-md",
                      )}
                      onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                      onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                    >
                      {letter}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Game Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(categories).map(cat => <SelectItem key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Difficulty</label>
                <Select value={difficulty} onValueChange={(v) => setDifficulty(v as Difficulty)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.keys(difficulties).map(diff => <SelectItem key={diff} value={diff}>{diff.charAt(0).toUpperCase() + diff.slice(1)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={startNewGame} className="w-full"><RotateCw className="mr-2 h-4 w-4" /> New Game</Button>
              <Button onClick={getHint} variant="outline" className="w-full" disabled={gameOver}><Lightbulb className="mr-2 h-4 w-4" /> Hint</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Words to Find</span>
                {timeLeft !== null && (
                  <div className="flex items-center text-lg font-mono bg-muted px-2 py-1 rounded-md">
                    <Timer className="mr-2 h-5 w-5" />
                    {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}
                  </div>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-2 gap-2 text-sm">
                {placedWords.map(({ word }) => (
                  <li key={word} className={cn("transition-all", foundWords.includes(word) && "line-through text-muted-foreground")}>
                    {word}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
      <AlertDialog open={gameOver}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <Trophy className="mr-2 h-6 w-6 text-yellow-500" />
              {win ? "Congratulations!" : "Time's Up!"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {win ? `You found all ${placedWords.length} words!` : "You ran out of time. Better luck next time!"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={startNewGame}>Play Again</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WordSearchGame;