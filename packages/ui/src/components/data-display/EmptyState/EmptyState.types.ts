export interface EmptyStateProps {
  variant?: 'default' | 'illustrated' | 'minimal' | 'action';
  title: string;
  description?: string;
  illustration?: React.ReactNode; // SVG/Lottie/etc
  primaryAction?: { label: string; onClick: () => void };
  secondaryAction?: { label: string; onClick: () => void };
  helpLink?: { label: string; href: string; external?: boolean };
  /**
   * Callback for the refresh button
   * Displays a refresh button in the action area when provided
   */
  onRefresh?: () => void;
  /**
   * Custom label for the refresh button
   * @default 'Refresh'
   */
  refreshLabel?: string;
  /**
   * Callback for the create/add new button
   * Displays a create button in the action area when provided
   */
  onCreate?: () => void;
  /**
   * Custom label for the create button
   * @default 'Create New'
   */
  createLabel?: string;
  className?: string;
  dataTestId?: string;
}