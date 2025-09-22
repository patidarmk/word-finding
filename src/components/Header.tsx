import { Puzzle } from 'lucide-react';
import { Link } from '@tanstack/react-router';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link to="/" className="mr-6 flex items-center space-x-2">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Puzzle className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
            WordFind
          </span>
        </Link>
      </div>
    </header>
  );
};