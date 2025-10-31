import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ 
  title = 'Algo deu errado',
  message = 'Não foi possível carregar os dados. Tente novamente.',
  onRetry
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <AlertCircle className="mb-4 text-destructive" size={48} />
      <h3 className="font-heading text-2xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{message}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline">
          Tentar Novamente
        </Button>
      )}
    </div>
  );
}
