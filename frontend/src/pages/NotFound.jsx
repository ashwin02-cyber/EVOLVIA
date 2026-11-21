import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

export const NotFound = () => {
  return (
    <div className="min-h-screen cyber-bg flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 text-center bg-[#0C061A]/90 border-amethyst/60 shadow-[0_0_50px_rgba(59,10,107,0.5)]">
        <div className="w-16 h-16 rounded-full bg-cyan/15 border border-cyan/40 flex items-center justify-center mx-auto mb-4 text-cyan shadow-glow-cyan-sm">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h1 className="text-4xl font-extrabold font-mono text-cyan text-glow-cyan">404</h1>
        <h2 className="text-lg font-bold text-white mt-1">Sector Not Found</h2>
        <p className="text-xs text-text-2 mt-2 leading-relaxed">
          The requested coordinate lies beyond the mapped cyber grid. Return to base to recalibrate your trajectory.
        </p>

        <Link to="/" className="inline-block mt-6">
          <Button variant="primary" size="md" icon={Home}>
            Return to Command Center
          </Button>
        </Link>
      </Card>
    </div>
  );
};

export default NotFound;
