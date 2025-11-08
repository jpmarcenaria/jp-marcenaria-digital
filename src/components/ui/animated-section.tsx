import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

export function AnimatedSection({
  children,
  className,
  delay = 0,
  direction = 'up'
}: AnimatedSectionProps) {
  const directionClasses = {
    up: 'animate-in fade-in slide-in-from-bottom-4',
    down: 'animate-in fade-in slide-in-from-top-4',
    left: 'animate-in fade-in slide-in-from-right-4',
    right: 'animate-in fade-in slide-in-from-left-4',
  };

  return (
    <div
      className={cn(directionClasses[direction], 'duration-700', className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
