export interface EmptyStateProps {
  variant?: 'default' | 'illustrated' | 'minimal' | 'action';
  title: string;
  description?: string;
  illustration?: React.ReactNode; // SVG/Lottie/etc
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  helpLink?: { label: string; href: string; external?: boolean };
  className?: string;
}