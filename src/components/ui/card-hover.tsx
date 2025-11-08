import { ReactNode } from 'react';
import { Card, CardProps } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CardHoverProps extends CardProps {
  children: ReactNode;
  delay?: number;
}

export function CardHover({ children, className, delay = 0, ...props }: CardHoverProps) {
  return (
    <Card
      className={cn(
        "hover-lift border-border hover:border-secondary/30 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4",
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
      {...props}
    >
      {children}
    </Card>
  );
}
